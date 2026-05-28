import { useLocation, Link } from 'react-router';
import { Search, ChevronRight } from 'lucide-react';

const routeMeta: Record<string, { category: string; label: string }> = {
  '/': { category: 'Control', label: 'Overview' },
  '/chat': { category: 'Chat', label: 'Chat' },
  '/new-form': { category: 'General', label: 'Start New Form' },
  '/recent-forms': { category: 'General', label: 'Recent Forms' },
  '/settings': { category: 'Settings', label: 'Settings' },
  '/sessions': { category: 'Agent', label: 'Sessions' },
  '/tools': { category: 'Agent', label: 'Tools' },
};

export default function TopBar() {
  const location = useLocation();

  // Build breadcrumb: Category > Page
  const meta = routeMeta[location.pathname] || { category: 'Walrus Form Studio', label: 'Dashboard' };
  const breadcrumbItems = [
    { label: meta.category, path: '/' },
    { label: meta.label, path: location.pathname },
  ];

  return (
    <div className="flex items-center h-12 px-5 bg-[var(--color-topbar-bg)] backdrop-blur-md border-b border-[var(--color-border-subtle)] shrink-0">
      {/* Breadcrumb */}
      <div className="flex items-center gap-1.5 text-sm">
        {breadcrumbItems.map((item, i) => (
          <span key={`${item.path}-${i}`} className="flex items-center gap-1.5">
            {i > 0 && <ChevronRight size={12} className="text-[var(--color-text-muted)]" />}
            <Link
              to={item.path}
              className={`font-medium transition-colors ${
                i === breadcrumbItems.length - 1
                  ? 'text-[var(--color-text-primary)]'
                  : 'text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)]'
              }`}
            >
              {item.label}
            </Link>
          </span>
        ))}
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Search */}
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[var(--color-bg-elevated)] border border-[var(--color-border-default)] text-[var(--color-text-muted)] text-sm mr-3 hover:border-accent-primary/50 transition-colors cursor-pointer shadow-sm">
        <Search size={14} />
        <span>Search...</span>
        <div className="flex items-center gap-1 ml-4">
          <kbd className="text-[10px] px-1.5 py-0.5 rounded bg-[var(--color-bg-surface)] border border-[var(--color-border-default)]">
            Ctrl
          </kbd>
          <kbd className="text-[10px] px-1.5 py-0.5 rounded bg-[var(--color-bg-surface)] border border-[var(--color-border-default)]">
            K
          </kbd>
        </div>
      </div>
    </div>
  );
}