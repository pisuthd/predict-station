'use client'

import { useEffect, useRef } from 'react'

interface Dot {
  phi: number
  theta: number
  r: number
  base: number
}

export default function OrbCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animRef = useRef<number>(0)
  const tRef = useRef(0)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const N = 90
    const dots: Dot[] = Array.from({ length: N }, (_, i) => ({
      phi: Math.acos(1 - 2 * (i + 0.5) / N),
      theta: Math.PI * (1 + Math.sqrt(5)) * i,
      r: 2 + Math.random() * 3.5,
      base: 0.4 + Math.random() * 0.6,
    }))

    const resize = () => {
      const parent = canvas.parentElement
      if (!parent) return
      canvas.width = parent.offsetWidth
      canvas.height = parent.offsetHeight
    }
    resize()
    window.addEventListener('resize', resize)

    const draw = () => {
      const W = canvas.width
      const H = canvas.height
      ctx.clearRect(0, 0, W, H)

      const cx = W * 0.62
      const cy = H * 0.46
      const R = Math.min(W, H) * 0.38
      const lightX = cx - R * 0.6
      const lightY = cy
      const t = tRef.current

      dots.forEach(d => {
        const x = cx + R * Math.sin(d.phi) * Math.cos(d.theta + t * 0.18)
        const y = cy + R * Math.cos(d.phi)
        const z = Math.sin(d.phi) * Math.sin(d.theta + t * 0.18)
        if (z < -0.1) return

        const dist = Math.sqrt((x - lightX) ** 2 + (y - lightY) ** 2)
        const glow = Math.max(0, 1 - dist / (R * 1.1))
        const alpha = (0.25 + z * 0.5) * d.base
        const size = d.r * (0.5 + z * 0.5) * (1 + glow * 1.2)
        const brightness = Math.round(180 + glow * 75)

        ctx.beginPath()
        ctx.arc(x, y, size, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(${brightness},${Math.round(brightness * 0.97)},255,${Math.min(1, alpha * (1 + glow))})`
        ctx.fill()

        if (glow > 0.5) {
          ctx.beginPath()
          ctx.arc(x, y, size * 1.8, 0, Math.PI * 2)
          ctx.fillStyle = `rgba(80,160,255,${glow * 0.18})`
          ctx.fill()
        }
      })

      tRef.current += 0.012
      animRef.current = requestAnimationFrame(draw)
    }

    draw()
    return () => {
      cancelAnimationFrame(animRef.current)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
      }}
    />
  )
}