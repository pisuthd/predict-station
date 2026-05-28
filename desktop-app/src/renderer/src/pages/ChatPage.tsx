import { useState, useRef, useEffect } from 'react';
import PageWrapper from '../components/common/PageWrapper';
import ChatMessage from '../components/chat/ChatMessage';
import SessionPicker from '../components/chat/SessionPicker';
import ChatInput from '../components/chat/ChatInput';
import { Bot } from 'lucide-react';
import { useSession } from '../context/SessionContext';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export default function ChatPage() {
  const {
    currentSession,
    setCurrentSession,
    getAllSessions,
    createSession,
    isReady: sessionReady,
  } = useSession();
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [streamingThinking, setStreamingThinking] = useState('');
  const [completedThinking, setCompletedThinking] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [input, setInput] = useState('');
  const [sessionOptions, setSessionOptions] = useState<{ value: string; label: string }[]>([]);
  const [showSessionPicker, setShowSessionPicker] = useState(false);
  const [isLoadingSessions, setIsLoadingSessions] = useState(true);
  const [isThinkingExpanded, setIsThinkingExpanded] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Use ref to always have access to latest messages
  const messagesRef = useRef(messages);
  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  // Load session list
  useEffect(() => {
    async function loadSessions() {
      setIsLoadingSessions(true);
      try {
        const allSessions = await getAllSessions();
        const options = allSessions.map(s => ({
          value: s.session,
          label: s.session,
        }));
        setSessionOptions(options);
      } catch (error) {
        console.error('Failed to load sessions:', error);
      } finally {
        setIsLoadingSessions(false);
      }
    }
    loadSessions();
  }, [getAllSessions]);

  // Load messages when session changes
  useEffect(() => {
    if (!sessionReady) return;
    
    async function loadMessages() {
      try {
        const loaded = await window.api.sessions.loadMessages(currentSession);
        setMessages(loaded);
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

  // Set up streaming listeners (only once on mount)
  useEffect(() => {
    // Prevent duplicate listener registration
    let isInitialized = false;
    
    const lastThinkingRef = { current: '' };
    const lastTokenRef = { current: '' };

    const handleStreamToken = (token: string) => {
      // Prevent duplicate tokens
      if (token === lastTokenRef.current) return;
      lastTokenRef.current = token;
      
      if (token === '') {
        setIsLoading(false);
        setCompletedThinking(lastThinkingRef.current);
        lastThinkingRef.current = '';
        lastTokenRef.current = ''; // Reset for next message
      } else {
        setMessages(prev => {
          const lastMsg = prev[prev.length - 1];
          if (lastMsg && lastMsg.role === 'assistant') {
            // Skip if already ends with this token (duplicate)
            if (lastMsg.content.endsWith(token)) {
              return prev;
            }
            return prev.map((m, i) => 
              i === prev.length - 1 
                ? { ...m, content: (m.content + token).replace(/^\s+/, '') }
                : m
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

    if (!isInitialized) {
      isInitialized = true;
      window.api.ai.onStreamToken(handleStreamToken);
      window.api.ai.onStreamThinking(handleStreamThinking);
    }

    return () => {
      window.api.ai.removeStreamTokenListener(handleStreamToken);
      window.api.ai.removeStreamThinkingListener(handleStreamThinking);
    };
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streamingThinking]);

  useEffect(() => {
    if (isLoading && (streamingThinking || completedThinking)) {
      setIsThinkingExpanded(true);
    }
  }, [isLoading, streamingThinking, completedThinking]);

  const handleSend = () => {
    if (!input.trim() || isLoading) return;
    
    setInput('');
    setIsThinkingExpanded(true);
    
    const userMessage: Message = { role: 'user', content: input.trim() };
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);
    
    setStreamingThinking('');
    setCompletedThinking('');
    
    window.api.ai.getStatus().then(status => {
      if (!status.isReady) {
        setError('AI model not loaded. Please enable AI in Settings.');
        setIsLoading(false);
        return;
      }
      
      window.api.ai.sendMessage(messagesRef.current, input.trim());
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleNewSession = async () => {
    const timestamp = Date.now().toString();
    const sessionName = `session-${timestamp}`;
    const slug = await createSession(sessionName);
    const allSessions = await getAllSessions();
    const options = allSessions.map(s => ({
      value: s.session,
      label: s.session,
    }));
    setSessionOptions(options);
    setCurrentSession(slug);
  };

  // Find last user message index
  const lastUserIndex = messages.reduce((lastIndex, msg, index) => {
    if (msg.role === 'user') return index;
    return lastIndex;
  }, -1);

  // Determine thinking content
  const thinkingContent = streamingThinking || completedThinking;
  const hasThinking = !!thinkingContent;

  return (
    <PageWrapper 
      title="Chat" 
      action={
        <div className="flex items-center gap-3">
          <SessionPicker
            currentSession={currentSession}
            sessions={sessionOptions}
            isLoading={isLoadingSessions}
            isOpen={showSessionPicker}
            onToggle={() => setShowSessionPicker(!showSessionPicker)}
            onSelect={(session) => {
              setCurrentSession(session);
              setShowSessionPicker(false);
            }}
          />
          
          <button
            onClick={handleNewSession}
            className="flex items-center justify-center w-8 h-8 rounded-lg bg-accent-primary text-white hover:bg-accent-primary-hover transition-colors"
            title="New session"
          >
            <span className="text-lg leading-none">+</span>
          </button>
        </div>
      }
    >
      <div className="h-[calc(100vh-180px)] flex flex-col">
        {error && (
          <div className="mb-4 p-4 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-red-500/20 flex items-center justify-center">
                <Bot size={16} className="text-red-400" />
              </div>
              <div>
                <p className="text-sm text-red-400 font-medium">AI not enabled</p>
                <p className="text-xs text-red-400/70">Please enable AI in Settings to start chatting</p>
              </div>
            </div>
            <button onClick={() => setError(null)} className="text-red-400/50 hover:text-red-400 transition-colors text-xl">×</button>
          </div>
        )}

        {/* Messages */}
        <div className="flex-1 overflow-y-auto space-y-4 mb-4">
          {messages.length === 0 && !isLoading && (
            <div className="flex flex-col items-center justify-center h-full text-center py-16">
              <div className="w-16 h-16 rounded-2xl bg-[var(--color-bg-elevated)] border border-[var(--color-border-default)] flex items-center justify-center mb-4">
                <Bot size={28} className="text-accent-primary" />
              </div>
              <h3 className="text-lg font-medium text-[var(--color-text-primary)] mb-2">Start a conversation</h3>
              <p className="text-sm text-[var(--color-text-muted)] max-w-sm">
                Ask questions about forms, get help analyzing responses, or brainstorm ideas.
              </p>
            </div>
          )}
          
          {messages.map((message, index) => {
            const isLastUserMessage = index === lastUserIndex && lastUserIndex !== -1;
            const showThinking = isLastUserMessage && hasThinking;
            
            return (
              <ChatMessage
                key={index}
                message={message}
                showThinking={showThinking}
                thinkingContent={thinkingContent}
                isThinkingExpanded={isThinkingExpanded}
                onToggleThinking={() => setIsThinkingExpanded(!isThinkingExpanded)}
                isLoading={isLoading}
              />
            );
          })}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <ChatInput
          value={input}
          onChange={setInput}
          onSend={handleSend}
          onKeyDown={handleKeyDown}
          disabled={!input.trim() || isLoading}
        />
      </div>
    </PageWrapper>
  );
}
