import { createSignal, onMount, Show } from "solid-js";
import { useParams, useNavigate } from "@solidjs/router";
import { createSubmission, getSubmission } from "./api";

function App() {
  const params = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = createSignal(true);
  const [error, setError] = createSignal<string | null>(null);
  const [submissionId, setSubmissionId] = createSignal<string | null>(null);
  const [answers, setAnswers] = createSignal<Record<string, unknown>>({});

  onMount(async () => {
    try {
      if (params.id) {
        const submission = await getSubmission(params.id);
        if (submission) {
          setSubmissionId(submission.id);
          setAnswers(submission.answers);
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

  return (
    <div class="max-w-2xl mx-auto p-8">
      <h1 class="text-3xl font-semibold mb-6">Client Intake Form</h1>

      <Show when={loading()}>
        <p class="text-gray-500">Loading...</p>
      </Show>

      <Show when={error()}>
        <p class="text-red-600 bg-red-50 p-4 rounded">{error()}</p>
      </Show>

      <Show when={!loading() && !error() && submissionId()}>
        <p class="text-sm text-gray-500">Submission ID: {submissionId()}</p>
        <p class="text-sm text-gray-400 mb-8">
          Bookmark this page to resume later
        </p>

        {/* Form questions will be added in next stage */}
        <pre class="bg-gray-100 p-4 rounded overflow-x-auto text-sm">
          {JSON.stringify(answers(), null, 2)}
        </pre>
      </Show>
    </div>
  );
}

export default App;
