export type QuizQuestion = {
  q: string;
  options: string[];
  answer: number; // index
  explain?: string;
};

export type LessonSection = { heading: string; body: string };

export type CodeExample = {
  language: string;
  code: string;
  note?: string;
};

export type Lesson = {
  slug: string;
  title: string;
  minutes: number;
  summary: string;
  sections: LessonSection[];
  examples?: CodeExample[];
  quiz: QuizQuestion[];
  xp?: number;
};

export type Track = {
  slug: string;
  language: string;
  domain: string;
  tagline: string;
  description: string;
  icon: string;
  color: string;
  seeded: boolean; // hand-authored curriculum available
  lessons: Lesson[];
};
