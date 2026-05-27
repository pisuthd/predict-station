import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import PageWrapper from '../components/common/PageWrapper';
import SessionsTable from '../components/sessions/SessionsTable';
import { useSession } from '../context/SessionContext';

interface Session {
  key: string;
  lastActive: string;
  messagesCount: number;
  created: string;
}

export default function SessionsPage() {
  const navigate = useNavigate();
  const { getAllSessions, deleteSession, setCurrentSession } = useSession();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchSessions = async () => {
    setIsLoading(true);
    try {
      const allSessions = await getAllSessions();
      setSessions(allSessions);
    } catch (error) {
      console.error('Failed to fetch sessions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  const handleRefresh = () => {
    fetchSessions();
  };

  const handleDelete = async (key: string) => {
    try {
      await deleteSession(key);
      fetchSessions();
    } catch (error) {
      console.error('Failed to delete session:', error);
      throw error;
    }
  };

  const handleSessionClick = (key: string) => {
    setCurrentSession(key);
    navigate('/chat');
  };

  return (
    <PageWrapper title="Sessions">
      {isLoading ? (
        <div className="flex items-center justify-center h-32">
          <div className="flex gap-1">
            <span className="w-2 h-2 bg-accent-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
            <span className="w-2 h-2 bg-accent-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
            <span className="w-2 h-2 bg-accent-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
          </div>
        </div>
      ) : (
        <SessionsTable 
          sessions={sessions} 
          onRefresh={handleRefresh} 
          onDelete={handleDelete}
          onSessionClick={handleSessionClick}
        />
      )}
    </PageWrapper>
  );
}