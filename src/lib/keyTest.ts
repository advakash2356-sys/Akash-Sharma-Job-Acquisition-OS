/** One tiny validation call made straight from the browser to Google: lists models (no tokens, no cost).
 *  The key goes only to generativelanguage.googleapis.com, in a header, not the URL. */
export const KEY_TEST_URL = 'https://generativelanguage.googleapis.com/v1beta/models?pageSize=1';
export const looksLikeKey = (k: string) => /^[A-Za-z0-9_-]{30,64}$/.test(k.trim());
export async function testGeminiKey(key: string, f: typeof fetch = fetch): Promise<{ ok: boolean; text: string }> {
  const k = key.trim();
  if (!k) return { ok: false, text: 'Paste your key first.' };
  if (!looksLikeKey(k)) return { ok: false, text: "That doesn't look like a Gemini key. It is usually about 39 characters and starts with AIza. Copy it again from AI Studio." };
  try {
    const r = await f(KEY_TEST_URL, { headers: { 'x-goog-api-key': k }, signal: AbortSignal.timeout(10000) });
    if (r.ok) return { ok: true, text: 'Key works. AI features are ready.' };
    const d: any = await r.json().catch(() => ({}));
    const m = String(d?.error?.message || '');
    if (r.status === 400 || r.status === 401 || /API key not valid/i.test(m)) return { ok: false, text: "Google says this key isn't valid. Copy it again from AI Studio, with nothing missing." };
    if (r.status === 403) return { ok: false, text: 'Google blocked this key. It may be restricted, or the Gemini API is off for its project. Create a new key in AI Studio.' };
    if (r.status === 429) return { ok: false, text: 'The key is valid but busy right now (free limit). Wait a minute and test again.' };
    return { ok: false, text: `Google answered with an error (${r.status}). Try again in a minute.` };
  } catch { return { ok: false, text: "Couldn't reach Google. Check your internet and try again." }; }
}
