import { For, Show, createSignal, createEffect, createMemo } from "solid-js";
import type { Question } from "./questions";

interface Props {
  question: Question;
  value: string | string[] | undefined;
  onAnswer: (value: string | string[]) => void;
}

const SEARCH_THRESHOLD = 6;

export default function QuestionComponent(props: Props) {
  const [selected, setSelected] = createSignal<string[]>([]);
  const [search, setSearch] = createSignal("");

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

  createEffect(() => {
    // Reset search when question changes
    props.question.id;
    setSearch("");
  });

  const showSearch = () => props.question.options.length >= SEARCH_THRESHOLD;

  const filteredOptions = createMemo(() => {
    const query = search().toLowerCase().trim();
    if (!query) return props.question.options;
    return props.question.options.filter((o) =>
      o.toLowerCase().includes(query)
    );
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

      <Show when={showSearch()}>
        <input
          type="text"
          placeholder="Search options..."
          value={search()}
          onInput={(e) => setSearch(e.currentTarget.value)}
          class="w-full px-4 py-2 mb-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </Show>

      <div class="flex flex-wrap gap-2">
        <For each={filteredOptions()}>
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

      <Show when={showSearch() && filteredOptions().length === 0}>
        <p class="text-gray-500 mt-2">No options match your search</p>
      </Show>
    </div>
  );
}
