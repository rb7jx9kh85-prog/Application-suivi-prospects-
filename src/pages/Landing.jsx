import React, { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'

function AnimTitle({ text, grad, delay = 0 }) {
  return (
    <>
      {text.split('').map((ch, i) => (
        <span
          key={i}
          className="hl"
          style={{
            animationDelay: `${delay + i * 0.045}s`,
            ...(grad ? { background: 'var(--grad2)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' } : {}),
          }}
        >
          {ch === ' ' ? ' ' : ch}
        </span>
      ))}
    </>
  )
}

export default function Landing() {
  const navigate = useNavigate()
  const ctaRef = useRef(null)

  useEffect(() => {
    if (window.innerWidth < 900 || !ctaRef.current) return
    const el = ctaRef.current
    el.style.transition = 'transform .25s cubic-bezier(.2,.8,.2,1)'
    const move = e => {
      const r = el.getBoundingClientRect()
      el.style.transform = `translate(${(e.clientX - (r.left + r.width / 2)) * 0.35}px,${(e.clientY - (r.top + r.height / 2)) * 0.45}px)`
    }
    const leave = () => { el.style.transform = 'translate(0,0)' }
    el.addEventListener('mousemove', move)
    el.addEventListener('mouseleave', leave)
    return () => { el.removeEventListener('mousemove', move); el.removeEventListener('mouseleave', leave) }
  }, [])

  const paths = Array.from({ length: 14 }, (_, i) => {
    const p = i % 2 === 0 ? 1 : -1
    const d = `M-${380 - i * 8 * p} -${189 + i * 9}C-${380 - i * 8 * p} -${189 + i * 9} -${312 - i * 8 * p} ${216 - i * 9} ${152 - i * 8 * p} ${343 - i * 9}C${616 - i * 8 * p} ${470 - i * 9} ${684 - i * 8 * p} ${875 - i * 9} ${684 - i * 8 * p} ${875 - i * 9}`
    return <path key={i} d={d} stroke="url(#vg)" strokeWidth={0.5 + i * 0.05} strokeOpacity={0.06 + i * 0.018} fill="none" style={{ animation: `pathFade ${18 + i * 2}s ease-in-out ${-i * 1.5}s infinite` }} />
  })

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      {/* NAV */}
      <nav style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100, background: 'rgba(5,0,26,0.85)', backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)', borderBottom: '1px solid rgba(139,92,246,0.18)', height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontWeight: 800, fontSize: 17, letterSpacing: '-0.3px' }}>
          <div style={{ width: 36, height: 36, background: 'linear-gradient(135deg,#7c3aed,#a855f7)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 16px rgba(124,58,237,0.4)' }}>📞</div>
          ProspectPro
        </div>
        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
          <button onClick={() => navigate('/login')} style={{ background: 'none', border: 'none', color: '#9ca3af', fontSize: 14, fontWeight: 500, padding: '9px 16px', borderRadius: 10, cursor: 'pointer' }}>Connexion</button>
          <button onClick={() => navigate('/register')} style={{ background: 'linear-gradient(135deg,#7c3aed,#a855f7)', color: '#fff', border: 'none', fontSize: 14, fontWeight: 700, padding: '10px 22px', borderRadius: 11, boxShadow: '0 4px 16px rgba(124,58,237,0.35)', cursor: 'pointer' }}>Commencer — Gratuit →</button>
        </div>
      </nav>

      {/* HERO */}
      <section style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', position: 'relative', overflow: 'hidden', padding: '110px 24px 80px' }}>
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden' }}>
          <svg style={{ width: '100%', height: '100%', position: 'absolute', inset: 0, overflow: 'visible' }} viewBox="0 0 696 316" fill="none">
            <defs><linearGradient id="vg" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#7c3aed" /><stop offset="50%" stopColor="#a855f7" /><stop offset="100%" stopColor="#ec4899" /></linearGradient></defs>
            {paths}
          </svg>
          <div style={{ position: 'absolute', top: '10%', left: '5%', width: 560, height: 560, borderRadius: '50%', background: 'radial-gradient(circle,rgba(124,58,237,0.18) 0%,transparent 70%)', filter: 'blur(80px)' }} />
          <div style={{ position: 'absolute', bottom: '10%', right: '5%', width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle,rgba(236,72,153,0.13) 0%,transparent 70%)', filter: 'blur(80px)' }} />
        </div>
        <div style={{ position: 'relative', zIndex: 2, maxWidth: 840, margin: '0 auto' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(124,58,237,0.12)', border: '1px solid rgba(139,92,246,0.4)', borderRadius: 50, padding: '7px 18px', color: 'var(--pi)', fontSize: 12, fontWeight: 600, marginBottom: 32 }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--p)', boxShadow: '0 0 8px var(--p)', display: 'inline-block', animation: 'pulse 2s infinite' }} />
            100% Gratuit · Propulsé par l'IA
          </div>
          <h1 style={{ fontSize: 'clamp(3rem,8vw,6.5rem)', fontWeight: 900, lineHeight: 1.03, letterSpacing: -3, marginBottom: 26 }}>
            <AnimTitle text="Prospectez" delay={0.3} /><br />
            <AnimTitle text="2× plus vite" grad delay={0.75} />
          </h1>
          <p style={{ color: '#c4b5d6', fontSize: 'clamp(1rem,2.3vw,1.15rem)', lineHeight: 1.75, maxWidth: 560, margin: '0 auto 44px' }}>
            Scripts personnalisés par l'IA, suivi des appels et rendez-vous, assistant en temps réel. Tout ce qu'il faut pour décrocher plus de RDV.
          </p>
          <button ref={ctaRef} onClick={() => navigate('/register')} style={{ display: 'inline-flex', alignItems: 'center', gap: 10, background: 'var(--grad)', color: '#fff', fontWeight: 700, fontSize: 16, padding: '17px 42px', borderRadius: 14, border: 'none', boxShadow: '0 0 40px rgba(124,58,237,0.45)', transition: 'transform .2s, box-shadow .2s', cursor: 'pointer', letterSpacing: -0.3 }}>
            Créer mon compte gratuit →
          </button>
          <p style={{ marginTop: 32, color: 'var(--text3)', fontSize: 12 }}>✦ Aucune carte bancaire &nbsp;·&nbsp; Compte en 30 secondes &nbsp;·&nbsp; Gratuit pour toujours</p>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 32, marginTop: 56, flexWrap: 'wrap' }}>
            {[['3×', 'Plus de RDV'], ['0€', 'Pour toujours'], ['30s', 'Pour commencer'], ['IA', 'Scripts sur mesure']].map(([v, l], i) => (
              <React.Fragment key={v}>
                {i > 0 && <div style={{ width: 1, height: 36, background: 'var(--border2)' }} />}
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 28, fontWeight: 900, background: 'var(--grad2)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', letterSpacing: -1 }}>{v}</div>
                  <div style={{ fontSize: 11, color: 'var(--text3)', marginTop: 2 }}>{l}</div>
                </div>
              </React.Fragment>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section style={{ padding: '96px 0', background: 'rgba(139,92,246,0.03)', borderTop: '1px solid rgba(139,92,246,0.1)', borderBottom: '1px solid rgba(139,92,246,0.1)' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 28px', textAlign: 'center' }}>
          <span className="sl">Fonctionnalités</span>
          <h2 className="st">Tout ce qu'il vous faut</h2>
          <p className="ss">Sans payer un centime.</p>
          <div className="feat-grid">
            {[
              { ic: '✨', t: 'Scripts IA personnalisés', d: "Entrez nom + secteur, l'IA génère un script percutant en secondes." },
              { ic: '🎙️', t: 'Assistant vocal en direct', d: "Microphone intégré : l'IA propose des réponses aux objections. Mains libres." },
              { ic: '📅', t: 'Gestion des rendez-vous', d: "Planifiez, confirmez et suivez vos RDV. Tout organisé en un coup d'œil." },
              { ic: '📞', t: 'Session Cold Call', d: "Liste de prospects, statuts visuels, notes. Votre cockpit de prospection." },
              { ic: '📊', t: 'Dashboard temps réel', d: "Appels du jour, taux de conversion — pilotez votre activité instantanément." },
              { ic: '⚡', t: 'Enrichissement IA', d: "Trouvez adresse, téléphone, décisionnaire automatiquement avec la recherche web IA." },
            ].map(f => (
              <div key={f.t} className="feat-card">
                <div className="feat-ic">{f.ic}</div>
                <div className="feat-t">{f.t}</div>
                <p className="feat-d">{f.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* STEPS */}
      <section style={{ padding: '96px 0' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 28px', textAlign: 'center' }}>
          <span className="sl">Comment ça marche</span>
          <h2 className="st">3 étapes, c'est tout</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: 24, marginTop: 48 }}>
            {[
              { n: '01', t: 'Créez votre compte', d: 'Inscription gratuite en 30 secondes. Aucune carte bancaire, aucun engagement.' },
              { n: '02', t: 'Ajoutez vos prospects', d: "Nom, secteur, infos clés. L'IA génère un script personnalisé immédiatement." },
              { n: '03', t: 'Appelez avec confiance', d: 'Script IA + assistant vocal = plus de RDV, moins de stress.' },
            ].map(s => (
              <div key={s.n} className="card">
                <div style={{ fontSize: 48, fontWeight: 900, background: 'var(--grad)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', marginBottom: 12, lineHeight: 1 }}>{s.n}</div>
                <div style={{ fontSize: 17, fontWeight: 700, marginBottom: 8, letterSpacing: '-0.3px' }}>{s.t}</div>
                <p style={{ color: 'var(--text2)', fontSize: 13, lineHeight: 1.65 }}>{s.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section style={{ padding: '96px 0', background: 'rgba(139,92,246,0.03)', borderTop: '1px solid rgba(139,92,246,0.1)', borderBottom: '1px solid rgba(139,92,246,0.1)' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 28px', textAlign: 'center' }}>
          <span className="sl">Tarifs</span>
          <h2 className="st">Simple comme bonjour</h2>
          <div style={{ maxWidth: 480, margin: '52px auto 0', background: 'linear-gradient(135deg,rgba(124,58,237,0.1),rgba(236,72,153,0.07))', border: '1px solid rgba(139,92,246,0.3)', borderRadius: 24, padding: 42, textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', width: 200, height: 2, background: 'var(--grad)' }} />
            <div style={{ fontSize: 72, fontWeight: 900, background: 'var(--grad)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', lineHeight: 1, letterSpacing: -4 }}>0€</div>
            <p style={{ color: 'var(--text2)', margin: '6px 0 28px' }}>Pour toujours. Vraiment.</p>
            <ul style={{ listStyle: 'none', textAlign: 'left', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 32 }}>
              {['Scripts IA illimités', 'Enrichissement IA', 'Suivi des prospects', 'Gestion des RDV', 'Dashboard complet', 'Bibliothèque scripts', 'Support IA inclus', 'Aucune limite'].map(f => (
                <li key={f} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#d1d5db' }}>
                  <span style={{ color: 'var(--p)', fontWeight: 700 }}>✓</span>{f}
                </li>
              ))}
            </ul>
            <button onClick={() => navigate('/register')} style={{ display: 'inline-flex', alignItems: 'center', gap: 10, background: 'var(--grad)', color: '#fff', fontWeight: 700, fontSize: 15, padding: '15px 38px', borderRadius: 14, border: 'none', boxShadow: '0 0 40px rgba(124,58,237,0.45)', cursor: 'pointer' }}>
              Commencer maintenant — Gratuit →
            </button>
          </div>
        </div>
      </section>

      <footer style={{ borderTop: '1px solid var(--border)', padding: '32px 24px', textAlign: 'center', color: 'var(--text3)', fontSize: 13 }}>
        <strong style={{ color: 'var(--pi)' }}>ProspectPro</strong> — Votre assistant de prospection IA
        &nbsp;·&nbsp; <a onClick={() => navigate('/login')} style={{ color: 'var(--p)', cursor: 'pointer' }}>Connexion</a>
        &nbsp;·&nbsp; <a onClick={() => navigate('/register')} style={{ color: 'var(--p)', cursor: 'pointer' }}>S'inscrire</a>
      </footer>

      <style>{`
        .feat-grid { display: grid; grid-template-columns: repeat(auto-fit,minmax(280px,1fr)); gap: 18px; margin-top: 52px }
        .feat-card { background: var(--card); border: 1px solid var(--border2); border-radius: 20px; padding: 28px; transition: all .3s; position: relative; overflow: hidden }
        .feat-card::before { content:''; position:absolute; top:0; left:0; right:0; height:2px; background:var(--grad); transform:scaleX(0); transition:transform .3s; transform-origin:left }
        .feat-card:hover { border-color:rgba(139,92,246,0.4); transform:translateY(-5px); box-shadow:0 16px 40px rgba(124,58,237,0.14) }
        .feat-card:hover::before { transform:scaleX(1) }
        .feat-ic { width:48px; height:48px; border-radius:14px; display:flex; align-items:center; justify-content:center; font-size:22px; margin-bottom:16px; background:rgba(124,58,237,0.14) }
        .feat-t { font-size:15px; font-weight:700; margin-bottom:8px }
        .feat-d { color:var(--text2); font-size:13px; line-height:1.65 }
        .sl { color:var(--p); font-weight:700; font-size:11px; text-transform:uppercase; letter-spacing:4px; display:block; margin-bottom:12px }
        .st { font-size:clamp(1.9rem,3.5vw,2.8rem); font-weight:900; line-height:1.12; margin-bottom:12px; letter-spacing:-1px }
        .ss { color:var(--text2); font-size:16px; line-height:1.6 }
      `}</style>
    </div>
  )
}
