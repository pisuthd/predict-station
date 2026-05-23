// AI Service - QVAC Model Management

let modelId = null;
let currentModelType = null;

// Model configurations
export const MODEL_INFO = {
  '1.7B': {
    name: 'Qwen3-1.7B',
    specs: '8GB+ RAM • ~1.5GB disk',
    recommended: 'Low-spec'
  },
  '4B': {
    name: 'Qwen3-4B',
    specs: '16GB+ RAM • ~3-4GB disk',
    recommended: 'High-spec'
  }
};

// Progress tracking
let loadProgressCallback = null;

export function setLoadProgressCallback(callback) {
  loadProgressCallback = callback;
}

// Report progress - always sends percentage number
function reportProgress(percentage, status) {
  if (loadProgressCallback) {
    loadProgressCallback({ percentage, status });
  }
}

// AI Service
export const aiService = {
  getStatus() {
    return {
      isReady: modelId !== null,
      modelId: modelId,
      modelType: currentModelType,
    };
  },

  async loadModel(modelType = '1.7B') {
    // First, try to unload any existing model
    if (modelId) {
      try {
        await this.unloadModel();
      } catch (e) {
        // Ignore unload errors
      }
    }

    try {
      reportProgress(0, 'Starting QVAC...');
      
      // Import QVAC SDK
      const { loadModel, QWEN3_1_7B_INST_Q4, QWEN3_4B_INST_Q4_K_M } = await import('@qvac/sdk');
      
      const modelSource = modelType === '4B' ? QWEN3_4B_INST_Q4_K_M : QWEN3_1_7B_INST_Q4;
      const modelDisplayName = MODEL_INFO[modelType]?.name || modelType;
      
      console.log(`[QVAC] Loading ${modelDisplayName}...`);
      reportProgress(5, `Connecting to ${modelDisplayName}...`);
      
      // Load model with real QVAC - use llamacpp-completion instead of "llm"
      modelId = await loadModel({
        modelSrc: modelSource,
        modelType: 'llamacpp-completion', // Updated from deprecated "llm"
        modelConfig: {
          ctx_size: 8192,
          tools: true,
        },
        onProgress: (progress) => {
          // QVAC progress can be string or object
          if (typeof progress === 'string') {
            console.log(`[QVAC] ${progress}`);
            // Convert string status to percentage estimate
            const text = progress.toLowerCase();
            let pct = 10;
            if (text.includes('downloading')) pct = 20;
            else if (text.includes('verif')) pct = 40;
            else if (text.includes('loading')) pct = 60;
            else if (text.includes('initializ')) pct = 75;
            else if (text.includes('warm')) pct = 90;
            else if (text.includes('ready') || text.includes('loaded')) pct = 100;
            reportProgress(pct, progress);
          } else if (progress && typeof progress.percentage === 'number') {
            reportProgress(progress.percentage, progress.status || 'Loading...');
          } else {
            console.log(`[QVAC] ${JSON.stringify(progress)}`);
            // Map common QVAC status messages to percentages
            const status = progress?.status || JSON.stringify(progress);
            let pct = 50;
            if (status.includes('Model cached')) pct = 30;
            else if (status.includes('Loading from registry')) pct = 35;
            reportProgress(pct, status);
          }
        }
      });
      
      console.log(`[QVAC] Model loaded: ${modelId}`);
      reportProgress(100, 'Ready');
      currentModelType = modelType;
      
      return { 
        success: true, 
        modelId, 
        modelType,
        message: `${modelDisplayName} loaded successfully`
      };
    } catch (error) {
      console.error('[QVAC] Failed to load model:', error);
      reportProgress(0, `Error: ${error.message}`);
      modelId = null;
      return { 
        success: false, 
        error: error.message || 'Failed to load model' 
      };
    }
  },

  async unloadModel() {
    try {
      if (modelId) {
        const { unloadModel } = await import('@qvac/sdk');
        console.log(`[QVAC] Unloading model: ${modelId}`);
        await unloadModel({ modelId });
        reportProgress(0, 'Unloading...');
        modelId = null;
        currentModelType = null;
      }
      return { success: true };
    } catch (error) {
      console.error('[QVAC] Failed to unload model:', error);
      // Reset state even on error
      modelId = null;
      currentModelType = null;
      return { 
        success: false, 
        error: error.message || 'Failed to unload model' 
      };
    }
  },

  async complete({ message, history = [], agentSlug, onToken, onThinking, onToolCall }) {
    if (!modelId) {
      throw new Error('AI model not loaded. Please load a model first.');
    }

    // Use real QVAC completion
    const { completion } = await import('@qvac/sdk');
    
    const result = completion({
      modelId: modelId,
      history: [...history, { role: 'user', content: message }],
      stream: true,
      kvCache: true,
      captureThinking: true,
    });

    for await (const streamEvent of result.events) {
      switch (streamEvent.type) {
        case "contentDelta":
          if (onToken) onToken(streamEvent.text);
          break;
        case "thinkingDelta":
          if (onThinking) onThinking(streamEvent.text);
          break;
        case "toolCall":
          if (onToolCall) onToolCall(streamEvent.call);
          break;
        case "completionDone":
          if (onToken) onToken(''); // Signal completion
          break;
      }
    }
  }
};

export default aiService;