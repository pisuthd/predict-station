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

// Model source definitions (placeholders - will be replaced with actual QVAC sources)
const MODEL_SOURCES = {
  '1.7B': 'qwen3-1.7b-q4',
  '4B': 'qwen3-4b-q4'
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

  async loadModel(modelType = '1.7B', onProgress) {
    try {
      reportProgress(0, 'Starting...');
      
      // Simulate QVAC loading with progress
      // In real implementation, this would use @qvac/sdk:
      // const { loadModel: qvacLoadModel } = await import('@qvac/sdk');
      // modelId = await qvacLoadModel({
      //   modelSrc: MODEL_SOURCES[modelType],
      //   modelType: 'llm',
      //   modelConfig: { ctx_size: 4096 },
      //   onProgress: (p) => onProgress?.(p.percentage),
      // });

      // Simulated loading stages
      const stages = [
        { pct: 10, status: 'Downloading model weights...' },
        { pct: 30, status: 'Verifying checksum...' },
        { pct: 50, status: 'Loading into memory...' },
        { pct: 70, status: 'Initializing tokenizer...' },
        { pct: 85, status: 'Warming up model...' },
        { pct: 95, status: 'Almost ready...' },
        { pct: 100, status: 'Ready' },
      ];

      for (const stage of stages) {
        await new Promise(resolve => setTimeout(resolve, 300 + Math.random() * 200));
        reportProgress(stage.pct, stage.status);
      }

      modelId = `model-${modelType}-${Date.now()}`;
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

    // Simulate streaming response for demo
    const response = `Hello! I'm ready to help. You said: "${message}"`;
    
    // Stream tokens
    for (const char of response) {
      if (onToken) onToken(char);
      await new Promise(resolve => setTimeout(resolve, 20));
    }

    // Send done signal via onToken with empty string
    if (onToken) onToken('');
  }
};

export default aiService;