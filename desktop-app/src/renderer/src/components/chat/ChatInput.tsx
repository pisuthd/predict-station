import { Send } from 'lucide-react';

interface ChatInputProps {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  onKeyDown: (e: React.KeyboardEvent) => void;
  disabled: boolean;
}

export default function ChatInput({
  value,
  onChange,
  onSend,
  onKeyDown,
  disabled,
}: ChatInputProps) {
  return (
    <div className="relative">
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={onKeyDown}
        placeholder="Ask me anything about forms..."
        rows={1}
        className="w-full px-4 py-3 pr-12 rounded-2xl bg-[var(--color-bg-elevated)] border border-[var(--color-border-default)] text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)] resize-none focus:outline-none focus:border-accent-primary transition-colors"
        style={{ minHeight: '48px', maxHeight: '120px' }}
      />
      <button
        onClick={onSend}
        disabled={disabled}
        className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-xl bg-accent-primary text-white flex items-center justify-center hover:bg-accent-primary-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <Send size={18} />
      </button>
    </div>
  );
}