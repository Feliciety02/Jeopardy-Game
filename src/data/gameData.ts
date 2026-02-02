export interface Question {
  id: string;
  question: string;
  answer: string;
  value: number;
  categoryId: string;
  answered: boolean;
}

export interface Category {
  id: string;
  name: string;
  questions: Question[];
}

export const POINT_VALUES = [200, 400, 600, 800, 1000];

export const initialCategories: Category[] = [
  {
    id: "cat-1",
    name: "SCIENCE",
    questions: POINT_VALUES.map((value, idx) => ({
      id: `cat-1-q-${idx}`,
      question: `This is the $${value} Science question. What scientific concept is being tested?`,
      answer: `What is the Science answer for $${value}?`,
      value,
      categoryId: "cat-1",
      answered: false,
    })),
  },
  {
    id: "cat-2",
    name: "HISTORY",
    questions: POINT_VALUES.map((value, idx) => ({
      id: `cat-2-q-${idx}`,
      question: `This is the $${value} History question. What historical event does this describe?`,
      answer: `What is the History answer for $${value}?`,
      value,
      categoryId: "cat-2",
      answered: false,
    })),
  },
  {
    id: "cat-3",
    name: "POP CULTURE",
    questions: POINT_VALUES.map((value, idx) => ({
      id: `cat-3-q-${idx}`,
      question: `This is the $${value} Pop Culture question. What movie, show, or celebrity is this about?`,
      answer: `What is the Pop Culture answer for $${value}?`,
      value,
      categoryId: "cat-3",
      answered: false,
    })),
  },
  {
    id: "cat-4",
    name: "GEOGRAPHY",
    questions: POINT_VALUES.map((value, idx) => ({
      id: `cat-4-q-${idx}`,
      question: `This is the $${value} Geography question. What place or location is being described?`,
      answer: `What is the Geography answer for $${value}?`,
      value,
      categoryId: "cat-4",
      answered: false,
    })),
  },
  {
    id: "cat-5",
    name: "SPORTS",
    questions: POINT_VALUES.map((value, idx) => ({
      id: `cat-5-q-${idx}`,
      question: `This is the $${value} Sports question. What athlete, team, or sporting event is this?`,
      answer: `What is the Sports answer for $${value}?`,
      value,
      categoryId: "cat-5",
      answered: false,
    })),
  },
  {
    id: "cat-6",
    name: "WILD CARD",
    questions: POINT_VALUES.map((value, idx) => ({
      id: `cat-6-q-${idx}`,
      question: `This is the $${value} Wild Card question. Anything goes in this category!`,
      answer: `What is the Wild Card answer for $${value}?`,
      value,
      categoryId: "cat-6",
      answered: false,
    })),
  },
];

export const HOST_PROMPTS = {
  welcome: ["Welcome to the game!", "Let's play Jeopardy!", "Choose your category!"],
  correct: ["Correct!", "That's right!", "You got it!", "Excellent!", "Well done!"],
  incorrect: ["Ooh, sorry!", "That's incorrect!", "Not quite!", "Better luck next time!"],
  selectQuestion: ["Good choice!", "Interesting pick!", "Here we go!", "Let's see this one!"],
};

export const getRandomPrompt = (type: keyof typeof HOST_PROMPTS): string => {
  const prompts = HOST_PROMPTS[type];
  return prompts[Math.floor(Math.random() * prompts.length)];
};
