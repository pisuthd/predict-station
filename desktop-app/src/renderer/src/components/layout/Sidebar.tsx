import { useLocation, useNavigate } from 'react-router';
import {
  MessageSquare,
  LayoutDashboard,
  MonitorSmartphone,
  Plus,
  Clock,
  Wrench,
  Settings
} from 'lucide-react';

interface NavItem {
  icon: typeof MessageSquare;
  label: string;
  path: string;
}

interface NavCategory {
  title: string;
  items: NavItem[];
}

const categories: NavCategory[] = [
  {
    title: 'Chat',
    items: [
      { icon: MessageSquare, label: 'Chat', path: '/chat' },
    ],
  },
  {
    title: 'Control',
    items: [
      { icon: LayoutDashboard, label: 'Overview', path: '/' },
      { icon: Plus, label: 'Start New Job', path: '/new-form' },
      { icon: Clock, label: 'Cron Jobs', path: '/recent-forms' },
    ],
  },
  {
    title: 'Agent',
    items: [
      { icon: MonitorSmartphone, label: 'Sessions', path: '/sessions' },
      { icon: Wrench, label: 'Tools', path: '/tools' },
    ],
  },
];

export default function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <aside className="w-[260px] bg-[var(--color-bg-surface)] border-r border-[var(--color-border-subtle)] flex flex-col shrink-0">
      {/* Brand */}
      <div className="px-6 pt-6 pb-8">
        <p className="font-mono text-lg font-bold tracking-wide">
          <span className="text-gray-400">Local</span>
          <span className="text-accent-primary">Book</span>
        </p>
      </div>

      {/* Nav categories */}
      <nav className="flex-1 px-4 space-y-6 overflow-y-auto">
        {categories.map((category) => (
          <div key={category.title}>
            <div className="px-3 mb-2">
              <span className="text-[11px] font-bold uppercase tracking-[0.15em] font-brand text-[var(--color-text-muted)]">
                {category.title}
              </span>
            </div>
            <div className="space-y-1">
              {category.items.map(({ icon: Icon, label, path }) => {
                const isActive = location.pathname === path ||
                  (path === '/' && location.pathname === '/');
                return (
                  <button
                    key={path}
                    onClick={() => navigate(path)}
                    className={`flex items-center gap-3.5 w-full px-3.5 py-2.5 rounded-xl text-[15px] font-semibold transition-all ${isActive
                      ? 'bg-accent-primary-dim text-accent-primary'
                      : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-sidebar-hover)] hover:text-[var(--color-text-primary)]'
                      }`}
                  >
                    <Icon size={20} strokeWidth={isActive ? 2.2 : 1.8} className={isActive ? 'text-accent-primary' : ''} />
                    <span>{label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Settings at bottom */}
      <div className="px-4 pb-5">
        <button
          onClick={() => navigate('/settings')}
          className={`flex items-center gap-3.5 w-full px-3.5 py-2.5 rounded-xl text-[15px] font-semibold transition-all ${location.pathname === '/settings'
            ? 'bg-accent-primary-dim text-accent-primary'
            : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-sidebar-hover)] hover:text-[var(--color-text-primary)]'
            }`}
        >
          <Settings size={20} strokeWidth={location.pathname === '/settings' ? 2.2 : 1.8} className={location.pathname === '/settings' ? 'text-accent-primary' : ''} />
          <span>Settings</span>
        </button>
      </div>
    </aside>
  );
}