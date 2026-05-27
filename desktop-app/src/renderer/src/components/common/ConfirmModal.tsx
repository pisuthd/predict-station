import { X } from 'lucide-react';

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message?: string;
  error?: string | null;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel?: () => void;
  onClose?: () => void;
  variant?: 'danger' | 'default';
  customContent?: React.ReactNode;
}

export default function ConfirmModal({
  isOpen,
  title,
  message,
  error = null,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  onConfirm,
  onCancel,
  onClose,
  variant = 'default',
  customContent,
}: ConfirmModalProps) {
  if (!isOpen) return null;

  const isDanger = variant === 'danger';

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center"
      onClick={onCancel}
    >
      <div className="absolute inset-0 bg-black/50" />

      <div
        className="relative w-full max-w-md mx-4 rounded-2xl p-6 bg-[var(--color-bg-elevated)] border border-[var(--color-border-default)]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-[var(--color-text-primary)]">
            {title}
          </h3>
          <button
            onClick={() => onClose?.() ?? onCancel?.()}
            className="p-2 rounded-lg hover:bg-[var(--color-bg-card)] text-[var(--color-text-muted)] transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl text-sm bg-red-500/10 border border-red-500/30 text-red-400">
            {error}
          </div>
        )}

        {customContent || (
          <p className="mb-6 text-[var(--color-text-muted)]">
            {message}
          </p>
        )}

        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-3 rounded-xl border border-[var(--color-border-default)] text-[var(--color-text-muted)] hover:bg-[var(--color-bg-card)] transition-colors"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className={`flex-1 px-4 py-3 rounded-xl font-semibold transition-colors ${
              isDanger
                ? 'bg-red-500 text-white hover:bg-red-600'
                : 'bg-accent-primary text-white hover:bg-accent-primary-hover'
            }`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}