import { Link } from 'react-router-dom'
import {
  ArrowRight, Zap, Phone, Calendar, BookOpen, MessageSquare,
  CheckCircle, Star, Shield, Clock, BarChart3, Mic,
  ChevronDown, Gift, Sparkles, TrendingUp, Users
} from 'lucide-react'
import ShaderBackground from '../components/ShaderBackground'

const FEATURES = [
  { icon: Sparkles, title: 'Scripts générés par IA', desc: 'Entrez le nom du prospect et son secteur. Claude IA génère un script d\'appel personnalisé et percutant en quelques secondes.', highlight: 'Propulsé par Claude' },
  { icon: Mic, title: 'Assistant vocal en direct', desc: 'Microphone intégré : parlez pendant vos appels. L\'assistant propose des réponses aux objections en temps réel, sans décrocher les yeux.', highlight: 'Mains libres' },
  { icon: Calendar, title: 'Google Calendar intégré', desc: 'Dites "RDV avec [nom] le 20 juin à 14h" et le rendez-vous est créé automatiquement avec email de confirmation.', highlight: 'Auto-planification' },
  { icon: Phone, title: 'Session Cold Call', desc: 'Liste de prospects, statuts (À appeler, Appelé, Refus, RDV ✅) et notes. Votre centre de commande pour chaque session.', highlight: 'Suivi complet' },
  { icon: BarChart3, title: 'Dashboard & Statistiques', desc: 'Appels du jour, taux de conversion, résumé quotidien. Pilotez votre activité commerciale en un coup d\'œil.', highlight: 'Vue temps réel' },
  { icon: BookOpen, title: 'Bibliothèque de scripts', desc: 'Cold Call, Warm Call, Hot Call, objections courantes — des scripts prêts à l\'emploi pour chaque situation.', highlight: 'Prêt à l\'emploi' },
]

const STEPS = [
  { num: '01', title: 'Créez votre compte', desc: 'Inscription gratuite en 30 secondes. Aucune carte bancaire, aucun engagement.' },
  { num: '02', title: 'Ajoutez vos prospects', desc: 'Nom, secteur, infos clés. L\'IA génère un script personnalisé immédiatement.' },
  { num: '03', title: 'Appelez avec confiance', desc: 'Script IA + assistant vocal en direct = plus de rendez-vous, moins de stress.' },
]

const TESTIMONIALS = [
  { name: 'Marc D.', role: 'Commercial B2B', text: 'J\'ai multiplié mes RDV par 3 en 2 semaines. Les scripts IA sont bluffants de précision.', stars: 5 },
  { name: 'Sophie L.', role: 'Responsable ventes', text: 'L\'assistant vocal pendant les appels change tout. Je ne cherche plus mes mots face aux objections.', stars: 5 },
  { name: 'Thomas B.', role: 'Auto-entrepreneur', text: 'Gratuit et plus puissant que des outils à 100€/mois. L\'intégration Google Calendar est parfaite.', stars: 5 },
]

const INCLUDED = [
  'Scripts IA illimités', 'Assistant vocal intégré', 'Suivi des prospects',
  'Gestion des RDV', 'Export Google Calendar', 'Email de confirmation auto',
  'Tableau de bord', 'Bibliothèque de scripts',
]

export default function LandingPage() {
  return (
    <div style={{ background: '#000', minHeight: '100vh', overflowX: 'hidden', fontFamily: 'system-ui, -apple-system, sans-serif' }}>

      {/* NAV */}
      <nav style={{ position: 'sticky', top: 0, zIndex: 100, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(139,92,246,0.2)', padding: '0 24px', height: '64px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '36px', height: '36px', background: 'linear-gradient(135deg,#7c3aed,#a855f7)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Phone size={18} color="white" />
          </div>
          <span style={{ color: 'white', fontWeight: 800, fontSize: '18px' }}>ProspectPro</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Link to="/login" style={{ color: '#9ca3af', textDecoration: 'none', fontSize: '14px', fontWeight: 500, padding: '8px 12px' }}>
            Connexion
          </Link>
          <Link to="/register" style={{ background: 'linear-gradient(135deg,#7c3aed,#a855f7)', color: 'white', textDecoration: 'none', fontSize: '14px', fontWeight: 700, padding: '10px 20px', borderRadius: '10px' }}>
            Commencer — Gratuit →
          </Link>
        </div>
      </nav>

      {/* HERO */}
      <section style={{ position: 'relative', minHeight: '90vh', display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '80px 24px', overflow: 'hidden' }}>
        <ShaderBackground />

        <div style={{ position: 'relative', zIndex: 1, maxWidth: '860px', margin: '0 auto' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(139,92,246,0.15)', border: '1px solid rgba(139,92,246,0.4)', borderRadius: '30px', padding: '8px 20px', marginBottom: '28px' }}>
            <Gift size={14} color="#a78bfa" />
            <span style={{ color: '#a78bfa', fontSize: '13px', fontWeight: 600 }}>100% Gratuit · Aucune carte bancaire</span>
          </div>

          <h1 style={{ color: 'white', fontSize: 'clamp(2.5rem, 7vw, 5rem)', fontWeight: 900, lineHeight: 1.1, margin: '0 0 24px', letterSpacing: '-2px' }}>
            Prospectez{' '}
            <span style={{ background: 'linear-gradient(135deg,#a855f7,#ec4899)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              2× plus vite
            </span>
            <br />grâce à l'IA
          </h1>

          <p style={{ color: '#d1d5db', fontSize: '1.2rem', lineHeight: 1.7, maxWidth: '600px', margin: '0 auto 40px' }}>
            Scripts personnalisés, assistant vocal en direct, suivi des appels et rendez-vous automatiques.
            Tout ce qu'il faut pour décrocher plus de RDV —{' '}
            <strong style={{ color: 'white' }}>gratuitement</strong>.
          </p>

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/register" style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', background: 'linear-gradient(135deg,#7c3aed,#a855f7)', color: 'white', textDecoration: 'none', fontWeight: 800, fontSize: '17px', padding: '16px 36px', borderRadius: '14px', boxShadow: '0 0 40px rgba(139,92,246,0.4)' }}>
              <Zap size={20} />
              Créer mon compte gratuit
              <ArrowRight size={18} />
            </Link>
            <Link to="/login" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.15)', color: 'white', textDecoration: 'none', fontWeight: 600, fontSize: '16px', padding: '16px 32px', borderRadius: '14px' }}>
              Déjà un compte → Connexion
            </Link>
          </div>

          <div style={{ marginTop: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
            <div style={{ display: 'flex', gap: '2px' }}>
              {[1,2,3,4,5].map(i => <Star key={i} size={14} color="#facc15" fill="#facc15" />)}
            </div>
            <span style={{ color: '#9ca3af', fontSize: '13px' }}>
              Utilisé par des commerciaux terrain · <strong style={{ color: 'white' }}>Gratuit pour toujours</strong>
            </span>
          </div>
        </div>
      </section>

      {/* BADGES */}
      <section style={{ borderTop: '1px solid rgba(139,92,246,0.2)', borderBottom: '1px solid rgba(139,92,246,0.2)', background: 'rgba(139,92,246,0.04)', padding: '28px 24px' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto', display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: '12px' }}>
          {[
            { icon: Gift, label: '100% Gratuit', sub: 'Pour toujours' },
            { icon: Shield, label: 'Sans CB', sub: 'Aucun engagement' },
            { icon: Clock, label: 'En ligne 24/7', sub: 'Toujours disponible' },
            { icon: Sparkles, label: 'IA intégrée', sub: 'Propulsé par Claude' },
            { icon: Users, label: 'Multi-profil', sub: 'Solo ou équipe' },
          ].map(({ icon: Icon, label, sub }) => (
            <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', padding: '12px 20px' }}>
              <Icon size={18} color="#a855f7" />
              <div>
                <p style={{ margin: 0, color: 'white', fontWeight: 700, fontSize: '13px' }}>{label}</p>
                <p style={{ margin: 0, color: '#6b7280', fontSize: '11px' }}>{sub}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FEATURES */}
      <section style={{ padding: '100px 24px' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '64px' }}>
            <p style={{ color: '#a855f7', fontWeight: 600, fontSize: '13px', textTransform: 'uppercase', letterSpacing: '3px', margin: '0 0 12px' }}>Fonctionnalités</p>
            <h2 style={{ color: 'white', fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 900, margin: '0 0 12px' }}>
              Tout ce qu'il vous faut
            </h2>
            <p style={{ color: '#9ca3af', fontSize: '18px', margin: 0 }}>Sans payer un centime.</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
            {FEATURES.map(({ icon: Icon, title, desc, highlight }) => (
              <div key={title} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '20px', padding: '28px', position: 'relative', transition: 'border-color 0.2s' }}>
                <div style={{ position: 'absolute', top: '16px', right: '16px', background: 'rgba(168,85,247,0.12)', border: '1px solid rgba(168,85,247,0.3)', borderRadius: '20px', padding: '4px 10px' }}>
                  <span style={{ color: '#c084fc', fontSize: '11px', fontWeight: 600 }}>{highlight}</span>
                </div>
                <div style={{ width: '48px', height: '48px', background: 'rgba(139,92,246,0.2)', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '18px' }}>
                  <Icon size={24} color="#a855f7" />
                </div>
                <h3 style={{ color: 'white', fontWeight: 700, fontSize: '17px', margin: '0 0 10px' }}>{title}</h3>
                <p style={{ color: '#9ca3af', fontSize: '14px', lineHeight: 1.6, margin: 0 }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section style={{ padding: '80px 24px', background: 'rgba(139,92,246,0.05)', borderTop: '1px solid rgba(139,92,246,0.15)', borderBottom: '1px solid rgba(139,92,246,0.15)' }}>
        <div style={{ maxWidth: '760px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '56px' }}>
            <p style={{ color: '#a855f7', fontWeight: 600, fontSize: '13px', textTransform: 'uppercase', letterSpacing: '3px', margin: '0 0 12px' }}>Simple comme bonjour</p>
            <h2 style={{ color: 'white', fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 900, margin: 0 }}>
              Démarrez en <span style={{ color: '#a855f7' }}>3 étapes</span>
            </h2>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {STEPS.map(({ num, title, desc }) => (
              <div key={num} style={{ display: 'flex', gap: '20px', alignItems: 'flex-start', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '24px' }}>
                <div style={{ fontSize: '40px', fontWeight: 900, background: 'linear-gradient(135deg,#7c3aed,#ec4899)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', flexShrink: 0, lineHeight: 1, minWidth: '56px' }}>
                  {num}
                </div>
                <div style={{ flex: 1 }}>
                  <h3 style={{ color: 'white', fontWeight: 700, fontSize: '18px', margin: '0 0 6px' }}>{title}</h3>
                  <p style={{ color: '#9ca3af', fontSize: '14px', lineHeight: 1.6, margin: 0 }}>{desc}</p>
                </div>
                <CheckCircle size={22} color="#a855f7" style={{ flexShrink: 0, marginTop: '2px' }} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* IA DEMO */}
      <section style={{ padding: '100px 24px' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '48px', alignItems: 'center' }}>
          <div>
            <p style={{ color: '#ec4899', fontWeight: 600, fontSize: '13px', textTransform: 'uppercase', letterSpacing: '3px', margin: '0 0 16px' }}>Propulsé par Claude IA</p>
            <h2 style={{ color: 'white', fontSize: 'clamp(1.8rem, 3.5vw, 2.6rem)', fontWeight: 900, margin: '0 0 28px', lineHeight: 1.2 }}>
              L'IA fait le travail,
              <span style={{ display: 'block', color: '#ec4899' }}>vous récoltez les RDV</span>
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {[
                { icon: Sparkles, text: 'Scripts adaptés au secteur et profil de votre prospect' },
                { icon: MessageSquare, text: 'Réponses aux objections en temps réel pendant l\'appel' },
                { icon: TrendingUp, text: 'Analyse de vos performances et suggestions d\'amélioration' },
                { icon: Mic, text: 'Commandes vocales pour noter sans décrocher les yeux' },
              ].map(({ icon: Icon, text }) => (
                <div key={text} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                  <div style={{ width: '32px', height: '32px', background: 'rgba(236,72,153,0.15)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: '2px' }}>
                    <Icon size={15} color="#ec4899" />
                  </div>
                  <p style={{ color: '#d1d5db', margin: 0, fontSize: '15px', lineHeight: 1.5 }}>{text}</p>
                </div>
              ))}
            </div>
          </div>

          <div style={{ background: 'rgba(139,92,246,0.08)', border: '1px solid rgba(139,92,246,0.3)', borderRadius: '20px', padding: '28px', fontFamily: 'monospace' }}>
            <div style={{ display: 'flex', gap: '6px', marginBottom: '20px' }}>
              {['#ef4444','#f59e0b','#22c55e'].map(c => <div key={c} style={{ width: '12px', height: '12px', borderRadius: '50%', background: c }} />)}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13px' }}>
              <div><span style={{ color: '#a855f7' }}>Prospect :</span><span style={{ color: '#e5e7eb' }}> Boulangerie Martin</span></div>
              <div><span style={{ color: '#a855f7' }}>Secteur :</span><span style={{ color: '#e5e7eb' }}> Restauration / Artisanat</span></div>
              <div><span style={{ color: '#a855f7' }}>Info clé :</span><span style={{ color: '#e5e7eb' }}> Veut développer la livraison</span></div>
              <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '16px', marginTop: '6px' }}>
                <p style={{ color: '#4ade80', fontWeight: 700, margin: '0 0 10px', fontSize: '12px' }}>✨ Script IA généré :</p>
                <p style={{ color: 'white', lineHeight: 1.7, margin: 0, fontSize: '13px' }}>
                  "Bonjour M. Martin, j'ai vu vos produits artisanaux en ligne — vraiment impressionnant. Je sais que la livraison est un enjeu dans la restauration en ce moment. Vous avez 5 minutes ?"
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section style={{ padding: '80px 24px', background: 'rgba(139,92,246,0.04)', borderTop: '1px solid rgba(139,92,246,0.15)' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          <h2 style={{ color: 'white', textAlign: 'center', fontSize: 'clamp(1.8rem, 3.5vw, 2.4rem)', fontWeight: 900, margin: '0 0 48px' }}>
            Ce qu'en disent les utilisateurs
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
            {TESTIMONIALS.map(({ name, role, text, stars }) => (
              <div key={name} style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', padding: '24px' }}>
                <div style={{ display: 'flex', gap: '3px', marginBottom: '14px' }}>
                  {Array.from({ length: stars }).map((_, i) => <Star key={i} size={14} color="#facc15" fill="#facc15" />)}
                </div>
                <p style={{ color: '#d1d5db', fontSize: '14px', lineHeight: 1.6, margin: '0 0 16px' }}>"{text}"</p>
                <p style={{ color: 'white', fontWeight: 700, fontSize: '13px', margin: '0 0 2px' }}>{name}</p>
                <p style={{ color: '#6b7280', fontSize: '12px', margin: 0 }}>{role}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section style={{ padding: '100px 24px' }}>
        <div style={{ maxWidth: '560px', margin: '0 auto', textAlign: 'center' }}>
          <div style={{ background: 'rgba(139,92,246,0.08)', border: '1px solid rgba(139,92,246,0.4)', borderRadius: '24px', padding: '48px 36px' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(74,222,128,0.1)', border: '1px solid rgba(74,222,128,0.3)', borderRadius: '30px', padding: '8px 18px', marginBottom: '24px' }}>
              <Gift size={14} color="#4ade80" />
              <span style={{ color: '#4ade80', fontSize: '13px', fontWeight: 700 }}>Prix unique et définitif</span>
            </div>

            <div style={{ marginBottom: '24px' }}>
              <span style={{ color: 'white', fontSize: '96px', fontWeight: 900, lineHeight: 1 }}>0€</span>
              <p style={{ color: '#9ca3af', fontSize: '16px', margin: '8px 0 0' }}>Pour toujours · Aucune limitation cachée</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '32px', textAlign: 'left' }}>
              {INCLUDED.map(item => (
                <div key={item} style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <CheckCircle size={15} color="#4ade80" />
                  <span style={{ color: '#d1d5db', fontSize: '13px' }}>{item}</span>
                </div>
              ))}
            </div>

            <Link to="/register" style={{ display: 'block', background: 'linear-gradient(135deg,#7c3aed,#a855f7)', color: 'white', textDecoration: 'none', fontWeight: 800, fontSize: '18px', padding: '18px', borderRadius: '14px', boxShadow: '0 0 40px rgba(139,92,246,0.4)' }}>
              Démarrer gratuitement maintenant →
            </Link>
            <p style={{ color: '#6b7280', fontSize: '12px', margin: '12px 0 0' }}>Aucune carte bancaire · Compte créé en 30 secondes</p>
          </div>
        </div>
      </section>

      {/* CTA FINAL */}
      <section style={{ position: 'relative', padding: '100px 24px', textAlign: 'center', overflow: 'hidden', background: 'rgba(139,92,246,0.06)', borderTop: '1px solid rgba(139,92,246,0.2)' }}>
        <div style={{ position: 'relative', zIndex: 1, maxWidth: '640px', margin: '0 auto' }}>
          <h2 style={{ color: 'white', fontSize: 'clamp(2rem, 4.5vw, 3.2rem)', fontWeight: 900, lineHeight: 1.15, margin: '0 0 20px' }}>
            Prêt à décrocher{' '}
            <span style={{ background: 'linear-gradient(135deg,#a855f7,#ec4899)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              plus de rendez-vous ?
            </span>
          </h2>
          <p style={{ color: '#9ca3af', fontSize: '17px', margin: '0 0 36px', lineHeight: 1.6 }}>
            Rejoignez les commerciaux qui utilisent ProspectPro pour multiplier leurs conversions. Gratuit. Maintenant.
          </p>
          <Link to="/register" style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', background: 'linear-gradient(135deg,#7c3aed,#a855f7)', color: 'white', textDecoration: 'none', fontWeight: 800, fontSize: '18px', padding: '18px 44px', borderRadius: '14px', boxShadow: '0 0 50px rgba(139,92,246,0.5)' }}>
            <Zap size={22} />
            Créer mon compte — C'est gratuit
            <ArrowRight size={20} />
          </Link>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ padding: '32px 24px', borderTop: '1px solid rgba(255,255,255,0.06)', textAlign: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '8px' }}>
          <div style={{ width: '28px', height: '28px', background: 'linear-gradient(135deg,#7c3aed,#a855f7)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Phone size={14} color="white" />
          </div>
          <span style={{ color: 'white', fontWeight: 700, fontSize: '16px' }}>ProspectPro</span>
        </div>
        <p style={{ color: '#6b7280', fontSize: '13px', margin: 0 }}>© 2025 ProspectPro · 100% gratuit · Données stockées localement sur votre appareil</p>
      </footer>
    </div>
  )
}
