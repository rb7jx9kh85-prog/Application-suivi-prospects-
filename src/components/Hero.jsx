import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight, Zap } from 'lucide-react'
import ShaderBackground from './ShaderBackground'

export default function Hero() {
  return (
    <div className="relative w-full min-h-screen overflow-hidden bg-black flex items-center justify-center">
      <ShaderBackground />

      <style>{`
        @keyframes gradient-shift {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        .animate-gradient-shift {
          background-size: 200% 200%;
          animation: gradient-shift 3s ease infinite;
        }
      `}</style>

      <div className="relative z-10 w-full max-w-5xl mx-auto px-4 py-20 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-8"
        >
          <div className="inline-flex items-center gap-2 px-6 py-2 bg-violet-500/10 border border-violet-400/30 rounded-full text-sm">
            <Zap size={14} className="text-violet-400" />
            <span className="text-violet-200">Alimenté par Claude IA</span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="mb-6"
        >
          <h1 className="text-5xl md:text-7xl font-black text-white mb-4">
            Prospectez en
            <span className="block bg-gradient-to-r from-violet-500 via-fuchsia-500 to-purple-600 bg-clip-text text-transparent animate-gradient-shift">
              pilote automatique
            </span>
          </h1>
          <p className="text-lg md:text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
            Scripts IA personnalisés, suivi intelligent des appels, et rendez-vous automatiques avec votre calendrier. Multipliez vos conversions.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="flex flex-col sm:flex-row gap-4 justify-center mt-12"
        >
          <Link
            to="/register"
            className="group relative px-8 py-4 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-700 hover:to-fuchsia-700 text-white rounded-lg font-semibold text-lg transition-all duration-300 flex items-center justify-center gap-2 hover:shadow-2xl hover:shadow-violet-500/50"
          >
            Commencer maintenant
            <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
          </Link>
          <Link
            to="/login"
            className="px-8 py-4 bg-white/5 hover:bg-white/10 border border-violet-400/30 hover:border-violet-400/60 text-white rounded-lg font-semibold text-lg transition-all duration-300 backdrop-blur-sm"
          >
            Se connecter
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.3 }}
          className="mt-16 pt-16 border-t border-white/10"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { label: 'Scripts IA', value: '100%' },
              { label: 'Intégration', value: 'Google' },
              { label: 'Support', value: '24/7' }
            ].map((item) => (
              <div key={item.label} className="text-center">
                <div className="text-3xl font-bold text-violet-400 mb-2">{item.value}</div>
                <div className="text-gray-400 text-sm">{item.label}</div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  )
}
