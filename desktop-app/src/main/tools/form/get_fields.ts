import { z } from 'zod';

export const getFormFieldsSchema = z.object({});

export const getFormFieldsMetadata = {
  uiDescription: 'Get the current form fields. Returns all field definitions including type, label, required status, placeholder, and options.',
  tags: ['form', 'fields', 'design'],
  requiredTools: [],
  packages: [],
  parameters: {},
};

export const getFormFieldsTool = {
  type: 'function' as const,
  name: 'get_form_fields',
  description: 'Get the current form fields. Returns all field definitions including type, label, required status, placeholder, and options.',
  parameters: getFormFieldsSchema,
  metadata: getFormFieldsMetadata,
  execute: async (_: Record<string, unknown>) => {
    try {
      // Get form fields from the main process store
      const fields = await global.formFieldsStore?.getFields();
      
      if (!fields || fields.length === 0) {
        return JSON.stringify({
          success: true,
          fields: [],
          message: 'No form fields defined yet. Use modify_form_fields to add fields.'
        }, null, 2);
      }
      
      return JSON.stringify({
        success: true,
        fields: fields,
        count: fields.length
      }, null, 2);
    } catch (error) {
      return JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  },
};