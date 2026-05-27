import { motion } from 'framer-motion';
import { Bot, User } from 'lucide-react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface ChatMessageProps {
  message: Message;
  showThinking?: boolean;
  thinkingContent?: string;
  isThinkingExpanded: boolean;
  onToggleThinking: () => void;
  isLoading: boolean;
}

export default function ChatMessage({
  message,
  showThinking,
  thinkingContent,
  isThinkingExpanded,
  onToggleThinking,
  isLoading,
}: ChatMessageProps) {
  return (
    <div>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className={`flex gap-3 ${message.role === 'user' ? 'flex-row-reverse' : ''}`}
      >
        {/* Avatar */}
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
          message.role === 'user'
            ? 'bg-accent-primary'
            : 'bg-[var(--color-bg-elevated)] border border-[var(--color-border-default)]'
        }`}>
          {message.role === 'user' ? (
            <User size={18} className="text-white" />
          ) : (
            <Bot size={18} className="text-accent-primary" />
          )}
        </div>
        
        {/* Message bubble */}
        <div className={`max-w-[70%] rounded-2xl px-4 py-3 ${
          message.role === 'user'
            ? 'bg-accent-primary text-white'
            : 'bg-[var(--color-bg-card)] border border-[var(--color-border-default)] text-[var(--color-text-primary)]'
        }`}>
          <p className="text-[15px] leading-relaxed whitespace-pre-wrap break-words">
            {message.content}
          </p>
        </div>
      </motion.div>
      
      {/* Thinking box */}
      {showThinking && (
        <div 
          className="mt-2 ml-11 rounded-xl p-2 bg-[var(--color-bg-card)] border border-[var(--color-border-default)] cursor-pointer hover:bg-[var(--color-bg-elevated)] transition-colors"
          onClick={() => !isLoading && onToggleThinking()}
        >
          {isThinkingExpanded ? (
            <p className="text-xs italic text-[var(--color-text-secondary)] whitespace-pre-wrap break-words">
              {thinkingContent}
            </p>
          ) : (
            <span className="text-xs text-[var(--color-text-muted)]">click to show thinking</span>
          )}
          {!isLoading && (
            <span className="text-xs mt-1 block text-[var(--color-text-muted)]">
              {isThinkingExpanded ? 'click to hide' : ''}
            </span>
          )}
        </div>
      )}
    </div>
  );
}