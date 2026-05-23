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

// Report progress
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
    try {
      reportProgress(0, 'Starting QVAC...');
      
      // Import QVAC SDK
      const { loadModel, QWEN3_1_7B_INST_Q4, QWEN3_4B_INST_Q4_K_M } = await import('@qvac/sdk');
      
      const modelSource = modelType === '4B' ? QWEN3_4B_INST_Q4_K_M : QWEN3_1_7B_INST_Q4;
      const modelDisplayName = MODEL_INFO[modelType]?.name || modelType;
      
      console.log(`[QVAC] Loading ${modelDisplayName}...`);
      reportProgress(5, `Connecting to ${modelDisplayName}...`);
      
      // Load model with real QVAC
      modelId = await loadModel({
        modelSrc: modelSource,
        modelType: 'llm',
        modelConfig: {
          ctx_size: 8192,
          tools: true,
        },
        onProgress: (progress) => {
          // QVAC progress can be string or object
          if (typeof progress === 'string') {
            console.log(`[QVAC] ${progress}`);
            reportProgress(-1, progress); // -1 indicates raw text for frontend
          } else if (progress && typeof progress.percentage === 'number') {
            reportProgress(progress.percentage, progress.status || 'Loading...');
          } else {
            console.log(`[QVAC] ${JSON.stringify(progress)}`);
            reportProgress(-1, JSON.stringify(progress));
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
      reportProgress(0, 'Error');
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