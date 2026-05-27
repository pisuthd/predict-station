import { ipcMain } from 'electron';
import { formFieldsStore, FormField } from './store';

// Register form fields IPC handlers
export function registerFormToolsHandlers(): void {
  // Get all form fields
  ipcMain.handle('form:getFields', async () => {
    return formFieldsStore.getFields();
  });

  // Set all form fields (from renderer)
  ipcMain.handle('form:setFields', async (_event, fields: FormField[]) => {
    formFieldsStore.setFields(fields);
    return { success: true };
  });

  // Add a single field
  ipcMain.handle('form:addField', async (_event, field: FormField) => {
    formFieldsStore.addField(field);
    return { success: true };
  });

  // Update a field
  ipcMain.handle('form:updateField', async (_event, id: string, updates: Partial<FormField>) => {
    formFieldsStore.updateField(id, updates);
    return { success: true };
  });

  // Remove a field
  ipcMain.handle('form:removeField', async (_event, id: string) => {
    formFieldsStore.removeField(id);
    return { success: true };
  });

  // Subscribe to field changes (for renderer to sync)
  ipcMain.handle('form:subscribe', async () => {
    // This would be handled via IPC events in the renderer
    return { success: true };
  });

  console.log('Form tools IPC handlers registered');
}