export type QuestionType = "MCQ" | "TRUE_FALSE" | "FILL_BLANK" | "ESSAY" | "CODE";

export interface Quiz {
  id: string;
  lessonId: string;
  title: string;
  instructions?: string;
  timeLimitMin?: number;
  passingScore: number;
  maxAttempts: number;
  cooldownHrs: number;
  randomize: boolean;
  questionsPerAttempt: number;
}

export interface Question {
  id: string;
  type: QuestionType;
  prompt: string;
  points: number;
  options: QuestionOption[];
}

export interface QuestionOption {
  id: string;
  questionId: string;
  text: string;
  isCorrect: boolean;
  order: number;
}

export interface Attempt {
  id: string;
  quizId: string;
  userId: string;
  score?: number;
  passed?: boolean;
  startedAt: string;
  submittedAt?: string;
}

export interface QuizSession {
  attemptId: string;
  questions: Question[];
  deadlineMs: number;
}
