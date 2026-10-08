'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Clock, CheckCircle } from 'lucide-react';
import { formatCurrency } from '@/lib/quiz-data';
import { useTracking } from '@/hooks/use-tracking';

export default function BackRedirectPage() {
  const [timeLeft, setTimeLeft] = useState(10 * 60); // 10 minutos em segundos
  const { trackStep } = useTracking();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Track que usuário chegou na página de back redirect
    trackStep('backRedirect', { source: 'exit_intent' });
  }, [trackStep]);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50">
      <div className="max-w-2xl mx-auto px-6 py-12">

        {/* Header de emergência */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-6 mb-12"
        >
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto">
            <span className="text-4xl">⚠️</span>
          </div>

          <h1 className="text-3xl md:text-4xl font-bold text-slate-900 leading-tight">
            <span className="text-red-600">ESPERE!</span> Não vá embora ainda...
          </h1>

          <p className="text-lg text-slate-700">
            Você está prestes a perder a <span className="font-bold text-red-600">única chance</span> de parar de queimar dinheiro todo mês!
          </p>
        </motion.div>

        {/* Oferta especial de última chance */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl shadow-2xl border-4 border-red-500 p-8 mb-8"
        >
          <div className="text-center space-y-6">
            <div className="bg-red-100 rounded-xl p-4">
              <h2 className="text-2xl font-bold text-red-700 mb-2">
                🎁 OFERTA FINAL DE EMERGÊNCIA
              </h2>
              <p className="text-red-600">Esta é sua última oportunidade!</p>
            </div>

            {/* Contador regressivo */}
            <motion.div
              animate={{ scale: timeLeft <= 120 ? [1, 1.05, 1] : 1 }}
              transition={{ duration: 0.5, repeat: timeLeft <= 120 ? 999 : 0 }}
              className={`inline-flex items-center gap-3 px-6 py-4 rounded-xl ${
                timeLeft <= 120 ? 'bg-red-100 border-2 border-red-500' : 'bg-orange-100 border-2 border-orange-500'
              }`}
            >
              <Clock className={`w-6 h-6 ${timeLeft <= 120 ? 'text-red-600' : 'text-orange-600'}`} />
              <div>
                <p className="text-sm text-slate-600 font-medium">Esta oferta expira em:</p>
                <p className={`text-3xl font-bold ${timeLeft <= 120 ? 'text-red-600' : 'text-orange-600'}`}>
                  {formatTime(timeLeft)}
                </p>
              </div>
            </motion.div>

            {/* Comparativo de preços */}
            <div className="bg-gradient-to-r from-emerald-50 to-green-50 border-3 border-emerald-500 rounded-2xl p-6">
              <p className="text-emerald-700 font-bold mb-4">💰 DESCONTO MÁXIMO LIBERADO</p>

              <div className="flex items-center justify-center gap-6 mb-4">
                <div className="text-center">
                  <p className="text-sm text-slate-500 mb-1">PREÇO NORMAL</p>
                  <p className="text-2xl font-bold text-slate-400 line-through">R$ 97,00</p>
                </div>

                <div className="text-4xl text-slate-400">→</div>

                <div className="text-center">
                  <p className="text-sm text-emerald-700 font-bold mb-1">PREÇO HOJE</p>
                  <p className="text-4xl font-bold text-emerald-600">R$ 19,90</p>
                </div>
              </div>

              <div className="bg-emerald-100 rounded-lg p-3">
                <p className="text-emerald-800 font-bold text-lg">79% DE DESCONTO</p>
                <p className="text-sm text-emerald-700">Economia de R$ 77,10</p>
              </div>
            </div>

            {/* CTA Principal */}
            <motion.a
              href="https://checkout.planilhaorganizacaofinanceira.online/VCCL1O8SCMGO"
                            whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="block w-full py-6 px-8 bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xl rounded-xl text-center transition-colors shadow-lg shadow-emerald-500/30"
            >
              🚀 SIM! QUERO APROVEITAR ESTA OFERTA
            </motion.a>

            <p className="text-sm text-slate-500">
              ✅ Acesso instantâneo • ✅ Garantia de 30 dias • ✅ Pagamento único
            </p>
          </div>
        </motion.div>

        {/* Urgência e escassez */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-slate-50 rounded-xl p-6 border border-slate-200"
        >
          <h3 className="text-xl font-bold text-center text-slate-900 mb-4">
            Por que você PRECISA agir agora?
          </h3>

          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <CheckCircle className="w-6 h-6 text-red-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-slate-800">Esta é sua última chance</p>
                <p className="text-sm text-slate-600">Se você sair agora, não conseguirá mais este desconto</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <CheckCircle className="w-6 h-6 text-red-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-slate-800">Você continuará perdendo dinheiro</p>
                <p className="text-sm text-slate-600">Sem controle financeiro, suas perdas só aumentam</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <CheckCircle className="w-6 h-6 text-red-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-slate-800">Oferta válida apenas hoje</p>
                <p className="text-sm text-slate-600">Amanhã volta ao preço normal de R$ 97,00</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* CTA Secundário */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="text-center mt-8"
        >
          <motion.a
            href="https://checkout.planilhaorganizacaofinanceira.online/VCCL1O8SCMGO"
            target="_blank"
            rel="noopener noreferrer"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="inline-block py-4 px-8 bg-red-500 hover:bg-red-600 text-white font-bold text-lg rounded-xl transition-colors shadow-lg"
          >
            Não quero perder esta oportunidade!
          </motion.a>
        </motion.div>

      </div>
    </div>
  );
}