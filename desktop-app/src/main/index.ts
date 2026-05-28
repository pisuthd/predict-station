import { app, shell, BrowserWindow, ipcMain } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'
import { setupWalletHandlers, setupCLIHandlers, setupSubmissionsHandlers } from './wallet'
import { registerSessionsIpcHandlers, initSessions } from './sessions'
import { registerDeploymentsIpcHandlers } from './sessions/deployments-handler'
import { registerFormToolsHandlers } from './tools/form/handlers'
import { formFieldsStore } from './tools/form/store'

// ============================================
// QVAC Service - AI Model (Main Process)
// ============================================
import {
  QWEN3_4B_INST_Q4_K_M,
  QWEN3_1_7B_INST_Q4,
  loadModel,
  unloadModel,
} from '@qvac/sdk';
import { logInfo, logError, logQVAC, getRecentLogs, getLogFilePathForUI } from './logger';

// Available models for selection
export type ModelType = '4B' | '1.7B';

// Local model file path
// const LOCAL_MODEL_PATH = 'c:\\projects\\medpsy-1.7b-q4_k_m-imat.gguf';

export const MODEL_INFO = {
  '1.7B': {
    name: 'Qwen3-1.7B',
    specs: '8GB+ RAM • ~1.5GB disk',
    label: 'Starter'
  },
  '4B': {
    name: 'Qwen3-4B',
    specs: '16GB+ RAM • ~3-4GB disk',
    label: 'High-spec'
  },
  'LOCAL': {
    name: 'Medpsy-1.7B (Local)',
    specs: 'Local file • medpsy-1.7b-q4_k_m-imat.gguf',
    label: 'Custom'
  }
} as const;

function getModelSource(modelType: ModelType) {
  if (modelType === '4B') return QWEN3_4B_INST_Q4_K_M;
  // if (modelType === 'LOCAL') return LOCAL_MODEL_PATH;
  return QWEN3_1_7B_INST_Q4;
}

function getModelName(modelType: ModelType): string {
  return MODEL_INFO[modelType].name;
}

let modelId: string | null = null;
let currentModelType: ModelType | null = null;

let modelLoadStartTime: number | null = null;

async function loadQVACModel(modelType: ModelType): Promise<string | null> {
  try {
    const modelSource = getModelSource(modelType);
    const modelDisplayName = getModelName(modelType);
    
    modelLoadStartTime = Date.now();
    logInfo(`Loading ${modelDisplayName}...`, { modelType });
    
    modelId = await loadModel({
      modelSrc: modelSource,
      modelType: 'llamacpp-completion',
        modelConfig: {
          ctx_size: 4096,
          tools: false, // Enable tools for form studio
        },
      onProgress: (progress) => {
        const progressMsg = typeof progress === 'string' ? progress : JSON.stringify(progress);
        logQVAC(progressMsg);
      }
    });
    
    currentModelType = modelType;
    const loadTime = modelLoadStartTime ? ((Date.now() - modelLoadStartTime) / 1000).toFixed(1) : 'unknown';
    logInfo(`${modelDisplayName} loaded successfully`, { modelId, loadTime: `${loadTime}s` });
    modelLoadStartTime = null;
    
    return modelId;
  } catch (error) {
    logError(`Failed to load model: ${modelType}`, error);
    modelLoadStartTime = null;
    return null;
  }
}

// ============================================
// AI Chat IPC Handler (Streaming with Thinking)
// ============================================
import { completion } from '@qvac/sdk';

let mainWindowRef: Electron.BrowserWindow | null = null;

// System prompts for different contexts
export const SYSTEM_PROMPTS = {
  chat: `You are an AI assistant. No tools are currently available.
For form building assistance, use the Form Assistant on the New Form page.`,

  formAssistant: `You are a FORM BUILDER assistant. Your ONLY job is to help users design form fields.

CRITICAL LIMITATIONS:
- You cannot create websites, write code, or do anything outside form design
- You MUST use the provided tools to make changes - do not suggest manual actions
- Only respond with form field related questions

Tools:
- get_form_fields: View current form fields
- modify_form_fields: Add/update/remove form fields (add=[{type,label,options}], update/remove=[{id}])
- reset_form_fields: Clear all fields

Available types: text, email, tel, url, number, textarea, select, checkbox, rating, date.
Select fields need options array.

If user wants a new/different form, use reset_form_fields first to clear all fields.`,
};

async function executeAiStreamingChat(
  history: { role: string; content: string }[],
  message: string,
  tools?: any[],
  systemPrompt?: string
): Promise<void> {
  if (!modelId || !mainWindowRef) {
    mainWindowRef?.webContents.send('ai:error', 'AI model not loaded');
    return;
  }

  const window = mainWindowRef;
  let fullResponse = '';
  const hasToolCalls = tools && tools.length > 0;

  try {
    // Build conversation with optional system prompt
    let conversationHistory = [...history, { role: 'user', content: message }];
    if (systemPrompt) {
      conversationHistory = [{ role: 'system', content: systemPrompt }, ...conversationHistory];
    }

    const completionOptions: any = {
      modelId: modelId,
      history: conversationHistory,
      stream: true,
      kvCache: true,
      captureThinking: true,
    };

    // Add tools if provided (for form assistant)
    if (hasToolCalls) {
      completionOptions.tools = tools;
    }

    const result = completion(completionOptions);

    if (hasToolCalls) {
      // When tools are enabled, we need to iterate events AND collect tool calls
      // The SDK provides both through result.events and result.toolCalls
      let pendingToolCalls: any[] = [];
      
      // Iterate events and stream while waiting for tool calls
      for await (const streamEvent of result.events) {
        switch (streamEvent.type) {
          case "contentDelta":
            fullResponse += streamEvent.text;
            window.webContents.send('ai:streamToken', streamEvent.text);
            break;
          case "thinkingDelta":
            window.webContents.send('ai:streamThinking', streamEvent.text);
            break;
          case "toolCall":
            // Collect tool calls as they come in
            pendingToolCalls.push(streamEvent.call);
            console.log(`[AI] Tool call received: ${streamEvent.call.name}`);
            break;
          case "completionDone":
            window.webContents.send('ai:streamToken', '');
            break;
        }
      }
      
      // After stream completes, check if we have tool calls
      const toolCalls = await result.toolCalls;
      console.log(`[AI] Tool calls resolved: ${toolCalls.length}`);
      
      // Use tool calls from stream if available, otherwise from resolved promise
      const allToolCalls = pendingToolCalls.length > 0 ? pendingToolCalls : toolCalls;
      
      if (allToolCalls.length > 0) {
        // Execute tools
        for (const toolCall of allToolCalls) {
          console.log(`[AI] Executing: ${toolCall.name}(${JSON.stringify(toolCall.arguments)})`);
          
          let toolResult = '';
          try {
            if (toolCall.name === 'get_form_fields') {
              toolResult = JSON.stringify({
                success: true,
                fields: formFieldsStore.getFields(),
                count: formFieldsStore.getFields().length
              }, null, 2);
            } else if (toolCall.name === 'modify_form_fields') {
              const args = toolCall.arguments as any;
              const { action, fieldId } = args;
              
              // Handle both formats:
              // 1. Nested: { action, field: { type, label, ... } }
              // 2. Flat: { action, fields: [{ type, label, ... }], form_id }
              
              let fieldsToAdd: any[] = [];
              
              // Check for fields array (AI format)
              if (args.fields && Array.isArray(args.fields)) {
                fieldsToAdd = args.fields;
              } else if (args.field) {
                // Single field object
                fieldsToAdd = [args.field];
              } else if (!fieldId && args.type) {
                // Flat params
                fieldsToAdd = [{
                  type: args.type,
                  label: args.label || `${args.type} Field`,
                  placeholder: args.placeholder || '',
                  required: args.required || false,
                  options: args.options,
                  min: args.min,
                  max: args.max,
                }];
              }
              
              // Map radio to select type
              fieldsToAdd = fieldsToAdd.map((f: any) => ({
                ...f,
                type: f.type === 'radio' ? 'select' : f.type,
              }));
              
              if (action === 'add') {
                const addedFields = fieldsToAdd.map((fieldData: any) => {
                  const newField = { id: Date.now().toString(), ...fieldData };
                  formFieldsStore.addField(newField);
                  return newField;
                });
                toolResult = JSON.stringify({ 
                  success: true, 
                  action: 'added', 
                  fields: addedFields,
                  allFields: formFieldsStore.getFields(),
                  message: `Added ${addedFields.length} field(s)`
                }, null, 2);
              } else if (action === 'update' && fieldId) {
                formFieldsStore.updateField(fieldId, fieldsToAdd[0] || {});
                toolResult = JSON.stringify({ 
                  success: true, 
                  action: 'updated', 
                  fieldId, 
                  allFields: formFieldsStore.getFields() 
                }, null, 2);
              } else if (action === 'remove' && fieldId) {
                formFieldsStore.removeField(fieldId);
                toolResult = JSON.stringify({ 
                  success: true, 
                  action: 'removed', 
                  fieldId,
                  allFields: formFieldsStore.getFields() 
                }, null, 2);
              } else {
                toolResult = JSON.stringify({ success: false, error: 'Invalid action' });
              }
            } else if (toolCall.name === 'reset_form_fields') {
              formFieldsStore.resetFields();
              toolResult = JSON.stringify({ 
                success: true, 
                action: 'reset',
                allFields: formFieldsStore.getFields(),
                message: 'Form reset to default fields'
              }, null, 2);
            }
            
            console.log(`[AI] Tool result: ${toolResult}`);
            window.webContents.send('ai:toolResult', { name: toolCall.name, result: toolResult });
            
            // Add tool result and continue
            conversationHistory.push({ role: 'tool', content: toolResult });
            
            // Second completion with tool result
            const continuedResult = completion({
              modelId: modelId,
              history: conversationHistory,
              stream: true,
              kvCache: true,
              captureThinking: true,
            });

            // Stream the continuation
            for await (const streamEvent of continuedResult.events) {
              switch (streamEvent.type) {
                case "contentDelta":
                  fullResponse += streamEvent.text;
                  window.webContents.send('ai:streamToken', streamEvent.text);
                  break;
                case "thinkingDelta":
                  window.webContents.send('ai:streamThinking', streamEvent.text);
                  break;
                case "completionDone":
                  window.webContents.send('ai:streamToken', '');
                  break;
              }
            }
            
            return;
          } catch (error) {
            const errorMsg = error instanceof Error ? error.message : String(error);
            console.error(`[AI] Tool error: ${errorMsg}`);
            window.webContents.send('ai:error', errorMsg);
          }
        }
      }
      
      return;
    } else {
      // No tools - simple streaming
      for await (const streamEvent of result.events) {
        switch (streamEvent.type) {
          case "contentDelta":
            fullResponse += streamEvent.text;
            window.webContents.send('ai:streamToken', streamEvent.text);
            break;
          case "thinkingDelta":
            window.webContents.send('ai:streamThinking', streamEvent.text);
            break;
          case "completionDone":
            window.webContents.send('ai:streamToken', '');
            break;
        }
      }
    }
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    window.webContents.send('ai:error', errorMsg);
  }
}

// ============================================
// QVAC IPC Handlers
// ============================================

function registerQVACIpcHandlers(): void {
  // Get AI status
  ipcMain.handle('ai:getStatus', async () => {
    return {
      isReady: modelId !== null,
      modelId: modelId,
      modelType: currentModelType,
    };
  });

  // Get available models info
  ipcMain.handle('ai:getModels', async () => {
    return MODEL_INFO;
  });

  // Select and load model
  ipcMain.handle('ai:selectModel', async (_event, modelType: ModelType) => {
    try {
      // Unload existing model if any
      if (modelId) {
        await unloadModel({ modelId });
        modelId = null;
        currentModelType = null;
      }
      
      // Load the selected model
      const loadedModelId = await loadQVACModel(modelType);
      
      if (loadedModelId) {
        return { success: true, modelId: loadedModelId, modelType };
      } else {
        return { success: false, error: 'Failed to load model' };
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to load model';
      return { success: false, error: message };
    }
  });

  // Unload model
  ipcMain.handle('ai:unloadModel', async () => {
    try {
      if (modelId) {
        await unloadModel({ modelId });
        modelId = null;
        currentModelType = null;
      }
      return { success: true };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to unload model';
      return { success: false, error: message };
    }
  });

  // Send chat message (streaming) - without tools, with system prompt for chat
  ipcMain.on('ai:sendMessage', (_event, history: { role: string; content: string }[], message: string) => {
    executeAiStreamingChat(history, message, undefined, SYSTEM_PROMPTS.chat);
  });

  // Send chat message with tools (for form assistant), with form assistant system prompt
  ipcMain.on('ai:sendMessageWithTools', (_event, history: { role: string; content: string }[], message: string, tools: any[]) => {
    executeAiStreamingChat(history, message, tools, SYSTEM_PROMPTS.formAssistant);
  });

  console.log('QVAC IPC handlers registered');

  // Logs handler
  ipcMain.handle('logs:getRecent', async (_event, lines: number = 50) => {
    return getRecentLogs(lines);
  });

  ipcMain.handle('logs:getPath', async () => {
    return getLogFilePathForUI();
  });

  console.log('Logs IPC handlers registered');
}

// ============================================
// Window Creation
// ============================================

function createWindow(): void {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 900,
    height: 670,
    show: false,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }

  // Store reference for streaming
  mainWindowRef = mainWindow;
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  // Set app user model id for windows
  electronApp.setAppUserModelId('com.walrus.form-studio')

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  // IPC test
  ipcMain.on('ping', () => console.log('pong'))

  // Setup wallet handlers
  setupWalletHandlers(ipcMain)

  // Setup CLI handlers
  setupCLIHandlers(ipcMain)

  // Register QVAC AI handlers
  registerQVACIpcHandlers()

  // Initialize and register sessions handlers
  initSessions()
  registerSessionsIpcHandlers()
  
  // Register deployments handlers
  registerDeploymentsIpcHandlers()

  // Register submissions handlers
  setupSubmissionsHandlers(ipcMain)

  // Register form tools handlers
  registerFormToolsHandlers()

  createWindow()

  console.log('[App] Walrus Form Studio ready');

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// Unload model before quitting
app.on('before-quit', async () => {
  if (modelId) {
    try {
      await unloadModel({ modelId });
      console.log('[QVAC] Model unloaded on exit');
    } catch (error) {
      console.error('Failed to unload model:', error);
    }
  }
})