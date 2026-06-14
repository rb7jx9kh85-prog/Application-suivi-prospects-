import React, { useState } from 'react'
import Nav from '../components/Nav'
import Chatbot from '../components/Chatbot'
import { askAI } from '../lib/ai'
import { toast } from '../components/Toast'

const PRESETS = {
  'Cold Call B2B': `**OUVERTURE**\nBonjour [Prénom], c'est [Votre Nom] de [Votre Société].\nJe vous appelle car nous accompagnons des entreprises de votre secteur à [bénéfice clé].\nJ'aurais 2 questions rapides — 90 secondes top chrono, c'est possible ?\n\n**PITCH**\nActuellement, comment gérez-vous [problème principal] ?\nNos clients comme [référence] ont réussi à [résultat concret] en [délai].\nCe qui nous différencie, c'est [avantage unique].\n\n**OBJECTIONS & CLOSING**\n"Pas le temps" → "C'est justement pour ça que j'appelle — 15 min suffisent. Mardi ou jeudi ?"\n"Envoyez un email" → "Bien sûr, pour cibler ma réponse : [question clé]"\n"On est équipés" → "Super ! Est-ce que ça vous donne [résultat spécifique] ?"`,
  'Relance chaude': `**OUVERTURE**\nBonjour [Prénom], c'est [Votre Nom] de [Votre Société].\nJe vous recontacte suite à notre dernier échange — avez-vous pu réfléchir à notre proposition ?\n\n**PITCH**\nDepuis notre dernier contact, un client similaire a [résultat concret].\nJe voulais vous partager ça car c'est exactement le cas de figure dont on avait parlé.\n\n**OBJECTIONS & CLOSING**\n"Toujours en réflexion" → "Qu'est-ce qui freine la décision ? Je peux peut-être vous apporter un éclairage."\nOn pourrait faire un point de 20 min cette semaine — mardi 10h ou jeudi 14h ?`,
  'Objections': `**"Je n'ai pas le temps"**\n→ "Je comprends, c'est pour ça que je suis direct : j'ai juste 2 questions. 90 secondes max ?"\n\n**"Envoyez-moi un email"**\n→ "Avec plaisir. Pour cibler ma réponse, j'ai juste besoin de savoir : [question clé]. 10 secondes ?"\n\n**"On a déjà un prestataire"**\n→ "Très bien ! Est-ce qu'il vous garantit [résultat spécifique] ? C'est souvent là qu'on fait la différence."\n\n**"C'est trop cher"**\n→ "Je comprends. Quel budget avez-vous en tête ? Et si on calcule ensemble le ROI..."\n\n**"Rappelez-moi dans 3 mois"**\n→ "Bien sûr. Pour que mon rappel soit utile, qu'est-ce qui aura changé d'ici là ?"`,
  'Closing RDV': `**OUVERTURE**\nBonjour [Prénom], vous avez posé d'excellentes questions — je pense vraiment qu'on peut vous aider sur [point précis].\n\n**PITCH**\nLa prochaine étape logique serait un appel de 20 minutes pour vous montrer concrètement comment [résultat].\nJe l'ai fait récemment avec [référence secteur] — ils ont [résultat rapide].\n\n**CLOSING**\nJe suis disponible mardi ou jeudi matin — qu'est-ce qui vous convient ?\n[Si hésitation] : Ce n'est pas un engagement. Juste 20 min pour voir si c'est pertinent.`,
}

export default function Scripts() {
  const [form, setForm] = useState({ name: '', company: '', sector: '', callType: 'Prospection (1er contact)', info1: '', info2: '', info3: '' })
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const upd = (k, v) => setForm(f => ({ ...f, [k]: v }))

  async function generate() {
    if (!form.name || !form.company) { toast('Nom et entreprise requis.', 'err'); return }
    setLoading(true); setResult(null)
    const infos = [form.info1, form.info2, form.info3].filter(Boolean)
    try {
      const res = await askAI(
        `Tu es un expert en vente B2B et prospection commerciale. Tu génères des scripts d'appel professionnels et naturels en français. Structure toujours en 3 parties: **OUVERTURE** (accroche 3 lignes), **PITCH** (valeur + questions 4-5 lignes), **OBJECTIONS & CLOSING** (réponses + demande RDV 4-5 lignes).`,
        `Génère un script de type "${form.callType}" pour:\n- Prospect: ${form.name}, ${form.company}${form.sector ? `\n- Secteur: ${form.sector}` : ''}${infos.length ? `\n- Infos clés: ${infos.join(', ')}` : ''}.\nLe script doit être naturel, personnalisé et finir par une proposition de RDV.`
      )
      setResult({ title: `✨ Script pour ${form.name} — ${form.company}`, text: res })
    } catch (e) {
      setResult({ error: e.message })
    }
    setLoading(false)
  }

  function copy() {
    if (result?.text) navigator.clipboard.writeText(result.text).then(() => toast('Copié !'))
  }

  return (
    <>
      <Nav />
      <div className="page">
        <div className="ph">
          <div><h1 className="pt">Générateur de Scripts IA</h1><p className="ps">Script personnalisé en quelques secondes</p></div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.1fr', gap: 24 }} className="scripts-grid">
          <div className="card">
            <p style={{ fontSize: 15, fontWeight: 700, marginBottom: 20, letterSpacing: '-0.3px' }}>✨ Paramètres</p>
            <div className="fg"><label className="fl">Nom du prospect *</label><input className="fi" placeholder="Ex: Jean Martin" value={form.name} onChange={e => upd('name', e.target.value)} /></div>
            <div className="fg"><label className="fl">Entreprise *</label><input className="fi" placeholder="Ex: Restaurant Le Gourmet" value={form.company} onChange={e => upd('company', e.target.value)} /></div>
            <div className="fg"><label className="fl">Secteur d'activité</label><input className="fi" placeholder="Ex: Restauration, IT..." value={form.sector} onChange={e => upd('sector', e.target.value)} /></div>
            <div className="fg"><label className="fl">Type d'appel</label>
              <select className="fi" value={form.callType} onChange={e => upd('callType', e.target.value)}>
                {['Prospection (1er contact)', 'Relance', 'Closing', 'Service client'].map(o => <option key={o}>{o}</option>)}
              </select>
            </div>
            <div className="fg"><label className="fl">Info clé 1 (optionnel)</label><input className="fi" placeholder="Ex: A récemment ouvert un 2e site" value={form.info1} onChange={e => upd('info1', e.target.value)} /></div>
            <div className="fg"><label className="fl">Info clé 2 (optionnel)</label><input className="fi" placeholder="Ex: Concurrent de X" value={form.info2} onChange={e => upd('info2', e.target.value)} /></div>
            <div className="fg"><label className="fl">Info clé 3 (optionnel)</label><input className="fi" placeholder="Ex: Cherche à digitaliser" value={form.info3} onChange={e => upd('info3', e.target.value)} /></div>
            <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }} onClick={generate} disabled={loading}>
              {loading ? '⏳ Génération...' : '✨ Générer le script IA'}
            </button>
          </div>

          <div>
            {!result && !loading && (
              <div style={{ minHeight: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', color: 'var(--text3)', border: '2px dashed rgba(139,92,246,0.2)', borderRadius: 16, padding: 40 }}>
                <div>
                  <div style={{ fontSize: 48, marginBottom: 16, opacity: 0.4 }}>✨</div>
                  <p style={{ fontSize: 15, fontWeight: 600, marginBottom: 8, color: 'var(--text2)' }}>Votre script apparaîtra ici</p>
                  <p style={{ fontSize: 13 }}>Remplissez le formulaire et cliquez sur Générer</p>
                </div>
              </div>
            )}
            {loading && (
              <div style={{ minHeight: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', color: 'var(--text2)', border: '2px dashed rgba(139,92,246,0.2)', borderRadius: 16, padding: 40 }}>
                <div>
                  <div style={{ fontSize: 32, marginBottom: 12 }}>⏳</div>
                  Génération du script en cours...
                </div>
              </div>
            )}
            {result?.error && (
              <div className="card" style={{ borderColor: 'rgba(239,68,68,.3)', color: '#f87171' }}>❌ {result.error}</div>
            )}
            {result?.text && (
              <div className="script-out">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                  <span style={{ fontWeight: 700, color: 'var(--pi)', fontSize: 13 }}>{result.title}</span>
                  <button className="btn btn-ghost btn-sm" onClick={copy}>📋 Copier</button>
                </div>
                <pre style={{ whiteSpace: 'pre-wrap', fontSize: 13, lineHeight: 1.85, color: '#e2d9f3', fontFamily: 'inherit' }}>{result.text}</pre>
              </div>
            )}

            <div style={{ marginTop: 20 }}>
              <p style={{ fontSize: 13, fontWeight: 700, marginBottom: 14 }}>📚 Scripts prêts à l'emploi</p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                {[{ t: 'Cold Call B2B', d: '1er contact', ic: '❄️' }, { t: 'Relance chaude', d: 'Prospect connu', ic: '🔥' }, { t: 'Objections', d: 'Réponses clés', ic: '🛡️' }, { t: 'Closing RDV', d: 'Décrocher le RDV', ic: '🎯' }].map(s => (
                  <div key={s.t} className="card card-hov" style={{ cursor: 'pointer', padding: 15 }} onClick={() => setResult({ title: `📝 ${s.t}`, text: PRESETS[s.t] })}>
                    <div style={{ fontSize: 22, marginBottom: 8 }}>{s.ic}</div>
                    <p style={{ fontWeight: 700, fontSize: 13, margin: '0 0 3px' }}>{s.t}</p>
                    <p style={{ fontSize: 11, color: 'var(--text2)', margin: 0 }}>{s.d}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      <Chatbot />
      <style>{`@media(max-width:768px){.scripts-grid{grid-template-columns:1fr !important}}`}</style>
    </>
  )
}
