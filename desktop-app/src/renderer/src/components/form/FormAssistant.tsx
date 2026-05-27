import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Send, Bot, User, AlertTriangle } from 'lucide-react';
import { useSession, SessionInfo } from '../../context/SessionContext';
import { useAI } from '../../context/AIContext';

// Form tools for AI assistant
const FORM_TOOLS = [
  {
    type: 'function' as const,
    name: 'get_form_fields',
    description: "View current form fields (returns id, type, label, required, placeholder, options for each).",
    parameters: {},
  },
  {
    type: 'function' as const,
    name: 'modify_form_fields',
    description: "Add, update, or remove form fields. Add: action='add', fields=[{type,label,options}]. Update: action='update', fieldId, field={updates}. Remove: action='remove', fieldId.",
    parameters: {
      type: 'object',
      properties: {
        action: { type: 'string', enum: ['add', 'update', 'remove'], description: 'Action to perform' },
        fieldId: { type: 'string', description: 'Field ID for update/remove actions' },
        fields: { type: 'array', description: 'Array of fields to add [{type,label,options,placeholder}]' },
        field: { type: 'object', description: 'Field definition or updates' },
      },
      required: ['action'],
    },
  },
  {
    type: 'function' as const,
    name: 'reset_form_fields',
    description: "Clear all form fields. Use when user wants to remove all fields.",
    parameters: {
      type: 'object',
      properties: {},
    },
  },
];

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const FORM_SUGGESTIONS = [
  'Survey form',
  'Contact form',
  'Registration form',
  'Feedback form',
  'Event registration',
  'Order form',
];

export default function FormAssistant() {
  const [isOpen, setIsOpen] = useState(true);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(true);
  const [sessionList, setSessionList] = useState<SessionInfo[]>([]);
  const [streamingThinking, setStreamingThinking] = useState('');
  const [completedThinking, setCompletedThinking] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isThinkingExpanded, setIsThinkingExpanded] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const { currentSession, setCurrentSession, createSession, getAllSessions, isReady: sessionReady } = useSession();
  const { aiEnabled } = useAI();

  // Sync form tools with main process
  const toolsRef = useRef(FORM_TOOLS);
  
  // Use ref to always have access to latest messages for AI
  const messagesRef = useRef<Message[]>([]);
  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  // Load sessions
  useEffect(() => {
    getAllSessions().then(setSessionList);
  }, [getAllSessions]);

  // Load messages when session changes
  useEffect(() => {
    if (!sessionReady || !currentSession) return;
    
    async function loadMessages() {
      try {
        const loaded = await window.api.sessions.loadMessages(currentSession);
        setMessages(loaded);
        setShowSuggestions(loaded.length === 0);
      } catch (error) {
        console.error('Failed to load messages:', error);
        setMessages([]);
      }
    }
    loadMessages();
  }, [currentSession, sessionReady]);

  // Save messages when they change
  useEffect(() => {
    if (messages.length === 0) return;
    
    const saveTimeout = setTimeout(async () => {
      try {
        await window.api.sessions.saveMessages(currentSession, messages);
      } catch (error) {
        console.error('Failed to save messages:', error);
      }
    }, 500);

    return () => clearTimeout(saveTimeout);
  }, [messages, currentSession]);

  // Set up streaming listeners
  useEffect(() => {
    const lastThinkingRef = { current: '' };

    const handleStreamToken = (token: string) => {
      if (token === '') {
        // Completion - save thinking
        setIsLoading(false);
        setCompletedThinking(lastThinkingRef.current);
        lastThinkingRef.current = '';
      } else {
        setMessages(prev => {
          const lastMsg = prev[prev.length - 1];
          if (lastMsg && lastMsg.role === 'assistant') {
            return prev.map((msg, i) => 
              i === prev.length - 1 
                ? { ...msg, content: (msg.content + token).replace(/^\s+/, '') }
                : msg
            );
          } else {
            return [...prev, { role: 'assistant', content: token.replace(/^\s+/, '') }];
          }
        });
      }
    };

    const handleStreamThinking = (token: string) => {
      if (token === '') return;
      lastThinkingRef.current += token;
      setStreamingThinking(lastThinkingRef.current);
    };

    window.api.ai.onStreamToken(handleStreamToken);
    window.api.ai.onStreamThinking(handleStreamThinking);

    return () => {
      window.api.ai.removeStreamTokenListener(handleStreamToken);
      window.api.ai.removeStreamThinkingListener(handleStreamThinking);
    };
  }, []);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streamingThinking]);

  // Auto-expand thinking when loading
  useEffect(() => {
    if (isLoading && (streamingThinking || completedThinking)) {
      setIsThinkingExpanded(true);
    }
  }, [isLoading, streamingThinking, completedThinking]);

  // Find last user message index
  const lastUserIndex = messages.reduce((lastIndex, msg, index) => {
    if (msg.role === 'user') return index;
    return lastIndex;
  }, -1);

  const thinkingContent = streamingThinking || completedThinking;
  const hasThinking = !!thinkingContent;

  const handleSend = (text?: string) => {
    const messageText = text || input;
    if (!messageText.trim() || isLoading) return;
    
    setInput('');
    setIsThinkingExpanded(true);
    
    const userMessage: Message = { role: 'user', content: messageText };
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);
    
    setStreamingThinking('');
    setCompletedThinking('');
    
    window.api.ai.getStatus().then(status => {
      if (!status.isReady) {
        setIsLoading(false);
        return;
      }
      
      // Use sendMessageWithTools to pass form tools to AI
      window.api.ai.sendMessageWithTools(messagesRef.current, messageText, toolsRef.current);
    });
  };

  const handleNewSession = async () => {
    const timestamp = Date.now();
    const sessionName = `form-${timestamp}`;
    const newSlug = await createSession(sessionName);
    const updatedSessions = await getAllSessions();
    setSessionList(updatedSessions);
    setCurrentSession(newSlug);
    setMessages([]);
    setShowSuggestions(true);
    setStreamingThinking('');
    setCompletedThinking('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      {/* Toggle button - shows when panel is hidden */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-accent-primary text-white shadow-lg hover:bg-accent-primary-hover transition-all z-50 flex items-center justify-center"
        >
          <MessageCircle size={24} />
        </button>
      )}

      {/* Chat panel - open by default */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed bottom-6 right-6 w-80 h-96 bg-[var(--color-bg-card)] rounded-2xl border border-[var(--color-border-default)] shadow-xl z-50 flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 bg-[var(--color-bg-elevated)] border-b border-[var(--color-border-default)]">
              <div className="flex items-center gap-2">
                <Bot size={18} className="text-accent-primary" />
                <span className="font-semibold text-sm text-[var(--color-text-primary)]">Form Assistant</span>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg text-[var(--color-text-muted)] hover:text-red-500 hover:bg-red-50 transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            {/* Session selector row */}
            <div className="flex items-center gap-2 px-4 py-3 bg-[var(--color-bg-elevated)] border-b border-[var(--color-border-default)]">
              <select
                value={currentSession || ''}
                onChange={(e) => setCurrentSession(e.target.value)}
                className="flex-1 px-3 py-2 rounded-lg bg-[var(--color-bg-card)] border border-[var(--color-border-default)] text-sm text-[var(--color-text-primary)] focus:outline-none focus:border-accent-primary"
              >
                {sessionList.map((session) => (
                  <option key={session.key} value={session.key}>
                    {session.session}
                  </option>
                ))}
              </select>
              <button
                onClick={handleNewSession}
                className="px-3 py-2 rounded-lg bg-accent-primary text-white text-sm hover:bg-accent-primary-hover transition-colors"
                title="New Form Session"
              >
                +
              </button>
            </div>

            {/* AI Warning - show when AI not enabled */}
            {!aiEnabled && (
              <div className="flex items-center gap-2 px-4 py-2 bg-yellow-500/10 border-b border-yellow-500/20">
                <AlertTriangle size={14} className="text-yellow-500 shrink-0" />
                <span className="text-xs text-yellow-500">AI is not enabled. Enable it in Settings.</span>
              </div>
            )}

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {/* Helper UI when no messages */}
              {messages.length === 0 && !isLoading && (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <Bot size={32} className="text-accent-primary mb-3 opacity-50" />
                  <p className="text-sm text-[var(--color-text-muted)] mb-4">
                    Ask me to help design your form
                  </p>
                  
                  {/* Quick suggestions */}
                  {showSuggestions && (
                    <div className="space-y-2 w-full">
                      <p className="text-xs text-[var(--color-text-muted)]">Quick start:</p>
                      <div className="flex flex-wrap gap-1.5 justify-center">
                        {FORM_SUGGESTIONS.map((suggestion) => (
                          <button
                            key={suggestion}
                            onClick={() => handleSend(suggestion)}
                            className="px-2.5 py-1 rounded-full bg-[var(--color-bg-elevated)] border border-[var(--color-border-default)] text-xs text-[var(--color-text-secondary)] hover:text-accent-primary hover:border-accent-primary/50 transition-colors"
                          >
                            {suggestion}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {messages.map((msg, i) => {
                const isLastUserMessage = i === lastUserIndex && lastUserIndex !== -1;
                const showThinking = isLastUserMessage && hasThinking;
                
                return (
                  <div key={i}>
                    <div className={`flex gap-2 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                      <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                        msg.role === 'user'
                          ? 'bg-accent-primary'
                          : 'bg-[var(--color-bg-elevated)] border border-[var(--color-border-default)]'
                      }`}>
                        {msg.role === 'user' ? (
                          <User size={14} className="text-white" />
                        ) : (
                          <Bot size={14} className="text-accent-primary" />
                        )}
                      </div>
                      <div className={`max-w-[80%] rounded-xl px-3 py-2 text-sm ${
                        msg.role === 'user'
                          ? 'bg-accent-primary text-white'
                          : 'bg-[var(--color-bg-elevated)] border border-[var(--color-border-default)] text-[var(--color-text-primary)]'
                      }`}>
                        {msg.content}
                      </div>
                    </div>
                    
                    {/* Thinking box - shown after assistant message when there's thinking */}
                    {showThinking && (
                      <div 
                        className="mt-2 ml-9 rounded-xl p-2 bg-[var(--color-bg-elevated)] border border-[var(--color-border-default)] cursor-pointer hover:bg-[var(--color-bg-surface)] transition-colors"
                        onClick={() => !isLoading && setIsThinkingExpanded(!isThinkingExpanded)}
                      >
                        {isThinkingExpanded ? (
                          <div>
                            <p className="text-xs italic text-[var(--color-text-secondary)] whitespace-pre-wrap break-words">
                              {thinkingContent}
                            </p>
                            {!isLoading && (
                              <span className="text-xs mt-1 block text-[var(--color-text-muted)]">
                                click to hide thinking
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-xs text-[var(--color-text-muted)]">click to show thinking</span>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}

              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-3 border-t border-[var(--color-border-default)]">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={aiEnabled ? 'Ask about your form...' : 'Enable AI in Settings'}
                  disabled={!aiEnabled || isLoading}
                  className="flex-1 px-3 py-2 rounded-lg bg-[var(--color-bg-elevated)] border border-[var(--color-border-default)] text-sm text-[var(--color-text-primary)] placeholder-[var(--color-text-muted)] focus:outline-none focus:border-accent-primary disabled:opacity-50"
                />
                <button
                  onClick={() => handleSend()}
                  disabled={!aiEnabled || !input.trim() || isLoading}
                  className="p-2 rounded-lg bg-accent-primary text-white hover:bg-accent-primary-hover disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <Send size={16} />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}