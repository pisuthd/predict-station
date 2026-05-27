import { z } from 'zod';

// Field definition schema for validation
const fieldDefinitionSchema = z.object({
  type: z.enum([
    'text', 'email', 'tel', 'url', 'number',
    'textarea', 'select', 'checkbox', 'rating', 'date'
  ]),
  label: z.string().min(1, 'Label is required'),
  required: z.boolean().optional().default(false),
  placeholder: z.string().optional(),
  options: z.array(z.string()).optional(), // For select field
  min: z.number().optional(), // For rating field
  max: z.number().optional(), // For rating field
});

export const modifyFormFieldsSchema = z.object({
  action: z.enum(['add', 'update', 'remove']),
  fieldId: z.string().optional().describe('Field ID (required for update/remove)'),
  field: fieldDefinitionSchema.optional().describe('Field definition (required for add/update)'),
});

export const modifyFormFieldsMetadata = {
  uiDescription: 'Modify form fields: add new fields, update existing fields, or remove fields. Use get_form_fields first to see current fields.',
  tags: ['form', 'fields', 'design'],
  requiredTools: [],
  packages: [],
  parameters: {
    action: { type: 'string', description: 'Action: add, update, or remove', required: true },
    fieldId: { type: 'string', description: 'Target field ID (required for update/remove)', required: false },
    field: { type: 'object', description: 'Field definition: type (text/email/tel/url/number/textarea/select/checkbox/rating/date), label, required, placeholder, options, min, max', required: false },
  },
};

export const modifyFormFieldsTool = {
  type: 'function' as const,
  name: 'modify_form_fields',
  description: 'Modify form fields: add new fields (action=add), update existing fields (action=update), or remove fields (action=remove). Requires fieldId for update/remove.',
  parameters: modifyFormFieldsSchema,
  metadata: modifyFormFieldsMetadata,
  execute: async (args: { action: string; fieldId?: string; field?: Record<string, unknown> }) => {
    try {
      const { action, fieldId, field } = args;
      
      if (action === 'add' && !field) {
        return JSON.stringify({
          success: false,
          error: 'Field definition is required for add action'
        });
      }
      
      if ((action === 'update' || action === 'remove') && !fieldId) {
        return JSON.stringify({
          success: false,
          error: 'Field ID is required for update/remove action'
        });
      }
      
      // Validate field type if provided
      if (field && 'type' in field) {
        const validTypes = ['text', 'email', 'tel', 'url', 'number', 'textarea', 'select', 'checkbox', 'rating', 'date'];
        if (!validTypes.includes(field.type as string)) {
          return JSON.stringify({
            success: false,
            error: `Invalid field type: ${field.type}. Valid types: ${validTypes.join(', ')}`
          });
        }
      }
      
      // Get the store from global
      const store = global.formFieldsStore;
      
      if (action === 'add') {
        const newField = {
          id: Date.now().toString(),
          ...field,
        };
        await store?.addField(newField as any);
        return JSON.stringify({
          success: true,
          action: 'added',
          field: newField,
          message: `Added new ${field?.type || 'field'}: ${field?.label}`
        }, null, 2);
      }
      
      if (action === 'update') {
        if (!fieldId) {
          return JSON.stringify({ success: false, error: 'Field ID required' });
        }
        await store?.updateField(fieldId, field as any);
        return JSON.stringify({
          success: true,
          action: 'updated',
          fieldId,
          updates: field,
          message: `Updated field: ${field?.label || fieldId}`
        }, null, 2);
      }
      
      if (action === 'remove') {
        if (!fieldId) {
          return JSON.stringify({ success: false, error: 'Field ID required' });
        }
        await store?.removeField(fieldId);
        return JSON.stringify({
          success: true,
          action: 'removed',
          fieldId,
          message: `Removed field: ${fieldId}`
        }, null, 2);
      }
      
      return JSON.stringify({
        success: false,
        error: `Unknown action: ${action}`
      });
    } catch (error) {
      return JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  },
};