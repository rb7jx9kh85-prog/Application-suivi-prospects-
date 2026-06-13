import { useState } from 'react'
import { X, Star, Phone, Globe, Clock, MapPin, Loader, Building2, ExternalLink, Key } from 'lucide-react'
import { searchGooglePlace, hasApifyToken, setApifyToken } from '../utils/apify'

export default function PlacePreview({ establishment, domain, onClose }) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [searched, setSearched] = useState(false)
  const [tempToken, setTempToken] = useState('')

  const search = async () => {
    if (!hasApifyToken()) {
      if (!tempToken.trim()) { setError('Entrez votre token Apify ci-dessus.'); return }
      setApifyToken(tempToken.trim())
    }
    setLoading(true)
    setError('')
    setSearched(true)
    const query = `${establishment} ${domain || ''}`.trim()
    try {
      const result = await searchGooglePlace(query)
      if (result) setData(result)
      else setError("Aucun résultat trouvé. Essayez d'être plus précis (ex: 'Hôtel Ibis Genève').")
    } catch (e) {
      setError("Erreur lors de la recherche. Vérifiez votre token Apify.")
    }
    setLoading(false)
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200, padding: '16px' }}>
      <div style={{ background: 'white', borderRadius: '20px', width: '100%', maxWidth: '500px', maxHeight: '85vh', overflowY: 'auto', boxShadow: '0 25px 60px rgba(0,0,0,0.25)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '18px 20px', borderBottom: '1px solid #f3f4f6', position: 'sticky', top: 0, background: 'white', borderRadius: '20px 20px 0 0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '34px', height: '34px', background: '#eff6ff', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Building2 size={18} color="#2563eb" />
            </div>
            <div>
              <h2 style={{ margin: 0, fontSize: '15px', fontWeight: 700, color: '#111827' }}>{establishment}</h2>
              {domain && <p style={{ margin: 0, fontSize: '12px', color: '#9ca3af' }}>{domain}</p>}
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', padding: '4px' }}><X size={20} /></button>
        </div>

        <div style={{ padding: '20px' }}>
          {!searched && (
            <div style={{ textAlign: 'center', padding: '10px 0' }}>
              <Building2 size={36} color="#e5e7eb" style={{ display: 'block', margin: '0 auto 12px' }} />
              <p style={{ margin: '0 0 14px', color: '#6b7280', fontSize: '14px' }}>Aperçu Google Places pour <strong>{establishment}</strong></p>
              {!hasApifyToken() && (
                <div style={{ marginBottom: '14px', textAlign: 'left' }}>
                  <p style={{ margin: '0 0 5px', fontSize: '12px', color: '#9ca3af', fontWeight: 600 }}>TOKEN APIFY (une seule fois)</p>
                  <input value={tempToken} onChange={e => setTempToken(e.target.value)} placeholder="apify_api_..."
                    style={{ width: '100%', border: '1px solid #e5e7eb', borderRadius: '10px', padding: '8px 12px', fontSize: '12px', outline: 'none', boxSizing: 'border-box', fontFamily: 'monospace' }} />
                  <p style={{ margin: '4px 0 0', fontSize: '11px', color: '#9ca3af' }}>Trouvez votre token sur <a href="https://console.apify.com/settings/integrations" target="_blank" rel="noopener noreferrer" style={{color:'#0284c7'}}>console.apify.com</a></p>
                </div>
              )}
              <button onClick={search} style={{ padding: '10px 24px', background: 'linear-gradient(135deg,#0ea5e9,#2563eb)', border: 'none', borderRadius: '12px', fontSize: '14px', fontWeight: 600, color: 'white', cursor: 'pointer' }}>
                🔍 Rechercher sur Google Places
              </button>
            </div>
          )}

          {loading && (
            <div style={{ textAlign: 'center', padding: '40px 0' }}>
              <Loader size={32} color="#0ea5e9" style={{ display: 'block', margin: '0 auto 12px', animation: 'spin 1s linear infinite' }} />
              <p style={{ margin: 0, color: '#9ca3af', fontSize: '13px' }}>Recherche sur Google Places...</p>
              <p style={{ margin: '4px 0 0', color: '#d1d5db', fontSize: '11px' }}>Cela peut prendre 10-20 secondes</p>
            </div>
          )}

          {error && (
            <div style={{ background: '#fef2f2', color: '#dc2626', padding: '12px', borderRadius: '12px', fontSize: '13px', textAlign: 'center' }}>
              {error}
              <br />
              <button onClick={search} style={{ marginTop: '8px', padding: '6px 14px', background: '#fee2e2', border: '1px solid #fecaca', borderRadius: '8px', fontSize: '12px', cursor: 'pointer', color: '#dc2626' }}>Réessayer</button>
            </div>
          )}

          {data && !loading && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {data.imageUrl && (
                <img src={data.imageUrl} alt={data.name} style={{ width: '100%', height: '180px', objectFit: 'cover', borderRadius: '12px' }} onError={e => e.target.style.display = 'none'} />
              )}

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <h3 style={{ margin: '0 0 4px', fontSize: '17px', fontWeight: 700, color: '#111827' }}>{data.name}</h3>
                  {data.category && <span style={{ fontSize: '12px', background: '#eff6ff', color: '#2563eb', padding: '2px 8px', borderRadius: '8px', fontWeight: 500 }}>{data.category}</span>}
                </div>
                {data.rating && (
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', justifyContent: 'flex-end' }}>
                      <Star size={16} fill="#fbbf24" color="#fbbf24" />
                      <span style={{ fontWeight: 700, color: '#111827', fontSize: '15px' }}>{data.rating}</span>
                    </div>
                    <p style={{ margin: 0, fontSize: '11px', color: '#9ca3af' }}>{data.reviewCount} avis</p>
                  </div>
                )}
              </div>

              {data.address && (
                <div style={{ display: 'flex', gap: '8px', color: '#374151', fontSize: '13px' }}>
                  <MapPin size={15} color="#f43f5e" style={{ flexShrink: 0, marginTop: '2px' }} />
                  <span>{data.address}</span>
                </div>
              )}

              {data.phone && (
                <div style={{ display: 'flex', gap: '8px', color: '#374151', fontSize: '13px' }}>
                  <Phone size={15} color="#0ea5e9" />
                  <a href={`tel:${data.phone}`} style={{ color: '#0284c7', textDecoration: 'none', fontWeight: 500 }}>{data.phone}</a>
                </div>
              )}

              {data.website && (
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center', fontSize: '13px' }}>
                  <Globe size={15} color="#22c55e" />
                  <a href={data.website} target="_blank" rel="noopener noreferrer" style={{ color: '#16a34a', textDecoration: 'none', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '320px' }}>{data.website}</a>
                </div>
              )}

              {data.hours?.length > 0 && (
                <div>
                  <div style={{ display: 'flex', gap: '6px', alignItems: 'center', marginBottom: '6px' }}>
                    <Clock size={14} color="#9ca3af" />
                    <span style={{ fontSize: '12px', fontWeight: 600, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Horaires</span>
                  </div>
                  <div style={{ fontSize: '12px', color: '#374151', lineHeight: 1.8 }}>
                    {data.hours.map((h, i) => (
                      <div key={i}>{h.day} : <strong>{h.hours}</strong></div>
                    ))}
                  </div>
                </div>
              )}

              {data.description && (
                <div style={{ background: '#f9fafb', borderRadius: '12px', padding: '12px', fontSize: '13px', color: '#374151', lineHeight: 1.6, fontStyle: 'italic' }}>
                  {data.description.slice(0, 300)}{data.description.length > 300 ? '...' : ''}
                </div>
              )}

              {data.googleUrl && (
                <a href={data.googleUrl} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', padding: '10px', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '12px', fontSize: '13px', color: '#16a34a', fontWeight: 600, textDecoration: 'none' }}>
                  <ExternalLink size={14} /> Voir sur Google Maps
                </a>
              )}

              <div style={{ background: '#eff6ff', borderRadius: '12px', padding: '12px' }}>
                <p style={{ margin: '0 0 4px', fontSize: '12px', fontWeight: 600, color: '#1d4ed8' }}>💡 Conseil pour l'appel</p>
                <p style={{ margin: 0, fontSize: '12px', color: '#2563eb', lineHeight: 1.5 }}>
                  {data.rating >= 4.5 ? `Note excellente (${data.rating}⭐) — valorisez leur réputation et proposez de l'amplifier.`
                    : data.rating >= 4 ? `Bonne note (${data.rating}⭐) — ils sont déjà performants, misez sur l'optimisation.`
                    : data.rating ? `Note correcte (${data.rating}⭐) — abordez l'amélioration de leur image en ligne.`
                    : "Peu d'avis en ligne — c'est une opportunité à mentionner lors de l'appel."}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
