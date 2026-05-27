import { Plus, Star, CheckSquare, Calendar, Link, Phone } from 'lucide-react';
import { FieldType } from './types';

interface FieldTypeSelectorProps {
  onAddField: (type: FieldType) => void;
}

const fieldTypes: { type: FieldType; label: string; icon?: React.ReactNode }[] = [
  { type: 'text', label: 'Text' },
  { type: 'textarea', label: 'Long Text' },
  { type: 'email', label: 'Email' },
  { type: 'number', label: 'Number' },
  { type: 'select', label: 'Dropdown' },
  { type: 'checkbox', label: 'Checkbox', icon: <CheckSquare size={14} /> },
  { type: 'rating', label: 'Rating', icon: <Star size={14} /> },
  { type: 'date', label: 'Date', icon: <Calendar size={14} /> },
  { type: 'url', label: 'URL', icon: <Link size={14} /> },
  // { type: 'file', label: 'File Upload', icon: <Upload size={14} /> },
  { type: 'tel', label: 'Phone', icon: <Phone size={14} /> },
];

export default function FieldTypeSelector({ onAddField }: FieldTypeSelectorProps) {
  return (
    <div className="space-y-3">
      <p className="text-sm font-medium text-[var(--color-text-muted)]">Add Field</p>
      <div className="flex flex-wrap gap-2">
        {fieldTypes.map((ft) => (
          <button
            key={ft.type}
            onClick={() => onAddField(ft.type)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[var(--color-bg-elevated)] border border-[var(--color-border-default)] text-[var(--color-text-secondary)] hover:text-accent-primary hover:border-accent-primary/50 transition-colors text-sm font-medium"
          >
            {ft.icon ? ft.icon : <Plus size={14} />}
            {ft.label}
          </button>
        ))}
      </div>
    </div>
  );
}