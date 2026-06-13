import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, Mic, MicOff, Bot, X, MessageCircle, Key, Loader, Copy, Check } from 'lucide-react'
import { askClaude, hasAnthropicKey } from '../utils/claude'
import { generateBotResponse } from '../utils/chatbot'
import ApiKeySetup from './ApiKeySetup'

const SYSTEM_PROMPT = `Tu es un expert en prospection commerciale pour ProspectPro.
Tu aides les commerciaux à mieux vendre en proposant des réponses pertinentes aux objections.
Réponds TOUJOURS en français, de manière concise (max 2-3 lignes).
Format: [suggestion court et direct]

Si c'est une objection courante, propose 2-3 réponses différentes.`

export default function EnhancedChatbot() {
  const [open, setOpen] = useState(false)
  const [showKeySetup, setShowKeySetup] = useState(false)
  const [messages, setMessages] = useState([
    { id: 1, role: 'bot', text: 'Bonjour 👋 Tapez une objection ou une question de prospect, je vous propose des réponses.' }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [suggestions, setSuggestions] = useState(null)
  const [copiedIndex, setCopiedIndex] = useState(null)
  const bottomRef = useRef(null)
  const recognitionRef = useRef(null)

  useEffect(() => {
    if (open) bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, open, suggestions])

  // Initialize speech recognition
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition()
      recognitionRef.current.lang = 'fr-FR'
      recognitionRef.current.continuous = false
      recognitionRef.current.interimResults = false

      recognitionRef.current.onstart = () => setIsListening(true)
      recognitionRef.current.onend = () => setIsListening(false)
      recognitionRef.current.onresult = (event) => {
        const transcript = Array.from(event.results)
          .map((result) => result[0].transcript)
          .join('')
        setInput(transcript)
      }
      recognitionRef.current.onerror = () => setIsListening(false)
    }
  }, [])

  const toggleMicrophone = () => {
    if (recognitionRef.current) {
      if (isListening) {
        recognitionRef.current.stop()
      } else {
        recognitionRef.current.start()
      }
    }
  }

  const generateSuggestions = async (msgText) => {
    if (!hasAnthropicKey()) {
      setSuggestions([
        '💬 Réponse 1: [Clé API requise pour suggestions IA]',
        '💬 Réponse 2: Configurez votre clé pour des suggestions personnalisées',
        '💬 Réponse 3: Voir les paramètres pour ajouter une clé'
      ])
      return
    }

    try {
      setSuggestions(null)
      const history = messages.slice(-4).map((m) => ({
        role: m.role === 'user' ? 'user' : 'assistant',
        content: m.text
      }))
      history.push({ role: 'user', content: msgText })

      const response = await askClaude(history, SYSTEM_PROMPT)

      // Parse multiple suggestions (separated by lines starting with numbers or bullets)
      const suggestionsText = response
        .split('\n')
        .filter((line) => line.trim())
        .slice(0, 3)

      setSuggestions(suggestionsText.length > 0 ? suggestionsText : [response])
    } catch (error) {
      setSuggestions(['Erreur génération: ' + error.message])
    }
  }

  const send = async () => {
    if (!input.trim()) return
    const userMsg = { id: Date.now(), role: 'user', text: input }
    setMessages((prev) => [...prev, userMsg])
    const msgText = input
    setInput('')
    setLoading(true)
    setSuggestions(null)

    try {
      await generateSuggestions(msgText)
      const response = generateBotResponse(msgText, [], [])
      setMessages((prev) => [...prev, { id: Date.now() + 1, role: 'bot', text: response.text }])
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        { id: Date.now() + 1, role: 'bot', text: '❌ Erreur: ' + error.message }
      ])
    } finally {
      setLoading(false)
    }
  }

  const copySuggestion = (text, index) => {
    navigator.clipboard.writeText(text.replace(/^[0-9\.]\s+/, '').replace(/^\[|\]$/g, ''))
    setCopiedIndex(index)
    setTimeout(() => setCopiedIndex(null), 2000)
  }

  const renderText = (text) => {
    return text.split(/(\*\*[^*]+\*\*)/g).map((part, i) =>
      part.startsWith('**') && part.endsWith('**') ? (
        <strong key={i}>{part.slice(2, -2)}</strong>
      ) : (
        <span key={i}>{part}</span>
      )
    )
  }

  return (
    <>
      <motion.button
        onClick={() => setOpen(true)}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        className="fixed bottom-6 right-6 z-40 w-16 h-16 rounded-full bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-700 hover:to-fuchsia-700 text-white shadow-2xl flex items-center justify-center hover:shadow-violet-500/50 transition-all"
      >
        <MessageCircle size={24} />
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-24 right-6 z-40 w-96 max-w-[calc(100vw-2rem)] bg-black border border-violet-500/30 rounded-2xl shadow-2xl overflow-hidden flex flex-col"
            style={{ height: '600px' }}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-violet-600 to-fuchsia-600 p-4 flex items-center justify-between">
              <div>
                <p className="text-white font-bold text-sm">Claude Assistant</p>
                <p className="text-violet-100 text-xs">Suggestions de réponse rapides</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowKeySetup(true)}
                  className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
                  title="Configurer la clé API"
                >
                  <Key size={16} className="text-white" />
                </button>
                <button
                  onClick={() => setOpen(false)}
                  className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
                >
                  <X size={16} className="text-white" />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex gap-3"
                >
                  {msg.role === 'bot' && <Bot size={16} className="text-violet-400 mt-1 flex-shrink-0" />}
                  <div
                    className={`rounded-lg px-4 py-2 max-w-xs ${
                      msg.role === 'user'
                        ? 'bg-violet-600 text-white rounded-br-none'
                        : 'bg-white/5 text-gray-200 rounded-bl-none'
                    }`}
                  >
                    <p className="text-sm">{renderText(msg.text)}</p>
                  </div>
                </motion.div>
              ))}

              {/* Suggestions */}
              {suggestions && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-gradient-to-br from-violet-500/10 to-fuchsia-500/10 border border-violet-500/20 rounded-lg p-4 space-y-2"
                >
                  <p className="text-violet-400 font-semibold text-sm">💡 Suggestions:</p>
                  {suggestions.map((sug, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      className="group"
                    >
                      <button
                        onClick={() => copySuggestion(sug, idx)}
                        className="w-full text-left px-3 py-2 bg-black/50 hover:bg-black/80 rounded text-gray-200 text-sm flex items-center justify-between group-hover:text-violet-300 transition-all"
                      >
                        <span>{sug}</span>
                        {copiedIndex === idx ? (
                          <Check size={14} className="text-green-400" />
                        ) : (
                          <Copy size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                        )}
                      </button>
                    </motion.div>
                  ))}
                </motion.div>
              )}

              {loading && (
                <div className="flex items-center gap-2 text-violet-400">
                  <Loader size={16} className="animate-spin" />
                  <span className="text-sm">Génération...</span>
                </div>
              )}

              <div ref={bottomRef} />
            </div>

            {/* Input */}
            <div className="p-4 border-t border-violet-500/10 space-y-3">
              <div className="flex gap-2">
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && send()}
                  placeholder="Votre question..."
                  className="flex-1 px-3 py-2 bg-white/5 border border-violet-500/30 rounded-lg text-white placeholder-gray-500 focus:border-violet-500 focus:outline-none text-sm"
                />
                <button
                  onClick={toggleMicrophone}
                  className={`p-2 rounded-lg transition-all ${
                    isListening
                      ? 'bg-red-600 text-white'
                      : 'bg-violet-600/30 text-violet-400 hover:bg-violet-600/50'
                  }`}
                  title={isListening ? 'Arrêter' : 'Microphone'}
                >
                  {isListening ? <MicOff size={18} /> : <Mic size={18} />}
                </button>
                <button
                  onClick={send}
                  disabled={!input.trim() || loading}
                  className="p-2 bg-violet-600 hover:bg-violet-700 text-white rounded-lg disabled:opacity-50 transition-all"
                >
                  <Send size={18} />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {showKeySetup && <ApiKeySetup onClose={() => setShowKeySetup(false)} onSaved={() => window.location.reload()} />}
    </>
  )
}
