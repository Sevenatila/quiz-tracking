'use client';

import { useState, useCallback, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import LandingScreenES from '@/components/es/landing-screen';
import QuestionScreenES from '@/components/es/question-screen';
import TransitionScreenES from '@/components/es/transition-screen';
import ResultsScreenES from '@/components/es/results-screen';
import { OfferScreenES } from '@/components/es/offer-screen';
import { quizQuestionsES, calculateEstimatedValueES, incomeRangesES } from '@/lib/quiz-data-es';
import { useTracking } from '@/hooks/use-tracking';

type Screen = 'landing' | 'question' | 'transition' | 'results' | 'offer';

export default function HomeES() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('landing');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [incomeIndex, setIncomeIndex] = useState<number>(0);
  const [multipliers, setMultipliers] = useState<number[]>([]);
  
  const { trackStep } = useTracking();

  // Track landing page view
  useEffect(() => {
    trackStep('landing_es');
  }, [trackStep]);

  const handleStart = useCallback(() => {
    setCurrentScreen('question');
    setCurrentQuestionIndex(0);
    setIncomeIndex(0);
    setMultipliers([]);
    trackStep('es_q1');
  }, [trackStep]);

  const handleAnswer = useCallback((optionIndex: number, multiplier: number) => {
    const currentQuestion = quizQuestionsES[currentQuestionIndex];
    
    if (currentQuestion?.isIncomeQuestion) {
      setIncomeIndex(optionIndex);
      const selectedRange = incomeRangesES[optionIndex]?.text;
      trackStep(`es_q${currentQuestionIndex + 1}`, { incomeRange: selectedRange });
    } else {
      setMultipliers(prev => [...prev, multiplier]);
      trackStep(`es_q${currentQuestionIndex + 1}`);
    }

    if (currentQuestionIndex < quizQuestionsES.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      trackStep(`es_q${currentQuestionIndex + 2}`);
    } else {
      setCurrentScreen('transition');
    }
  }, [currentQuestionIndex, trackStep]);

  const handleTransitionComplete = useCallback(() => {
    setCurrentScreen('results');
    const value = calculateEstimatedValueES(incomeIndex, multipliers);
    trackStep('results_es', { estimatedLoss: value });
  }, [incomeIndex, multipliers, trackStep]);

  const handleContinueToOffer = useCallback(() => {
    setCurrentScreen('offer');
    const value = calculateEstimatedValueES(incomeIndex, multipliers);
    trackStep('offer_es', { estimatedLoss: value });
  }, [incomeIndex, multipliers, trackStep]);

  const currentQuestion = quizQuestionsES?.[currentQuestionIndex];
  const totalValue = calculateEstimatedValueES(incomeIndex, multipliers);

  // Todas las pantallas usan tema claro
  const isDarkTheme = false;

  return (
    <main className={`min-h-screen transition-colors duration-500 ${
      isDarkTheme 
        ? 'bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950' 
        : 'bg-gradient-to-br from-gray-50 via-white to-indigo-50'
    }`}>
      <AnimatePresence mode="wait">
        {currentScreen === 'landing' && (
          <LandingScreenES key="landing" onStart={handleStart} />
        )}

        {currentScreen === 'question' && currentQuestion && (
          <QuestionScreenES
            key={`question-${currentQuestionIndex}`}
            question={currentQuestion}
            currentQuestion={currentQuestionIndex + 1}
            totalQuestions={quizQuestionsES?.length ?? 7}
            totalValue={totalValue}
            incomeIndex={incomeIndex}
            multipliers={multipliers}
            onAnswer={handleAnswer}
          />
        )}

        {currentScreen === 'transition' && (
          <TransitionScreenES key="transition" onComplete={handleTransitionComplete} />
        )}

        {currentScreen === 'results' && (
          <ResultsScreenES 
            key="results" 
            totalValue={totalValue} 
            incomeIndex={incomeIndex}
            onContinue={handleContinueToOffer} 
          />
        )}

        {currentScreen === 'offer' && (
          <OfferScreenES key="offer" totalValue={totalValue} />
        )}
      </AnimatePresence>
    </main>
  );
}
