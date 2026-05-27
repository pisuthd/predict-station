import { RotateCw, Trash2, Search } from 'lucide-react';
import { useState } from 'react';
import ConfirmModal from '../common/ConfirmModal';

interface Session {
  key: string;
  lastActive: string;
  messagesCount: number;
  created: string;
}

interface SessionsTableProps {
  sessions: Session[];
  onRefresh?: () => void;
  onDelete?: (key: string) => void;
  onSessionClick?: (key: string) => void;
}

function formatRelativeTime(isoString: string): string {
  const date = new Date(isoString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSecs < 60) return 'Just now';
  if (diffMins < 60) return `${diffMins} min ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function formatDate(isoString: string): string {
  const date = new Date(isoString);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function SessionsTable({ sessions, onRefresh, onDelete, onSessionClick }: SessionsTableProps) {
  const [filter, setFilter] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  
  const filteredSessions = sessions.filter(session => 
    session.key.toLowerCase().includes(filter.toLowerCase())
  );

  const handleDeleteClick = (key: string) => {
    setDeleteTarget(key);
    setDeleteError(null);
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget || !onDelete) return;
    
    try {
      await onDelete(deleteTarget);
      setDeleteTarget(null);
      setDeleteError(null);
    } catch (error) {
      setDeleteError(error instanceof Error ? error.message : 'Failed to delete session');
    }
  };

  const handleCancelDelete = () => {
    setDeleteTarget(null);
    setDeleteError(null);
  };

  const columns = [
    { key: 'key', label: 'Session' },
    { key: 'messagesCount', label: 'Messages' },
    { key: 'lastActive', label: 'Last Active' },
    { key: 'created', label: 'Created' },
    { key: 'actions', label: '' },
  ];

  return (
    <>
      <div className="bg-[var(--color-bg-card)] border border-[var(--color-border-default)] rounded-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-[var(--color-border-default)]">
          <h3 className="text-lg font-semibold text-[var(--color-text-primary)]">
            Sessions ({sessions.length})
          </h3>
          <div className="flex items-center gap-3">
            {/* Filter input */}
            <div className="relative flex items-center gap-2 px-3 py-2 rounded-xl border border-[var(--color-border-default)] bg-[var(--color-bg-elevated)]">
              <Search size={14} className="text-[var(--color-text-muted)]" />
              <input
                type="text"
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                placeholder="Filter sessions..."
                className="bg-transparent text-sm outline-none w-40 text-[var(--color-text-primary)] placeholder:text-[var(--color-text-muted)]"
              />
            </div>
            <button
              onClick={onRefresh}
              className="flex items-center gap-2 px-3 py-2 rounded-xl bg-[var(--color-bg-elevated)] border border-[var(--color-border-default)] text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] hover:border-accent-primary transition-colors text-sm"
            >
              <RotateCw size={16} />
              Refresh
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          {filteredSessions.length === 0 ? (
            <div className="p-8 text-center text-[var(--color-text-muted)]">
              {sessions.length === 0 ? 'No sessions yet' : 'No sessions found'}
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-[var(--color-border-default)] text-[var(--color-text-muted)]">
                  {columns.map((col) => (
                    <th
                      key={col.key}
                      className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wider"
                    >
                      {col.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredSessions.map((session) => (
                  <tr
                    key={session.key}
                    onClick={() => onSessionClick?.(session.key)}
                    className="border-b border-[var(--color-border-default)] hover:bg-[var(--color-bg-elevated)] transition-colors cursor-pointer"
                  >
                    <td className="px-5 py-4">
                      <span className="text-sm font-mono text-accent-primary hover:text-accent-primary/80">
                        {session.key === 'main' ? 'main (default)' : session.key}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-sm text-[var(--color-text-muted)]">
                      {session.messagesCount}
                    </td>
                    <td className="px-5 py-4 text-sm text-[var(--color-text-muted)]">
                      {formatRelativeTime(session.lastActive)}
                    </td>
                    <td className="px-5 py-4 text-sm text-[var(--color-text-muted)]">
                      {formatDate(session.created)}
                    </td>
                    <td className="px-5 py-4">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteClick(session.key);
                        }}
                        className="p-2 rounded-lg hover:bg-red-500/10 text-[var(--color-text-muted)] hover:text-red-500 transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={deleteTarget !== null}
        title="Delete Session"
        message={deleteTarget ? `Are you sure you want to delete "${deleteTarget}"? This action cannot be undone.` : ''}
        error={deleteError}
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
      />
    </>
  );
}