// Fallback for the site's free tier: OpenRouter free models (ids ending ":free", plus the "openrouter/free" router).
// Used only when the site's own Gemini key is missing, out of quota or overloaded. Never used with a user's own key.
export const DEFAULT_OR_MODELS = ["openrouter/free", "google/gemma-4-31b-it:free", "nvidia/nemotron-3-ultra-550b-a55b:free"];
export const openRouterConfigured = () => fallbackConfigured();
const models = () => (process.env.OPENROUTER_MODELS || "").split(",").map((s) => s.trim()).filter(Boolean).slice(0, 3);

/** Only free models are allowed, so this path can never bill the site owner. */
export const isFreeModel = (id: string) => id === "openrouter/free" || id.endsWith(":free");

// Fallback chain after Gemini, in order, each skipped when its env key is unset. Checked against each provider's terms:
// Groq (Services Agreement allows Customer Applications with End Users) and OpenRouter (Authorized Users flow-down).
// Excluded: NVIDIA build.nvidia.com (trial terms forbid production / serving real end users) and Cerebras (no free tier:
// a 30-day, card-required $5 trial only).
export interface Provider { name: string; env: string; url: string; body: (m: any[]) => any }
export const PROVIDERS: Provider[] = [
  { name: "groq", env: "GROQ_API_KEY", url: "https://api.groq.com/openai/v1/chat/completions", body: (messages) => ({ model: process.env.GROQ_MODEL || "openai/gpt-oss-120b", messages, max_tokens: 8000 }) },
  { name: "openrouter", env: "OPENROUTER_API_KEY", url: "https://openrouter.ai/api/v1/chat/completions", body: (messages) => ({ models: (models().length ? models() : DEFAULT_OR_MODELS).filter(isFreeModel), messages, max_tokens: 8000 }) },
];
export const fallbackConfigured = () => PROVIDERS.some((p) => !!process.env[p.env]);

/** Tries each configured fallback provider in order; on 429/quota/any error moves to the next. */
export async function fallbackGenerate(req: { contents: string; config?: any }, timeoutMs = 30000): Promise<{ text: string; provider: string }> {
  let last: any = Object.assign(new Error("No fallback AI provider is configured."), { status: 503 });
  for (const p of PROVIDERS) {
    if (!process.env[p.env]) continue;
    try { return { ...(await chat(p, req, timeoutMs)), provider: p.name }; } catch (e) { last = e; }
  }
  throw last;
}
export const openRouterGenerate = fallbackGenerate;

async function chat(p: Provider, req: { contents: string; config?: any }, timeoutMs: number): Promise<{ text: string }> {
  const key = process.env[p.env]!;
  const schema = req.config?.responseSchema;
  const system = [req.config?.systemInstruction, schema ? `Reply with ONLY one JSON object (no markdown fences) that matches this JSON schema:\n${JSON.stringify(schema)}` : ""].filter(Boolean).join("\n\n");
  const messages = [...(system ? [{ role: "system", content: system }] : []), { role: "user", content: req.contents }];
  const res = await fetch(p.url, {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json", ...(p.name === "openrouter" ? { "HTTP-Referer": "https://akash-sharma-job-acquisition-os.vercel.app", "X-Title": "Job Acquisition OS" } : {}) },
    body: JSON.stringify({ ...p.body(messages), ...(schema ? { response_format: { type: "json_object" } } : {}) }),
    signal: AbortSignal.timeout(timeoutMs),
  });
  const d: any = await res.json().catch(() => ({}));
  if (!res.ok || d.error) throw Object.assign(new Error(`${p.name}: ${d?.error?.message || res.status}`), { status: d?.error?.code || res.status });
  let text = String(d?.choices?.[0]?.message?.content || "").trim();
  if (schema) text = extractJson(text);
  return { text };
}
export function extractJson(t: string) {
  const s = t.replace(/^```(?:json)?\s*/i, "").replace(/```\s*$/, "").trim();
  const a = s.indexOf("{"), b = s.lastIndexOf("}");
  return a >= 0 && b > a ? s.slice(a, b + 1) : s;
}
