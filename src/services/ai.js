// AI Service - Model Management (Placeholder)
// @qvac/sdk will be integrated separately in the backend server process

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
      reportProgress(0, 'Starting...');
      
      // Simulated loading stages (placeholder for real QVAC integration)
      const stages = [
        { pct: 10, status: 'Connecting to model service...' },
        { pct: 25, status: 'Downloading model weights...' },
        { pct: 45, status: 'Verifying checksum...' },
        { pct: 60, status: 'Loading into memory...' },
        { pct: 75, status: 'Initializing tokenizer...' },
        { pct: 90, status: 'Warming up model...' },
        { pct: 100, status: 'Ready' },
      ];

      for (const stage of stages) {
        await new Promise(resolve => setTimeout(resolve, 400 + Math.random() * 300));
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