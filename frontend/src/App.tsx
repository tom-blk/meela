import { createSignal, onMount, Show } from "solid-js";
import { useParams, useNavigate } from "@solidjs/router";
import {
  createSubmission,
  getSubmission,
  updateSubmission,
  getQuestions,
  type Question as QuestionType,
} from "./api";
import Question from "./Question";
import { ThemeToggle } from "./theme";

function App() {
  const params = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = createSignal(true);
  const [error, setError] = createSignal<string | null>(null);
  const [submissionId, setSubmissionId] = createSignal<string | null>(null);
  const [answers, setAnswers] = createSignal<Record<string, unknown>>({});
  const [questions, setQuestions] = createSignal<QuestionType[]>([]);
  const [step, setStep] = createSignal(0);
  const [currentStep, setCurrentStep] = createSignal(0);

  onMount(async () => {
    try {
      const fetchedQuestions = await getQuestions();
      setQuestions(fetchedQuestions);

      if (params.id) {
        const submission = await getSubmission(params.id);
        if (submission) {
          setSubmissionId(submission.id);
          setAnswers(submission.answers);
          // Resume at first unanswered question
          const firstUnanswered = fetchedQuestions.findIndex(
            (q) => !submission.answers[q.id]
          );
          const resumeStep =
            firstUnanswered === -1 ? fetchedQuestions.length : firstUnanswered;
          setStep(resumeStep);
          setCurrentStep(resumeStep);
        } else {
          setError("Submission not found");
        }
      } else {
        const submission = await createSubmission();
        setSubmissionId(submission.id);
        navigate(`/${submission.id}`, { replace: true });
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  });

  const saveAnswer = async (key: string, value: unknown) => {
    const id = submissionId();
    if (!id) return;

    const newAnswers = { ...answers(), [key]: value };
    setAnswers(newAnswers);

    try {
      await updateSubmission(id, newAnswers);
    } catch (e) {
      console.error("Failed to save:", e);
    }
  };

  const currentQuestion = () => questions()[step()];
  const isComplete = () => step() >= questions().length;
  const progress = () =>
    questions().length > 0
      ? Math.round((step() / questions().length) * 100)
      : 0;

  const handleAnswer = (value: string | string[]) => {
    const q = currentQuestion();
    if (!q) return;
    saveAnswer(q.id, value);
  };

  const next = () => {
    if (step() < questions().length) {
      const newStep = step() + 1;
      setStep(newStep);
      if (newStep > currentStep()) {
        setCurrentStep(newStep);
      }
    }
  };

  const jumpToCurrent = () => {
    setStep(currentStep());
  };

  const isReviewing = () => step() < currentStep();

  const back = () => {
    if (step() > 0) {
      setStep(step() - 1);
    }
  };

  return (
    <div class="min-h-screen bg-bg-primary transition-colors">
      <div class="max-w-2xl mx-auto p-8">
        {/* Header with theme toggle */}
        <div class="flex justify-between items-start mb-2">
          <h1 class="text-3xl font-semibold text-text-primary">
            Client Intake Form
          </h1>
          <ThemeToggle />
        </div>
        <p class="text-sm text-text-muted mb-6">
          Your progress is saved automatically
        </p>

        <Show when={loading()}>
          <p class="text-text-tertiary">Loading...</p>
        </Show>

        <Show when={error()}>
          <p class="text-text-error bg-bg-error p-4 rounded-lg">{error()}</p>
        </Show>

        <Show when={!loading() && !error() && submissionId()}>
          {/* Progress bar */}
          <div class="mb-8">
            <div class="flex justify-between text-sm text-text-tertiary mb-1">
              <span>
                Question {Math.min(step() + 1, questions().length)} of{" "}
                {questions().length}
              </span>
              <span>{progress()}% complete</span>
            </div>
            <div class="h-2 bg-progress-bg rounded-full">
              <div
                class="h-2 bg-progress-fill rounded-full transition-all"
                style={{ width: `${progress()}%` }}
              />
            </div>
          </div>

          <Show when={!isComplete()}>
            <Question
              question={currentQuestion()!}
              value={answers()[currentQuestion()!.id] as string | string[]}
              onAnswer={handleAnswer}
            />

            <div class="flex justify-between items-center mt-8">
              <button
                type="button"
                onClick={back}
                disabled={step() === 0}
                class="px-4 py-2 text-text-secondary border border-border-secondary rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:text-text-primary hover:border-border-primary transition-colors"
              >
                Back
              </button>

              <Show when={isReviewing()}>
                <button
                  type="button"
                  onClick={jumpToCurrent}
                  class="px-4 py-2 text-link hover:text-link-hover hover:underline transition-colors"
                >
                  Return to Question {currentStep() + 1}
                </button>
              </Show>

              <button
                type="button"
                onClick={next}
                class="px-6 py-2 bg-btn-primary-bg text-btn-primary-text rounded-lg hover:bg-btn-primary-bg-hover transition-colors focus:outline-none focus:ring-2 focus:ring-input-focus-ring focus:ring-offset-2 focus:ring-offset-bg-primary"
              >
                {step() === questions().length - 1 ? "Complete" : "Next"}
              </button>
            </div>
          </Show>

          <Show when={isComplete()}>
            <div class="text-center py-8">
              <h2 class="text-2xl font-semibold text-text-success mb-4">
                Thank you!
              </h2>
              <p class="text-text-secondary mb-6">
                Your responses have been saved. We'll be in touch soon.
              </p>
              <button
                type="button"
                onClick={() => setStep(0)}
                class="text-link hover:text-link-hover hover:underline transition-colors"
              >
                Review your answers
              </button>
            </div>
          </Show>
        </Show>
      </div>
    </div>
  );
}

export default App;
