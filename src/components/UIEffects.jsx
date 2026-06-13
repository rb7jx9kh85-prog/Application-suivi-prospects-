import { useEffect, useRef, useState } from 'react'

// Animated floating shapes background
function ShapeBackground() {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animId
    let t = 0

    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resize()
    window.addEventListener('resize', resize)

    // Shapes config
    const shapes = [
      { x: 0.15, y: 0.25, r: 140, speed: 0.0008, phase: 0,    type: 'circle',  color: '139,92,246',  opacity: 0.12 },
      { x: 0.82, y: 0.15, r: 90,  speed: 0.0012, phase: 1.5,  type: 'circle',  color: '168,85,247',  opacity: 0.10 },
      { x: 0.70, y: 0.72, r: 180, speed: 0.0006, phase: 0.8,  type: 'circle',  color: '217,70,239',  opacity: 0.09 },
      { x: 0.35, y: 0.80, r: 70,  speed: 0.0015, phase: 2.1,  type: 'circle',  color: '139,92,246',  opacity: 0.08 },
      { x: 0.90, y: 0.50, r: 50,  speed: 0.002,  phase: 3.0,  type: 'circle',  color: '236,72,153',  opacity: 0.07 },

      // Rings
      { x: 0.20, y: 0.60, r: 200, speed: 0.0005, phase: 0.3,  type: 'ring',    color: '139,92,246',  opacity: 0.06 },
      { x: 0.75, y: 0.35, r: 160, speed: 0.0007, phase: 1.9,  type: 'ring',    color: '168,85,247',  opacity: 0.05 },
    ]

    const draw = () => {
      const w = canvas.width
      const h = canvas.height
      t += 0.016

      ctx.clearRect(0, 0, w, h)

      shapes.forEach(s => {
        const ox = Math.sin(t * s.speed * 1000 + s.phase) * 40
        const oy = Math.cos(t * s.speed * 800 + s.phase) * 30
        const cx = s.x * w + ox
        const cy = s.y * h + oy

        if (s.type === 'circle') {
          const grd = ctx.createRadialGradient(cx, cy, 0, cx, cy, s.r)
          grd.addColorStop(0, `rgba(${s.color},${s.opacity})`)
          grd.addColorStop(1, `rgba(${s.color},0)`)
          ctx.beginPath()
          ctx.arc(cx, cy, s.r, 0, Math.PI * 2)
          ctx.fillStyle = grd
          ctx.fill()
        } else if (s.type === 'ring') {
          ctx.beginPath()
          ctx.arc(cx, cy, s.r, 0, Math.PI * 2)
          ctx.strokeStyle = `rgba(${s.color},${s.opacity})`
          ctx.lineWidth = 1.5
          ctx.stroke()
          // Second inner ring
          ctx.beginPath()
          ctx.arc(cx, cy, s.r * 0.6, 0, Math.PI * 2)
          ctx.strokeStyle = `rgba(${s.color},${s.opacity * 0.6})`
          ctx.lineWidth = 1
          ctx.stroke()
        }
      })

      // Subtle grid lines
      ctx.strokeStyle = 'rgba(139,92,246,0.04)'
      ctx.lineWidth = 1
      for (let x = 0; x < w; x += 80) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke()
      }
      for (let y = 0; y < h; y += 80) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke()
      }

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
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', zIndex: 0, pointerEvents: 'none' }}
    />
  )
}

// Typewriter effect
function TypeWriter({ words, speed = 80, pause = 2000 }) {
  const [display, setDisplay] = useState('')
  const [wordIndex, setWordIndex] = useState(0)
  const [charIndex, setCharIndex] = useState(0)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    const current = words[wordIndex]
    let timeout

    if (!deleting && charIndex < current.length) {
      timeout = setTimeout(() => setCharIndex(i => i + 1), speed)
    } else if (!deleting && charIndex === current.length) {
      timeout = setTimeout(() => setDeleting(true), pause)
    } else if (deleting && charIndex > 0) {
      timeout = setTimeout(() => setCharIndex(i => i - 1), speed / 2)
    } else if (deleting && charIndex === 0) {
      setDeleting(false)
      setWordIndex(i => (i + 1) % words.length)
    }

    setDisplay(current.slice(0, charIndex))
    return () => clearTimeout(timeout)
  }, [charIndex, deleting, wordIndex, words, speed, pause])

  return (
    <span>
      {display}
      <span style={{
        display: 'inline-block', width: '3px', height: '1em',
        background: 'linear-gradient(135deg,#a855f7,#ec4899)',
        marginLeft: '3px', verticalAlign: 'middle',
        animation: 'blink 1s step-end infinite'
      }} />
    </span>
  )
}

// Animated counter
function Counter({ target, suffix = '', duration = 2000 }) {
  const [count, setCount] = useState(0)
  const ref = useRef(null)
  const started = useRef(false)

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !started.current) {
        started.current = true
        const start = Date.now()
        const tick = () => {
          const elapsed = Date.now() - start
          const progress = Math.min(elapsed / duration, 1)
          const eased = 1 - Math.pow(1 - progress, 3)
          setCount(Math.floor(eased * target))
          if (progress < 1) requestAnimationFrame(tick)
          else setCount(target)
        }
        requestAnimationFrame(tick)
      }
    }, { threshold: 0.5 })
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [target, duration])

  return <span ref={ref}>{count}{suffix}</span>
}

// Shimmer button
function ShimmerButton({ children, to, style = {} }) {
  const [hover, setHover] = useState(false)
  return (
    <a
      href={`#${to}`}
      onClick={e => { e.preventDefault(); window.location.hash = to }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: '10px',
        padding: '16px 36px', borderRadius: '14px', fontWeight: 800,
        fontSize: '17px', textDecoration: 'none', color: 'white', position: 'relative',
        overflow: 'hidden', cursor: 'pointer', transition: 'transform 0.2s, box-shadow 0.2s',
        transform: hover ? 'scale(1.04)' : 'scale(1)',
        background: 'linear-gradient(135deg,#7c3aed,#a855f7,#ec4899)',
        boxShadow: hover ? '0 0 60px rgba(139,92,246,0.6)' : '0 0 30px rgba(139,92,246,0.35)',
        ...style
      }}
    >
      <span style={{
        position: 'absolute', top: 0, left: hover ? '100%' : '-100%',
        width: '100%', height: '100%',
        background: 'linear-gradient(90deg,transparent,rgba(255,255,255,0.15),transparent)',
        transition: 'left 0.5s ease',
        pointerEvents: 'none'
      }} />
      {children}
    </a>
  )
}

export { ShapeBackground, TypeWriter, Counter, ShimmerButton }
