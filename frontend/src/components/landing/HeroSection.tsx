import { useNavigate } from 'react-router-dom'
import { CYAN, monoFont } from '../../theme'
import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'

const products = ['Predict', 'Spot', 'Margin']

export default function HeroSection() {
  const navigate = useNavigate()
  const [productIndex, setProductIndex] = useState(0)
  const [displayText, setDisplayText] = useState('')
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    const currentProduct = products[productIndex]
    const timeout = setTimeout(() => {
      if (!isDeleting) {
        // Typing
        if (displayText.length < currentProduct.length) {
          setDisplayText(currentProduct.slice(0, displayText.length + 1))
        } else {
          // Pause at full word, then start deleting
          setTimeout(() => setIsDeleting(true), 5000)
        }
      } else {
        // Deleting
        if (displayText.length > 0) {
          setDisplayText(displayText.slice(0, -1))
        } else {
          setIsDeleting(false)
          setProductIndex((prev) => (prev + 1) % products.length)
        }
      }
    }, isDeleting ? 50 : 100)

    return () => clearTimeout(timeout)
  }, [displayText, isDeleting, productIndex])

  return (
    <div
      style={{
        flex: 1,
        display: 'flex',
        padding: '3rem 56px',
        alignItems: 'center',
      }}
    >
       <div style={{ maxWidth: 1200, flex : 1, margin: '0 auto'  }}>
        <p
          style={{
            fontSize: '11px',
            fontWeight: 500,
            letterSpacing: '0.18em',
            color: CYAN,
            textTransform: 'uppercase',
            marginBottom: '16px',
          }}
        >
          Private & On-Device AI
        </p>

        <h1
          style={{
            fontSize: '48px',
            fontWeight: 300,
            color: '#fff',
            letterSpacing: '-0.02em',
            lineHeight: 1.1,
            marginBottom: '24px',
            minHeight: '120px',
          }}
        >
          <strong style={{ fontWeight: 500 }}>Mission Control</strong>
          <br />
          <span>for DeepBook</span>
          {` `}
          <motion.span
            style={{
              display: 'inline-block',
              color: '#fff',
              minWidth: '120px'
            }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.1 }}
          >
            {displayText}
            <motion.span
              animate={{ opacity: [1, 0] }}
              transition={{ repeat: Infinity, duration: 0.5 }}
              style={{ marginLeft: '2px' }}
            >
              |
            </motion.span>
          </motion.span>
        </h1>

        <p
          style={{
            fontFamily: "'DM Sans', sans-serif",
            fontSize: '16px',
            color: 'rgba(180,200,255,0.6)',
            lineHeight: 1.6,
            marginBottom: '40px',
            maxWidth: "500px"
          }}
        >
          Deploy local AI agents to monitor, analyze, and trade on Sui via DeepBook — no API costs, and runs entirely on your device.
        </p>

        {/* CTA Buttons */}
        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            onClick={() => navigate('/predict')}
            style={{
              padding: '12px 28px',
              background: CYAN,
              border: 'none',
              borderRadius: 12,
              //  fontFamily: monoFont,
              fontSize: 12,
              fontWeight: 700,
              color: '#000',
              cursor: 'pointer',
              letterSpacing: '0.1em',
              transition: 'all 0.3s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(62,196,192,0.8)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = CYAN
            }}
          >
            PREDICT BTC
          </button>

          <button
            style={{
              padding: '12px 28px',
              background: 'rgba(255,255,255,0.04)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(180,200,255,0.12)',
              borderRadius: 12,
              fontFamily: monoFont,
              fontSize: 12,
              fontWeight: 700,
              color: '#fff',
              cursor: 'pointer',
              letterSpacing: '0.1em',
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.08)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.04)'
            }}
          >
            DOWNLOAD AGENT
          </button>
        </div>
      </div>
    </div>
  )
}