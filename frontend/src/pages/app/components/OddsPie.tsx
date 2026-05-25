'use client'

import { motion } from 'framer-motion'

const GREEN = '#22c55e'
const RED = '#ef4444'

interface OddsPieProps {
  upProb: number
  downProb: number
  upPayout: number
  downPayout: number
  onUpClick: () => void
  onDownClick: () => void
}

export function OddsPie({ upProb, downProb, upPayout, downPayout, onUpClick, onDownClick }: OddsPieProps) {
  const size = 120
  const radius = 50
  const centerX = size / 2
  const centerY = size / 2

  // Half pie (180 degrees), up is right half, down is left half
  const upAngle = upProb * 180
  const downAngle = downProb * 180

  // Calculate arc paths
  const polarToCartesian = (angle: number) => {
    const rad = ((angle - 90) * Math.PI) / 180
    return {
      x: centerX + radius * Math.cos(rad),
      y: centerY + radius * Math.sin(rad)
    }
  }

  const describeArc = (startAngle: number, endAngle: number) => {
    const start = polarToCartesian(startAngle)
    const end = polarToCartesian(endAngle)
    const largeArcFlag = endAngle - startAngle <= 180 ? 0 : 1
    return `M ${centerX} ${centerY} L ${start.x} ${start.y} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${end.x} ${end.y} Z`
  }

  return (
    <div style={{ display: 'flex', gap: 24, alignItems: 'center', justifyContent: 'center' }}>
      {/* UP section */}
      <motion.button
        onClick={onUpClick}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        style={{
          background: 'rgba(34,197,94,0.1)',
          border: `2px solid ${upProb > 0.5 ? GREEN : 'rgba(34,197,94,0.3)'}`,
          borderRadius: 12,
          padding: '16px 24px',
          cursor: 'pointer',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          minWidth: 120,
        }}
      >
        <svg width={80} height={50} viewBox="0 0 80 50">
          {/* Right half - UP */}
          <motion.path
            d={describeArc(-90, -90 + upAngle)}
            fill={GREEN}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          />
        </svg>
        <span style={{ fontSize: 11, color: GREEN, fontFamily: 'Space Mono, monospace', marginTop: 8 }}>UP</span>
        <span style={{ fontSize: 20, fontWeight: 700, color: GREEN, fontFamily: 'Space Mono, monospace' }}>
          ${upPayout.toFixed(2)}
        </span>
        <span style={{ fontSize: 10, color: '#888', fontFamily: 'Space Mono, monospace' }}>
          {(upProb * 100).toFixed(1)}%
        </span>
      </motion.button>

      {/* Center divider with total */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '0 8px'
      }}>
        <svg width={60} height={80} viewBox="0 0 60 80">
          {/* UP half pie (right side) */}
          <motion.path
            d={describeArc(-90, -90 + upAngle)}
            fill={GREEN}
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.8 }}
            style={{ cursor: 'pointer' }}
            onClick={onUpClick}
          />
          {/* DOWN half pie (left side) */}
          <motion.path
            d={describeArc(90, 90 + downAngle)}
            fill={RED}
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            style={{ cursor: 'pointer' }}
            onClick={onDownClick}
          />
        </svg>
        <span style={{ fontSize: 10, color: '#666', marginTop: 4 }}>Odds</span>
      </div>

      {/* DOWN section */}
      <motion.button
        onClick={onDownClick}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        style={{
          background: 'rgba(239,68,68,0.1)',
          border: `2px solid ${downProb > 0.5 ? RED : 'rgba(239,68,68,0.3)'}`,
          borderRadius: 12,
          padding: '16px 24px',
          cursor: 'pointer',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          minWidth: 120,
        }}
      >
        <svg width={80} height={50} viewBox="0 0 80 50">
          {/* Left half - DOWN */}
          <motion.path
            d={describeArc(90, 90 + downAngle)}
            fill={RED}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          />
        </svg>
        <span style={{ fontSize: 11, color: RED, fontFamily: 'Space Mono, monospace', marginTop: 8 }}>DOWN</span>
        <span style={{ fontSize: 20, fontWeight: 700, color: RED, fontFamily: 'Space Mono, monospace' }}>
          ${downPayout.toFixed(2)}
        </span>
        <span style={{ fontSize: 10, color: '#888', fontFamily: 'Space Mono, monospace' }}>
          {(downProb * 100).toFixed(1)}%
        </span>
      </motion.button>
    </div>
  )
}