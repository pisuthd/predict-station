import { GripVertical, Trash2, Plus, X } from 'lucide-react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { FormField, FieldType } from './types';

interface FormFieldEditorProps {
  field: FormField;
  onUpdate: (updates: Partial<FormField>) => void;
  onRemove: () => void;
}

const fieldTypes: { type: FieldType; label: string }[] = [
  { type: 'text', label: 'Text' },
  { type: 'textarea', label: 'Long Text' },
  { type: 'email', label: 'Email' },
  { type: 'number', label: 'Number' },
  { type: 'select', label: 'Dropdown' },
  { type: 'checkbox', label: 'Checkbox' },
  { type: 'rating', label: 'Rating' },
  { type: 'date', label: 'Date' },
  { type: 'url', label: 'URL' },
  { type: 'file', label: 'File Upload' },
  { type: 'tel', label: 'Phone' },
];

interface SortableFormFieldEditorProps extends FormFieldEditorProps {
  isDragging?: boolean;
}

export function SortableFormFieldEditor({ field, onUpdate, onRemove }: SortableFormFieldEditorProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isSortableDragging,
  } = useSortable({ id: field.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isSortableDragging ? 0.5 : 1,
  };

  const showPlaceholder = field.type !== 'checkbox' && field.type !== 'rating' && field.type !== 'file';
  const showOptions = field.type === 'select';
  const showRatingConfig = field.type === 'rating';

  const handleAddOption = () => {
    const newOptions = [...(field.options || []), `Option ${(field.options?.length || 0) + 1}`];
    onUpdate({ options: newOptions });
  };

  const handleRemoveOption = (index: number) => {
    const newOptions = field.options?.filter((_, i) => i !== index) || [];
    onUpdate({ options: newOptions });
  };

  const handleUpdateOption = (index: number, value: string) => {
    const newOptions = [...(field.options || [])];
    newOptions[index] = value;
    onUpdate({ options: newOptions });
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-start gap-3 p-4 bg-[var(--color-bg-card)] rounded-xl border border-[var(--color-border-default)] group shadow-sm ${isSortableDragging ? 'z-50 shadow-lg ring-2 ring-accent-primary/50' : ''}`}
    >
      <div
        {...attributes}
        {...listeners}
        className="mt-2 text-[var(--color-text-muted)] cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <GripVertical size={16} />
      </div>

      <div className="flex-1 space-y-3">
        {/* Label and Type row */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-[var(--color-text-muted)] mb-1.5 uppercase tracking-wide">
              Label
            </label>
            <input
              type="text"
              value={field.label}
              onChange={(e) => onUpdate({ label: e.target.value })}
              className="w-full px-3 py-2 rounded-lg bg-[var(--color-bg-elevated)] border border-[var(--color-border-default)] text-[var(--color-text-primary)] focus:outline-none focus:border-accent-primary transition-colors text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[var(--color-text-muted)] mb-1.5 uppercase tracking-wide">
              Type
            </label>
            <select
              value={field.type}
              onChange={(e) => onUpdate({ type: e.target.value as FieldType })}
              className="w-full px-3 py-2 rounded-lg bg-[var(--color-bg-elevated)] border border-[var(--color-border-default)] text-[var(--color-text-primary)] focus:outline-none focus:border-accent-primary transition-colors text-sm"
            >
              {fieldTypes.map((ft) => (
                <option key={ft.type} value={ft.type}>{ft.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Placeholder (conditional) */}
        {showPlaceholder && (
          <div>
            <label className="block text-xs font-medium text-[var(--color-text-muted)] mb-1.5 uppercase tracking-wide">
              Placeholder
            </label>
            <input
              type={field.type === 'email' ? 'email' : field.type === 'url' ? 'url' : field.type === 'tel' ? 'tel' : field.type === 'number' ? 'number' : 'text'}
              value={field.placeholder}
              onChange={(e) => onUpdate({ placeholder: e.target.value })}
              placeholder={field.type === 'tel' ? '+1 (555) 123-4567' : field.type === 'url' ? 'https://...' : 'Enter placeholder...'}
              className="w-full px-3 py-2 rounded-lg bg-[var(--color-bg-elevated)] border border-[var(--color-border-default)] text-[var(--color-text-primary)] focus:outline-none focus:border-accent-primary transition-colors text-sm"
            />
          </div>
        )}

        {/* Rating config (conditional) */}
        {showRatingConfig && (
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-xs font-medium text-[var(--color-text-muted)] mb-1.5 uppercase tracking-wide">
                Min Stars
              </label>
              <input
                type="number"
                min="1"
                max="5"
                value={field.min || 1}
                onChange={(e) => onUpdate({ min: parseInt(e.target.value) || 1 })}
                className="w-full px-3 py-2 rounded-lg bg-[var(--color-bg-elevated)] border border-[var(--color-border-default)] text-[var(--color-text-primary)] focus:outline-none focus:border-accent-primary transition-colors text-sm"
              />
            </div>
            <div className="flex-1">
              <label className="block text-xs font-medium text-[var(--color-text-muted)] mb-1.5 uppercase tracking-wide">
                Max Stars
              </label>
              <input
                type="number"
                min="1"
                max="10"
                value={field.max || 5}
                onChange={(e) => onUpdate({ max: parseInt(e.target.value) || 5 })}
                className="w-full px-3 py-2 rounded-lg bg-[var(--color-bg-elevated)] border border-[var(--color-border-default)] text-[var(--color-text-primary)] focus:outline-none focus:border-accent-primary transition-colors text-sm"
              />
            </div>
          </div>
        )}

        {/* Options (conditional - for dropdown) */}
        {showOptions && (
          <div>
            <label className="block text-xs font-medium text-[var(--color-text-muted)] mb-1.5 uppercase tracking-wide">
              Options
            </label>
            <div className="space-y-2">
              {(field.options || []).map((option, index) => (
                <div key={index} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={option}
                    onChange={(e) => handleUpdateOption(index, e.target.value)}
                    className="flex-1 px-3 py-2 rounded-lg bg-[var(--color-bg-elevated)] border border-[var(--color-border-default)] text-[var(--color-text-primary)] focus:outline-none focus:border-accent-primary transition-colors text-sm"
                  />
                  <button
                    onClick={() => handleRemoveOption(index)}
                    className="p-2 rounded-lg text-[var(--color-text-muted)] hover:text-red-500 hover:bg-red-50 transition-colors"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
              <button
                onClick={handleAddOption}
                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[var(--color-bg-elevated)] border border-dashed border-[var(--color-border-default)] text-[var(--color-text-muted)] hover:text-accent-primary hover:border-accent-primary/50 transition-colors text-sm"
              >
                <Plus size={14} />
                Add Option
              </button>
            </div>
          </div>
        )}

        {/* File config (conditional) */}
        {field.type === 'file' && (
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-xs font-medium text-[var(--color-text-muted)] mb-1.5 uppercase tracking-wide">
                Max Size (MB)
              </label>
              <input
                type="number"
                min="1"
                max="100"
                value={field.maxSize || 10}
                onChange={(e) => onUpdate({ maxSize: parseInt(e.target.value) || 10 })}
                className="w-full px-3 py-2 rounded-lg bg-[var(--color-bg-elevated)] border border-[var(--color-border-default)] text-[var(--color-text-primary)] focus:outline-none focus:border-accent-primary transition-colors text-sm"
              />
            </div>
            <div className="flex-1">
              <label className="block text-xs font-medium text-[var(--color-text-muted)] mb-1.5 uppercase tracking-wide">
                Accept Types
              </label>
              <select
                value={field.acceptedTypes || '*'}
                onChange={(e) => onUpdate({ acceptedTypes: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-[var(--color-bg-elevated)] border border-[var(--color-border-default)] text-[var(--color-text-primary)] focus:outline-none focus:border-accent-primary transition-colors text-sm"
              >
                <option value="*">Any file</option>
                <option value="image/*">Images only</option>
                <option value=".pdf,.doc,.docx">Documents only</option>
                <option value="image/*,.pdf">Images & PDFs</option>
              </select>
            </div>
          </div>
        )}

        {/* Checkbox info (conditional) */}
        {field.type === 'checkbox' && (
          <p className="text-xs text-[var(--color-text-muted)]">
            Displayed as a toggle switch.
          </p>
        )}

        {/* Required toggle */}
        <div className="flex items-center gap-3 pt-2">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={field.required}
              onChange={(e) => onUpdate({ required: e.target.checked })}
              className="w-4 h-4 rounded border-[var(--color-border-default)] text-accent-primary focus:ring-accent-primary"
            />
            <span className="text-sm text-[var(--color-text-secondary)]">Required</span>
          </label>
        </div>
      </div>

      <button
        onClick={onRemove}
        className="mt-2 w-8 h-8 rounded-lg flex items-center justify-center text-[var(--color-text-muted)] hover:text-red-500 hover:bg-red-50 transition-colors"
      >
        <Trash2 size={16} />
      </button>
    </div>
  );
}

export default function FormFieldEditor(props: FormFieldEditorProps) {
  return <SortableFormFieldEditor {...props} />;
}