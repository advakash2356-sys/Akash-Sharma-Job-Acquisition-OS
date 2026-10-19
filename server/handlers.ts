import { GoogleGenAI, Type } from "@google/genai";

export class ApiError extends Error {
  constructor(public status: number, message: string, public code?: string) { super(message); }
}

// Listed by ListModels with generateContent; gemini-2.5-flash is retired for new keys, so it is not used. Tried in order when a model is missing, busy or out of quota.
const MODELS = ["gemini-flash-latest", "gemini-3.8-flash", "gemini-3.6-flash", "gemini-flash-lite-latest"];

/** Pulls Google's real status + message out of an @google/genai error. */
export function googleError(e: any): { status: number; code: string; message: string } {
  const raw = String(e?.message || e || "");
  let status = Number(e?.status) || 0;
  let msg = raw;
  try {
    const j = JSON.parse(raw);
    if (j?.error) { status = Number(j.error.code) || status; msg = j.error.message || msg; }
  } catch { /* not JSON */ }
  msg = msg.replace(/\s+/g, " ").slice(0, 300);
  return { status, code: "", message: msg };
}

function explain(e: any): ApiError {
  if (e instanceof ApiError) return e;
  const g = googleError(e);
  const m = g.message;
  if (/API key not valid|API_KEY_INVALID|API key expired|invalid api key/i.test(m)) return new ApiError(401, `Google says this API key is invalid: "${m}". Copy a fresh key from aistudio.google.com/apikey.`, "BAD_API_KEY");
  if (g.status === 429 || /RESOURCE_EXHAUSTED|quota/i.test(m)) return new ApiError(429, `Google says the free-tier limit is reached: "${m}". Wait a minute and retry.`, "RATE_LIMIT");
  if (/location is not supported|not available in your (country|region)/i.test(m)) return new ApiError(403, `Google says the Gemini API is not available from this server's region: "${m}".`, "REGION");
  if (g.status === 403 || /PERMISSION_DENIED/i.test(m)) return new ApiError(403, `Google denied access for this key: "${m}". The key may be restricted or the Generative Language API disabled for its project.`, "PERMISSION");
  if (g.status === 404 || /not found|not supported for generateContent/i.test(m)) return new ApiError(502, `Google says the AI model is unavailable for this key: "${m}".`, "MODEL");
  if (g.status === 400) return new ApiError(502, `Google rejected the request: "${m}".`, "BAD_REQUEST");
  if (g.status === 503 || /overloaded|UNAVAILABLE/i.test(m)) return new ApiError(503, `Google's model is overloaded right now: "${m}". Try again shortly.`, "OVERLOADED");
  return new ApiError(502, `The AI request failed${g.status ? ` (Google ${g.status})` : ""}: "${m || "no details"}".`, "UPSTREAM");
}

const retryable = (e: any) => { const g = googleError(e); return g.status === 404 || g.status === 429 || g.status === 503 || /not found|RESOURCE_EXHAUSTED|overloaded/i.test(g.message); };

async function generate(client: GoogleGenAI, req: { contents: string; config?: any }) {
  let last: any;
  for (const model of MODELS) {
    try {
      const res = await client.models.generateContent({ model, ...req });
      if (res.text) return res;
      last = new ApiError(502, "The AI returned an empty response. Try again.", "EMPTY");
    } catch (e) {
      if (!last || googleError(last).status === 404) last = e; // keep the most informative error (quota beats not-found)
      if (!retryable(e)) throw e;
    }
  }
  throw last;
}

const SYSTEM = `You are a careful career assistant. You work ONLY from the candidate's resume text supplied in the request.
Never invent employers, dates, degrees, certifications, or metrics that are not in the resume. If something is missing, say so.
Be specific, concise, and honest.`;

interface Body { [k: string]: any }

function need(body: Body) {
  const resume = String(body.resume || "").trim();
  if (resume.length < 50) throw new ApiError(400, "Add your resume first (Resume page). It is used for every AI feature.", "NO_RESUME");
  if (!String(body.title || "").trim() || !String(body.description || "").trim()) {
    throw new ApiError(400, "A job title and description are required.", "BAD_INPUT");
  }
  return {
    resume: resume.slice(0, 20000),
    title: String(body.title).slice(0, 200),
    company: String(body.company || "the company").slice(0, 200),
    description: String(body.description).slice(0, 20000),
    prefs: `Target roles: ${body.targetRoles || "n/a"}. Minimum CTC: ${body.minCtc || "n/a"}.`,
    name: String(body.name || "the candidate").slice(0, 120),
    instructions: String(body.instructions || "").slice(0, 1000),
  };
}

const str = { type: Type.STRING };
const strs = { type: Type.ARRAY, items: { type: Type.STRING } };

async function run(client: GoogleGenAI, prompt: string, schema?: any) {
  const res = await generate(client, {
    contents: prompt,
    config: {
      systemInstruction: SYSTEM,
      ...(schema ? { responseMimeType: "application/json", responseSchema: schema } : {}),
    },
  });
  if (!res.text) throw new ApiError(502, "The AI returned an empty response. Try again.");
  return schema ? JSON.parse(res.text) : res.text;
}


function resumeOnly(body: Body) {
  const resume = String(body.resume || "").trim();
  if (resume.length < 50) throw new ApiError(400, "Add your resume first. It is used for every AI feature.", "NO_RESUME");
  return resume.slice(0, 20000);
}

function extractJson(text: string): any {
  const m = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  const raw = (m ? m[1] : text).trim();
  const start = raw.search(/[\[{]/);
  return JSON.parse(start >= 0 ? raw.slice(start) : raw);
}

async function parseResume(client: GoogleGenAI, body: Body) {
  const resume = resumeOnly(body);
  return run(client, `RESUME TEXT:\n${resume}\n\nExtract the candidate's details strictly from this text. Use an empty string or empty list when something is not stated. Do not guess. "minPay" must be empty unless the resume states a pay expectation. "targetTitles" are 3-5 job titles this person is best suited for, based only on their experience.`, {
    type: Type.OBJECT,
    properties: {
      name: str, headline: str, email: str, phone: str, location: str, links: str, minPay: str,
      skills: strs, targetTitles: strs,
      experience: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { role: str, company: str, period: str }, required: ["role", "company", "period"] } },
    },
    required: ["name", "headline", "email", "phone", "location", "links", "minPay", "skills", "targetTitles", "experience"],
  });
}

async function suggestJobs(client: GoogleGenAI, body: Body) {
  const resume = resumeOnly(body);
  const titles = String(body.targetRoles || "").slice(0, 300) || "(infer from resume)";
  const loc = String(body.location || "").slice(0, 120) || "anywhere / remote";
  const base = `CANDIDATE RESUME:\n${resume.slice(0, 8000)}\n\nTarget titles: ${titles}\nLocation: ${loc}\nMinimum pay: ${body.minCtc || "n/a"}\n\n`;
  // 1) Try Google Search grounding (real, current results).
  let groundingError = "";
  try {
    const res = await generate(client, {
      contents: base + `Use Google Search to find real, currently open job postings and hiring companies that best match this candidate. Return ONLY a JSON array (inside a \`\`\`json block) of up to 8 items: {"title": string, "company": string, "location": string, "why": string (1-2 sentences tied to the resume), "url": string (only a page you actually saw in search results, else "")}. Never invent a company, posting or URL; return fewer items if unsure.`,
      config: { systemInstruction: SYSTEM, tools: [{ googleSearch: {} }] },
    });
    const chunks: any[] = (res as any).candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    const sources = chunks.filter((c) => c.web?.uri).map((c) => ({ title: String(c.web.title || ""), uri: String(c.web.uri) }));
    if (!sources.length) throw new Error("search returned no sources");
    const items = extractJson(res.text || "[]");
    const hosts = new Set(sources.map((s) => s.title.toLowerCase().replace(/^www\./, "")));
    const suggestions = (Array.isArray(items) ? items : []).slice(0, 8).map((it: any) => {
      let url = "";
      try { const h = new URL(String(it.url)).hostname.toLowerCase().replace(/^www\./, ""); if (hosts.has(h)) url = String(it.url); } catch { /* no url */ }
      return { title: String(it.title || ""), company: String(it.company || ""), location: String(it.location || ""), why: String(it.why || ""), url };
    }).filter((x: any) => x.title);
    return { grounded: true, note: "Found with Google Search. These are suggestions from web results, not verified postings. Open the source and confirm the role is still open.", suggestions, sources: sources.slice(0, 8) };
  } catch (e: any) {
    const ge = googleError(e);
    groundingError = ge.message || String(e?.message || e);
  }
  // 2) Honest fallback: role titles + search queries only. No companies, no postings, no URLs invented.
  const out = await run(client, base + "Search is not available. Suggest 6 job titles that best match this candidate, each with a short reason tied to the resume and a good job-board search query. Do NOT name specific companies or postings.", {
    type: Type.OBJECT,
    properties: { roles: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { title: str, why: str, query: str }, required: ["title", "why", "query"] } } },
    required: ["roles"],
  });
  return {
    grounded: false,
    note: `Google Search grounding was not available for this key (${groundingError.slice(0, 160) || "unknown reason"}), so these are role titles to search for, not job postings. Use the job-board links to find real openings.`,
    suggestions: (out.roles || []).slice(0, 6).map((r: any) => ({ title: String(r.title), company: "", location: "", why: String(r.why), url: "", query: String(r.query || r.title) })),
    sources: [],
  };
}

export async function handleAction(action: string, body: Body, apiKey?: string) {
  const key = apiKey || process.env.GEMINI_API_KEY;
  if (!key) throw new ApiError(401, "No API key set. Add your free Gemini key in Settings.", "NO_API_KEY");
  if (action === "test-key") {
    try {
      await generate(new GoogleGenAI({ apiKey: key }), { contents: "Reply with the single word: ok" });
      return { result: { ok: true } };
    } catch (e: any) { throw explain(e); }
  }
  if (action === "parse-resume" || action === "suggest-jobs") {
    try { const c = new GoogleGenAI({ apiKey: key }); return { result: action === "parse-resume" ? await parseResume(c, body) : await suggestJobs(c, body) }; }
    catch (e: any) { throw explain(e); }
  }
  const j = need(body);
  const client = new GoogleGenAI({ apiKey: key });
  const ctx = `${j.instructions ? `USER INSTRUCTIONS (follow unless they ask for fabrication): ${j.instructions}\n\n` : ''}CANDIDATE RESUME:\n${j.resume}\n\nPREFERENCES: ${j.prefs}\n\nJOB: ${j.title} at ${j.company}\n${j.description}`;

  try {
    switch (action) {
      case "score-job":
        return { result: await run(client, `${ctx}\n\nScore how well this candidate fits the job (0-100). Be honest and base it on the resume only.`, {
          type: Type.OBJECT,
          properties: { score: { type: Type.INTEGER }, verdict: str, strengths: strs, gaps: strs, keywords: strs, recommendation: str },
          required: ["score", "verdict", "strengths", "gaps", "keywords", "recommendation"],
        }) };
      case "tailor-resume":
        return { result: await run(client, `${ctx}\n\nRewrite the candidate's resume tailored to this job as clean markdown. Keep every fact true to the original; only reorder, rephrase and weave in relevant keywords. Return the full resume.`) };
      case "generate-cover-letter":
        return { result: await run(client, `${ctx}\n\nWrite a concise (under 300 words), confident, specific cover letter from ${j.name}. No filler. Use only facts in the resume.`) };
      case "generate-outreach":
        return { result: await run(client, `${ctx}\n\nContact: ${body.contactName || "Hiring manager"} (${body.contactTitle || "Recruiter"}).\nWrite cold outreach from ${j.name}: a short email (subject + body), a LinkedIn message under 300 characters, and a 5-day follow-up note.`, {
          type: Type.OBJECT,
          properties: { emailSubject: str, emailBody: str, linkedinMessage: str, followUp: str },
          required: ["emailSubject", "emailBody", "linkedinMessage", "followUp"],
        }) };
      case "recruiter-review":
        return { result: await run(client, `${ctx}\n\nAct as a busy recruiter doing a 6-second screen of this resume against this job, then as an ATS. Be candid. Base everything on the resume text only.`, {
          type: Type.OBJECT,
          properties: { shortlist: { type: Type.STRING, description: "Yes, Maybe or No" }, sixSecondRead: str, strengths: strs, concerns: strs, atsRisks: strs, fixes: strs },
          required: ["shortlist", "sixSecondRead", "strengths", "concerns", "atsRisks", "fixes"],
        }) };
      case "interview-prep":
        return { result: await run(client, `${ctx}\n\nPrepare the candidate for interviews for this job: 8 likely questions (each with why they ask it and a short answer outline using ONLY real resume facts), 5 smart questions to ask the interviewer, and 4 research tips about the company/role.`, {
          type: Type.OBJECT,
          properties: {
            questions: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { question: str, why: str, answerOutline: str }, required: ["question", "why", "answerOutline"] } },
            askThem: strs, research: strs,
          },
          required: ["questions", "askThem", "research"],
        }) };
      default:
        throw new ApiError(404, "Unknown action.");
    }
  } catch (e: any) {
    throw explain(e);
  }
}

export const serverKeyConfigured = () => !!process.env.GEMINI_API_KEY;

export function keyFromHeaders(h: any): string | undefined {
  const raw = h?.["x-user-gemini-key"];
  const k = typeof raw === "string" ? raw.trim() : "";
  return k && k.length <= 256 ? k : undefined;
}
