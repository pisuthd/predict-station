export type FieldType = 
  | 'text' 
  | 'textarea' 
  | 'email' 
  | 'number' 
  | 'select'
  | 'checkbox'
  | 'rating'
  | 'date'
  | 'url'
  | 'file'
  | 'tel';

export interface FormField {
  id: string;
  type: FieldType;
  label: string;
  placeholder: string;
  required: boolean;
  options?: string[]; // for select/dropdown
  min?: number; // for rating
  max?: number; // for rating
  maxSize?: number; // for file (in MB)
  acceptedTypes?: string; // for file (e.g., "image/*,.pdf")
}

export function createField(type: FieldType, id: string): FormField {
  const defaults: Record<FieldType, Partial<FormField>> = {
    text: { label: 'Text Field', placeholder: 'Enter text...' },
    textarea: { label: 'Long Text', placeholder: 'Enter detailed response...' },
    email: { label: 'Email', placeholder: 'Enter your email...' },
    number: { label: 'Number', placeholder: 'Enter a number...' },
    select: { label: 'Dropdown', placeholder: 'Select an option...', options: ['Option 1', 'Option 2', 'Option 3'] },
    checkbox: { label: 'Checkbox', placeholder: '' },
    rating: { label: 'Rating', min: 1, max: 5 },
    date: { label: 'Date', placeholder: 'Select a date...' },
    url: { label: 'Website URL', placeholder: 'https://...' },
    file: { label: 'File Upload', placeholder: 'Upload a file...', maxSize: 10, acceptedTypes: '*' },
    tel: { label: 'Phone Number', placeholder: '+1 (555) 123-4567' },
  };

  return {
    id,
    type,
    label: defaults[type].label || `New ${type}`,
    placeholder: defaults[type].placeholder || '',
    required: false,
    options: (defaults[type] as { options?: string[] }).options,
    min: (defaults[type] as { min?: number }).min,
    max: (defaults[type] as { max?: number }).max,
  };
}