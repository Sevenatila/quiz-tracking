export interface QuizOption {
  text: string;
  emoji?: string;
  percentageMultiplier: number; // Multiplicador da porcentagem base
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
  baseValue: number; // Valor médio da faixa para cálculo
  basePercentage: number; // Porcentagem base de desperdício
}

export const incomeRanges: IncomeRange[] = [
  { text: "Até R$ 2.000", baseValue: 1500, basePercentage: 0.08 },
  { text: "R$ 2.000 a R$ 3.000", baseValue: 2500, basePercentage: 0.10 },
  { text: "R$ 3.000 a R$ 5.000", baseValue: 4000, basePercentage: 0.12 },
  { text: "R$ 5.000 a R$ 10.000", baseValue: 7500, basePercentage: 0.15 },
  { text: "Acima de R$ 10.000", baseValue: 12000, basePercentage: 0.18 }
];

export const quizQuestions: QuizQuestion[] = [
  {
    id: 1,
    question: "Qual é sua faixa de renda mensal?",
    subtitle: "Escolha a opção que mais se aproxima:",
    isIncomeQuestion: true,
    options: [
      { text: "Até R$ 2.000", emoji: "💵", percentageMultiplier: 1, feedback: "✓ Perfil identificado" },
      { text: "R$ 2.000 a R$ 3.000", emoji: "💰", percentageMultiplier: 1, feedback: "✓ Perfil identificado" },
      { text: "R$ 3.000 a R$ 5.000", emoji: "💳", percentageMultiplier: 1, feedback: "✓ Perfil identificado" },
      { text: "R$ 5.000 a R$ 10.000", emoji: "🏦", percentageMultiplier: 1, feedback: "✓ Perfil identificado" },
      { text: "Acima de R$ 10.000", emoji: "💎", percentageMultiplier: 1, feedback: "✓ Perfil identificado" }
    ]
  },
  {
    id: 2,
    question: "Quando termina o mês, você sente que o dinheiro simplesmente \"desapareceu\"?",
    subtitle: "Escolha a opção que mais te identifica:",
    options: [
      { text: "Sim... parece que evapora", emoji: "😔", percentageMultiplier: 1.4, feedback: "✓ Vazamento detectado" },
      { text: "Não sei exatamente pra onde foi", emoji: "🤷", percentageMultiplier: 1.0, feedback: "✓ Vazamento identificado" },
      { text: "Às vezes... mas no fim me viro", emoji: "🙂", percentageMultiplier: 0.6, feedback: "✓ Bom controle" }
    ]
  },
  {
    id: 3,
    question: "O que mais te impede de ter controle financeiro hoje?",
    subtitle: "Responda com sinceridade:",
    options: [
      { text: "Não tenho uma ferramenta simples de controle", emoji: "😓", percentageMultiplier: 1.3, feedback: "✓ Oportunidade encontrada" },
      { text: "Esqueço de anotar os gastos", emoji: "❌", percentageMultiplier: 1.2, feedback: "✓ Vazamento identificado" },
      { text: "Falta de organização", emoji: "🤷", percentageMultiplier: 1.0, feedback: "✓ Padrão detectado" }
    ]
  },
  {
    id: 4,
    question: "Se nada mudar, como você estará financeiramente em 6 meses?",
    subtitle: "Seja honesto consigo mesmo:",
    options: [
      { text: "Igual ou pior, as coisas estão apertadas", emoji: "😰", percentageMultiplier: 1.4, feedback: "✓ Urgência identificada" },
      { text: "Provavelmente igual, sem grandes mudanças", emoji: "😐", percentageMultiplier: 1.0, feedback: "✓ Padrão detectado" },
      { text: "Melhor, estou trabalhando nisso", emoji: "💪", percentageMultiplier: 0.5, feedback: "✓ Perspectiva positiva" }
    ]
  },
  {
    id: 5,
    question: "Você registra seus gastos de alguma forma?",
    subtitle: "Escolha sua situação atual:",
    options: [
      { text: "Não, nunca registro nada", emoji: "🚫", percentageMultiplier: 1.3, feedback: "✓ Oportunidade encontrada" },
      { text: "Só os gastos grandes", emoji: "📝", percentageMultiplier: 1.0, feedback: "✓ Vazamento identificado" },
      { text: "Sim, tenho tudo anotado", emoji: "✅", percentageMultiplier: 0.5, feedback: "✓ Hábito positivo" }
    ]
  },
  {
    id: 6,
    question: "Qual é seu maior bloqueio financeiro hoje?",
    subtitle: "Identifique seu principal obstáculo:",
    options: [
      { text: "Não sei pra onde vai meu dinheiro", emoji: "❓", percentageMultiplier: 1.3, feedback: "✓ Vazamento crítico" },
      { text: "Gasto mais do que ganho", emoji: "📉", percentageMultiplier: 1.2, feedback: "✓ Vazamento identificado" },
      { text: "Não consigo poupar nada", emoji: "💸", percentageMultiplier: 0.9, feedback: "✓ Bloqueio mapeado" }
    ]
  },
  {
    id: 7,
    question: "Você quer acessar essa planilha agora mesmo e começar a colocar suas finanças em ordem?",
    subtitle: "Escolha sua resposta:",
    options: [
      { text: "Não vou seguir como estou por enquanto", emoji: "🥱", percentageMultiplier: 0.8, feedback: "✓ Curiosidade detectada" },
      { text: "Quero sim, mas tem que ser MUITO simples de usar", emoji: "🤩", percentageMultiplier: 0.9, feedback: "✓ Potencial identificado" },
      { text: "Sim, quero tomar o controle do meu dinheiro", emoji: "✅", percentageMultiplier: 1.0, feedback: "✓ Interesse confirmado" }
    ]
  }
];

export const testimonials = [
  {
    name: "Carla M.",
    text: "Em 2 meses consegui economizar R$ 480 só cortando gastos que nem sabia que tinha!",
    avatar: "CM"
  },
  {
    name: "Roberto S.",
    text: "Finalmente entendi pra onde ia meu dinheiro. A planilha me salvou do vermelho.",
    avatar: "RS"
  },
  {
    name: "Ana Paula",
    text: "Simples e prática. Uso todo dia e já recuperei muito mais que o valor investido.",
    avatar: "AP"
  }
];

// Calcula o valor estimado com base na renda e multiplicadores
// O valor SEMPRE aumenta conforme o usuário responde (gamificação)
export const calculateEstimatedValue = (
  incomeIndex: number,
  multipliers: number[]
): number => {
  const income = incomeRanges[incomeIndex];
  if (!income) return 0;
  
  // Valor máximo possível para esta faixa de renda
  const maxValue = income.baseValue * income.basePercentage;
  
  // Se não há multiplicadores ainda, retorna 0 (não mostrar valor antes de responder)
  if (multipliers.length === 0) {
    return 0;
  }
  
  // Cada resposta adiciona uma fração do valor máximo
  // O multiplicador determina QUANTO adiciona (maior = mais desperdício identificado)
  const numQuestions = 6; // Total de perguntas após a de renda
  const basePerQuestion = maxValue / numQuestions;
  
  // Soma os valores de cada resposta
  const accumulatedValue = multipliers.reduce((total, mult) => {
    // Garante que sempre adiciona algo (mínimo 40% da fração, máximo 150%)
    const addition = basePerQuestion * Math.max(0.4, mult);
    return total + addition;
  }, 0);
  
  return Math.round(accumulatedValue);
};

export const getControlLevel = (totalValue: number, incomeIndex: number, questionNumber?: number): { level: string; color: string; bgColor: string } => {
  // Níveis nunca diminuem, só aumentam conforme progresso
  // Perguntas 2-4: Médio
  // Perguntas 5: Médio (transição)
  // Perguntas 6-7 e resultados: Alto
  
  if (questionNumber && questionNumber <= 4) {
    return { level: "Médio", color: "text-yellow-500", bgColor: "bg-yellow-500/10" };
  }
  
  if (questionNumber && questionNumber === 5) {
    return { level: "Médio", color: "text-yellow-500", bgColor: "bg-yellow-500/10" };
  }
  
  // Perguntas 6, 7 e tela de resultados (questionNumber undefined ou >= 6): sempre Alto
  return { level: "Alto", color: "text-red-500", bgColor: "bg-red-500/10" };
};

export const formatCurrency = (value: number): string => {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
};
