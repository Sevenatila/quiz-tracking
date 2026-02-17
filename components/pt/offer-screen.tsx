'use client';

import { useEffect, useCallback, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Check, ShieldCheck, ChevronDown, Zap, Clock, Star, CheckCircle, Play } from 'lucide-react';
import Image from 'next/image';
import { formatCurrency } from '@/lib/quiz-data';
import { useTracking } from '@/hooks/use-tracking';
import { useSound } from '@/hooks/use-sound';

interface OfferScreenProps {
  totalValue: number;
  onRestart?: () => void;
}

interface FAQItemProps {
  question: string;
  answer: string;
  isOpen: boolean;
  onClick: () => void;
}

function VideoPlayer({ src }: { src: string }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const handlePlay = () => {
    if (videoRef.current) {
      videoRef.current.play();
      setIsPlaying(true);
    }
  };

  const handleVideoClick = () => {
    if (videoRef.current) {
      if (videoRef.current.paused) {
        videoRef.current.play();
        setIsPlaying(true);
      } else {
        videoRef.current.pause();
        setIsPlaying(false);
      }
    }
  };

  return (
    <div className="flex justify-center">
      <div className="relative w-full max-w-[400px] rounded-2xl overflow-hidden border-2 border-emerald-300 shadow-xl">
        <video
          ref={videoRef}
          src={src}
          playsInline
          preload="metadata"
          onClick={handleVideoClick}
          onEnded={() => setIsPlaying(false)}
          className="w-full cursor-pointer"
        />
        {!isPlaying && (
          <div
            onClick={handlePlay}
            className="absolute inset-0 flex items-center justify-center bg-black/30 cursor-pointer"
          >
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="w-20 h-20 rounded-full bg-emerald-500 flex items-center justify-center shadow-2xl shadow-emerald-500/50"
            >
              <Play className="w-10 h-10 text-white ml-1" fill="white" />
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
}

function FAQItem({ question, answer, isOpen, onClick }: FAQItemProps) {
  return (
    <div className="border border-slate-200 rounded-xl overflow-hidden">
      <button
        onClick={onClick}
        className="w-full flex items-center justify-between p-4 text-left bg-white hover:bg-slate-50 transition-colors"
      >
        <span className="font-medium text-slate-800">{question}</span>
        <ChevronDown className={`w-5 h-5 text-slate-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="px-4 pb-4 text-slate-600"
        >
          {answer}
        </motion.div>
      )}
    </div>
  );
}

export function OfferScreenPT({ totalValue }: OfferScreenProps) {
  const perdaMensal = totalValue;
  const perdaAnual = totalValue * 12;
  const { trackStep } = useTracking();
  const { playTickSound } = useSound();
  const [openFAQ, setOpenFAQ] = useState<number | null>(null);
  const ctaRef = useRef<HTMLAnchorElement>(null);
  const [timeLeft, setTimeLeft] = useState(15 * 60);
  const [checkoutUrl, setCheckoutUrl] = useState('https://pay.wiapy.com/Lfuk9cRXOe?payment_method=pix');

  useEffect(() => {
    const sid = localStorage.getItem('quiz_session_id');
    if (sid) {
      setCheckoutUrl(`https://pay.wiapy.com/Lfuk9cRXOe?payment_method=pix&src=${sid}`);
    }
  }, []);

  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      playTickSound();
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [playTickSound]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleOfferClick = useCallback(() => {
    trackStep('offer_click_pt', { clickedOffer: true, estimatedLoss: totalValue });
  }, [trackStep, totalValue]);

  const scrollToCTA = () => {
    ctaRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  const beneficios = [
    'Registra todos os seus ganhos e gastos',
    'Identifica seus "gastos fantasma"',
    'Controla suas d\u00edvidas e pagamentos',
    'Planeja suas economias m\u00eas a m\u00eas',
    'Visualiza sua situa\u00e7\u00e3o financeira completa',
  ];

  const faqs = [
    {
      question: 'Preciso ter experi\u00eancia com planilhas?',
      answer: 'N\u00e3o, a planilha foi feita para ser super f\u00e1cil de usar. Voc\u00ea s\u00f3 precisa colocar seus n\u00fameros e ela faz todo o trabalho por voc\u00ea.'
    },
    {
      question: 'Onde posso usar?',
      answer: 'Voc\u00ea usa no Google Sheets, que \u00e9 100% gratuito. Funciona no computador, tablet ou celular.'
    },
    {
      question: 'Funciona no Windows e Mac?',
      answer: 'Sim! Como funciona pelo Google Sheets no navegador, funciona perfeitamente em qualquer sistema operacional.'
    },
    {
      question: 'Posso pagar com PIX?',
      answer: 'Sim! Aceitamos PIX e cart\u00e3o de cr\u00e9dito. O pagamento via PIX \u00e9 instant\u00e2neo e voc\u00ea recebe acesso imediato.'
    }
  ];

  const reviews = [
    {
      name: 'Lucas M.',
      image: '/review-1.jpg',
      comment: 'Eu nem imaginava que estava perdendo tanto dinheiro. A planilha me mostrou exatamente onde estava o problema. Em 2 meses j\u00e1 economizei mais de R$ 800!'
    },
    {
      name: 'Fernanda S.',
      image: '/review-2.jpg',
      comment: 'Super f\u00e1cil de usar! Finalmente consegui organizar minhas finan\u00e7as sem precisar de um contador. Recomendo demais!'
    },
    {
      name: 'Carolina R.',
      image: '/review-3.jpg',
      comment: 'Melhor investimento que fiz. Agora sei exatamente pra onde vai cada centavo do meu sal\u00e1rio. Deveria ter come\u00e7ado antes!'
    }
  ];

  return (
    <div className="min-h-screen">

      {/* Cronômetro fixo no topo */}
      <div className={`fixed top-0 left-0 right-0 z-50 ${timeLeft <= 60 ? 'bg-red-600' : 'bg-gradient-to-r from-orange-500 to-red-500'} shadow-lg`}>
        <div className="max-w-lg mx-auto flex items-center justify-center gap-3 py-2.5 px-4">
          <Clock className="w-5 h-5 text-white animate-pulse" />
          <span className="text-white font-semibold text-sm">Oferta expira em:</span>
          <span className="text-white font-bold text-xl tracking-wider">{formatTime(timeLeft)}</span>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-6 pt-20 pb-12 space-y-12">

        {/* Bloco 1 - Dor/Impacto */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center space-y-6"
        >
          <h1 className="text-3xl md:text-4xl font-bold leading-tight text-slate-900">
            Voc&ecirc; est&aacute; <span className="text-red-600">queimando dinheiro</span> todo m&ecirc;s.
          </h1>

          <div className="bg-white border border-slate-200 rounded-2xl p-6 text-center space-y-4 shadow-sm">
            <div>
              <span className="text-4xl md:text-5xl font-bold text-red-600">
                -{formatCurrency(perdaMensal)}
              </span>
              <p className="text-slate-500 mt-1">por m&ecirc;s</p>
            </div>
            <div className="w-16 h-px bg-slate-200 mx-auto" />
            <div>
              <span className="text-4xl md:text-5xl font-bold text-red-600">
                -{formatCurrency(perdaAnual)}
              </span>
              <p className="text-slate-500 mt-1">por ano jogado fora</p>
            </div>
          </div>
        </motion.section>

        {/* Bloco 2 - Solucao + Mockups */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.05 }}
          className="space-y-6"
        >
          <h2 className="text-2xl md:text-3xl font-bold text-center text-slate-900">
            Veja como funciona em 1 minuto
          </h2>
          <p className="text-center text-slate-600">
            Tudo que voc&ecirc; precisa para tomar o controle do seu dinheiro:
          </p>

          {/* Vídeo demonstrativo */}
          <VideoPlayer src="/como-funciona-planilha-compressed.mp4" />
        </motion.section>

        {/* Bloco 3 - Badges de valor */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="bg-slate-50 rounded-2xl p-6 border border-slate-200"
        >
          <h3 className="text-xl font-bold text-center text-slate-900 mb-6">
            Garanta a sua agora!
          </h3>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center">
                <Zap className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <p className="font-semibold text-slate-800">PAGAMENTO &Uacute;NICO</p>
                <p className="text-sm text-slate-500">Sem assinaturas ou taxas escondidas</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center">
                <Clock className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <p className="font-semibold text-slate-800">ENTREGA IMEDIATA</p>
                <p className="text-sm text-slate-500">Acesso instant&acirc;neo ap&oacute;s o pagamento</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <p className="font-semibold text-slate-800">PIX OU CART&Atilde;O</p>
                <p className="text-sm text-slate-500">Pague como preferir, de forma segura</p>
              </div>
            </div>
          </div>
        </motion.section>

        {/* Bloco 4 - Preco com desconto */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.15 }}
          className="text-center space-y-4"
        >
          <h3 className="text-2xl font-bold text-slate-900">
            Oferta especial para voc&ecirc;
          </h3>

          {/* Contador Regressivo */}
          {/* Comparativo ANTES/AGORA */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white border border-slate-200 rounded-xl p-4">
              <p className="text-sm text-slate-500 mb-1">ANTES</p>
              <p className="text-sm text-slate-400">Sem a oferta</p>
              <p className="text-2xl font-bold text-slate-400 line-through mt-2">R$ 97</p>
            </div>
            <div className="bg-emerald-50 border-2 border-emerald-500 rounded-xl p-4">
              <p className="text-sm text-emerald-600 font-semibold mb-1">AGORA</p>
              <p className="text-sm text-emerald-600">80% DESCONTO</p>
              <p className="text-3xl font-bold text-slate-900 mt-2">R$ 19,90</p>
            </div>
          </div>

          <p className="text-sm text-slate-500">
            Menos do que voc&ecirc; perde em uma semana.
          </p>
        </motion.section>

        {/* Bloco 5 - CTA */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="space-y-4"
        >
          <motion.a
            ref={ctaRef}
            href={checkoutUrl}
            onClick={handleOfferClick}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="block w-full py-5 px-8 bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-lg rounded-xl transition-colors shadow-lg shadow-emerald-500/30 text-center"
          >
            Quero a planilha por R$ 19,90
          </motion.a>

          <div className="flex items-center justify-center gap-2 text-slate-500 text-sm">
            <ShieldCheck className="w-4 h-4" />
            <span>Garantia de 30 dias. Se n&atilde;o funcionar, devolvemos seu dinheiro.</span>
          </div>
        </motion.section>

        {/* Bloco 6 - Reviews */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.25 }}
          className="space-y-6"
        >
          <h3 className="text-xl font-bold text-center text-slate-900">
            O que nossos clientes dizem
          </h3>
          <div className="space-y-4">
            {reviews.map((review, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.1 + index * 0.05 }}
                className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm"
              >
                <div className="flex items-start gap-3">
                  <div className="relative w-12 h-12 rounded-full overflow-hidden flex-shrink-0">
                    <Image
                      src={review.image}
                      alt={review.name}
                      fill
                      sizes="48px"
                      className="object-cover"
                      loading="lazy"
                    />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-slate-800">{review.name}</span>
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        ))}
                      </div>
                    </div>
                    <p className="text-sm text-slate-600">{review.comment}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Bloco 7 - FAQs */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
          className="space-y-4"
        >
          <h3 className="text-xl font-bold text-center text-slate-900">
            Perguntas Frequentes
          </h3>
          <div className="space-y-3">
            {faqs.map((faq, index) => (
              <FAQItem
                key={index}
                question={faq.question}
                answer={faq.answer}
                isOpen={openFAQ === index}
                onClick={() => setOpenFAQ(openFAQ === index ? null : index)}
              />
            ))}
          </div>
        </motion.section>

        {/* Aviso legal */}
        <motion.section
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.3 }}
          className="text-center text-xs text-slate-400 pb-8"
        >
          <p>Aviso importante sobre este produto</p>
          <p className="mt-2">
            Este site n&atilde;o oferece contas de poupan&ccedil;a, empr&eacute;stimos, oportunidades de investimento ou assessoria financeira.
            Vendemos apenas uma planilha de finan&ccedil;as pessoais em formato de planilha (arquivo digital edit&aacute;vel)
            para que voc&ecirc; mesmo registre e organize seus ganhos, gastos, economias e pagamentos.
          </p>
        </motion.section>

      </div>
    </div>
  );
}
