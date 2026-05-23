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

// Get model source based on type
function getModelSource(modelType) {
  // Dynamically get model sources from @qvac/sdk
  // These will be imported at load time
  return modelType === '4B' 
    ? 'qwen3-4b-inst-q4-k-m'  // Fallback identifier
    : 'qwen3-1.7b-inst-q4';
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
      
      // Dynamically import @qvac/sdk
      const { loadModel: qvacLoadModel, QWEN3_1_7B_INST_Q4, QWEN3_4B_INST_Q4_K_M } = await import('@qvac/sdk');
      
      const modelSource = modelType === '4B' ? QWEN3_4B_INST_Q4_K_M : QWEN3_1_7B_INST_Q4;
      
      reportProgress(5, 'Connecting to model service...');
      
      // Load model with real QVAC
      modelId = await qvacLoadModel({
        modelSrc: modelSource,
        modelType: 'llm',
        modelConfig: {
          ctx_size: 8192,
          tools: true,
        },
        onProgress: (progress) => {
          // QVAC progress can be string or object with percentage
          if (typeof progress === 'string') {
            // Parse string progress messages
            reportProgress(-1, progress); // -1 indicates raw text
          } else if (progress && typeof progress.percentage === 'number') {
            reportProgress(progress.percentage, progress.status || 'Loading...');
          } else {
            reportProgress(-1, JSON.stringify(progress));
          }
        }
      });
      
      reportProgress(100, 'Ready');
      currentModelType = modelType;
      
      return { 
        success: true, 
        modelId, 
        modelType,
        message: `${MODEL_INFO[modelType]?.name || modelType} loaded successfully`
      };
    } catch (error) {
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
        console.log(`[AI] Unloading model: ${modelId}`);
        const { unloadModel: qvacUnloadModel } = await import('@qvac/sdk');
        await qvacUnloadModel({ modelId });
        reportProgress(0, 'Unloading...');
        modelId = null;
        currentModelType = null;
      }
      return { success: true };
    } catch (error) {
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