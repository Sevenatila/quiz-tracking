'use client';

import { useEffect, useCallback, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Check, ShieldCheck, ChevronDown, Clock, Star, Play } from 'lucide-react';
import Image from 'next/image';
import { formatCurrencyES } from '@/lib/quiz-data-es';
import { useTracking } from '@/hooks/use-tracking';
import { useSound } from '@/hooks/use-sound';
import { useRouter } from 'next/navigation';

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

export function OfferScreenES({ totalValue }: OfferScreenProps) {
  const perdaMensal = totalValue;
  const perdaAnual = totalValue * 12;
  const { trackStep } = useTracking();
  const { playTickSound } = useSound();
  const router = useRouter();
  const [openFAQ, setOpenFAQ] = useState<number | null>(null);
  const ctaRef = useRef<HTMLAnchorElement>(null);
  const [timeLeft, setTimeLeft] = useState(15 * 60); // 15 minutos en segundos
  const [checkoutUrl, setCheckoutUrl] = useState('https://checkout.centerpag.com/pay/PPU38CQ6K3M?');

  useEffect(() => {
    const sid = localStorage.getItem('quiz_session_id');
    if (sid) {
      setCheckoutUrl(`https://checkout.centerpag.com/pay/PPU38CQ6K3M?src=${sid}`);
    }
  }, []);

  useEffect(() => {
    window.scrollTo({ top: 0 });

    // Back redirect code
    const setBackRedirect = (url: string) => {
      let urlBackRedirect = url;
      urlBackRedirect = urlBackRedirect.trim() +
        (urlBackRedirect.indexOf('?') > 0 ? '&' : '?') +
        document.location.search.replace('?', '').toString();

      window.history.pushState({}, '', location.href);
      window.history.pushState({}, '', location.href);
      window.history.pushState({}, '', location.href);

      const handlePopState = () => {
        console.log('onpopstate', urlBackRedirect);
        setTimeout(() => {
          router.push('/es/back-redirect' + document.location.search);
        }, 1);
      };

      window.addEventListener('popstate', handlePopState);

      return () => {
        window.removeEventListener('popstate', handlePopState);
      };
    };

    const cleanupBackRedirect = setBackRedirect('/es/back-redirect');

    return () => {
      if (cleanupBackRedirect) cleanupBackRedirect();
    };
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
    trackStep('offer', { clickedOffer: true, estimatedLoss: totalValue });
  }, [trackStep, totalValue]);

  const scrollToCTA = () => {
    ctaRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  const beneficios = [
    'Registra todos tus ingresos y gastos',
    'Identifica tus "gastos hormiga"',
    'Controla tus deudas y pagos',
    'Planifica tus ahorros mes a mes',
    'Visualiza tu situación financiera completa',
  ];

  const faqs = [
    {
      question: '¿Necesito experiencia con hojas de cálculo?',
      answer: 'No, la plantilla está diseñada para ser súper fácil de usar. Solo necesitas ingresar tus números y ella hace todo el trabajo por ti.'
    },
    {
      question: '¿En dónde la puedo usar?',
      answer: 'La usas en Google Sheets, que es 100% gratuito. Funciona en computadora, tablet o celular.'
    },
    {
      question: '¿Es compatible con Windows y Mac?',
      answer: '¡Sí! Como funciona desde Google Sheets en el navegador, funciona perfectamente en cualquier sistema operativo.'
    }
  ];

  const reviews = [
    {
      name: 'Lucas M.',
      image: '/review-1.jpg',
      comment: 'No tenía idea de que estaba perdiendo tanto dinero. La plantilla me mostró exactamente dónde estaba el problema. ¡En 2 meses ya ahorré más de $80!'
    },
    {
      name: 'Fernanda S.',
      image: '/review-2.jpg',
      comment: '¡Súper fácil de usar! Por fin pude organizar mis finanzas sin necesitar un contador. ¡Lo recomiendo mucho!'
    },
    {
      name: 'Rafael G.',
      image: '/review-3.jpg',
      comment: 'Mejor inversión que he hecho. Ahora sé exactamente a dónde va cada centavo de mi sueldo. ¡Debí haberlo empezado antes!'
    }
  ];

  return (
    <div className="min-h-screen">

      {/* Cronómetro fijo en el tope */}
      <div className={`fixed top-0 left-0 right-0 z-50 ${timeLeft <= 60 ? 'bg-red-600' : 'bg-gradient-to-r from-orange-500 to-red-500'} shadow-lg`}>
        <div className="max-w-lg mx-auto flex items-center justify-center gap-3 py-2.5 px-4">
          <Clock className="w-5 h-5 text-white animate-pulse" />
          <span className="text-white font-semibold text-sm">Oferta expira en:</span>
          <span className="text-white font-bold text-xl tracking-wider">{formatTime(timeLeft)}</span>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-6 pt-20 pb-12 space-y-12">
        
        {/* Bloque 1 — Dolor/Impacto */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center space-y-6"
        >
          <h1 className="text-3xl md:text-4xl font-bold leading-tight text-slate-900">
            Estás <span className="text-red-600">quemando dinero</span> cada mes.
          </h1>
          
          <div className="bg-white border border-slate-200 rounded-2xl p-6 text-center space-y-4 shadow-sm">
            <div>
              <span className="text-4xl md:text-5xl font-bold text-red-600">
                -{formatCurrencyES(perdaMensal)}
              </span>
              <p className="text-slate-500 mt-1">por mes</p>
            </div>
            <div className="w-16 h-px bg-slate-200 mx-auto" />
            <div>
              <span className="text-4xl md:text-5xl font-bold text-red-600">
                -{formatCurrencyES(perdaAnual)}
              </span>
              <p className="text-slate-500 mt-1">por año tirado a la basura</p>
            </div>
          </div>

        </motion.section>

        {/* Bloque 2 — Solución + Mockups */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.05 }}
          className="space-y-6"
        >
          <h2 className="text-2xl md:text-3xl font-bold text-center text-slate-900">
            Mira cómo funciona en 1 minuto
          </h2>
          <p className="text-center text-slate-600">
            Todo lo que necesitas para tomar el control de tu dinero:
          </p>
          
          {/* Vídeo demonstrativo */}
          <VideoPlayer src="/como-funciona-planilha-compressed.mp4" />
        </motion.section>


        {/* Bloque 4 — Precio con descuento */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.15 }}
          className="text-center space-y-4"
        >
          <h3 className="text-2xl font-bold text-slate-900">
            Oferta especial para ti
          </h3>

          {/* Comparativo ANTES/AHORA */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white border border-slate-200 rounded-xl p-4">
              <p className="text-sm text-slate-500 mb-1">ANTES</p>
              <p className="text-sm text-slate-400">Sin la oferta</p>
              <p className="text-2xl font-bold text-slate-400 line-through mt-2">$49 USD</p>
            </div>
            <div className="bg-emerald-50 border-2 border-emerald-500 rounded-xl p-4">
              <p className="text-sm text-emerald-600 font-semibold mb-1">AHORA</p>
              <p className="text-sm text-emerald-600">80% DESCUENTO</p>
              <p className="text-3xl font-bold text-slate-900 mt-2">$9.90 USD</p>
            </div>
          </div>
          
          <p className="text-sm text-slate-500">
            Menos de lo que pierdes en una semana.
          </p>
        </motion.section>

        {/* Bloque 5 — CTA */}
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
            Quiero la plantilla
          </motion.a>

          <div className="flex items-center justify-center gap-2 text-slate-500 text-sm">
            <ShieldCheck className="w-4 h-4" />
            <span>Garantía de 30 días. Si no funciona, te devolvemos tu dinero.</span>
          </div>
        </motion.section>

        {/* Bloque 6 — Reviews */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.25 }}
          className="space-y-6"
        >
          <h3 className="text-xl font-bold text-center text-slate-900">
            Lo que dicen nuestros clientes
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

        {/* Bloque 7 — FAQs */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
          className="space-y-4"
        >
          <h3 className="text-xl font-bold text-center text-slate-900">
            Preguntas Frecuentes
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
          <p>Aviso importante sobre este producto</p>
          <p className="mt-2">
            Este sitio no ofrece cuentas de ahorro, préstamos, oportunidades de inversión ni asesoría financiera. 
            Solo vendemos una plantilla de finanzas personales en formato de hoja de cálculo (archivo digital editable) 
            para que tú mismo registres y organices tus ingresos, gastos, ahorros y pagos.
          </p>
        </motion.section>

      </div>
    </div>
  );
}
