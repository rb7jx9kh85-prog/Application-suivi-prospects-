import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Phone, Calendar, BookOpen, MessageSquare,
  CheckCircle, Star, Shield, Clock, BarChart3, Mic,
  Gift, Sparkles, TrendingUp, ArrowRight, Zap, Users
} from 'lucide-react'
import BackgroundPathsHero from '../components/BackgroundPaths'

/* ─── helpers ─── */
function fadeUp(delay = 0) {
  return {
    initial: { opacity: 0, y: 32 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true },
    transition: { duration: 0.6, delay },
  }
}

function GradientText({ children, from = '#a855f7', to = '#ec4899', style = {} }) {
  return (
    <span style={{
      background: `linear-gradient(135deg, ${from}, ${to})`,
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      backgroundClip: 'text',
      ...style,
    }}>
      {children}
    </span>
  )
}

/* ─── data ─── */
const FEATURES = [
  { icon: Sparkles, title: 'Scripts générés par IA', desc: 'Entrez le nom du prospect et son secteur. Claude IA génère un script d\'appel percutant et personnalisé en quelques secondes.', highlight: 'Claude IA' },
  { icon: Mic,      title: 'Assistant vocal en direct', desc: 'Microphone intégré : parlez, l\'IA propose des réponses aux objections en temps réel. Mains libres pendant vos appels.', highlight: 'Mains libres' },
  { icon: Calendar, title: 'Google Calendar auto', desc: 'Dites "RDV avec [nom] le 20 juin à 14h" et le rendez-vous est créé + email de confirmation envoyé.', highlight: 'Auto-planification' },
  { icon: Phone,    title: 'Session Cold Call', desc: 'Liste de prospects, statuts visuels (À appeler, Appelé, Refus, RDV ✅) et notes. Votre cockpit de prospection.', highlight: 'Suivi complet' },
  { icon: BarChart3, title: 'Dashboard temps réel', desc: 'Appels du jour, taux de conversion, résumé quotidien. Pilotez votre activité commerciale en un coup d\'œil.', highlight: 'Statistiques' },
  { icon: BookOpen, title: 'Bibliothèque de scripts', desc: 'Cold Call, Warm Call, Hot Call, objections — des scripts prêts à l\'emploi pour chaque situation.', highlight: 'Prêt à l\'emploi' },
]

const STEPS = [
  { num: '01', title: 'Créez votre compte', desc: 'Inscription gratuite en 30 secondes. Aucune carte bancaire, aucun engagement.' },
  { num: '02', title: 'Ajoutez vos prospects', desc: 'Nom, secteur, infos clés. L\'IA génère un script personnalisé immédiatement.' },
  { num: '03', title: 'Appelez avec confiance', desc: 'Script IA + assistant vocal en direct = plus de rendez-vous, moins de stress.' },
]

const TESTIMONIALS = [
  { name: 'Marc D.',    role: 'Commercial B2B',       text: 'J\'ai multiplié mes RDV par 3 en 2 semaines. Les scripts IA sont bluffants de précision.', stars: 5 },
  { name: 'Sophie L.', role: 'Responsable ventes',    text: 'L\'assistant vocal pendant les appels change tout. Plus jamais à court d\'arguments face aux objections.', stars: 5 },
  { name: 'Thomas B.', role: 'Auto-entrepreneur',     text: 'Gratuit et plus puissant que des outils à 100€/mois. L\'intégration Google Calendar est parfaite.', stars: 5 },
]

const INCLUDED = [
  'Scripts IA illimités', 'Assistant vocal intégré',
  'Suivi des prospects',  'Gestion des RDV',
  'Export Google Calendar', 'Email de confirmation auto',
  'Tableau de bord',      'Bibliothèque de scripts',
]

/* ─── styles constants ─── */
const S = {
  section:    { padding: '100px 24px' },
  sectionAlt: { padding: '100px 24px', background: 'rgba(139,92,246,0.04)', borderTop: '1px solid rgba(139,92,246,0.15)', borderBottom: '1px solid rgba(139,92,246,0.15)' },
  container:  { maxWidth: '1100px', margin: '0 auto' },
  label:      { color: '#a855f7', fontWeight: 600, fontSize: '12px', textTransform: 'uppercase', letterSpacing: '4px', display: 'block', marginBottom: '14px' },
  h2:         { color: 'white', fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 900, margin: '0 0 12px', lineHeight: 1.15 },
  card:       { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '20px', padding: '28px' },
}

/* ─── component ─── */
export default function LandingPage() {
  const [hoveredFeature, setHoveredFeature] = useState(null)

  return (
    <div style={{ background: '#000', minHeight: '100vh', overflowX: 'hidden', fontFamily: 'system-ui,-apple-system,sans-serif' }}>

      {/* ── NAV ── */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 200,
        background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(139,92,246,0.18)',
        padding: '0 28px', height: '64px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '36px', height: '36px', background: 'linear-gradient(135deg,#7c3aed,#a855f7)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Phone size={17} color="white" />
          </div>
          <span style={{ color: 'white', fontWeight: 800, fontSize: '18px', letterSpacing: '-0.5px' }}>ProspectPro</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Link to="/login" style={{ color: '#9ca3af', textDecoration: 'none', fontSize: '14px', fontWeight: 500, padding: '9px 14px' }}>
            Connexion
          </Link>
          <Link to="/register" style={{
            background: 'linear-gradient(135deg,#7c3aed,#a855f7)',
            color: 'white', textDecoration: 'none', fontSize: '14px', fontWeight: 700,
            padding: '10px 22px', borderRadius: '10px',
            boxShadow: '0 0 20px rgba(139,92,246,0.35)',
          }}>
            Commencer — Gratuit →
          </Link>
        </div>
      </nav>

      {/* ── HERO (BackgroundPaths) ── */}
      <div style={{ paddingTop: '64px' }}>
        <BackgroundPathsHero
          title="Prospectez 2× plus vite"
          subtitle="Scripts personnalisés par l'IA, assistant vocal en direct, suivi des appels et rendez-vous automatiques. Tout ce qu'il faut pour décrocher plus de RDV — gratuitement."
          cta="Créer mon compte gratuit"
        />
      </div>

      {/* ── BADGES ── */}
      <section style={{ borderTop: '1px solid rgba(139,92,246,0.2)', borderBottom: '1px solid rgba(139,92,246,0.2)', background: 'rgba(139,92,246,0.03)', padding: '24px' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto', display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: '10px' }}>
          {[
            { icon: Gift,     label: '100% Gratuit',  sub: 'Pour toujours' },
            { icon: Shield,   label: 'Sans CB',        sub: 'Aucun engagement' },
            { icon: Clock,    label: 'En ligne 24/7',  sub: 'Toujours disponible' },
            { icon: Sparkles, label: 'IA intégrée',    sub: 'Claude Haiku' },
            { icon: Users,    label: 'Multi-profil',   sub: 'Solo ou équipe' },
          ].map(({ icon: Icon, label, sub }) => (
            <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '10px 18px' }}>
              <Icon size={16} color="#a855f7" />
              <div>
                <p style={{ margin: 0, color: 'white', fontWeight: 700, fontSize: '13px' }}>{label}</p>
                <p style={{ margin: 0, color: '#6b7280', fontSize: '11px' }}>{sub}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section style={S.section}>
        <div style={S.container}>
          <motion.div {...fadeUp()} style={{ textAlign: 'center', marginBottom: '64px' }}>
            <span style={S.label}>Fonctionnalités</span>
            <h2 style={S.h2}>Tout ce qu'il vous faut</h2>
            <p style={{ color: '#9ca3af', fontSize: '18px', margin: 0 }}>Sans payer un centime.</p>
          </motion.div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(300px,1fr))', gap: '20px' }}>
            {FEATURES.map(({ icon: Icon, title, desc, highlight }, i) => (
              <motion.div
                key={title}
                {...fadeUp(i * 0.08)}
                onMouseEnter={() => setHoveredFeature(i)}
                onMouseLeave={() => setHoveredFeature(null)}
                style={{
                  ...S.card,
                  position: 'relative',
                  transition: 'border-color 0.25s, transform 0.25s, box-shadow 0.25s',
                  borderColor: hoveredFeature === i ? 'rgba(168,85,247,0.5)' : 'rgba(255,255,255,0.08)',
                  transform: hoveredFeature === i ? 'translateY(-4px)' : 'none',
                  boxShadow: hoveredFeature === i ? '0 20px 50px rgba(139,92,246,0.15)' : 'none',
                }}
              >
                <div style={{ position: 'absolute', top: 16, right: 16, background: 'rgba(168,85,247,0.1)', border: '1px solid rgba(168,85,247,0.25)', borderRadius: '20px', padding: '3px 10px' }}>
                  <span style={{ color: '#c084fc', fontSize: '11px', fontWeight: 600 }}>{highlight}</span>
                </div>
                <div style={{ width: '48px', height: '48px', background: 'rgba(124,58,237,0.18)', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '18px', transition: 'background 0.2s', ...(hoveredFeature === i ? { background: 'rgba(124,58,237,0.35)' } : {}) }}>
                  <Icon size={22} color="#a855f7" />
                </div>
                <h3 style={{ color: 'white', fontWeight: 700, fontSize: '17px', margin: '0 0 10px' }}>{title}</h3>
                <p style={{ color: '#9ca3af', fontSize: '14px', lineHeight: 1.6, margin: 0 }}>{desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section style={S.sectionAlt}>
        <div style={{ maxWidth: '760px', margin: '0 auto' }}>
          <motion.div {...fadeUp()} style={{ textAlign: 'center', marginBottom: '56px' }}>
            <span style={S.label}>Simple comme bonjour</span>
            <h2 style={S.h2}>Démarrez en <GradientText>3 étapes</GradientText></h2>
          </motion.div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {STEPS.map(({ num, title, desc }, i) => (
              <motion.div key={num} {...fadeUp(i * 0.12)} style={{ display: 'flex', gap: '20px', alignItems: 'flex-start', ...S.card }}>
                <div style={{ fontSize: '38px', fontWeight: 900, background: 'linear-gradient(135deg,#7c3aed,#ec4899)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', flexShrink: 0, lineHeight: 1, minWidth: '54px' }}>
                  {num}
                </div>
                <div style={{ flex: 1 }}>
                  <h3 style={{ color: 'white', fontWeight: 700, fontSize: '18px', margin: '0 0 6px' }}>{title}</h3>
                  <p style={{ color: '#9ca3af', fontSize: '14px', lineHeight: 1.6, margin: 0 }}>{desc}</p>
                </div>
                <CheckCircle size={22} color="#a855f7" style={{ flexShrink: 0, marginTop: '3px' }} />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── IA DEMO ── */}
      <section style={S.section}>
        <div style={{ maxWidth: '1000px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(320px,1fr))', gap: '56px', alignItems: 'center' }}>
          <motion.div {...fadeUp()}>
            <span style={{ ...S.label, color: '#ec4899' }}>Propulsé par Claude IA</span>
            <h2 style={S.h2}>
              L'IA fait le travail,
              <br /><GradientText from="#a855f7" to="#ec4899">vous récoltez les RDV</GradientText>
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '28px' }}>
              {[
                { icon: Sparkles,      text: 'Scripts adaptés au secteur et profil de votre prospect' },
                { icon: MessageSquare, text: 'Réponses aux objections en temps réel pendant l\'appel' },
                { icon: TrendingUp,    text: 'Analyse de vos performances et suggestions d\'amélioration' },
                { icon: Mic,           text: 'Commandes vocales pour noter sans décrocher les yeux' },
              ].map(({ icon: Icon, text }) => (
                <div key={text} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                  <div style={{ width: '32px', height: '32px', background: 'rgba(236,72,153,0.12)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Icon size={15} color="#ec4899" />
                  </div>
                  <p style={{ color: '#d1d5db', margin: 0, fontSize: '15px', lineHeight: 1.5 }}>{text}</p>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div {...fadeUp(0.2)} style={{ background: 'rgba(124,58,237,0.07)', border: '1px solid rgba(139,92,246,0.3)', borderRadius: '20px', padding: '28px', fontFamily: 'monospace' }}>
            <div style={{ display: 'flex', gap: '6px', marginBottom: '20px' }}>
              {['#ef4444','#f59e0b','#22c55e'].map(c => <div key={c} style={{ width: '11px', height: '11px', borderRadius: '50%', background: c }} />)}
              <span style={{ color: '#4b5563', fontSize: '11px', marginLeft: '8px', lineHeight: '11px', alignSelf: 'center' }}>script-generator.ai</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13px' }}>
              {[
                ['Prospect', 'Boulangerie Martin'],
                ['Secteur', 'Restauration / Artisanat'],
                ['Info clé', 'Veut développer la livraison'],
              ].map(([k, v]) => (
                <div key={k}><span style={{ color: '#a855f7' }}>{k} : </span><span style={{ color: '#e5e7eb' }}>{v}</span></div>
              ))}
              <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '16px', marginTop: '4px' }}>
                <motion.div
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.5 }}
                >
                  <p style={{ color: '#4ade80', fontWeight: 700, margin: '0 0 10px', fontSize: '12px' }}>✨ Script IA généré :</p>
                  <p style={{ color: 'white', lineHeight: 1.7, margin: 0, fontSize: '13px' }}>
                    "Bonjour M. Martin, j'ai vu vos produits artisanaux en ligne — vraiment impressionnant.
                    Je sais que la livraison à domicile explose dans la restauration. Vous avez 5 minutes ?"
                  </p>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section style={S.sectionAlt}>
        <div style={S.container}>
          <motion.div {...fadeUp()} style={{ textAlign: 'center', marginBottom: '48px' }}>
            <h2 style={S.h2}>Ce qu'en disent les utilisateurs</h2>
          </motion.div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: '20px' }}>
            {TESTIMONIALS.map(({ name, role, text, stars }, i) => (
              <motion.div key={name} {...fadeUp(i * 0.1)} style={S.card}>
                <div style={{ display: 'flex', gap: '3px', marginBottom: '14px' }}>
                  {Array.from({ length: stars }).map((_, j) => <Star key={j} size={14} color="#facc15" fill="#facc15" />)}
                </div>
                <p style={{ color: '#d1d5db', fontSize: '14px', lineHeight: 1.6, margin: '0 0 16px' }}>"{text}"</p>
                <p style={{ color: 'white', fontWeight: 700, fontSize: '13px', margin: '0 0 2px' }}>{name}</p>
                <p style={{ color: '#6b7280', fontSize: '12px', margin: 0 }}>{role}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRICING ── */}
      <section style={S.section}>
        <div style={{ maxWidth: '540px', margin: '0 auto', textAlign: 'center' }}>
          <motion.div {...fadeUp()}>
            <div style={{ background: 'rgba(124,58,237,0.08)', border: '1px solid rgba(139,92,246,0.4)', borderRadius: '28px', padding: '52px 40px' }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(74,222,128,0.1)', border: '1px solid rgba(74,222,128,0.3)', borderRadius: '30px', padding: '8px 18px', marginBottom: '28px' }}>
                <Gift size={14} color="#4ade80" />
                <span style={{ color: '#4ade80', fontSize: '13px', fontWeight: 700 }}>Prix unique et définitif</span>
              </div>
              <div style={{ marginBottom: '24px' }}>
                <span style={{ color: 'white', fontSize: '96px', fontWeight: 900, lineHeight: 1 }}>0€</span>
                <p style={{ color: '#9ca3af', fontSize: '16px', margin: '8px 0 0' }}>Pour toujours · Aucune limitation cachée</p>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '36px', textAlign: 'left' }}>
                {INCLUDED.map(item => (
                  <div key={item} style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <CheckCircle size={14} color="#4ade80" />
                    <span style={{ color: '#d1d5db', fontSize: '13px' }}>{item}</span>
                  </div>
                ))}
              </div>
              <Link to="/register" style={{
                display: 'block', background: 'linear-gradient(135deg,#7c3aed,#a855f7,#ec4899)',
                color: 'white', textDecoration: 'none', fontWeight: 800, fontSize: '18px',
                padding: '18px', borderRadius: '14px', boxShadow: '0 0 40px rgba(139,92,246,0.4)',
              }}>
                Démarrer gratuitement maintenant →
              </Link>
              <p style={{ color: '#6b7280', fontSize: '12px', margin: '12px 0 0' }}>Aucune carte bancaire · Compte en 30 secondes</p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── FINAL CTA ── */}
      <section style={{ position: 'relative', padding: '120px 24px', textAlign: 'center', overflow: 'hidden', borderTop: '1px solid rgba(139,92,246,0.2)' }}>
        {/* ambient glow */}
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at center, rgba(124,58,237,0.12) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ position: 'relative', zIndex: 1, maxWidth: '700px', margin: '0 auto' }}>
          <motion.div {...fadeUp()}>
            <h2 style={{ color: 'white', fontSize: 'clamp(2.2rem, 5vw, 3.5rem)', fontWeight: 900, lineHeight: 1.15, margin: '0 0 20px', letterSpacing: '-1.5px' }}>
              Prêt à décrocher{' '}
              <GradientText>plus de rendez-vous ?</GradientText>
            </h2>
            <p style={{ color: '#9ca3af', fontSize: '17px', margin: '0 0 40px', lineHeight: 1.6 }}>
              Rejoignez les commerciaux qui utilisent ProspectPro pour multiplier leurs conversions. Gratuit. Maintenant.
            </p>
            <div style={{
              display: 'inline-block', background: 'linear-gradient(135deg,rgba(124,58,237,0.4),rgba(236,72,153,0.4))',
              padding: '1.5px', borderRadius: '16px',
            }}>
              <Link to="/register" style={{
                display: 'inline-flex', alignItems: 'center', gap: '10px',
                background: '#000', color: 'white', textDecoration: 'none',
                fontWeight: 800, fontSize: '18px', padding: '18px 48px', borderRadius: '15px',
                transition: 'background 0.2s',
              }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(124,58,237,0.2)'}
                onMouseLeave={e => e.currentTarget.style.background = '#000'}
              >
                <Zap size={22} color="#a855f7" />
                Créer mon compte — C'est gratuit
                <ArrowRight size={20} />
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ padding: '32px 24px', borderTop: '1px solid rgba(255,255,255,0.06)', textAlign: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '8px' }}>
          <div style={{ width: '28px', height: '28px', background: 'linear-gradient(135deg,#7c3aed,#a855f7)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Phone size={14} color="white" />
          </div>
          <span style={{ color: 'white', fontWeight: 700, fontSize: '16px' }}>ProspectPro</span>
        </div>
        <p style={{ color: '#4b5563', fontSize: '13px', margin: 0 }}>© 2025 ProspectPro · 100% gratuit · Données stockées localement sur votre appareil</p>
      </footer>
    </div>
  )
}
