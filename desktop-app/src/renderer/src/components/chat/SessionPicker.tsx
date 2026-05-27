import { motion } from 'framer-motion';
import { ChevronDown, Loader2 } from 'lucide-react';

interface SessionOption {
  value: string;
  label: string;
}

interface SessionPickerProps {
  currentSession: string;
  sessions: SessionOption[];
  isLoading: boolean;
  isOpen: boolean;
  onToggle: () => void;
  onSelect: (session: string) => void;
}

export default function SessionPicker({
  currentSession,
  sessions,
  isLoading,
  isOpen,
  onToggle,
  onSelect,
}: SessionPickerProps) {
  return (
    <div className="relative">
      <button
        onClick={onToggle}
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[var(--color-bg-elevated)] border border-[var(--color-border-default)] hover:border-accent-primary transition-colors text-sm"
      >
        <span className="capitalize">{currentSession}</span>
        <ChevronDown size={14} />
      </button>
      
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute right-0 top-full mt-2 w-56 bg-[var(--color-bg-elevated)] border border-[var(--color-border-default)] rounded-xl shadow-lg overflow-hidden z-20"
        >
          {isLoading ? (
            <div className="px-4 py-3 flex items-center justify-center">
              <Loader2 size={16} className="animate-spin text-[var(--color-text-muted)]" />
            </div>
          ) : (
            sessions.map(session => (
              <button
                key={session.value}
                onClick={() => {
                  onSelect(session.value);
                }}
                className={`w-full px-4 py-2 text-left hover:bg-[var(--color-bg-card)] transition-colors ${
                  session.value === currentSession ? 'text-accent-primary font-medium' : 'text-[var(--color-text-primary)]'
                }`}
              >
                {session.label}
              </button>
            ))
          )}
        </motion.div>
      )}
    </div>
  );
}