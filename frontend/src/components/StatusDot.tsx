import { CYAN } from '../theme'

interface StatusDotProps {
  status: 'idle' | 'active' | 'error'
}

export default function StatusDot({ status }: StatusDotProps) {
  const color = status === 'active' ? CYAN : status === 'error' ? '#ff6b6b' : 'rgba(180,200,255,0.3)'
  return (
    <div style={{
      width: 6, height: 6, borderRadius: '50%', background: color, flexShrink: 0,
      boxShadow: status === 'active' ? `0 0 6px ${CYAN}` : 'none',
    }} />
  )
}