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
    questions: [
      {
        id: "cat-1-q-0",
        question: "This is a method of criticism of art that focuses on the visuals or structural aspects of a work of art to reach a conclusion.",
        answer: "Formalism",
        value: 100,
        categoryId: "cat-1",
        answered: false,
      },
      {
        id: "cat-1-q-1",
        question: "This states that art cannot be fully comprehended without its historical, cultural, social, and political contexts.",
        answer: "Contextualism",
        value: 500,
        categoryId: "cat-1",
        answered: false,
      },
      {
        id: "cat-1-q-2",
        question: "Who is the creator of the Composition with Red, Blue, and Yellow (1930)?",
        answer: "Piet Mondrian",
        value: 1000,
        categoryId: "cat-1",
        answered: false,
      },
    ],
  },
  {
    id: "cat-2",
    name: "BELOY",
    questions: [
      {
        id: "cat-2-q-0",
        question: "This framework looks for hidden rules, symbols, and patterns that shape art's meaning.",
        answer: "Structuralism",
        value: 100,
        categoryId: "cat-2",
        answered: false,
      },
      {
        id: "cat-2-q-1",
        question: "Give one example of an artwork discussed in relation to Structuralism.",
        answer: "The Last Supper",
        value: 500,
        categoryId: "cat-2",
        answered: false,
      },
      {
        id: "cat-2-q-2",
        question: "It is used in The Last Supper to show the difference between Christ (good) and Judas (bad).",
        answer: "Binary opposites",
        value: 1000,
        categoryId: "cat-2",
        answered: false,
      },
    ],
  },
  {
    id: "cat-3",
    name: "MEA",
    questions: [
      {
        id: "cat-3-q-0",
        question: "A discipline concerned with the study of signs and symbols, and an excellent analytical tool in art criticism.",
        answer: "Semiotics",
        value: 100,
        categoryId: "cat-3",
        answered: false,
      },
      {
        id: "cat-3-q-1",
        question: "Give the example of a Semiotic Critique by Jean-Michel Basquiat.",
        answer: "Untitled (Skull)",
        value: 500,
        categoryId: "cat-3",
        answered: false,
      },
      {
        id: "cat-3-q-2",
        question: "Give one Semiotic Approach.",
        answer: "Identify the Signs & Symbols, Investigate the Signifier & Signified, Explore Cultural & Contextual Associations, or Examine Pierce's Icon, Index and Symbol",
        value: 1000,
        categoryId: "cat-3",
        answered: false,
      },
    ],
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
