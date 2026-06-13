import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  ArrowRight, Zap, Phone, Calendar, BookOpen, MessageSquare,
  CheckCircle, Star, Shield, Clock, BarChart3, Mic,
  ChevronDown, Gift, Sparkles, TrendingUp, Users
} from 'lucide-react'
import ShaderBackground from '../components/ShaderBackground'

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.6, delay }
})

const FEATURES = [
  {
    icon: Sparkles,
    title: 'Scripts générés par IA',
    desc: 'Entrez le nom du prospect, son secteur et quelques infos clés. Claude IA génère un script d\'appel personnalisé et percutant en 3 secondes.',
    highlight: 'Généré par Claude'
  },
  {
    icon: Mic,
    title: 'Assistant vocal en temps réel',
    desc: 'Parlez à votre assistant pendant un appel. Microphone intégré, suggestions de réponses aux objections en direct, sans quitter l\'écran.',
    highlight: 'Sans les mains'
  },
  {
    icon: Calendar,
    title: 'Rendez-vous & Google Calendar',
    desc: 'Dites "RDV avec [prénom] le 20 juin à 14h" et l\'assistant crée le rendez-vous automatiquement, avec email de confirmation.',
    highlight: 'Auto-planification'
  },
  {
    icon: Phone,
    title: 'Session Cold Call',
    desc: 'Gérez votre liste de prospects, leurs statuts (À appeler, Appelé, Refus, RDV visio ✅) et vos notes. Tout en un seul endroit.',
    highlight: 'Suivi complet'
  },
  {
    icon: BarChart3,
    title: 'Dashboard & Statistiques',
    desc: 'Visualisez vos performances en temps réel : nombre d\'appels, taux de conversion, résumé quotidien. Pilotez votre activité.',
    highlight: 'Vue d\'ensemble'
  },
  {
    icon: BookOpen,
    title: 'Bibliothèque de scripts',
    desc: 'Scripts prédéfinis pour chaque situation : Cold Call, Warm Call, Hot Call, réponses aux objections. Plus jamais à court d\'arguments.',
    highlight: 'Prêt à l\'emploi'
  },
]

const STEPS = [
  { num: '01', title: 'Créez votre compte', desc: 'Inscription gratuite en 30 secondes. Aucune carte bancaire, aucun engagement.' },
  { num: '02', title: 'Ajoutez vos prospects', desc: 'Entrez leur nom, secteur, et informations clés. L\'IA fait le reste.' },
  { num: '03', title: 'Appelez avec confiance', desc: 'Script IA personnalisé + assistant vocal en direct = plus de conversions.' },
]

const TESTIMONIALS = [
  { name: 'Marc D.', role: 'Commercial B2B', text: 'J\'ai multiplié mes RDV par 3 en 2 semaines. Les scripts IA sont bluffants de précision.', stars: 5 },
  { name: 'Sophie L.', role: 'Responsable ventes', text: 'L\'assistant vocal pendant les appels change tout. Je ne cherche plus mes mots face aux objections.', stars: 5 },
  { name: 'Thomas B.', role: 'Auto-entrepreneur', text: 'Gratuit et plus puissant que des outils à 100€/mois. L\'intégration Google Calendar est parfaite.', stars: 5 },
]

export default function LandingPage() {
  return (
    <div className="bg-black min-h-screen overflow-x-hidden">
      {/* HERO */}
      <section className="relative min-h-screen flex flex-col items-center justify-center text-center px-4 pb-20">
        <ShaderBackground />

        {/* Nav */}
        <nav className="absolute top-0 left-0 right-0 flex items-center justify-between px-6 py-5 z-20">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 bg-gradient-to-br from-violet-600 to-fuchsia-600 rounded-lg flex items-center justify-center">
              <Phone size={18} className="text-white" />
            </div>
            <span className="text-white font-bold text-lg">ProspectPro</span>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/login" className="text-gray-400 hover:text-white text-sm font-medium transition-colors px-3 py-2">
              Connexion
            </Link>
            <Link to="/register" className="px-4 py-2 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white text-sm font-semibold rounded-lg hover:shadow-lg hover:shadow-violet-500/30 transition-all">
              Commencer — Gratuit →
            </Link>
          </div>
        </nav>

        {/* Hero Content */}
        <div className="relative z-10 max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-8"
          >
            <span className="inline-flex items-center gap-2 px-4 py-2 bg-violet-500/10 border border-violet-500/30 rounded-full text-sm text-violet-300 font-medium">
              <Gift size={14} />
              100% Gratuit · Aucune carte bancaire
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="text-5xl md:text-7xl font-black text-white mb-6 leading-tight"
          >
            Prospectez{' '}
            <span className="bg-gradient-to-r from-violet-400 via-fuchsia-400 to-violet-400 bg-clip-text text-transparent">
              2× plus vite
            </span>
            <br />grâce à l'IA
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="text-xl text-gray-300 max-w-2xl mx-auto mb-10 leading-relaxed"
          >
            Scripts personnalisés, assistant vocal en direct, suivi des appels et rendez-vous automatiques.
            Tout ce qu'il faut pour décrocher plus de RDV — <strong className="text-white">gratuitement</strong>.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link
              to="/register"
              className="group w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white rounded-xl font-bold text-lg flex items-center justify-center gap-2 shadow-2xl shadow-violet-500/30 transition-all hover:scale-105"
            >
              <Zap size={20} />
              Créer mon compte gratuit
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              to="/login"
              className="w-full sm:w-auto px-8 py-4 bg-white/5 hover:bg-white/10 border border-white/20 hover:border-violet-400/50 text-white rounded-xl font-semibold text-lg transition-all"
            >
              Déjà un compte → Se connecter
            </Link>
          </motion.div>

          {/* Social proof */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-10 flex items-center justify-center gap-2 text-gray-400 text-sm"
          >
            <div className="flex">
              {[1,2,3,4,5].map(i => <Star key={i} size={14} className="text-yellow-400 fill-yellow-400" />)}
            </div>
            <span>Utilisé par des commerciaux terrain · <strong className="text-white">Gratuit pour toujours</strong></span>
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 text-gray-500"
        >
          <ChevronDown size={24} />
        </motion.div>
      </section>

      {/* PRIX - GRATUIT */}
      <section className="py-16 px-4 border-y border-violet-500/20">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div {...fadeUp()}>
            <div className="inline-flex items-center justify-center gap-4 flex-wrap">
              {[
                { icon: Gift, label: '100% Gratuit', sub: 'Pour toujours' },
                { icon: Shield, label: 'Sans CB', sub: 'Aucun engagement' },
                { icon: Clock, label: 'En ligne', sub: 'Disponible 24/7' },
                { icon: Users, label: 'Multi-profil', sub: 'Équipe ou solo' },
              ].map(({ icon: Icon, label, sub }) => (
                <div key={label} className="flex items-center gap-3 px-6 py-3 bg-white/5 border border-white/10 rounded-xl">
                  <Icon size={20} className="text-violet-400" />
                  <div className="text-left">
                    <p className="text-white font-bold text-sm">{label}</p>
                    <p className="text-gray-400 text-xs">{sub}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="py-24 px-4">
        <div className="max-w-6xl mx-auto">
          <motion.div {...fadeUp()} className="text-center mb-16">
            <span className="text-violet-400 font-semibold text-sm uppercase tracking-widest">Fonctionnalités</span>
            <h2 className="text-4xl md:text-5xl font-black text-white mt-3 mb-4">
              Tout ce qu'il vous faut
              <span className="block text-gray-400 text-2xl md:text-3xl font-normal mt-2">sans payer un centime</span>
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map(({ icon: Icon, title, desc, highlight }, i) => (
              <motion.div
                key={title}
                {...fadeUp(i * 0.1)}
                className="group relative bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 hover:border-violet-500/40 rounded-2xl p-6 transition-all hover:shadow-xl hover:shadow-violet-500/10"
              >
                <div className="absolute top-4 right-4">
                  <span className="text-xs text-violet-400 bg-violet-400/10 px-2 py-1 rounded-full font-medium">
                    {highlight}
                  </span>
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-violet-600/30 to-fuchsia-600/30 rounded-xl flex items-center justify-center mb-4 group-hover:from-violet-600/50 group-hover:to-fuchsia-600/50 transition-all">
                  <Icon size={24} className="text-violet-400" />
                </div>
                <h3 className="text-white font-bold text-lg mb-2">{title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="py-24 px-4 bg-gradient-to-b from-transparent via-violet-950/10 to-transparent">
        <div className="max-w-4xl mx-auto">
          <motion.div {...fadeUp()} className="text-center mb-16">
            <span className="text-violet-400 font-semibold text-sm uppercase tracking-widest">Simple comme bonjour</span>
            <h2 className="text-4xl md:text-5xl font-black text-white mt-3">
              Démarrez en <span className="text-violet-400">3 étapes</span>
            </h2>
          </motion.div>

          <div className="space-y-6">
            {STEPS.map(({ num, title, desc }, i) => (
              <motion.div
                key={num}
                {...fadeUp(i * 0.15)}
                className="flex gap-6 items-start p-6 bg-white/[0.03] border border-white/10 rounded-2xl hover:border-violet-500/30 transition-all"
              >
                <div className="text-5xl font-black bg-gradient-to-br from-violet-500 to-fuchsia-500 bg-clip-text text-transparent flex-shrink-0 w-16">
                  {num}
                </div>
                <div>
                  <h3 className="text-white font-bold text-xl mb-1">{title}</h3>
                  <p className="text-gray-400 leading-relaxed">{desc}</p>
                </div>
                <CheckCircle size={24} className="text-violet-400 flex-shrink-0 mt-1" />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* IA SECTION */}
      <section className="py-24 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <motion.div {...fadeUp()}>
              <span className="text-fuchsia-400 font-semibold text-sm uppercase tracking-widest">Propulsé par Claude IA</span>
              <h2 className="text-4xl font-black text-white mt-3 mb-6">
                L'IA fait le travail
                <span className="block text-fuchsia-400">vous récoltez les RDV</span>
              </h2>
              <div className="space-y-4">
                {[
                  { icon: Sparkles, text: 'Scripts adaptés au secteur et au profil de votre prospect' },
                  { icon: MessageSquare, text: 'Réponses aux objections en temps réel pendant l\'appel' },
                  { icon: TrendingUp, text: 'Analyse de vos performances et suggestions d\'amélioration' },
                  { icon: Mic, text: 'Commandes vocales pour noter sans décrocher les yeux' },
                ].map(({ icon: Icon, text }) => (
                  <div key={text} className="flex gap-3 items-start">
                    <div className="w-8 h-8 bg-fuchsia-500/10 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Icon size={16} className="text-fuchsia-400" />
                    </div>
                    <p className="text-gray-300">{text}</p>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div {...fadeUp(0.2)}>
              <div className="bg-gradient-to-br from-violet-950/50 to-fuchsia-950/30 border border-violet-500/30 rounded-2xl p-6 font-mono text-sm">
                <div className="flex gap-2 mb-4">
                  {['#ef4444','#f59e0b','#22c55e'].map(c => (
                    <div key={c} className="w-3 h-3 rounded-full" style={{ background: c }} />
                  ))}
                </div>
                <div className="space-y-3 text-gray-300">
                  <div><span className="text-violet-400">Prospect:</span> Boulangerie Martin</div>
                  <div><span className="text-violet-400">Secteur:</span> Restauration</div>
                  <div><span className="text-violet-400">Info:</span> Livraison à domicile à développer</div>
                  <div className="border-t border-white/10 pt-3 mt-3">
                    <p className="text-green-400 font-bold mb-2">✨ Script généré :</p>
                    <p className="text-white leading-relaxed">
                      "Bonjour M. Martin, je vois que vous faites des produits artisanaux exceptionnels. Avec la demande croissante de livraison dans votre secteur, avez-vous 5 minutes pour qu'on en parle ?"
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="py-24 px-4">
        <div className="max-w-5xl mx-auto">
          <motion.div {...fadeUp()} className="text-center mb-16">
            <h2 className="text-4xl font-black text-white">
              Ce qu'en disent les utilisateurs
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {TESTIMONIALS.map(({ name, role, text, stars }, i) => (
              <motion.div
                key={name}
                {...fadeUp(i * 0.1)}
                className="bg-white/[0.03] border border-white/10 rounded-2xl p-6"
              >
                <div className="flex mb-4">
                  {Array.from({ length: stars }).map((_, j) => (
                    <Star key={j} size={16} className="text-yellow-400 fill-yellow-400" />
                  ))}
                </div>
                <p className="text-gray-300 text-sm leading-relaxed mb-4">"{text}"</p>
                <div>
                  <p className="text-white font-bold text-sm">{name}</p>
                  <p className="text-gray-500 text-xs">{role}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* PRICING - GRATUIT */}
      <section className="py-24 px-4">
        <div className="max-w-2xl mx-auto">
          <motion.div {...fadeUp()}>
            <div className="bg-gradient-to-br from-violet-950/60 to-fuchsia-950/40 border border-violet-500/40 rounded-3xl p-10 text-center shadow-2xl shadow-violet-500/10">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-500/10 border border-green-500/30 rounded-full text-sm text-green-400 font-semibold mb-6">
                <Gift size={14} />
                Prix unique et définitif
              </div>

              <div className="mb-6">
                <span className="text-8xl font-black text-white">0€</span>
                <p className="text-gray-400 text-lg mt-2">Pour toujours · Aucune limitation cachée</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8 text-left">
                {[
                  'Scripts IA illimités',
                  'Assistant vocal intégré',
                  'Suivi des prospects',
                  'Gestion des RDV',
                  'Export Google Calendar',
                  'Email de confirmation auto',
                  'Tableau de bord',
                  'Bibliothèque de scripts',
                ].map(item => (
                  <div key={item} className="flex items-center gap-2 text-sm text-gray-300">
                    <CheckCircle size={16} className="text-green-400 flex-shrink-0" />
                    {item}
                  </div>
                ))}
              </div>

              <Link
                to="/register"
                className="block w-full py-4 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white rounded-xl font-bold text-xl transition-all hover:scale-105 hover:shadow-xl hover:shadow-violet-500/30"
              >
                Démarrer gratuitement maintenant →
              </Link>

              <p className="text-gray-500 text-xs mt-4">Aucune carte bancaire · Compte créé en 30 secondes</p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* CTA FINAL */}
      <section className="py-24 px-4 relative">
        <ShaderBackground />
        <div className="relative z-10 max-w-3xl mx-auto text-center">
          <motion.div {...fadeUp()}>
            <h2 className="text-4xl md:text-5xl font-black text-white mb-6">
              Prêt à décrocher
              <span className="block bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent">
                plus de rendez-vous ?
              </span>
            </h2>
            <p className="text-gray-300 text-lg mb-8">
              Rejoignez les commerciaux qui utilisent ProspectPro pour multiplier leurs conversions. Gratuit. Maintenant.
            </p>
            <Link
              to="/register"
              className="inline-flex items-center gap-2 px-10 py-5 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white rounded-xl font-black text-xl transition-all hover:scale-105 hover:shadow-2xl hover:shadow-violet-500/40"
            >
              <Zap size={22} />
              Créer mon compte — C'est gratuit
              <ArrowRight size={20} />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="py-8 px-4 border-t border-white/10 text-center">
        <div className="flex items-center justify-center gap-2 mb-3">
          <div className="w-7 h-7 bg-gradient-to-br from-violet-600 to-fuchsia-600 rounded-lg flex items-center justify-center">
            <Phone size={14} className="text-white" />
          </div>
          <span className="text-white font-bold">ProspectPro</span>
        </div>
        <p className="text-gray-500 text-sm">© 2025 ProspectPro · 100% gratuit · Données stockées localement</p>
      </footer>
    </div>
  )
}
