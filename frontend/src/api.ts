const API_BASE = "/api";

export interface Submission {
  id: string;
  answers: Record<string, unknown>;
}

export async function createSubmission(): Promise<Submission> {
  const res = await fetch(`${API_BASE}/submissions`, { method: "POST" });
  if (!res.ok) throw new Error("Failed to create submission");
  return res.json();
}

export async function getSubmission(id: string): Promise<Submission | null> {
  const res = await fetch(`${API_BASE}/submissions/${id}`);
  if (res.status === 404) return null;
  if (!res.ok) throw new Error("Failed to get submission");
  return res.json();
}

export async function updateSubmission(
  id: string,
  answers: Record<string, unknown>
): Promise<Submission> {
  const res = await fetch(`${API_BASE}/submissions/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ answers }),
  });
  if (!res.ok) throw new Error("Failed to update submission");
  return res.json();
}
