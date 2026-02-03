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

export const POINT_VALUES = [100, 500, 1000];

export const initialCategories: Category[] = [
  {
    id: "cat-1",
    name: "FE ANNE",
    questions: POINT_VALUES.map((value, idx) => ({
      id: `cat-1-q-${idx}`,
      question: "Question",
      answer: "Answer",
      value,
      categoryId: "cat-1",
      answered: false,
    })),
  },
  {
    id: "cat-2",
    name: "BELOY",
    questions: POINT_VALUES.map((value, idx) => ({
      id: `cat-2-q-${idx}`,
      question: "Question",
      answer: "Answer",
      value,
      categoryId: "cat-2",
      answered: false,
    })),
  },
  {
    id: "cat-3",
    name: "MEA",
    questions: POINT_VALUES.map((value, idx) => ({
      id: `cat-3-q-${idx}`,
      question: "Question",
      answer: "Answer",
      value,
      categoryId: "cat-3",
      answered: false,
    })),
  },
  {
    id: "cat-4",
    name: "WAPILI",
    questions: [
      {
        id: "cat-4-q-0",
        question: "It is a form of visual storytelling that is sometimes referred to as a motion picture or movie.",
        answer: "Film",
        value: 100,
        categoryId: "cat-4",
        answered: false,
      },
      {
        id: "cat-4-q-1",
        question: "An example of this form of visual storytelling would be \"Watchmen\" by Alan Moore.",
        answer: "Comics or Sequential Art",
        value: 500,
        categoryId: "cat-4",
        answered: false,
      },
      {
        id: "cat-4-q-2",
        question: "What is the Latin word for \"painter\"?",
        answer: "Pistorius",
        value: 1000,
        categoryId: "cat-4",
        answered: false,
      },
    ],
  },
  {
    id: "cat-5",
    name: "ALONZO",
    questions: [
      {
        id: "cat-5-q-0",
        question: "This can be demonstrated by a single image or a series of images to narrate a story.",
        answer: "Visual Narratives",
        value: 100,
        categoryId: "cat-5",
        answered: false,
      },
      {
        id: "cat-5-q-1",
        question: "Give two features of Visual Narratives.",
        answer: "Story, Characters, Narrative, Diverse Media",
        value: 500,
        categoryId: "cat-5",
        answered: false,
      },
      {
        id: "cat-5-q-2",
        question: "Their role is to serve as emotional or psychological cornerstones to facilitate the audience's interaction.",
        answer: "Characters",
        value: 1000,
        categoryId: "cat-5",
        answered: false,
      },
    ],
  },
  {
    id: "cat-6",
    name: "AZURA",
    questions: [
      {
        id: "cat-6-q-0",
        question: "What is the name of the narrative structure that presents its story out of chronological order?",
        answer: "Non-Linear Narrative",
        value: 100,
        categoryId: "cat-6",
        answered: false,
      },
      {
        id: "cat-6-q-1",
        question: "What is an example of a Quest Narrative based on what the reporter shared?",
        answer: "The Hobbit or Indiana Jones",
        value: 500,
        categoryId: "cat-6",
        answered: false,
      },
      {
        id: "cat-6-q-2",
        question: "From how many possible options is the viewpoint selected in a Viewpoint Narrative?",
        answer: "Hundreds of options",
        value: 1000,
        categoryId: "cat-6",
        answered: false,
      },
    ],
  },
];

export const HOST_PROMPTS = {
  welcome: ["Welcome to the game!", "Let's play!", "Choose your category!"],
  correct: ["Correct!", "That's right!", "You got it!", "Excellent!", "Well done!"],
  incorrect: ["Ooh, sorry!", "That's incorrect!", "Not quite!", "Better luck next time!"],
  selectQuestion: ["Good choice!", "Interesting pick!", "Here we go!", "Let's see this one!"],
};

export const getRandomPrompt = (type: keyof typeof HOST_PROMPTS): string => {
  const prompts = HOST_PROMPTS[type];
  return prompts[Math.floor(Math.random() * prompts.length)];
};
