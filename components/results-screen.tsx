'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Target, TrendingUp, PiggyBank, BarChart3, ChevronRight, AlertTriangle } from 'lucide-react';
import { getControlLevel, formatCurrency, incomeRanges } from '@/lib/quiz-data';
import { useSound } from '@/hooks/use-sound';

interface ResultsScreenProps {
  totalValue: number;
  incomeIndex: number;
  onContinue: () => void;
}

function AnimatedValue({ value, prefix = '', suffix = '' }: { value: number; prefix?: string; suffix?: string }) {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    const duration = 1500;
    const startTime = Date.now();
    const endValue = value;

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayValue(Math.round(endValue * eased));

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [value]);

  return <span>{prefix}{formatCurrency(displayValue)}{suffix}</span>;
}

export default function ResultsScreen({ totalValue, incomeIndex, onContinue }: ResultsScreenProps) {
  const { playSuccessSound, playClickSound } = useSound();
  
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    const timer = setTimeout(() => playSuccessSound(), 300);
    return () => clearTimeout(timer);
  }, [playSuccessSound]);
  
  const handleContinue = () => {
    playClickSound();
    onContinue();
  };

  const controlLevel = getControlLevel(totalValue, incomeIndex);
  const sixMonthValue = totalValue * 6;
  const savingsValue = Math.round(totalValue * 0.7);
  const incomeRange = incomeRanges[incomeIndex];

  const stats = [
    {
      icon: AlertTriangle,
      label: 'Vazamento Mensal',
      value: totalValue,
      prefix: '-',
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-100'
    },
    {
      icon: TrendingUp,
      label: 'Projeção 6 Meses',
      value: sixMonthValue,
      prefix: '-',
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      borderColor: 'border-orange-100'
    },
    {
      icon: PiggyBank,
      label: 'Economia Possível',
      value: savingsValue,
      prefix: '+',
      suffix: '/mês',
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
      borderColor: 'border-emerald-100'
    },
    {
      icon: BarChart3,
      label: 'Nível de Vazamento',
      textValue: controlLevel?.level ?? 'N/A',
      color: controlLevel?.level === 'Baixo' ? 'text-green-600' :
             controlLevel?.level === 'Médio' ? 'text-yellow-600' : 'text-red-600',
      bgColor: controlLevel?.level === 'Baixo' ? 'bg-green-50' :
               controlLevel?.level === 'Médio' ? 'bg-yellow-50' : 'bg-red-50',
      borderColor: controlLevel?.level === 'Baixo' ? 'border-green-100' :
                   controlLevel?.level === 'Médio' ? 'border-yellow-100' : 'border-red-100'
    }
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen flex items-center justify-center px-4 py-4"
    >
      <div className="max-w-lg w-full">
        {/* Header compacto */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-center mb-4"
        >
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 shadow-lg shadow-emerald-500/30 mb-3">
            <Target className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-xl md:text-2xl font-bold text-slate-800 mb-1">
            Diagnóstico Concluído! 🎯
          </h1>
          <p className="text-slate-500 text-sm">
            Com base na sua faixa de renda ({incomeRange?.text}), identificamos vazamentos de aproximadamente:
          </p>
        </motion.div>

        {/* Card principal compacto */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="bg-gradient-to-br from-red-100 to-orange-100 rounded-xl p-4 mb-4 border border-red-200"
        >
          <p className="text-slate-600 text-xs mb-1">Estimativa de desperdício mensal</p>
          <div className="text-3xl md:text-4xl font-bold text-red-600">
            <AnimatedValue value={totalValue} prefix="-" />
          </div>
          <p className="text-slate-500 text-[10px] mt-1">*Baseado nas suas respostas e perfil financeiro</p>
        </motion.div>

        {/* Grid 2x2 compacto */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="grid grid-cols-2 gap-2 mb-4"
        >
          {(stats ?? []).map((stat, index) => {
            const Icon = stat?.icon ?? BarChart3;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 + index * 0.1 }}
                className={`${stat?.bgColor ?? 'bg-white'} rounded-lg p-3 border ${stat?.borderColor ?? 'border-slate-200'}`}
              >
                <Icon className={`w-4 h-4 ${stat?.color ?? 'text-slate-600'} mb-1`} />
                <p className="text-slate-500 text-[10px] mb-0.5">{stat?.label}</p>
                <p className={`font-bold text-base ${stat?.color ?? 'text-slate-800'}`}>
                  {stat?.textValue ?? (
                    <AnimatedValue value={stat?.value ?? 0} prefix={stat?.prefix ?? ''} suffix={stat?.suffix ?? ''} />
                  )}
                </p>
              </motion.div>
            );
          })}
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 1 }}
          className="text-center"
        >
          <p className="text-slate-500 text-sm mb-3">
            Seu painel financeiro personalizado está pronto...
          </p>
          <motion.button
            whileHover={{ scale: 1.02, boxShadow: '0 20px 40px rgba(16, 185, 129, 0.3)' }}
            whileTap={{ scale: 0.98 }}
            onClick={handleContinue}
            className="w-full py-4 bg-gradient-to-r from-emerald-500 to-green-600 text-white font-semibold text-lg rounded-xl shadow-lg shadow-emerald-500/30 flex items-center justify-center gap-2 hover:from-emerald-600 hover:to-green-700 transition-all"
          >
            Ver meu diagnóstico completo
            <ChevronRight className="w-5 h-5" />
          </motion.button>
        </motion.div>
      </div>
    </motion.div>
  );
}
