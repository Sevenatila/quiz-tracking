'use client';

import { motion } from 'framer-motion';
import { Clock, ChevronRight, Shield, Zap } from 'lucide-react';
import { useSound } from '@/hooks/use-sound';
import Image from 'next/image';

interface LandingScreenProps {
  onStart: () => void;
}

export default function LandingScreenES({ onStart }: LandingScreenProps) {
  const { playClickSound } = useSound();
  
  const handleStart = () => {
    playClickSound();
    onStart();
  };
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen flex items-center justify-center px-4 py-4"
    >
      <div className="max-w-lg w-full text-center">
        <motion.h1
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-2xl md:text-3xl font-bold text-slate-800 mb-4 leading-tight"
        >
          ¿Así te sientes?
        </motion.h1>

        {/* Imagen de la Rueda */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mb-3 relative w-full aspect-square max-w-[320px] mx-auto"
        >
          <Image
            src="/hamster-wheel-es.png"
            alt="¿Así es como te sientes? Trabajas para ganar dinero para pagar cuentas hasta quedarte sin dinero"
            fill
            className="object-contain rounded-2xl"
            priority
          />
        </motion.div>

        <motion.p
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-slate-600 text-base mb-4"
        >
          Descubre cuánto dinero estás{' '}
          <span className="text-red-500 font-semibold">perdiendo</span>{' '}
          sin darte cuenta
        </motion.p>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="flex flex-wrap justify-center gap-2 mb-4"
        >
          <div className="flex items-center gap-1.5 text-xs text-slate-600 bg-slate-100 px-3 py-1.5 rounded-full">
            <Clock className="w-3.5 h-3.5 text-purple-500" />
            <span>2 minutos</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-slate-600 bg-slate-100 px-3 py-1.5 rounded-full">
            <Shield className="w-3.5 h-3.5 text-purple-500" />
            <span>100% gratuito</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-slate-600 bg-slate-100 px-3 py-1.5 rounded-full">
            <Zap className="w-3.5 h-3.5 text-purple-500" />
            <span>Resultado inmediato</span>
          </div>
        </motion.div>

        <motion.button
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6 }}
          whileHover={{ scale: 1.02, boxShadow: '0 20px 40px rgba(16, 185, 129, 0.3)' }}
          whileTap={{ scale: 0.98 }}
          onClick={handleStart}
          className="w-full md:w-auto px-10 py-4 bg-gradient-to-r from-emerald-500 to-green-600 text-white font-semibold text-lg rounded-xl shadow-lg shadow-emerald-500/30 flex items-center justify-center gap-2 mx-auto hover:from-emerald-600 hover:to-green-700 transition-all"
        >
          Hacer diagnóstico gratuito
          <ChevronRight className="w-5 h-5" />
        </motion.button>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="text-slate-500 text-xs mt-4"
        >
          +12,000 diagnósticos realizados
        </motion.p>
      </div>
    </motion.div>
  );
}
