'use client';

import { useState, useCallback, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { AnimatePresence } from 'framer-motion';
import LandingScreen from '@/components/landing-screen';
import QuestionScreen from '@/components/question-screen';
import TransitionScreen from '@/components/transition-screen';
import ResultsScreen from '@/components/results-screen';
import { quizQuestions, calculateEstimatedValue, incomeRanges } from '@/lib/quiz-data';
import { useTracking } from '@/hooks/use-tracking';

const OfferScreen = dynamic(() => import('@/components/offer-screen').then(mod => mod.OfferScreen), { loading: () => null });

type Screen = 'landing' | 'question' | 'transition' | 'results' | 'offer';

export default function Home() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('landing');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [incomeIndex, setIncomeIndex] = useState<number>(0);
  const [multipliers, setMultipliers] = useState<number[]>([]);
  
  const { trackStep } = useTracking();

  // Track landing page view
  useEffect(() => {
    trackStep('landing');
  }, [trackStep]);

  const handleStart = useCallback(() => {
    setCurrentScreen('question');
    setCurrentQuestionIndex(0);
    setIncomeIndex(0);
    setMultipliers([]);
    trackStep('q1');
  }, [trackStep]);

  const handleAnswer = useCallback((optionIndex: number, multiplier: number) => {
    const currentQuestion = quizQuestions[currentQuestionIndex];
    
    if (currentQuestion?.isIncomeQuestion) {
      // Primeira pergunta: salvar o índice de renda
      setIncomeIndex(optionIndex);
      const selectedRange = incomeRanges[optionIndex]?.text;
      trackStep(`q${currentQuestionIndex + 1}`, { incomeRange: selectedRange });
    } else {
      // Demais perguntas: acumular multiplicador
      setMultipliers(prev => [...prev, multiplier]);
      trackStep(`q${currentQuestionIndex + 1}`);
    }

    if (currentQuestionIndex < quizQuestions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      // Track próxima pergunta
      trackStep(`q${currentQuestionIndex + 2}`);
    } else {
      setCurrentScreen('transition');
    }
  }, [currentQuestionIndex, trackStep]);

  const handleTransitionComplete = useCallback(() => {
    setCurrentScreen('results');
    const value = calculateEstimatedValue(incomeIndex, multipliers);
    trackStep('results', { estimatedLoss: value });
  }, [incomeIndex, multipliers, trackStep]);

  const handleContinueToOffer = useCallback(() => {
    setCurrentScreen('offer');
    const value = calculateEstimatedValue(incomeIndex, multipliers);
    trackStep('offer', { estimatedLoss: value });
  }, [incomeIndex, multipliers, trackStep]);

  const currentQuestion = quizQuestions?.[currentQuestionIndex];
  const totalValue = calculateEstimatedValue(incomeIndex, multipliers);

  // Todas as telas usam tema claro
  const isDarkTheme = false;

  return (
    <main className={`min-h-screen transition-colors duration-500 ${
      isDarkTheme 
        ? 'bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950' 
        : 'bg-gradient-to-br from-gray-50 via-white to-indigo-50'
    }`}>
      <AnimatePresence mode="wait">
        {currentScreen === 'landing' && (
          <LandingScreen key="landing" onStart={handleStart} />
        )}

        {currentScreen === 'question' && currentQuestion && (
          <QuestionScreen
            key={`question-${currentQuestionIndex}`}
            question={currentQuestion}
            currentQuestion={currentQuestionIndex + 1}
            totalQuestions={quizQuestions?.length ?? 7}
            totalValue={totalValue}
            incomeIndex={incomeIndex}
            multipliers={multipliers}
            onAnswer={handleAnswer}
          />
        )}

        {currentScreen === 'transition' && (
          <TransitionScreen key="transition" onComplete={handleTransitionComplete} />
        )}

        {currentScreen === 'results' && (
          <ResultsScreen 
            key="results" 
            totalValue={totalValue} 
            incomeIndex={incomeIndex}
            onContinue={handleContinueToOffer} 
          />
        )}

        {currentScreen === 'offer' && (
          <OfferScreen key="offer" totalValue={totalValue} />
        )}
      </AnimatePresence>
    </main>
  );
}
