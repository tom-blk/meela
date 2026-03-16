import { For, Show, createSignal, createEffect, createMemo } from "solid-js";
import type { Question } from "./api";

interface Props {
  question: Question;
  value: string | string[] | undefined;
  onAnswer: (value: string | string[]) => void;
}

const SEARCH_THRESHOLD = 6;

export default function QuestionComponent(props: Props) {
  const [selected, setSelected] = createSignal<string[]>([]);
  const [search, setSearch] = createSignal("");
  const [showInfo, setShowInfo] = createSignal(false);

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
    setShowInfo(false);
  });

  const showSearch = () => props.question.options.length >= SEARCH_THRESHOLD;

  const filteredOptions = createMemo(() => {
    const query = search().toLowerCase().trim();
    if (!query) return props.question.options;
    return props.question.options.filter((o) =>
      o.toLowerCase().includes(query)
    );
  });

  const maxReached = () => {
    const max = props.question.max_selections;
    return max !== null && selected().length >= max;
  };

  const toggle = (option: string) => {
    if (props.question.type === "single") {
      setSelected([option]);
      props.onAnswer(option);
    } else {
      const current = selected();
      if (current.includes(option)) {
        const newSelected = current.filter((o) => o !== option);
        setSelected(newSelected);
        props.onAnswer(newSelected);
      } else if (!maxReached()) {
        const newSelected = [...current, option];
        setSelected(newSelected);
        props.onAnswer(newSelected);
      }
    }
  };

  const isSelected = (option: string) => selected().includes(option);

  return (
    <div class="mb-8">
      <div class="flex items-start gap-2 mb-2">
        <h2 class="text-xl font-medium">{props.question.text}</h2>
        <Show when={props.question.info}>
          <button
            type="button"
            onClick={() => setShowInfo(!showInfo())}
            class="text-gray-400 hover:text-gray-600 mt-1"
            title="More information"
          >
            <svg
              class="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </button>
        </Show>
      </div>

      <Show when={props.question.subtitle}>
        <p class="text-sm text-gray-500 mb-3">{props.question.subtitle}</p>
      </Show>

      <Show when={showInfo() && props.question.info}>
        <div class="bg-blue-50 text-blue-800 text-sm p-3 rounded-lg mb-4">
          {props.question.info}
        </div>
      </Show>

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
              disabled={!isSelected(option) && maxReached()}
              class={`px-4 py-2 rounded-full border transition-colors ${
                isSelected(option)
                  ? "bg-indigo-600 text-white border-indigo-600"
                  : maxReached()
                    ? "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed"
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

      <Show when={props.question.max_selections !== null}>
        <p class="text-sm text-gray-400 mt-3">
          {selected().length} / {props.question.max_selections} selected
        </p>
      </Show>
    </div>
  );
}
