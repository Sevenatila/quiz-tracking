'use client';

import { useEffect, useCallback, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, ShieldCheck, ChevronDown, Zap, Clock, Infinity, Star, CheckCircle } from 'lucide-react';
import Image from 'next/image';
import { formatCurrency } from '@/lib/quiz-data';
import { useTracking } from '@/hooks/use-tracking';
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

export function OfferScreen({ totalValue }: OfferScreenProps) {
  const perdaMensal = totalValue;
  const perdaAnual = totalValue * 12;
  const { trackStep } = useTracking();
  const router = useRouter();
  const [openFAQ, setOpenFAQ] = useState<number | null>(null);
  const ctaRef = useRef<HTMLAnchorElement>(null);
  const [timeLeft, setTimeLeft] = useState(15 * 60); // 15 minutos em segundos
  const [checkoutUrl, setCheckoutUrl] = useState('https://checkout.planilhaorganizacaofinanceira.online/VCCL1O8SCPPL');

  useEffect(() => {
    const sid = localStorage.getItem('quiz_session_id');
    if (sid) {
      setCheckoutUrl(`https://checkout.planilhaorganizacaofinanceira.online/VCCL1O8SCPPL?src=${sid}`);
    }
  }, []);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Adicionar script UTM
    const script = document.createElement('script');
    script.src = 'https://cdn.utmify.com.br/scripts/utms/latest.js';
    script.setAttribute('data-utmify-prevent-xcod-sck', '');
    script.setAttribute('data-utmify-prevent-subids', '');
    script.async = true;
    script.defer = true;
    document.head.appendChild(script);

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
          router.push('/back-redirect' + document.location.search);
        }, 1);
      };

      window.addEventListener('popstate', handlePopState);

      return () => {
        window.removeEventListener('popstate', handlePopState);
      };
    };

    const cleanupBackRedirect = setBackRedirect('/back-redirect');

    return () => {
      // Cleanup - remover script quando componente desmontar
      const existingScript = document.querySelector('script[src="https://cdn.utmify.com.br/scripts/utms/latest.js"]');
      if (existingScript) {
        document.head.removeChild(existingScript);
      }
      // Cleanup back redirect
      if (cleanupBackRedirect) cleanupBackRedirect();
    };
  }, []);


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

  const handleOfferClick = useCallback(() => {
    trackStep('offer', { clickedOffer: true, estimatedLoss: totalValue });
  }, [trackStep, totalValue]);

  const scrollToCTA = () => {
    ctaRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  const beneficios = [
    'Registra todos os seus ganhos e gastos',
    'Identifica seus "gastos invisíveis"',
    'Controla suas dívidas e pagamentos',
    'Planeja suas economias mês a mês',
    'Visualiza sua situação financeira completa',
  ];

  const faqs = [
    {
      question: 'Preciso ter experiência com planilhas?',
      answer: 'Não, a planilha foi feita para ser super fácil de usar. Você só precisa colocar seus números e ela faz todo o trabalho por você.'
    },
    {
      question: 'Onde posso usar?',
      answer: 'Você usa no Google Sheets, que é 100% gratuito. Funciona no computador, tablet ou celular.'
    },
    {
      question: 'Funciona no Windows e Mac?',
      answer: 'Sim! Como funciona pelo Google Sheets no navegador, funciona perfeitamente em qualquer sistema operacional.'
    }
  ];

  const reviews = [
    {
      name: 'Lucas M.',
      image: '/review-1.jpg',
      comment: 'Eu nem imaginava que estava perdendo tanto dinheiro. A planilha me mostrou exatamente onde estava o problema. Em 2 meses já economizei mais de R$ 800!'
    },
    {
      name: 'Fernanda S.',
      image: '/review-2.jpg',
      comment: 'Super fácil de usar! Finalmente consegui organizar minhas finanças sem precisar de um contador. Recomendo demais!'
    },
    {
      name: 'Rafael G.',
      image: '/review-3.jpg',
      comment: 'Melhor investimento que fiz. Agora sei exatamente pra onde vai cada centavo do meu salário. Deveria ter começado antes!'
    }
  ];

  return (
    <div className="min-h-screen">

      <div className="max-w-lg mx-auto px-6 py-12 space-y-12">
        
        {/* Bloco 1 — Dor/Impacto */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center space-y-6"
        >
          <h1 className="text-3xl md:text-4xl font-bold leading-tight text-slate-900">
            Você está <span className="text-red-600">queimando dinheiro</span> todo mês.
          </h1>
          
          <div className="bg-white border border-slate-200 rounded-2xl p-6 text-center space-y-4 shadow-sm">
            <div>
              <span className="text-4xl md:text-5xl font-bold text-red-600">
                -{formatCurrency(perdaMensal)}
              </span>
              <p className="text-slate-500 mt-1">por mês</p>
            </div>
            <div className="w-16 h-px bg-slate-200 mx-auto" />
            <div>
              <span className="text-4xl md:text-5xl font-bold text-red-600">
                -{formatCurrency(perdaAnual)}
              </span>
              <p className="text-slate-500 mt-1">por ano jogado fora</p>
            </div>
          </div>

          {/* Botão da primeira dobra */}
          <motion.button
            onClick={scrollToCTA}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full py-4 px-8 bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-lg rounded-xl text-center transition-colors shadow-lg shadow-emerald-500/30"
          >
            Quero a planilha
          </motion.button>
        </motion.section>

        {/* Bloco 2 — Solução + Mockups */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="space-y-6"
        >
          <h2 className="text-2xl md:text-3xl font-bold text-center text-slate-900">
            A Planilha de Finanças Pessoais
          </h2>
          <p className="text-center text-slate-600">
            Tudo que você precisa para tomar o controle do seu dinheiro:
          </p>
          
          {/* Mockup visual */}
          <div className="flex justify-center">
            <Image
              src="/planilha-mockup.webp"
              alt="Planilha de organização e controle financeiro"
              width={400}
              height={300}
              className="rounded-2xl"
              priority
            />
          </div>

          {/* Lista de benefícios */}
          <ul className="space-y-3">
            {beneficios.map((beneficio, index) => (
              <motion.li
                key={index}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 0.2 + index * 0.1 }}
                className="flex items-start gap-3"
              >
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center mt-0.5">
                  <Check className="w-4 h-4 text-emerald-600" />
                </div>
                <span className="text-slate-700">{beneficio}</span>
              </motion.li>
            ))}
          </ul>
        </motion.section>

        {/* Bloco 3 — Badges de valor */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
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
                <p className="font-semibold text-slate-800">PAGAMENTO ÚNICO</p>
                <p className="text-sm text-slate-500">Sem assinaturas ou taxas escondidas</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center">
                <Clock className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <p className="font-semibold text-slate-800">ENTREGA IMEDIATA</p>
                <p className="text-sm text-slate-500">Acesso instantâneo após o pagamento</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <p className="font-semibold text-slate-800">SEM COMPLICAÇÃO</p>
                <p className="text-sm text-slate-500">Simples como anotar em um caderno</p>
              </div>
            </div>
          </div>
        </motion.section>

        {/* Bloco 4 — Preço com desconto */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-center space-y-4"
        >
          <h3 className="text-2xl font-bold text-slate-900">
            Oferta especial para você
          </h3>

          {/* Contador Regressivo */}
          <motion.div
            animate={{ scale: timeLeft <= 60 ? [1, 1.05, 1] : 1 }}
            transition={{ duration: 0.5, repeat: timeLeft <= 60 ? 999 : 0 }}
            className={`inline-flex items-center gap-2 px-4 py-3 rounded-xl ${
              timeLeft <= 60 ? 'bg-red-100 border-2 border-red-500' : 'bg-orange-100 border-2 border-orange-500'
            }`}
          >
            <Clock className={`w-5 h-5 ${timeLeft <= 60 ? 'text-red-600' : 'text-orange-600'}`} />
            <div>
              <p className="text-xs text-slate-600 font-medium">Oferta expira em:</p>
              <p className={`text-2xl font-bold ${timeLeft <= 60 ? 'text-red-600' : 'text-orange-600'}`}>
                {formatTime(timeLeft)}
              </p>
            </div>
          </motion.div>

          {/* Comparativo ANTES/AGORA */}
          <div className="grid grid-cols-2 gap-4 mt-6">
            <div className="bg-white border border-slate-200 rounded-xl p-4">
              <p className="text-sm text-slate-500 mb-1">ANTES</p>
              <p className="text-sm text-slate-400">Sem a oferta</p>
              <p className="text-2xl font-bold text-slate-400 line-through mt-2">R$ 97</p>
            </div>
            <div className="bg-emerald-50 border-2 border-emerald-500 rounded-xl p-4">
              <p className="text-sm text-emerald-600 font-semibold mb-1">AGORA</p>
              <p className="text-sm text-emerald-600">70% DESCONTO</p>
              <p className="text-3xl font-bold text-slate-900 mt-2">R$ 29,90</p>
            </div>
          </div>
          
          <p className="text-sm text-slate-500">
            Menos do que você perde em uma semana.
          </p>
        </motion.section>

        {/* Bloco 5 — CTA */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="space-y-4"
        >
          <motion.a
            ref={ctaRef}
            href={checkoutUrl}
            onClick={handleOfferClick}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="block w-full py-5 px-8 bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-lg rounded-xl text-center transition-colors shadow-lg shadow-emerald-500/30"
          >
            Quero a planilha
          </motion.a>
          
          <div className="flex items-center justify-center gap-2 text-slate-500 text-sm">
            <ShieldCheck className="w-4 h-4" />
            <span>Garantia de 30 dias. Se não funcionar, devolvemos seu dinheiro.</span>
          </div>
        </motion.section>

        {/* Bloco 6 — Reviews */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
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
                transition={{ duration: 0.4, delay: 0.7 + index * 0.1 }}
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
                      loading="eager"
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

        {/* Bloco 7 — FAQs */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.9 }}
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
          transition={{ duration: 0.6, delay: 0.7 }}
          className="text-center text-xs text-slate-400 pb-8"
        >
          <p>Aviso importante sobre este produto</p>
          <p className="mt-2">
            Este site não oferece contas de poupança, empréstimos, oportunidades de investimento ou assessoria financeira. 
            Vendemos apenas uma planilha de finanças pessoais em formato de planilha (arquivo digital editável) 
            para que você mesmo registre e organize seus ganhos, gastos, economias e pagamentos.
          </p>
        </motion.section>

      </div>
    </div>
  );
}
