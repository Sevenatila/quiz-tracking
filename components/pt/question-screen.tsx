'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TrendingUp, CheckCircle, DollarSign, Sparkles } from 'lucide-react';
import { QuizQuestion, getControlLevel, formatCurrency, incomeRanges, calculateEstimatedValue } from '@/lib/quiz-data';
import { useSound } from '@/hooks/use-sound';

// Componente de animacao de moedas voando
function FlyingMoney({
  startPos,
  endPos,
  onComplete
}: {
  startPos: { x: number; y: number };
  endPos: { x: number; y: number };
  onComplete: () => void;
}) {
  const coins = [0, 1, 2, 3, 4];

  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      {coins.map((i) => (
        <motion.div
          key={i}
          initial={{
            x: startPos.x,
            y: startPos.y,
            scale: 0,
            opacity: 0
          }}
          animate={{
            x: endPos.x,
            y: endPos.y,
            scale: [0, 1.2, 1, 0.8],
            opacity: [0, 1, 1, 0]
          }}
          transition={{
            duration: 0.6,
            delay: i * 0.05,
            ease: "easeOut"
          }}
          onAnimationComplete={i === coins.length - 1 ? onComplete : undefined}
          className="absolute"
        >
          <div className="w-6 h-6 bg-gradient-to-br from-red-400 to-red-600 rounded-full flex items-center justify-center shadow-lg shadow-red-500/50">
            <DollarSign className="w-4 h-4 text-white" />
          </div>
        </motion.div>
      ))}
    </div>
  );
}

interface QuestionScreenProps {
  question: QuizQuestion;
  currentQuestion: number;
  totalQuestions: number;
  totalValue: number;
  incomeIndex: number;
  multipliers: number[];
  onAnswer: (optionIndex: number, multiplier: number) => void;
}

function AnimatedCounter({ value, prefix = '' }: { value: number; prefix?: string }) {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    const duration = 600;
    const startTime = Date.now();
    const startValue = displayValue;
    const endValue = value;

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const currentValue = Math.round(startValue + (endValue - startValue) * eased);
      setDisplayValue(currentValue);

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [value]);

  return <span>{prefix}{formatCurrency(displayValue)}</span>;
}

export default function QuestionScreenPT({
  question,
  currentQuestion,
  totalQuestions,
  totalValue,
  incomeIndex,
  multipliers,
  onAnswer
}: QuestionScreenProps) {
  const [feedback, setFeedback] = useState<string | null>(null);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [selectedQuestionId, setSelectedQuestionId] = useState<number | null>(null);
  const [displayValue, setDisplayValue] = useState(totalValue);
  const [flyingMoney, setFlyingMoney] = useState<{ start: { x: number; y: number }; end: { x: number; y: number } } | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const moneyTargetRef = useRef<HTMLDivElement>(null);

  const { playClickSound, playCoinSound } = useSound();

  useEffect(() => {
    setSelectedIndex(null);
    setSelectedQuestionId(null);
    setFeedback(null);
    setFlyingMoney(null);
    setIsTransitioning(false);
    setDisplayValue(totalValue);
  }, [question.id, totalValue]);

  useEffect(() => {
    if (!isTransitioning) {
      setDisplayValue(totalValue);
    }
  }, [totalValue, isTransitioning]);

  const progress = (currentQuestion / totalQuestions) * 100;
  const controlLevel = getControlLevel(displayValue, incomeIndex, currentQuestion);

  const showStats = !question.isIncomeQuestion && displayValue > 0;

  const handleSelect = (option: typeof question.options[0], index: number, event: React.MouseEvent<HTMLButtonElement>) => {
    if (isTransitioning) return;

    playClickSound();

    setIsTransitioning(true);
    setSelectedIndex(index);
    setSelectedQuestionId(question.id);
    setFeedback(option?.feedback ?? '');

    if (!question.isIncomeQuestion && moneyTargetRef.current) {
      setTimeout(() => playCoinSound(), 100);
      const buttonRect = event.currentTarget.getBoundingClientRect();
      const targetRect = moneyTargetRef.current.getBoundingClientRect();

      setFlyingMoney({
        start: {
          x: buttonRect.left + buttonRect.width / 2 - 12,
          y: buttonRect.top + buttonRect.height / 2 - 12
        },
        end: {
          x: targetRect.left + targetRect.width / 2 - 12,
          y: targetRect.top + targetRect.height / 2 - 12
        }
      });
    }

    if (!question.isIncomeQuestion) {
      const newMultipliers = [...multipliers, option?.percentageMultiplier ?? 1];
      const newValue = calculateEstimatedValue(incomeIndex, newMultipliers);
      setTimeout(() => {
        setDisplayValue(newValue);
      }, 300);
    }

    setTimeout(() => {
      onAnswer(index, option?.percentageMultiplier ?? 1);
    }, 600);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen flex flex-col px-4 py-6"
    >
      {/* Header com progresso */}
      <div className="max-w-lg w-full mx-auto mb-8">
        {/* Barra de Progresso */}
        <div className="mb-4">
          <div className="flex justify-between text-sm text-slate-500 mb-2">
            <span className="font-medium">Pergunta {currentQuestion} de {totalQuestions}</span>
            <span className="font-medium">{Math.round(progress)}%</span>
          </div>
          <div className="h-2.5 bg-slate-200 rounded-full overflow-hidden shadow-inner">
            <motion.div
              className="h-full bg-gradient-to-r from-blue-500 to-blue-600"
              initial={{ width: `${((currentQuestion - 1) / totalQuestions) * 100}%` }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>

        {/* Stats Cards */}
        {showStats && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-2 gap-3"
          >
            <div ref={moneyTargetRef} className="bg-white rounded-xl p-3 border border-slate-200 shadow-sm relative overflow-hidden">
              <div className="flex items-center gap-2 text-slate-500 text-xs mb-1">
                <DollarSign className="w-3 h-3" />
                <span>Gastos Fantasma</span>
              </div>
              <div className="text-red-600 font-bold text-lg">
                <AnimatedCounter value={displayValue} prefix="-" />
              </div>
              {flyingMoney && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: [0, 0.5, 0] }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                  className="absolute inset-0 bg-red-400/30"
                />
              )}
            </div>

            <div className="bg-white rounded-xl p-3 border border-slate-200 shadow-sm">
              <div className="flex items-center gap-2 text-slate-500 text-xs mb-1">
                <TrendingUp className="w-3 h-3" />
                <span>N&iacute;vel de Vazamento</span>
              </div>
              <div className={`font-bold text-lg ${
                controlLevel?.level === 'M\u00e9dio' ? 'text-yellow-600' :
                controlLevel?.level === 'Alto' ? 'text-red-600' : 'text-green-600'
              }`}>
                {controlLevel?.level ?? 'N/A'}
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Pergunta */}
      <div className="flex-1 flex items-center justify-center">
        <motion.div
          key={question?.id}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="max-w-lg w-full"
        >
          <h2 className="text-xl md:text-2xl font-semibold text-slate-800 text-center mb-2">
            {question?.question}
          </h2>
          {question?.subtitle && (
            <p className="text-slate-500 text-center mb-8">{question.subtitle}</p>
          )}

          <div className="space-y-3">
            {(question?.options ?? []).map((option, index) => {
              const isSelected = selectedIndex === index && selectedQuestionId === question.id;
              return (
                <motion.button
                  key={`${question.id}-${index}`}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  onClick={(e) => handleSelect(option, index, e)}
                  disabled={selectedIndex !== null}
                  className={`w-full p-4 rounded-xl text-left transition-all border-2 ${
                    isSelected
                      ? 'bg-blue-100 border-blue-500 text-blue-900 shadow-md'
                      : 'bg-white border-slate-200 text-slate-700 hover:border-blue-300 hover:bg-blue-50 shadow-sm'
                  } disabled:cursor-not-allowed`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {option?.emoji && <span className="text-xl">{option.emoji}</span>}
                      <span className="font-medium">{option?.text}</span>
                    </div>
                    {isSelected && (
                      <CheckCircle className="w-5 h-5 text-blue-500" />
                    )}
                  </div>
                </motion.button>
              );
            })}
          </div>

          {/* Feedback */}
          <AnimatePresence>
            {feedback && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="mt-6 flex items-center justify-center gap-2 text-emerald-600 font-medium bg-emerald-50 py-3 px-4 rounded-lg"
              >
                <Sparkles className="w-4 h-4" />
                {feedback}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* Animacao de moedas voando */}
      {flyingMoney && (
        <FlyingMoney
          startPos={flyingMoney.start}
          endPos={flyingMoney.end}
          onComplete={() => setFlyingMoney(null)}
        />
      )}
    </motion.div>
  );
}
