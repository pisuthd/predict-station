'use client'
 
import { CYAN, monoFont } from '../theme'

interface AppSidebarProps {
  activeTab?: string
  onTabChange?: (tab: string) => void
}

const tabs = [
  { id: 'dashboard', label: 'Dashboard', icon: '▣' },
  { id: 'agents', label: 'Agents', icon: '◈' },
  { id: 'markets', label: 'Markets', icon: '◇' },
  { id: 'settings', label: 'Settings', icon: '⚙' },
]

export default function AppSidebar({ activeTab = 'dashboard', onTabChange }: AppSidebarProps) {
  return (
    <aside
      style={{
        width: 240,
        background: 'rgba(0,0,0,0.4)',
        borderRight: '1px solid rgba(180,200,255,0.08)',
        padding: '24px 0',
        display: 'flex',
        flexDirection: 'column',
        gap: '4px',
      }}
    >
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange?.(tab.id)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '12px 24px',
            background: activeTab === tab.id ? 'rgba(62,196,192,0.1)' : 'transparent',
            border: 'none',
            borderLeft: activeTab === tab.id ? `2px solid ${CYAN}` : '2px solid transparent',
            fontFamily: monoFont,
            fontSize: 12,
            color: activeTab === tab.id ? CYAN : 'rgba(180,200,255,0.5)',
            cursor: 'pointer',
            textAlign: 'left',
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={(e) => {
            if (activeTab !== tab.id) {
              e.currentTarget.style.color = '#fff'
              e.currentTarget.style.background = 'rgba(255,255,255,0.04)'
            }
          }}
          onMouseLeave={(e) => {
            if (activeTab !== tab.id) {
              e.currentTarget.style.color = 'rgba(180,200,255,0.5)'
              e.currentTarget.style.background = 'transparent'
            }
          }}
        >
          <span style={{ fontSize: 14 }}>{tab.icon}</span>
          {tab.label}
        </button>
      ))}
    </aside>
  )
}