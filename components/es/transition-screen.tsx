'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Loader2, Search, Calculator, Target } from 'lucide-react';

interface TransitionScreenProps {
  onComplete: () => void;
}

const loadingSteps = [
  { text: "Analizando tus respuestas...", icon: Search },
  { text: "Identificando fugas de dinero...", icon: Calculator },
  { text: "Calculando tu potencial de ahorro...", icon: Target }
];

export default function TransitionScreenES({ onComplete }: TransitionScreenProps) {
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStep((prev) => {
        if (prev < loadingSteps?.length - 1) {
          return prev + 1;
        }
        clearInterval(interval);
        setTimeout(onComplete, 150);
        return prev;
      });
    }, 350);

    return () => clearInterval(interval);
  }, [onComplete]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen flex items-center justify-center px-4"
    >
      <div className="max-w-md w-full text-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: 999, ease: "linear" }}
          className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-blue-600 to-blue-700 mb-8 shadow-lg shadow-blue-500/30"
        >
          <Loader2 className="w-8 h-8 text-white" />
        </motion.div>

        <div className="space-y-4">
          {(loadingSteps ?? []).map((step, index) => {
            const StepIcon = step?.icon ?? Loader2;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0.3 }}
                animate={{ 
                  opacity: index <= currentStep ? 1 : 0.3,
                  x: index <= currentStep ? 0 : 10
                }}
                transition={{ duration: 0.3 }}
                className={`flex items-center gap-3 p-4 rounded-xl border-2 ${
                  index <= currentStep 
                    ? 'bg-blue-50 border-blue-300 shadow-sm' 
                    : 'bg-white border-slate-200'
                }`}
              >
                <StepIcon className={`w-5 h-5 ${
                  index <= currentStep ? 'text-blue-600' : 'text-slate-400'
                }`} />
                <span className={`font-medium ${
                  index <= currentStep ? 'text-slate-800' : 'text-slate-400'
                }`}>
                  {step?.text}
                </span>
                {index < currentStep && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="ml-auto text-emerald-500 font-bold"
                  >
                    ✓
                  </motion.span>
                )}
              </motion.div>
            );
          })}
        </div>

        <motion.div
          className="mt-8 h-2 bg-slate-200 rounded-full overflow-hidden shadow-inner"
        >
          <motion.div
            className="h-full bg-gradient-to-r from-blue-500 to-emerald-500"
            initial={{ width: '0%' }}
            animate={{ width: `${((currentStep + 1) / (loadingSteps?.length ?? 1)) * 100}%` }}
            transition={{ duration: 0.5 }}
          />
        </motion.div>

        <p className="mt-4 text-slate-500 text-sm">Por favor, espera...</p>
      </div>
    </motion.div>
  );
}
