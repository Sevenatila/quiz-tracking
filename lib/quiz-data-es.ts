export interface QuizOption {
  text: string;
  emoji?: string;
  percentageMultiplier: number;
  feedback: string;
}

export interface QuizQuestion {
  id: number;
  question: string;
  subtitle?: string;
  options: QuizOption[];
  isIncomeQuestion?: boolean;
}

export interface IncomeRange {
  text: string;
  baseValue: number;
  basePercentage: number;
}

// Faixas de renda em USD para América Latina
export const incomeRangesES: IncomeRange[] = [
  { text: "Hasta $500", baseValue: 350, basePercentage: 0.08 },
  { text: "$500 a $1,000", baseValue: 750, basePercentage: 0.10 },
  { text: "$1,000 a $2,000", baseValue: 1500, basePercentage: 0.12 },
  { text: "$2,000 a $4,000", baseValue: 3000, basePercentage: 0.15 },
  { text: "Más de $4,000", baseValue: 5000, basePercentage: 0.18 }
];

export const quizQuestionsES: QuizQuestion[] = [
  {
    id: 1,
    question: "¿Cuál es tu ingreso mensual aproximado?",
    subtitle: "Elige la opción que más se acerque:",
    isIncomeQuestion: true,
    options: [
      { text: "Hasta $500", emoji: "💵", percentageMultiplier: 1, feedback: "✓ Perfil identificado" },
      { text: "$500 a $1,000", emoji: "💰", percentageMultiplier: 1, feedback: "✓ Perfil identificado" },
      { text: "$1,000 a $2,000", emoji: "💳", percentageMultiplier: 1, feedback: "✓ Perfil identificado" },
      { text: "$2,000 a $4,000", emoji: "🏦", percentageMultiplier: 1, feedback: "✓ Perfil identificado" },
      { text: "Más de $4,000", emoji: "💎", percentageMultiplier: 1, feedback: "✓ Perfil identificado" }
    ]
  },
  {
    id: 2,
    question: "Cuando termina el mes, ¿sientes que el dinero simplemente \"desapareció\"?",
    subtitle: "Elige la opción que más te identifique:",
    options: [
      { text: "Sí... parece que se evapora", emoji: "😔", percentageMultiplier: 1.4, feedback: "✓ Fuga detectada" },
      { text: "No sé exactamente a dónde fue", emoji: "🤷", percentageMultiplier: 1.0, feedback: "✓ Fuga identificada" },
      { text: "A veces... pero al final me las arreglo", emoji: "🙂", percentageMultiplier: 0.6, feedback: "✓ Buen control" }
    ]
  },
  {
    id: 3,
    question: "¿Qué es lo que más te impide tener control financiero hoy?",
    subtitle: "Responde con sinceridad:",
    options: [
      { text: "No tengo una herramienta simple de control", emoji: "😓", percentageMultiplier: 1.3, feedback: "✓ Oportunidad encontrada" },
      { text: "Se me olvida anotar los gastos", emoji: "❌", percentageMultiplier: 1.2, feedback: "✓ Fuga identificada" },
      { text: "Falta de organización", emoji: "🤷", percentageMultiplier: 1.0, feedback: "✓ Patrón detectado" }
    ]
  },
  {
    id: 4,
    question: "Si nada cambia, ¿cómo estarás financieramente en 6 meses?",
    subtitle: "Sé honesto contigo:",
    options: [
      { text: "Igual o peor, las cosas están apretadas", emoji: "😰", percentageMultiplier: 1.4, feedback: "✓ Urgencia identificada" },
      { text: "Probablemente igual, sin grandes cambios", emoji: "😐", percentageMultiplier: 1.0, feedback: "✓ Patrón detectado" },
      { text: "Mejor, estoy trabajando en ello", emoji: "💪", percentageMultiplier: 0.5, feedback: "✓ Perspectiva positiva" }
    ]
  },
  {
    id: 5,
    question: "¿Registras tus gastos de alguna forma?",
    subtitle: "Elige tu situación actual:",
    options: [
      { text: "No, nunca registro nada", emoji: "🚫", percentageMultiplier: 1.3, feedback: "✓ Oportunidad encontrada" },
      { text: "Solo los gastos grandes", emoji: "📝", percentageMultiplier: 1.0, feedback: "✓ Fuga identificada" },
      { text: "Sí, tengo todo anotado", emoji: "✅", percentageMultiplier: 0.5, feedback: "✓ Hábito positivo" }
    ]
  },
  {
    id: 6,
    question: "¿Cuál es tu mayor bloqueo financiero hoy?",
    subtitle: "Identifica tu principal obstáculo:",
    options: [
      { text: "No sé a dónde va mi dinero", emoji: "❓", percentageMultiplier: 1.3, feedback: "✓ Fuga crítica" },
      { text: "Gasto más de lo que gano", emoji: "📉", percentageMultiplier: 1.2, feedback: "✓ Fuga identificada" },
      { text: "No logro ahorrar nada", emoji: "💸", percentageMultiplier: 0.9, feedback: "✓ Bloqueo mapeado" }
    ]
  },
  {
    id: 7,
    question: "¿Quieres acceder a esta plantilla ahora mismo y empezar a poner tus finanzas en orden?",
    subtitle: "Elige tu respuesta:",
    options: [
      { text: "No voy a seguir como estoy por ahora", emoji: "🥱", percentageMultiplier: 0.8, feedback: "✓ Curiosidad detectada" },
      { text: "Quiero sí, pero tiene que ser MUY simple de usar", emoji: "🤩", percentageMultiplier: 0.9, feedback: "✓ Potencial identificado" },
      { text: "Sí, quiero tomar el control de mi dinero", emoji: "✅", percentageMultiplier: 1.0, feedback: "✓ Interés confirmado" }
    ]
  }
];

export const testimonialsES = [
  {
    name: "María G.",
    text: "En 2 meses logré ahorrar $120 solo eliminando gastos que ni sabía que tenía.",
    avatar: "MG"
  },
  {
    name: "Carlos R.",
    text: "Por fin entendí a dónde iba mi dinero. La plantilla me salvó de las deudas.",
    avatar: "CR"
  },
  {
    name: "Ana L.",
    text: "Simple y práctica. La uso todos los días y ya recuperé mucho más de lo que pagué.",
    avatar: "AL"
  }
];

// Calcula el valor estimado basado en ingresos y multiplicadores
export const calculateEstimatedValueES = (
  incomeIndex: number,
  multipliers: number[]
): number => {
  const income = incomeRangesES[incomeIndex];
  if (!income) return 0;
  
  const maxValue = income.baseValue * income.basePercentage;
  
  if (multipliers.length === 0) {
    return 0;
  }
  
  const numQuestions = 6;
  const basePerQuestion = maxValue / numQuestions;
  
  const accumulatedValue = multipliers.reduce((total, mult) => {
    const addition = basePerQuestion * Math.max(0.4, mult);
    return total + addition;
  }, 0);
  
  return Math.round(accumulatedValue);
};

export const getControlLevelES = (totalValue: number, incomeIndex: number, questionNumber?: number): { level: string; color: string; bgColor: string } => {
  if (questionNumber && questionNumber <= 4) {
    return { level: "Medio", color: "text-yellow-500", bgColor: "bg-yellow-500/10" };
  }
  
  if (questionNumber && questionNumber === 5) {
    return { level: "Medio", color: "text-yellow-500", bgColor: "bg-yellow-500/10" };
  }
  
  return { level: "Alto", color: "text-red-500", bgColor: "bg-red-500/10" };
};

export const formatCurrencyES = (value: number): string => {
  return value.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
};
