export interface Option {
  optionId: string;
  text: string;
  weights: Record<string, number>;
}

export interface Question {
  id: string;
  text: string;
  module: string;
  options: Option[];
}

export interface AnsweredQuestion {
  question: Question;
  selectedOptionId: string;
}

export interface AnswerRequest {
  questionId: string;
  module: string;
  selectOption: { optionId: string };
}

export interface StartTestResponse {
  message: string;
  question: Question;
}

export interface AnswerResponse {
  message: string;
  nextQuestion?: Question;
}

export interface ModuleScore {
  module: string;
  score: number;
  percentage: number;
}

export interface PersonalityResult {
  archetype: string;
  emoji: string;
  tagline: string;
  description: string;
  traits: string[];
  topModules: string[];
  moduleScores: ModuleScore[];
  primaryColor: string;
  secondaryColor: string;
}
