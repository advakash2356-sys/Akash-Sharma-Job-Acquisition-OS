// Fallback for the site's free tier: OpenRouter free models (ids ending ":free", plus the "openrouter/free" router).
// Used only when the site's own Gemini key is missing, out of quota or overloaded. Never used with a user's own key.
export const DEFAULT_OR_MODELS = ["openrouter/free", "google/gemma-4-31b-it:free", "nvidia/nemotron-3-ultra-550b-a55b:free"];
export const openRouterConfigured = () => !!process.env.OPENROUTER_API_KEY;
const models = () => (process.env.OPENROUTER_MODELS || "").split(",").map((s) => s.trim()).filter(Boolean).slice(0, 3);

/** Only free models are allowed, so this path can never bill the site owner. */
export const isFreeModel = (id: string) => id === "openrouter/free" || id.endsWith(":free");

export async function openRouterGenerate(req: { contents: string; config?: any }, timeoutMs = 30000): Promise<{ text: string }> {
  const key = process.env.OPENROUTER_API_KEY;
  if (!key) throw Object.assign(new Error("OpenRouter is not configured."), { status: 503 });
  const list = (models().length ? models() : DEFAULT_OR_MODELS).filter(isFreeModel);
  const schema = req.config?.responseSchema;
  const system = [req.config?.systemInstruction, schema ? `Reply with ONLY one JSON object (no markdown fences) that matches this JSON schema:\n${JSON.stringify(schema)}` : ""].filter(Boolean).join("\n\n");
  const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json", "HTTP-Referer": "https://akash-sharma-job-acquisition-os.vercel.app", "X-Title": "Job Acquisition OS" },
    body: JSON.stringify({ models: list, messages: [...(system ? [{ role: "system", content: system }] : []), { role: "user", content: req.contents }], max_tokens: 8000, ...(schema ? { response_format: { type: "json_object" } } : {}) }),
    signal: AbortSignal.timeout(timeoutMs),
  });
  const d: any = await res.json().catch(() => ({}));
  if (!res.ok || d.error) throw Object.assign(new Error(`OpenRouter: ${d?.error?.message || res.status}`), { status: d?.error?.code || res.status });
  let text = String(d?.choices?.[0]?.message?.content || "").trim();
  if (schema) text = extractJson(text);
  return { text };
}
export function extractJson(t: string) {
  const s = t.replace(/^```(?:json)?\s*/i, "").replace(/```\s*$/, "").trim();
  const a = s.indexOf("{"), b = s.lastIndexOf("}");
  return a >= 0 && b > a ? s.slice(a, b + 1) : s;
}
