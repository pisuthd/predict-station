 

export interface FormField {
  id: string;
  type: string;
  label: string;
  required?: boolean;
  placeholder?: string;
  options?: string[];
  min?: number;
  max?: number;
}

// Default fields for new form
export const DEFAULT_FIELDS: FormField[] = [
  { id: '1', type: 'text', label: 'Name', placeholder: 'Enter your name', required: true },
  { id: '2', type: 'email', label: 'Email', placeholder: 'Enter your email', required: true },
];

class FormFieldsStore {
  private fields: FormField[] = [...DEFAULT_FIELDS];
  private listeners: Set<(fields: FormField[]) => void> = new Set();

  getFields(): FormField[] {
    return [...this.fields];
  }

  setFields(fields: FormField[]): void {
    this.fields = [...fields];
    this.notifyListeners();
  }

  addField(field: FormField): void {
    this.fields.push(field);
    this.notifyListeners();
  }

  updateField(id: string, updates: Partial<FormField>): void {
    const index = this.fields.findIndex(f => f.id === id);
    if (index !== -1) {
      this.fields[index] = { ...this.fields[index], ...updates };
      this.notifyListeners();
    }
  }

  removeField(id: string): void {
    this.fields = this.fields.filter(f => f.id !== id);
    this.notifyListeners();
  }

  // Clear all fields
  resetFields(): void {
    this.fields = [];
    this.notifyListeners();
  }

  subscribe(listener: (fields: FormField[]) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notifyListeners(): void {
    const currentFields = [...this.fields];
    this.listeners.forEach(listener => listener(currentFields));
  }
}

// Singleton instance
export const formFieldsStore = new FormFieldsStore();

// Expose to global for tool access
(global as any).formFieldsStore = formFieldsStore;