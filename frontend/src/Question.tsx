import { For, Show, createSignal, createEffect, createMemo } from "solid-js";
import { Icon } from "@iconify-icon/solid";
import type { Question } from "./api";

interface Props {
  question: Question;
  value: string | string[] | undefined;
  onAnswer: (value: string | string[]) => void;
  disabled?: boolean;
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
    if (props.disabled) return;
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
        <h2 class="text-xl font-medium text-text-primary">
          {props.question.text}
        </h2>
        <Show when={props.question.info}>
          <button
            type="button"
            onClick={() => setShowInfo(!showInfo())}
            class="text-text-muted hover:text-text-secondary mt-1 transition-colors"
            title="More information"
          >
            <Icon icon="feather:info" width="20" height="20" class="block" />
          </button>
        </Show>
      </div>

      <Show when={props.question.subtitle}>
        <p class="text-sm text-text-tertiary mb-3">{props.question.subtitle}</p>
      </Show>

      <Show when={showInfo() && props.question.info}>
        <div class="bg-bg-info text-text-info text-sm p-3 rounded-lg mb-4">
          {props.question.info}
        </div>
      </Show>

      <Show when={showSearch()}>
        <input
          type="text"
          placeholder="Search options..."
          value={search()}
          onInput={(e) => setSearch(e.currentTarget.value)}
          disabled={props.disabled}
          class="w-full px-4 py-2 mb-4 bg-input-bg border border-input-border rounded-lg text-text-primary placeholder:text-input-placeholder focus:outline-none focus:ring-2 focus:ring-input-focus-ring transition-colors disabled:opacity-50"
        />
      </Show>

      <div class="flex flex-wrap gap-2">
        <For each={filteredOptions()}>
          {(option) => (
            <button
              type="button"
              onClick={() => toggle(option)}
              disabled={props.disabled || (!isSelected(option) && maxReached())}
              class={`px-4 py-2 rounded-full border transition-colors ${
                isSelected(option)
                  ? "bg-chip-selected-bg text-chip-selected-text border-chip-selected-border"
                  : props.disabled || maxReached()
                    ? "bg-chip-disabled-bg text-chip-disabled-text border-chip-disabled-border cursor-not-allowed"
                    : "bg-chip-default-bg text-chip-default-text border-chip-default-border hover:border-chip-default-hover-border"
              }`}
            >
              {option}
            </button>
          )}
        </For>
      </div>

      <Show when={showSearch() && filteredOptions().length === 0}>
        <p class="text-text-tertiary mt-2">No options match your search</p>
      </Show>

      <Show when={props.question.max_selections !== null}>
        <p class="text-sm text-text-muted mt-3">
          {selected().length} / {props.question.max_selections} selected
        </p>
      </Show>
    </div>
  );
}
