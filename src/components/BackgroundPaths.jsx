import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'

function FloatingPaths({ position }) {
  const paths = Array.from({ length: 36 }, (_, i) => ({
    id: i,
    d: `M-${380 - i * 5 * position} -${189 + i * 6}C-${
      380 - i * 5 * position
    } -${189 + i * 6} -${312 - i * 5 * position} ${216 - i * 6} ${
      152 - i * 5 * position
    } ${343 - i * 6}C${616 - i * 5 * position} ${470 - i * 6} ${
      684 - i * 5 * position
    } ${875 - i * 6} ${684 - i * 5 * position} ${875 - i * 6}`,
    width: 0.5 + i * 0.03,
  }))

  return (
    <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
      <svg
        style={{ width: '100%', height: '100%' }}
        viewBox="0 0 696 316"
        fill="none"
      >
        {paths.map((path) => (
          <motion.path
            key={path.id}
            d={path.d}
            stroke="url(#violetGrad)"
            strokeWidth={path.width}
            strokeOpacity={0.08 + path.id * 0.025}
            initial={{ pathLength: 0.3, opacity: 0.6 }}
            animate={{
              pathLength: 1,
              opacity: [0.3, 0.6, 0.3],
              pathOffset: [0, 1, 0],
            }}
            transition={{
              duration: 20 + (path.id % 7) * 3,
              repeat: Infinity,
              ease: 'linear',
            }}
          />
        ))}
        <defs>
          <linearGradient id="violetGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#7c3aed" />
            <stop offset="50%" stopColor="#a855f7" />
            <stop offset="100%" stopColor="#ec4899" />
          </linearGradient>
        </defs>
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
      {/* Floating paths — deux miroirs */}
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
      <div style={{ position: 'relative', zIndex: 10, textAlign: 'center', padding: '0 24px', maxWidth: '900px', margin: '0 auto' }}>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 2 }}
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
                animation: 'pulse 2s infinite',
              }} />
              100% Gratuit · Propulsé par Claude IA
            </span>
          </motion.div>

          {/* Animated title letter by letter */}
          <h1 style={{
            fontSize: 'clamp(3rem, 9vw, 7rem)',
            fontWeight: 900,
            marginBottom: '32px',
            lineHeight: 1.05,
            letterSpacing: '-3px',
          }}>
            {words.map((word, wordIndex) => (
              <span key={wordIndex} style={{ display: 'inline-block', marginRight: '0.3em', lastOfType: { marginRight: 0 } }}>
                {word.split('').map((letter, letterIndex) => (
                  <motion.span
                    key={`${wordIndex}-${letterIndex}`}
                    initial={{ y: 80, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{
                      delay: 0.4 + wordIndex * 0.12 + letterIndex * 0.04,
                      type: 'spring',
                      stiffness: 140,
                      damping: 22,
                    }}
                    style={{
                      display: 'inline-block',
                      background: wordIndex === 0
                        ? 'linear-gradient(135deg, #ffffff, rgba(255,255,255,0.85))'
                        : 'linear-gradient(135deg, #a855f7, #ec4899)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      backgroundClip: 'text',
                    }}
                  >
                    {letter}
                  </motion.span>
                ))}
              </span>
            ))}
          </h1>

          {/* Subtitle */}
          {subtitle && (
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.2, duration: 0.8 }}
              style={{
                color: '#d1d5db', fontSize: 'clamp(1rem, 2.5vw, 1.25rem)',
                lineHeight: 1.7, maxWidth: '620px', margin: '0 auto 48px',
              }}
            >
              {subtitle}
            </motion.p>
          )}

          {/* CTA shimmer button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.5, duration: 0.8 }}
          >
            <div style={{
              display: 'inline-block',
              background: 'linear-gradient(135deg, rgba(124,58,237,0.3), rgba(236,72,153,0.3))',
              padding: '1px', borderRadius: '18px',
              backdropFilter: 'blur(12px)',
              boxShadow: '0 0 40px rgba(139,92,246,0.35)',
            }}>
              <Link
                to="/register"
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: '12px',
                  background: 'rgba(0,0,0,0.85)', color: 'white',
                  textDecoration: 'none', fontWeight: 700, fontSize: '17px',
                  padding: '18px 44px', borderRadius: '17px',
                  backdropFilter: 'blur(20px)',
                  transition: 'all 0.3s',
                  border: '1px solid rgba(168,85,247,0.2)',
                  letterSpacing: '-0.3px',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = 'rgba(124,58,237,0.15)'
                  e.currentTarget.style.transform = 'translateY(-2px)'
                  e.currentTarget.style.boxShadow = '0 8px 30px rgba(139,92,246,0.3)'
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = 'rgba(0,0,0,0.85)'
                  e.currentTarget.style.transform = 'translateY(0)'
                  e.currentTarget.style.boxShadow = 'none'
                }}
              >
                <span style={{ opacity: 0.9 }}>{cta || 'Commencer gratuitement'}</span>
                <motion.span
                  animate={{ x: [0, 5, 0] }}
                  transition={{ repeat: Infinity, duration: 1.5, ease: 'easeInOut' }}
                  style={{ opacity: 0.8 }}
                >
                  →
                </motion.span>
              </Link>
            </div>
          </motion.div>

          {/* Social proof */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2, duration: 1 }}
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
