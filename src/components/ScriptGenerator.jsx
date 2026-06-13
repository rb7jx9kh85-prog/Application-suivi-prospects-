import { useState } from 'react'
import { motion } from 'framer-motion'
import { Send, Loader, Copy, Check } from 'lucide-react'
import { askClaude, hasAnthropicKey } from '../utils/claude'

const CALL_TYPES = ['Prospection', 'Relance', 'Closing', 'Service client']

export default function ScriptGenerator() {
  const [formData, setFormData] = useState({
    prospectName: '',
    sector: '',
    info1: '',
    info2: '',
    info3: '',
    callType: CALL_TYPES[0]
  })
  const [script, setScript] = useState(null)
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)
  const [showForm, setShowForm] = useState(true)

  const generateScript = async () => {
    if (!formData.prospectName || !formData.sector) {
      alert('Veuillez remplir au moins le nom et le secteur')
      return
    }

    if (!hasAnthropicKey()) {
      alert('Clé API Anthropic non configurée')
      return
    }

    setLoading(true)
    try {
      const prompt = `Tu es un expert en prospection commerciale. Génère un script d'appel professionnel et persuasif.

Détails du prospect:
- Nom: ${formData.prospectName}
- Secteur: ${formData.sector}
- Type d'appel: ${formData.callType}
${formData.info1 ? `- Info clé 1: ${formData.info1}` : ''}
${formData.info2 ? `- Info clé 2: ${formData.info2}` : ''}
${formData.info3 ? `- Info clé 3: ${formData.info3}` : ''}

Génère un script en 3 parties:
1. **Ouverture** (30 secondes): Présentation professionnelle et accroche
2. **Discours principal** (1-2 minutes): Propositions pertinentes avec les infos clés mentionnées
3. **Objections courantes** (avec réponses): Les 3-4 principales objections dans ce secteur

Format: Texte direct et naturel, prêt à être mémorisé. Sois bref, professionnel, persuasif.`

      const messages = [{ role: 'user', content: prompt }]
      const result = await askClaude(messages, 'Tu es un expert commercial.')
      setScript(result)
      setShowForm(false)
    } catch (error) {
      alert('Erreur: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(script)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (!showForm && script) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-black to-violet-950/20 border border-violet-500/30 rounded-2xl p-8 mb-8"
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-2xl font-bold text-white mb-2">
              Script pour {formData.prospectName}
            </h3>
            <p className="text-gray-400">{formData.sector} • {formData.callType}</p>
          </div>
          <button
            onClick={copyToClipboard}
            className="p-3 bg-violet-600/20 hover:bg-violet-600/40 border border-violet-500/50 rounded-lg text-violet-400 transition-all"
          >
            {copied ? <Check size={20} /> : <Copy size={20} />}
          </button>
        </div>

        <div className="bg-black/50 rounded-lg p-6 mb-6 max-h-96 overflow-y-auto border border-violet-500/10">
          <p className="text-gray-200 whitespace-pre-line leading-relaxed text-sm">{script}</p>
        </div>

        <button
          onClick={() => {
            setShowForm(true)
            setScript(null)
            setFormData({
              prospectName: '',
              sector: '',
              info1: '',
              info2: '',
              info3: '',
              callType: CALL_TYPES[0]
            })
          }}
          className="w-full px-4 py-3 bg-violet-600/20 hover:bg-violet-600/40 border border-violet-500/50 text-violet-400 rounded-lg font-medium transition-all"
        >
          Générer un autre script
        </button>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-black to-violet-950/20 border border-violet-500/30 rounded-2xl p-8 mb-8"
    >
      <h3 className="text-2xl font-bold text-white mb-6">Générateur de Script IA</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <input
          type="text"
          placeholder="Nom du prospect"
          value={formData.prospectName}
          onChange={(e) => setFormData({ ...formData, prospectName: e.target.value })}
          className="w-full px-4 py-3 bg-black/50 border border-violet-500/30 rounded-lg text-white placeholder-gray-500 focus:border-violet-500 focus:outline-none transition-colors"
        />
        <input
          type="text"
          placeholder="Secteur d'activité"
          value={formData.sector}
          onChange={(e) => setFormData({ ...formData, sector: e.target.value })}
          className="w-full px-4 py-3 bg-black/50 border border-violet-500/30 rounded-lg text-white placeholder-gray-500 focus:border-violet-500 focus:outline-none transition-colors"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {['info1', 'info2', 'info3'].map((key) => (
          <input
            key={key}
            type="text"
            placeholder={`Info clé ${key === 'info1' ? 1 : key === 'info2' ? 2 : 3} (optionnel)`}
            value={formData[key]}
            onChange={(e) => setFormData({ ...formData, [key]: e.target.value })}
            className="w-full px-4 py-3 bg-black/50 border border-violet-500/30 rounded-lg text-white placeholder-gray-500 focus:border-violet-500 focus:outline-none transition-colors text-sm"
          />
        ))}
      </div>

      <select
        value={formData.callType}
        onChange={(e) => setFormData({ ...formData, callType: e.target.value })}
        className="w-full px-4 py-3 bg-black/50 border border-violet-500/30 rounded-lg text-white focus:border-violet-500 focus:outline-none transition-colors mb-6"
      >
        {CALL_TYPES.map((type) => (
          <option key={type} value={type}>
            {type}
          </option>
        ))}
      </select>

      <button
        onClick={generateScript}
        disabled={loading}
        className="w-full px-6 py-3 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-700 hover:to-fuchsia-700 text-white rounded-lg font-semibold flex items-center justify-center gap-2 transition-all disabled:opacity-50"
      >
        {loading ? (
          <>
            <Loader size={20} className="animate-spin" />
            Génération...
          </>
        ) : (
          <>
            <Send size={20} />
            Générer le script
          </>
        )}
      </button>

      {!hasAnthropicKey() && (
        <p className="text-yellow-400 text-sm mt-4">⚠️ Clé API Anthropic nécessaire pour la génération</p>
      )}
    </motion.div>
  )
}
