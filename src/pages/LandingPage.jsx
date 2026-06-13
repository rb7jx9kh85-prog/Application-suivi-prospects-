import { Link } from 'react-router-dom'
import { Phone, Calendar, BarChart3, MessageCircle, Cloud, Mail, ArrowRight, CheckCircle2, Star } from 'lucide-react'

const FEATURES = [
  { icon: Phone, title: 'Suivi des appels', desc: 'Enregistrez chaque appel avec statut, notes et durée. Retrouvez tout en un coup d\'œil.', bg: '#e0f2fe', iconColor: '#0284c7' },
  { icon: Calendar, title: 'Gestion des RDV', desc: 'Planifiez vos rendez-vous et exportez-les directement vers Google Calendar.', bg: '#dbeafe', iconColor: '#2563eb' },
  { icon: MessageCircle, title: 'Assistant IA', desc: 'Créez des RDV en langage naturel. Dites simplement "RDV avec Hôtel du Lac le 20 juin".', bg: '#ede9fe', iconColor: '#7c3aed' },
  { icon: Cloud, title: 'Import Google Drive', desc: 'Importez vos notes depuis Google Docs directement dans l\'application en un clic.', bg: '#d1fae5', iconColor: '#059669' },
  { icon: Mail, title: 'Notifications email', desc: 'Recevez automatiquement un email de confirmation avec lien Google Calendar pour chaque RDV.', bg: '#ffedd5', iconColor: '#ea580c' },
  { icon: BarChart3, title: 'Résumé quotidien', desc: 'Visualisez votre performance du jour : appels effectués, RDV planifiés, et statistiques.', bg: '#fce7f3', iconColor: '#db2777' },
]

const s = {
  nav: { borderBottom: '1px solid #f3f4f6', position: 'sticky', top: 0, background: 'rgba(255,255,255,0.97)', backdropFilter: 'blur(10px)', zIndex: 50 },
  navInner: { maxWidth: '1100px', margin: '0 auto', padding: '0 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '64px' },
  logo: { display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none' },
  logoIcon: { width: '32px', height: '32px', background: 'linear-gradient(135deg,#0ea5e9,#2563eb)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  logoText: { fontWeight: 700, fontSize: '1.1rem', color: '#111827' },
  btnPrimary: { background: 'linear-gradient(135deg,#0ea5e9,#2563eb)', color: 'white', fontWeight: 700, padding: '10px 22px', borderRadius: '10px', textDecoration: 'none', fontSize: '14px' },
  btnSecondary: { color: '#6b7280', fontWeight: 500, textDecoration: 'none', fontSize: '14px', padding: '10px 16px' },
  section: { maxWidth: '1100px', margin: '0 auto', padding: '0 24px' },
}

export default function LandingPage() {
  return (
    <div style={{ minHeight: '100vh', background: 'white' }}>
      {/* Nav */}
      <header style={s.nav}>
        <div style={s.navInner}>
          <div style={s.logo}>
            <div style={s.logoIcon}><Phone size={16} color="white" /></div>
            <span style={s.logoText}>ProspectPro</span>
          </div>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <Link to="/login" style={s.btnSecondary}>Connexion</Link>
            <Link to="/login" style={s.btnPrimary}>Commencer →</Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section style={{ padding: '80px 24px 60px', background: 'linear-gradient(180deg, #f0f9ff 0%, white 100%)' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#e0f2fe', color: '#0284c7', fontSize: '13px', fontWeight: 600, padding: '6px 16px', borderRadius: '20px', marginBottom: '24px', border: '1px solid #bae6fd' }}>
            <CheckCircle2 size={14} /> 100% gratuit · Sans installation
          </div>
          <h1 style={{ margin: '0 0 20px', fontSize: 'clamp(2.2rem, 5vw, 3.5rem)', fontWeight: 800, color: '#111827', lineHeight: 1.15, letterSpacing: '-1px' }}>
            Gérez vos prospects<br />
            <span style={{ background: 'linear-gradient(135deg,#0ea5e9,#2563eb)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              comme un professionnel
            </span>
          </h1>
          <p style={{ margin: '0 0 36px', fontSize: '1.15rem', color: '#6b7280', maxWidth: '580px', margin: '0 auto 36px', lineHeight: 1.7 }}>
            Suivez vos appels, organisez vos rendez-vous, et boostez votre productivité commerciale avec un outil tout-en-un intégrant Google Calendar et Google Drive.
          </p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/login" style={{ ...s.btnPrimary, fontSize: '16px', padding: '14px 32px', borderRadius: '14px', boxShadow: '0 8px 25px rgba(14,165,233,0.3)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              Accéder à l'application <ArrowRight size={18} />
            </Link>
            <a href="#features" style={{ border: '2px solid #e5e7eb', color: '#374151', fontWeight: 600, padding: '14px 28px', borderRadius: '14px', textDecoration: 'none', fontSize: '15px' }}>
              Voir les fonctionnalités
            </a>
          </div>
        </div>

        {/* Mock UI */}
        <div style={{ maxWidth: '900px', margin: '60px auto 0' }}>
          <div style={{ background: '#1e293b', borderRadius: '16px', padding: '14px', boxShadow: '0 30px 80px rgba(30,41,59,0.3)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '12px' }}>
              {['#ef4444','#f59e0b','#22c55e'].map(c => <div key={c} style={{ width: '12px', height: '12px', borderRadius: '50%', background: c }} />)}
              <div style={{ flex: 1, background: '#334155', borderRadius: '8px', height: '24px', marginLeft: '8px', display: 'flex', alignItems: 'center', padding: '0 12px' }}>
                <span style={{ color: '#94a3b8', fontSize: '12px' }}>prospectpro.app/dashboard</span>
              </div>
            </div>
            <div style={{ background: '#f8fafc', borderRadius: '10px', padding: '20px', display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '12px' }}>
              {[
                { label: 'Appels aujourd\'hui', val: '24', note: '+12% vs hier', noteColor: '#16a34a' },
                { label: 'RDV planifiés', val: '8', note: '3 cette semaine', noteColor: '#0284c7' },
                { label: 'Taux de succès', val: '67%', note: 'Excellent', noteColor: '#2563eb' },
              ].map(({ label, val, note, noteColor }) => (
                <div key={label} style={{ background: 'white', borderRadius: '12px', padding: '16px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
                  <p style={{ margin: '0 0 4px', fontSize: '12px', color: '#9ca3af' }}>{label}</p>
                  <p style={{ margin: '0 0 4px', fontSize: '28px', fontWeight: 700, color: '#111827' }}>{val}</p>
                  <p style={{ margin: 0, fontSize: '11px', color: noteColor }}>{note}</p>
                </div>
              ))}
              <div style={{ gridColumn: '1 / -1', background: 'white', borderRadius: '12px', padding: '16px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <span style={{ fontSize: '13px', fontWeight: 600, color: '#374151' }}>Derniers appels</span>
                  <span style={{ fontSize: '11px', background: '#e0f2fe', color: '#0284c7', padding: '3px 10px', borderRadius: '10px', fontWeight: 500 }}>Aujourd'hui</span>
                </div>
                {[
                  { n: 'Hôtel du Lac', s: 'Complété', bg: '#dcfce7', c: '#16a34a', t: '10:30' },
                  { n: 'Restaurant Le Grill', s: 'Rappel', bg: '#dbeafe', c: '#2563eb', t: '11:15' },
                  { n: 'Boulangerie Martin', s: 'Injoignable', bg: '#fee2e2', c: '#dc2626', t: '14:00' },
                ].map(item => (
                  <div key={item.n} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid #f9fafb' }}>
                    <span style={{ fontSize: '13px', color: '#374151', fontWeight: 500 }}>{item.n}</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '12px', color: '#9ca3af' }}>{item.t}</span>
                      <span style={{ fontSize: '11px', background: item.bg, color: item.c, padding: '3px 10px', borderRadius: '10px', fontWeight: 500 }}>{item.s}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" style={{ padding: '80px 24px', background: '#fafafa' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '56px' }}>
            <h2 style={{ margin: '0 0 12px', fontSize: 'clamp(1.8rem,3vw,2.4rem)', fontWeight: 800, color: '#111827' }}>Tout ce dont vous avez besoin</h2>
            <p style={{ margin: 0, color: '#6b7280', fontSize: '1.05rem', maxWidth: '520px', marginLeft: 'auto', marginRight: 'auto' }}>Un outil complet pour remplacer vos notes éparpillées et votre agenda basique.</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
            {FEATURES.map(({ icon: Icon, title, desc, bg, iconColor }) => (
              <div key={title} style={{ background: 'white', borderRadius: '16px', padding: '24px', border: '1px solid #f3f4f6', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
                <div style={{ width: '48px', height: '48px', background: bg, borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
                  <Icon size={24} color={iconColor} />
                </div>
                <h3 style={{ margin: '0 0 8px', fontSize: '16px', fontWeight: 700, color: '#111827' }}>{title}</h3>
                <p style={{ margin: 0, color: '#6b7280', fontSize: '14px', lineHeight: 1.6 }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section style={{ padding: '80px 24px' }}>
        <div style={{ maxWidth: '700px', margin: '0 auto' }}>
          <h2 style={{ textAlign: 'center', margin: '0 0 48px', fontSize: 'clamp(1.6rem,3vw,2rem)', fontWeight: 800, color: '#111827' }}>Ce qu'en disent les utilisateurs</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
            {[
              { name: 'Marie L.', role: 'Commercial terrain', text: 'ProspectPro a transformé ma façon de gérer mes prospects. Plus aucun oubli de rappel !', stars: 5 },
              { name: 'Thomas B.', role: 'Responsable ventes', text: "L'intégration Google Calendar est parfaite. Je gagne 2h par semaine facilement.", stars: 5 },
            ].map(({ name, role, text, stars }) => (
              <div key={name} style={{ background: '#fafafa', borderRadius: '16px', padding: '24px', border: '1px solid #f3f4f6' }}>
                <div style={{ display: 'flex', marginBottom: '12px' }}>
                  {Array.from({ length: stars }).map((_, i) => <Star key={i} size={16} fill="#fbbf24" color="#fbbf24" />)}
                </div>
                <p style={{ margin: '0 0 16px', color: '#374151', lineHeight: 1.6, fontSize: '14px' }}>"{text}"</p>
                <p style={{ margin: 0, fontWeight: 700, fontSize: '13px', color: '#111827' }}>{name}</p>
                <p style={{ margin: 0, color: '#9ca3af', fontSize: '12px' }}>{role}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: '80px 24px', background: 'linear-gradient(135deg,#0ea5e9,#2563eb)' }}>
        <div style={{ maxWidth: '600px', margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ margin: '0 0 12px', fontSize: 'clamp(1.6rem,3vw,2.2rem)', fontWeight: 800, color: 'white' }}>Prêt à booster vos ventes ?</h2>
          <p style={{ margin: '0 0 32px', color: 'rgba(255,255,255,0.8)', fontSize: '1.05rem' }}>Commencez maintenant — gratuit et sans installation.</p>
          <Link to="/login" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'white', color: '#0284c7', fontWeight: 700, padding: '14px 32px', borderRadius: '14px', textDecoration: 'none', fontSize: '15px', boxShadow: '0 8px 25px rgba(0,0,0,0.15)' }}>
            Accéder à ProspectPro <ArrowRight size={18} />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ padding: '24px', borderTop: '1px solid #f3f4f6' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '24px', height: '24px', background: 'linear-gradient(135deg,#0ea5e9,#2563eb)', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Phone size={12} color="white" />
            </div>
            <span style={{ fontWeight: 700, color: '#374151', fontSize: '14px' }}>ProspectPro</span>
          </div>
          <p style={{ margin: 0, color: '#9ca3af', fontSize: '13px' }}>© 2025 ProspectPro. Tous droits réservés.</p>
        </div>
      </footer>
    </div>
  )
}
