import { useState } from 'react';
import { X } from 'lucide-react';

interface CreateSessionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (name: string) => Promise<void>;
}

export default function CreateSessionModal({ isOpen, onClose, onCreate }: CreateSessionModalProps) {
  const [name, setName] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || isCreating) return;

    setError(null);
    setSuccess(null);
    setIsCreating(true);

    try {
      await onCreate(name.trim());
      setSuccess('Session created!');
      setName('');
      setTimeout(() => {
        onClose();
        setSuccess(null);
      }, 1000);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create session';
      setError(errorMessage);
    } finally {
      setIsCreating(false);
    }
  };

  const handleClose = () => {
    setName('');
    setError(null);
    setSuccess(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      onClick={handleClose}
    >
      <div className="absolute inset-0 bg-black/50" />

      <div
        className="relative w-full max-w-md mx-4 rounded-2xl p-6 bg-[var(--color-bg-elevated)] border border-[var(--color-border-default)]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-[var(--color-text-primary)]">
            Create New Session
          </h3>
          <button
            onClick={handleClose}
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

        {success && (
          <div className="mb-4 p-3 rounded-xl text-sm bg-green-500/10 border border-green-500/30 text-green-400">
            {success}
          </div>
        )}

        {success === null && (
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-sm mb-2 text-[var(--color-text-muted)]">
                Session Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  setError(null);
                }}
                placeholder="e.g., form-analysis, feedback-review"
                className="w-full px-4 py-3 rounded-xl border border-[var(--color-border-default)] bg-[var(--color-bg-card)] text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] focus:border-accent-primary focus:outline-none transition-colors"
                autoFocus
              />
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={handleClose}
                className="flex-1 px-4 py-3 rounded-xl border border-[var(--color-border-default)] text-[var(--color-text-muted)] hover:bg-[var(--color-bg-card)] transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!name.trim() || isCreating}
                className="flex-1 px-4 py-3 rounded-xl font-semibold bg-accent-primary text-white hover:bg-accent-primary-hover transition-colors disabled:opacity-50"
              >
                {isCreating ? 'Creating...' : 'Create Session'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}