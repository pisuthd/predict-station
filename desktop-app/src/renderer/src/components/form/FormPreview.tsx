import { Star, ChevronDown } from 'lucide-react';

interface FormField {
  id: string;
  type: string;
  label: string;
  required?: boolean;
  placeholder?: string;
  options?: string[];
  min?: number;
  max?: number;
}

interface FormPreviewProps {
  formName: string;
  fields: FormField[];
}

export default function FormPreview({ formName, fields }: FormPreviewProps) {
  const renderField = (field: FormField) => {
    const baseFieldClasses = "w-full px-4 py-3 rounded-lg bg-[var(--color-bg-surface)] border border-[var(--color-border-default)] text-[var(--color-text-primary)]";
    
    switch (field.type) {
      case 'textarea':
        return (
          <div key={field.id} className="mb-4">
            <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-1.5">
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <textarea className={`${baseFieldClasses} min-h-[80px] resize-none`} disabled placeholder={field.placeholder} />
          </div>
        );

      case 'select':
        return (
          <div key={field.id} className="mb-4">
            <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-1.5">
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <div className="relative">
              <select className={`${baseFieldClasses} appearance-none cursor-not-allowed pr-10`} disabled>
                <option>{field.placeholder || 'Select an option'}</option>
                {field.options?.map((opt, i) => (
                  <option key={i} disabled>{opt}</option>
                ))}
              </select>
              <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)] pointer-events-none" />
            </div>
          </div>
        );

      case 'checkbox':
        return (
          <div key={field.id} className="mb-4">
            <label className="flex items-center gap-3 cursor-not-allowed">
              <input type="checkbox" disabled className="w-5 h-5 rounded border-[var(--color-border-default)]" />
              <span className="text-sm text-[var(--color-text-primary)]">{field.label}</span>
              {field.required && <span className="text-red-500 text-xs">*</span>}
            </label>
          </div>
        );

      case 'rating':
        const min = field.min || 1;
        const max = field.max || 5;
        return (
          <div key={field.id} className="mb-4">
            <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-2">
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <div className="flex items-center gap-1">
              {[...Array(max)].map((_, i) => (
                <Star key={i} size={24} className="text-[var(--color-text-muted)]" />
              ))}
              <span className="ml-2 text-sm text-[var(--color-text-muted)]">{min}-{max}</span>
            </div>
          </div>
        );

      case 'date':
        return (
          <div key={field.id} className="mb-4">
            <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-1.5">
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <input type="date" className={baseFieldClasses} disabled placeholder={field.placeholder} />
          </div>
        );

      default:
        return (
          <div key={field.id} className="mb-4">
            <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-1.5">
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <input 
              type={field.type === 'email' ? 'email' : field.type === 'tel' ? 'tel' : field.type === 'url' ? 'url' : 'text'} 
              className={baseFieldClasses} 
              disabled 
              placeholder={field.placeholder} 
            />
          </div>
        );
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="px-6 py-5 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">{formName}</h2>
          </div>
          <div className="text-sm text-gray-400">{fields.length} questions</div>
        </div>
      </div>
      
      <div className="p-6">
        {fields.map((field) => renderField(field))}
      </div>
    </div>
  );
}