'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { CYAN, NAVY, MUTED, monoFont, sansFont } from '../theme'
import { useApp } from '../context/AppProvider'

export default function LoadingScreenModal() {
  const { selectedModel, setModelLoaded } = useApp()
  const [progress, setProgress] = useState(0)
  const [status, setStatus] = useState('Initializing...')

  useEffect(() => {
    // Simulate loading progress via SSE or fallback to animation
    const eventSource = new EventSource('http://localhost:3001/api/models/load/progress')
    
    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)
        setProgress(data.progress || 0)
        setStatus(data.status || 'Loading...')
        
        if (data.progress >= 100 || data.status === 'complete') {
          eventSource.close()
          setTimeout(() => setModelLoaded(true), 500)
        }
      } catch (err) {
        // JSON parse error, ignore
      }
    }

    eventSource.onerror = () => {
      eventSource.close()
      // Fallback: animate progress manually
      let p = 0
      const interval = setInterval(() => {
        p += Math.random() * 15
        if (p >= 100) {
          clearInterval(interval)
          setProgress(100)
          setStatus('Complete')
          setTimeout(() => setModelLoaded(true), 500)
        } else {
          setProgress(Math.min(p, 95))
          setStatus(`Loading Qwen3-${selectedModel}...`)
        }
      }, 200)
    }

    return () => {
      eventSource.close()
    }
  }, [setModelLoaded, selectedModel])

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.85)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
      }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        style={{
          background: NAVY,
          border: '1px solid rgba(180,200,255,0.12)',
          borderRadius: 20,
          width: '100%',
          maxWidth: 400,
          padding: 40,
          textAlign: 'center',
        }}
      >
        {/* Animated logo */}
        <motion.div
          animate={{ 
            rotate: 360,
            // scale: [1, 1.1, 1],
          }}
          transition={{ 
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut'
          }}
          style={{
            width: 60,
            height: 60,
            margin: '0 auto 24px',
            borderRadius: '50%',
            border: `3px solid ${CYAN}`,
            borderTopColor: 'transparent',
          }}
        />

        {/* Status */}
        <motion.p
          key={status}
          // initial={{ opacity: 0, y: 5 }}
          // animate={{ opacity: 1, y: 0 }}
          style={{
            fontFamily: monoFont,
            fontSize: 12,
            letterSpacing: '0.14em',
            color: MUTED,
            textTransform: 'uppercase',
            marginBottom: 16,
          }}
        >
          {status}
        </motion.p>

        {/* Model name */}
        <h2 style={{
          fontFamily: sansFont,
          fontSize: 24,
          fontWeight: 300,
          color: '#fff',
          marginBottom: 24,
        }}>
          Loading <strong style={{ fontWeight: 500 }}>Qwen3-{selectedModel}</strong>
        </h2>

        {/* Progress bar */}
        <div style={{
          background: 'rgba(255,255,255,0.1)',
          borderRadius: 8,
          height: 8,
          overflow: 'hidden',
          marginBottom: 12,
        }}>
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            style={{
              height: '100%',
              background: CYAN,
              borderRadius: 8,
            }}
          />
        </div>

        {/* Progress percentage */}
        <motion.p
          key={progress}
          // initial={{ opacity: 0 }}
          // animate={{ opacity: 1 }}
          style={{
            fontFamily: monoFont,
            fontSize: 14,
            color: CYAN,
            fontWeight: 700,
          }}
        >
          {Math.round(progress)}%
        </motion.p>
      </motion.div>
    </motion.div>
  )
}