import { useState, useEffect } from 'react';
import { FileText, RefreshCw, Loader2 } from 'lucide-react';

interface LogFile {
  file: string;
  content: string;
  lines: string[];
}

export default function LogsSettingsTab() {
  const [logs, setLogs] = useState<LogFile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [logPath, setLogPath] = useState('');

  const fetchLogs = async () => {
    setIsLoading(true);
    try {
      const [recentLogs, path] = await Promise.all([
        window.api.logs.getRecent(50),
        window.api.logs.getPath(),
      ]);
      setLogPath(path);

      // Transform data into LogFile format
      const logFiles: LogFile[] = recentLogs.map(item => ({
        file: item.file,
        content: item.logs.join('\n'),
        lines: item.logs,
      }));

      setLogs(logFiles);
    } catch (error) {
      console.error('Failed to fetch logs:', error);
      setLogs([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const parseLogLine = (line: string) => {
    // Format: [timestamp] [LEVEL] message
    const match = line.match(/\[([^\]]+)\]\s*\[([^\]]+)\]\s*(.*)/);
    if (match) {
      return {
        timestamp: match[1],
        level: match[2],
        message: match[3],
      };
    }
    return { timestamp: '', level: '', message: line };
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'ERROR': return 'text-red-400';
      case 'WARN': return 'text-yellow-400';
      case 'QVAC': return 'text-cyan-400';
      case 'INFO': return 'text-green-400';
      default: return 'text-[var(--color-text-secondary)]';
    }
  };

  return (
    <div>
      <h2 className="text-lg font-bold text-[var(--color-text-primary)] mb-1">Logs</h2>
      <p className="text-sm text-[var(--color-text-secondary)] mb-4">
        Application logs for debugging
      </p>

      {/* Refresh button */}
      <div className="mb-4 flex justify-start">
        <button
          onClick={fetchLogs}
          disabled={isLoading}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-elevated)] transition-colors disabled:opacity-50"
        >
          {isLoading ? <Loader2 size={14} className="animate-spin" /> : <RefreshCw size={14} />}
          Refresh
        </button>
      </div>


      {/* Logs list */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 size={24} className="animate-spin text-[var(--color-text-muted)]" />
        </div>
      ) : logs.length === 0 ? (
        <div className="text-center py-12 text-[var(--color-text-muted)] border border-dashed border-[var(--color-border-default)] rounded-xl">
          <p className="text-sm mb-2">No logs found</p>
          <p className="text-xs">Logs will appear here once the app runs</p>
        </div>
      ) : (
        <div className="space-y-4">
          {logs.map((logFile, fileIndex) => (
            <div key={fileIndex} className="rounded-xl border border-[var(--color-border-default)] overflow-hidden">
              <div className="px-4 py-2 bg-[var(--color-bg-elevated)] border-b border-[var(--color-border-default)]">
                <p className="text-sm font-medium text-[var(--color-text-primary)]">{logFile.file}</p>
                <p className="text-xs text-[var(--color-text-muted)]">{logFile.lines.length} entries</p>
              </div>
              <div className="bg-[var(--color-bg-surface)] max-h-96 overflow-y-auto">
                {logFile.lines.length === 0 ? (
                  <p className="p-4 text-sm text-[var(--color-text-muted)]">Empty log file</p>
                ) : (
                  logFile.lines.map((line, lineIndex) => {
                    const parsed = parseLogLine(line);
                    return (
                      <div
                        key={lineIndex}
                        className="px-4 py-2 border-b border-[var(--color-border-subtle)] last:border-b-0 font-mono text-xs hover:bg-[var(--color-bg-elevated)]"
                      >
                        {parsed.timestamp && (
                          <span className="text-[var(--color-text-muted)] mr-2">
                            [{parsed.timestamp}]
                          </span>
                        )}
                        {parsed.level && (
                          <span className={`mr-2 ${getLevelColor(parsed.level)}`}>
                            [{parsed.level}]
                          </span>
                        )}
                        <span className="text-[var(--color-text-primary)] word-break-break-all">{parsed.message}</span>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          ))}
        </div>
      )}


      {/* Log path */}
      <div className="my-4 p-3 rounded-xl bg-[var(--color-bg-elevated)] border border-[var(--color-border-default)]">
        <div className="flex items-center gap-2 mb-1">
          <FileText size={14} className="text-[var(--color-text-muted)]" />
          <span className="text-xs text-[var(--color-text-muted)]">Log Directory</span>
        </div>
        <p className="text-xs font-mono text-[var(--color-text-secondary)] break-all">
          {logPath || 'Loading...'}
        </p>
      </div>
    </div>
  );
}