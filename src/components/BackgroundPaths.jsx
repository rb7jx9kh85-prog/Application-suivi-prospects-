import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'

function FloatingPaths({ position }) {
  const paths = Array.from({ length: 24 }, (_, i) => ({
    id: i,
    d: `M-${380 - i * 5 * position} -${189 + i * 6}C-${
      380 - i * 5 * position
    } -${189 + i * 6} -${312 - i * 5 * position} ${216 - i * 6} ${
      152 - i * 5 * position
    } ${343 - i * 6}C${616 - i * 5 * position} ${470 - i * 6} ${
      684 - i * 5 * position
    } ${875 - i * 6} ${684 - i * 5 * position} ${875 - i * 6}`,
    width: 0.5 + i * 0.04,
    opacity: 0.06 + i * 0.018,
    duration: 18 + (i % 7) * 3,
    delay: -(i * 1.2),
  }))

  return (
    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
      <svg
        style={{ width: '100%', height: '100%' }}
        viewBox="0 0 696 316"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="violetGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#7c3aed" />
            <stop offset="50%" stopColor="#a855f7" />
            <stop offset="100%" stopColor="#ec4899" />
          </linearGradient>
          <style>{`
            @keyframes pathFade {
              0%, 100% { opacity: 0.3; }
              50% { opacity: 1; }
            }
          `}</style>
        </defs>
        {paths.map((path) => (
          <path
            key={path.id}
            d={path.d}
            stroke="url(#violetGrad)"
            strokeWidth={path.width}
            strokeOpacity={path.opacity}
            fill="none"
            style={{
              animation: `pathFade ${path.duration}s ease-in-out ${path.delay}s infinite`,
            }}
          />
        ))}
      </svg>
    </div>
  )
}

export default function BackgroundPathsHero({ title = 'ProspectPro', subtitle, cta }) {
  const words = title.split(' ')

  return (
    <div style={{
      position: 'relative',
      minHeight: '100vh',
      width: '100%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'hidden',
      background: '#000',
    }}>
      <div style={{ position: 'absolute', inset: 0 }}>
        <FloatingPaths position={1} />
        <FloatingPaths position={-1} />
      </div>

      {/* Glow blobs */}
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
        <div style={{
          position: 'absolute', top: '20%', left: '15%',
          width: '400px', height: '400px', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(124,58,237,0.18) 0%, transparent 70%)',
          filter: 'blur(40px)',
        }} />
        <div style={{
          position: 'absolute', bottom: '25%', right: '10%',
          width: '350px', height: '350px', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(236,72,153,0.14) 0%, transparent 70%)',
          filter: 'blur(40px)',
        }} />
      </div>

      {/* Content */}
      <div style={{
        position: 'relative', zIndex: 10, textAlign: 'center',
        padding: '0 24px', maxWidth: '900px', margin: '0 auto',
      }}>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.5 }}
        >
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            style={{ marginBottom: '32px' }}
          >
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: '8px',
              background: 'rgba(124,58,237,0.12)',
              border: '1px solid rgba(168,85,247,0.4)',
              borderRadius: '30px', padding: '8px 20px',
              color: '#c084fc', fontSize: '13px', fontWeight: 600,
            }}>
              <span style={{
                width: '6px', height: '6px', borderRadius: '50%',
                background: '#a855f7',
                boxShadow: '0 0 6px #a855f7',
                display: 'inline-block',
                animation: 'pulse 2s infinite',
              }} />
              100% Gratuit · Propulsé par Claude IA
            </span>
          </motion.div>

          {/* Title */}
          <h1 style={{
            fontSize: 'clamp(3rem, 9vw, 7rem)',
            fontWeight: 900,
            marginBottom: '32px',
            lineHeight: 1.05,
            letterSpacing: '-3px',
          }}>
            {words.map((word, wordIndex) => (
              <motion.span
                key={wordIndex}
                initial={{ y: 60, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{
                  delay: 0.4 + wordIndex * 0.2,
                  type: 'spring',
                  stiffness: 120,
                  damping: 20,
                }}
                style={{
                  display: 'inline-block',
                  marginRight: '0.3em',
                  background: wordIndex === 0
                    ? 'linear-gradient(135deg, #ffffff, rgba(255,255,255,0.85))'
                    : 'linear-gradient(135deg, #a855f7, #ec4899)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  color: 'transparent',
                }}
              >
                {word}
              </motion.span>
            ))}
          </h1>

          {/* Subtitle */}
          {subtitle && (
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.8 }}
              style={{
                color: '#d1d5db', fontSize: 'clamp(1rem, 2.5vw, 1.25rem)',
                lineHeight: 1.7, maxWidth: '620px', margin: '0 auto 48px',
              }}
            >
              {subtitle}
            </motion.p>
          )}

          {/* CTA button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.1, duration: 0.8 }}
          >
            <div style={{
              display: 'inline-block',
              background: 'linear-gradient(135deg, rgba(124,58,237,0.5), rgba(236,72,153,0.5))',
              padding: '1.5px', borderRadius: '18px',
              boxShadow: '0 0 40px rgba(139,92,246,0.35)',
            }}>
              <Link
                to="/register"
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: '12px',
                  background: 'rgba(0,0,0,0.88)', color: 'white',
                  textDecoration: 'none', fontWeight: 700, fontSize: '17px',
                  padding: '18px 44px', borderRadius: '17px',
                  transition: 'background 0.3s, transform 0.2s',
                  letterSpacing: '-0.3px',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = 'rgba(124,58,237,0.2)'
                  e.currentTarget.style.transform = 'translateY(-2px)'
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = 'rgba(0,0,0,0.88)'
                  e.currentTarget.style.transform = 'translateY(0)'
                }}
              >
                {cta || 'Commencer gratuitement'}
                <span style={{ opacity: 0.8 }}>→</span>
              </Link>
            </div>
          </motion.div>

          {/* Social proof */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.4, duration: 1 }}
            style={{ marginTop: '36px', color: '#6b7280', fontSize: '13px' }}
          >
            ✦ Aucune carte bancaire ✦ Compte en 30 secondes ✦ Gratuit pour toujours
          </motion.div>
        </motion.div>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
      `}</style>
    </div>
  )
}
