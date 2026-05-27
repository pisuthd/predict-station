import { motion } from 'framer-motion'
import { CYAN, monoFont, sansFont } from '../../theme'

interface AppWrapperProps {
  children: React.ReactNode
}

export default function AppWrapper({ children }: AppWrapperProps) {
  return (
    <div style={{ minHeight: '100vh', position: 'relative' }}>
      {/* Page Content */}
      <div style={{ paddingBottom: '80px' }}>
        {children}
      </div>

      {/* Bottom Glass Panel - Fade Up Animation */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        style={{
          position: 'fixed',
          bottom: 20,
          right: 20,
          padding: '12px 20px',
          background: 'rgba(255, 255, 255, 0.04)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(180, 200, 255, 0.12)',
          borderRadius: 12,
          display: 'flex',
          alignItems: 'center',
          gap: 16,
          zIndex: 200,
        }}
      >
        {/* Message */}
        <p
          style={{
            fontFamily: sansFont,
            fontSize: 13,
            color: 'rgba(180, 200, 255, 0.8)',
            margin: 0,
            lineHeight: 1.4,
          }}
        >
          Pair your local AI agent for personalized market analysis.
        </p>

        {/* Pair Agent Button */}
        <button
          style={{
            padding: '8px 16px',
            background: CYAN,
            border: 'none',
            borderRadius: 8,
            fontFamily: monoFont,
            fontSize: 11,
            fontWeight: 700,
            color: '#000',
            cursor: 'pointer',
            letterSpacing: '0.05em',
            transition: 'all 0.2s ease',
            flexShrink: 0,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(62, 196, 192, 0.8)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = CYAN
          }}
        >
          PAIR NOW
        </button>
      </motion.div>
    </div>
  )
}