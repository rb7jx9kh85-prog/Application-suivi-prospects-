import { motion } from 'framer-motion'
import { BookOpen } from 'lucide-react'
import ProNavBar from '../components/ProNavBar'
import EnhancedChatbot from '../components/EnhancedChatbot'
import ScriptGenerator from '../components/ScriptGenerator'

const SCRIPTS = {
  cold: {
    label: 'Cold Call (jamais parlé)',
    pro: {
      title: 'Pro & Clair',
      text: `Bonjour [Nom], je m'appelle [Votre Nom] de [Votre Entreprise].

La raison de mon appel : j'ai remarqué que vous êtes dans le domaine [DOMAINE] et j'aimerais vous parler d'une solution qui pourrait vous intéresser.

Avez-vous 5 minutes ? C'est court, promis.`
    },
    humorous: {
      title: 'Humour & Direct',
      text: `Bonjour, écoutez je vais être direct : c'est un appel de prospection.

Mauvaise nouvelle : oui, c'est un appel de vente. Bonne nouvelle : j'ai créé quelque chose de gratuit pour les [DOMAINE] et j'étais sur le point de vous l'envoyer.

Vous avez 15 minutes la semaine prochaine ?`
    },
    hidden: {
      title: 'Accroche Dissimulée',
      text: `Bonjour, un ami m'a dit que vous étiez exceptionnels chez vous.

J'ai essayé de trouver votre [carte/horaires/infos] sur internet, mais franchement je n'ai rien trouvé de clair. C'est normal ou c'est juste moi ?

[Écouter la réponse] - profiter pour envoyer une ressource utile.`
    },
  },
  warm: {
    label: 'Warm Call (connaît la personne)',
    pro: {
      title: 'Professionnel',
      text: `Bonjour [Nom], c'est [Votre Nom], on s'était parlé il y a quelques semaines.

Je voulais vous montrer quelque chose qui pourrait vraiment vous aider. C'est rapide, 10 minutes ?`
    },
    followup: {
      title: 'Relance Naturelle',
      text: `Salut [Nom], j'espère que tout va bien de ton côté.

Je réfléchissais à ce qu'on avait discuté la dernière fois, et j'ai trouvé une solution parfaite pour toi.

Est-ce qu'on peut prendre un café ou un appel cette semaine ?`
    },
  },
  hot: {
    label: 'Hot Call (demande de visio)',
    pro: {
      title: 'Visio Confirmée',
      text: `Bonjour [Nom], excité de vous rencontrer jeudi à 14h.

Avant : avez-vous des questions spécifiques que j'aimerais couvrir ? C'est pour que je sois bien préparé.

À jeudi ! Voici le lien : [LIEN VISIO]`
    },
    engagement: {
      title: 'Engagement Fort',
      text: `[Nom], on arrive enfin au moment où on va vraiment voir si c'est une bonne fit.

Je suis confiant qu'on peut trouver une solution ensemble. Et même si ce n'est pas le cas, vous aurez au minimum quelques idées intéressantes.

À bientôt !`
    },
  }
}

export default function ScriptsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-black to-slate-900">
      <ProNavBar />
      <EnhancedChatbot />

      <main className="max-w-6xl mx-auto px-4 py-32 md:py-40">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-3 mb-6 px-6 py-2 bg-violet-500/10 border border-violet-500/30 rounded-full">
            <BookOpen size={20} className="text-violet-400" />
            <span className="text-violet-300 font-semibold text-sm">Scripts Professionnels</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-black text-white mb-6">
            Scripts et Stratégies
            <span className="block bg-gradient-to-r from-violet-500 to-fuchsia-500 bg-clip-text text-transparent">
              Générés par IA
            </span>
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Créez des scripts personnalisés en fonction de votre prospect, secteur et objectif. Obtenez des réponses aux objections en temps réel.
          </p>
        </motion.div>

        {/* Script Generator */}
        <ScriptGenerator />

        {/* Prédéfinis Scripts */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-20"
        >
          <h2 className="text-3xl font-bold text-white mb-12 text-center">Scripts Prédéfinis</h2>

          <div className="space-y-12">
            {Object.entries(SCRIPTS).map(([key, config]) => (
              <motion.div
                key={key}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-gradient-to-br from-black/50 to-violet-950/20 border border-violet-500/20 rounded-2xl p-8"
              >
                <h3 className="text-2xl font-bold text-white mb-8 text-center">{config.label}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {Object.entries(config).map(([scriptKey, script]) => {
                    if (scriptKey === 'label') return null
                    return (
                      <motion.div
                        key={scriptKey}
                        whileHover={{ scale: 1.02 }}
                        className="bg-black/40 border border-violet-500/10 hover:border-violet-500/30 rounded-xl p-6 transition-all"
                      >
                        <h4 className="text-lg font-bold text-violet-400 mb-4">{script.title}</h4>
                        <div className="bg-black/60 rounded-lg p-4 mb-4 max-h-40 overflow-y-auto">
                          <p className="text-gray-300 text-sm whitespace-pre-line leading-relaxed font-mono">
                            {script.text}
                          </p>
                        </div>
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(script.text)
                            alert('✅ Script copié !')
                          }}
                          className="w-full px-4 py-2 bg-violet-600/20 hover:bg-violet-600/40 border border-violet-500/50 text-violet-300 rounded-lg font-medium transition-all text-sm"
                        >
                          Copier
                        </button>
                      </motion.div>
                    )
                  })}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Pro Tips */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-20 bg-gradient-to-br from-violet-500/10 to-fuchsia-500/10 border border-violet-500/30 rounded-2xl p-8"
        >
          <h3 className="text-2xl font-bold text-white mb-6">💡 Tips de Pro</h3>
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              'Appelez le matin (9-11h) ou fin d\'après (16-17h) pour plus de chances',
              'Souriez avant d\'appeler — ça s\'entend !',
              'Posez plus de questions que vous ne faites de pitchs',
              'Mémorisez le script jusqu\'à le maîtriser, puis adaptez-le',
              'Si on vous dit non : "Puis-je juste vous demander pourquoi ?" fonctionne toujours',
              'Documentez chaque appel pour améliorer vos scripts'
            ].map((tip, i) => (
              <li key={i} className="flex gap-3 text-gray-200 text-sm">
                <span className="text-violet-400 font-bold flex-shrink-0">✓</span>
                <span>{tip}</span>
              </li>
            ))}
          </ul>
        </motion.div>
      </main>
    </div>
  )
}
