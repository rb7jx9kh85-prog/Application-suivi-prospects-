import { useEffect, useRef } from 'react'

export default function ShaderBackground({ variant = 'dark' }) {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    let animId
    let t = 0

    const resize = () => {
      canvas.width = canvas.offsetWidth
      canvas.height = canvas.offsetHeight
    }
    resize()
    window.addEventListener('resize', resize)

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const draw = () => {
      const w = canvas.width
      const h = canvas.height
      t += 0.003

      ctx.clearRect(0, 0, w, h)
      ctx.fillStyle = '#000000'
      ctx.fillRect(0, 0, w, h)

      // Animated blobs
      const blobs = [
        { x: 0.3 + 0.15 * Math.sin(t * 0.7), y: 0.3 + 0.1 * Math.cos(t * 0.5), r: 0.35, color: '139, 92, 246' },
        { x: 0.7 + 0.1 * Math.cos(t * 0.9), y: 0.6 + 0.15 * Math.sin(t * 0.6), r: 0.3, color: '168, 85, 247' },
        { x: 0.5 + 0.2 * Math.sin(t * 0.4), y: 0.1 + 0.08 * Math.cos(t * 0.8), r: 0.25, color: '217, 70, 239' },
      ]

      blobs.forEach(({ x, y, r, color }) => {
        const grd = ctx.createRadialGradient(x * w, y * h, 0, x * w, y * h, r * Math.max(w, h))
        grd.addColorStop(0, `rgba(${color}, 0.18)`)
        grd.addColorStop(1, `rgba(${color}, 0)`)
        ctx.fillStyle = grd
        ctx.fillRect(0, 0, w, h)
      })

      animId = requestAnimationFrame(draw)
    }

    draw()

    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        zIndex: 0,
        pointerEvents: 'none',
      }}
    />
  )
}
