'use client'

interface TopNavBarProps {
  onConnectWallet?: () => void
}

export default function TopNavBar({ onConnectWallet }: TopNavBarProps) {
  return (
    <div
      style={{
        position: 'fixed',
        top: 24,
        right: 24,
        zIndex: 100,
      }}
    >
      {/* Connect Wallet - Same style as ENTER APP button */}
      <button
        onClick={onConnectWallet}
        style={{
          padding: '12px 28px',
          background: 'rgba(255,255,255,0.04)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(180,200,255,0.12)',
          borderRadius: 16,
          fontFamily: 'Space Mono, monospace',
          fontSize: 12,
          fontWeight: 700,
          color: '#3EC4C0',
          cursor: 'pointer',
          letterSpacing: '0.08em',
          transition: 'all 0.3s ease',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = 'rgba(255,255,255,0.08)'
          e.currentTarget.style.borderColor = 'rgba(62,196,192,0.3)'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'rgba(255,255,255,0.04)'
          e.currentTarget.style.borderColor = 'rgba(180,200,255,0.12)'
        }}
      >
        CONNECT WALLET
      </button>
    </div>
  )
}