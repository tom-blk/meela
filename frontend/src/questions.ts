export type QuestionType = "single" | "multiple";

export interface Question {
  id: string;
  text: string;
  type: QuestionType;
  options: string[];
}

export const questions: Question[] = [
  {
    id: "seeking_help_for",
    text: "What are you seeking help for?",
    type: "multiple",
    options: [
      "Anxiety",
      "Depression",
      "Relationship issues",
      "Stress",
      "Grief or loss",
      "Self-esteem",
      "Other",
    ],
  },
  {
    id: "therapy_before",
    text: "Have you been to therapy before?",
    type: "single",
    options: ["Yes", "No", "Prefer not to say"],
  },
  {
    id: "preferred_contact",
    text: "How would you prefer to be contacted?",
    type: "single",
    options: ["Email", "Phone", "Text message"],
  },
];
