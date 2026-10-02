export type Language = "id" | "en";

export type SentenceTag = "situation" | "task" | "action" | "result" | "filler" | "offtopic";

export interface PracticeSetup {
  jobDescription: string;
  cv: string;
  language: Language;
}

export interface PracticeAnswer {
  question: string;
  transcript: string;
  seconds: number;
  typed: boolean;
}

export interface SessionData extends PracticeSetup {
  questions: string[];
  answers: (PracticeAnswer | null)[];
}

export interface SentenceSpan {
  text: string;
  tag?: SentenceTag;
}

export interface ScoredAnswer {
  questionIndex: number;
  question: string;
  transcript: string;
  seconds: number;
  typed: boolean;
  star: { situation: boolean; task: boolean; action: boolean; result: boolean };
  relevance: number;
  conciseness: number;
  tip: string;
  modelAnswer: string;
  sentences: SentenceSpan[];
  metrics: {
    words: number;
    fillers: number;
    tangled: number;
  };
}

export interface FeedbackReport {
  createdAt: string;
  language: Language;
  answeredCount: number;
  totalCount: number;
  answers: ScoredAnswer[];
  overall: {
    tangled: number;
    summary: string;
  };
}
