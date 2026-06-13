import { useState } from 'react'
import { Cloud, Link2, FileText, X, Loader, CheckCircle } from 'lucide-react'

function extractDocId(url) {
  const patterns = [
    /\/document\/d\/([a-zA-Z0-9_-]+)/,
    /\/spreadsheets\/d\/([a-zA-Z0-9_-]+)/,
    /\/presentation\/d\/([a-zA-Z0-9_-]+)/,
    /id=([a-zA-Z0-9_-]+)/,
  ]
  for (const p of patterns) {
    const m = url.match(p)
    if (m) return m[1]
  }
  return null
}

const inputStyle = {
  width: '100%', border: '1px solid #e5e7eb', borderRadius: '12px', padding: '10px 14px 10px 38px',
  fontSize: '14px', outline: 'none', boxSizing: 'border-box'
}

export default function GoogleDriveImport({ onImport, onClose }) {
  const [url, setUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [imported, setImported] = useState(null)

  const handleImport = async () => {
    if (!url.trim()) return
    setLoading(true)
    setError('')
    try {
      const docId = extractDocId(url)
      if (!docId) {
        setError('URL invalide. Collez un lien Google Docs, Sheets ou Drive.')
        setLoading(false)
        return
      }
      const exportUrl = `https://docs.google.com/document/d/${docId}/export?format=txt`
      const res = await fetch(exportUrl)
      if (!res.ok) {
        setError('Impossible d\'accéder. Vérifiez que le document est partagé publiquement (Partager → Tout le monde avec le lien).')
        setLoading(false)
        return
      }
      const text = await res.text()
      const lines = text.split('\n').filter(l => l.trim())
      const data = { id: docId, content: text, lines: lines.length, preview: lines.slice(0, 3).join('\n'), url, importedAt: new Date().toISOString() }
      setImported(data)
      onImport && onImport(data)
    } catch {
      setError('Erreur réseau. Vérifiez votre connexion et les permissions du document.')
    }
    setLoading(false)
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '16px' }}>
      <div style={{ background: 'white', borderRadius: '20px', width: '100%', maxWidth: '440px', boxShadow: '0 25px 60px rgba(0,0,0,0.25)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 20px 16px', borderBottom: '1px solid #f3f4f6' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '34px', height: '34px', background: '#dbeafe', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Cloud size={16} color="#2563eb" />
            </div>
            <h2 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: '#111827' }}>Importer depuis Google Drive</h2>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', padding: '4px' }}><X size={20} /></button>
        </div>

        <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ background: '#eff6ff', borderRadius: '12px', padding: '12px', fontSize: '12px', color: '#1d4ed8' }}>
            <p style={{ margin: '0 0 6px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '5px' }}><FileText size={13} /> Comment importer :</p>
            <p style={{ margin: '2px 0' }}>1. Ouvrez votre Google Docs / Drive</p>
            <p style={{ margin: '2px 0' }}>2. Cliquez sur <strong>Partager</strong> → "Tout le monde avec le lien"</p>
            <p style={{ margin: '2px 0' }}>3. Copiez et collez le lien ci-dessous</p>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '5px' }}>Lien Google Docs / Drive</label>
            <div style={{ position: 'relative' }}>
              <Link2 size={15} color="#9ca3af" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
              <input value={url} onChange={e => setUrl(e.target.value)} style={inputStyle} placeholder="https://docs.google.com/document/d/..."
                onFocus={e => e.target.style.borderColor = '#2563eb'} onBlur={e => e.target.style.borderColor = '#e5e7eb'} />
            </div>
          </div>

          {error && <div style={{ background: '#fef2f2', color: '#dc2626', padding: '10px 14px', borderRadius: '10px', fontSize: '13px' }}>{error}</div>}

          {imported && (
            <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '12px', padding: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#16a34a', marginBottom: '6px' }}>
                <CheckCircle size={15} />
                <span style={{ fontSize: '13px', fontWeight: 600 }}>Importé ({imported.lines} lignes)</span>
              </div>
              <p style={{ margin: 0, fontSize: '11px', fontFamily: 'monospace', background: '#dcfce7', padding: '8px', borderRadius: '8px', color: '#15803d', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{imported.preview}...</p>
            </div>
          )}

          <div style={{ display: 'flex', gap: '10px' }}>
            <button onClick={onClose} style={{ flex: 1, padding: '11px', border: '1px solid #e5e7eb', background: 'white', borderRadius: '12px', fontSize: '14px', fontWeight: 500, cursor: 'pointer', color: '#374151' }}>Fermer</button>
            <button onClick={handleImport} disabled={!url.trim() || loading} style={{ flex: 1, padding: '11px', background: 'linear-gradient(135deg,#3b82f6,#2563eb)', border: 'none', borderRadius: '12px', fontSize: '14px', fontWeight: 600, cursor: 'pointer', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', opacity: (!url.trim() || loading) ? 0.6 : 1 }}>
              {loading ? <><Loader size={15} style={{ animation: 'spin 1s linear infinite' }} /> Import...</> : <><Cloud size={15} /> Importer</>}
            </button>
          </div>
        </div>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
