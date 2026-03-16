import { For, createSignal, createEffect } from "solid-js";
import type { Question } from "./questions";

interface Props {
  question: Question;
  value: string | string[] | undefined;
  onAnswer: (value: string | string[]) => void;
}

export default function QuestionComponent(props: Props) {
  const [selected, setSelected] = createSignal<string[]>([]);

  createEffect(() => {
    const val = props.value;
    if (Array.isArray(val)) {
      setSelected(val);
    } else if (typeof val === "string") {
      setSelected([val]);
    } else {
      setSelected([]);
    }
  });

  const toggle = (option: string) => {
    if (props.question.type === "single") {
      setSelected([option]);
      props.onAnswer(option);
    } else {
      const current = selected();
      const newSelected = current.includes(option)
        ? current.filter((o) => o !== option)
        : [...current, option];
      setSelected(newSelected);
      props.onAnswer(newSelected);
    }
  };

  const isSelected = (option: string) => selected().includes(option);

  return (
    <div class="mb-8">
      <h2 class="text-xl font-medium mb-4">{props.question.text}</h2>
      {props.question.type === "multiple" && (
        <p class="text-sm text-gray-500 mb-3">Select all that apply</p>
      )}
      <div class="flex flex-wrap gap-2">
        <For each={props.question.options}>
          {(option) => (
            <button
              type="button"
              onClick={() => toggle(option)}
              class={`px-4 py-2 rounded-full border transition-colors ${
                isSelected(option)
                  ? "bg-indigo-600 text-white border-indigo-600"
                  : "bg-white text-gray-700 border-gray-300 hover:border-indigo-400"
              }`}
            >
              {option}
            </button>
          )}
        </For>
      </div>
    </div>
  );
}
