import { GoogleGenAI, Type } from "@google/genai";

export class ApiError extends Error {
  constructor(public status: number, message: string, public code?: string) { super(message); }
}

const MODEL = "gemini-3.6-flash";

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
  };
}

const str = { type: Type.STRING };
const strs = { type: Type.ARRAY, items: { type: Type.STRING } };

async function run(client: GoogleGenAI, prompt: string, schema?: any) {
  const res = await client.models.generateContent({
    model: MODEL,
    contents: prompt,
    config: {
      systemInstruction: SYSTEM,
      ...(schema ? { responseMimeType: "application/json", responseSchema: schema } : {}),
    },
  });
  if (!res.text) throw new ApiError(502, "The AI returned an empty response. Try again.");
  return schema ? JSON.parse(res.text) : res.text;
}

export async function handleAction(action: string, body: Body, apiKey?: string) {
  const key = apiKey || process.env.GEMINI_API_KEY;
  if (!key) throw new ApiError(401, "No API key set. Add your free Gemini key in Settings.", "NO_API_KEY");
  const j = need(body);
  const client = new GoogleGenAI({ apiKey: key });
  const ctx = `CANDIDATE RESUME:\n${j.resume}\n\nPREFERENCES: ${j.prefs}\n\nJOB: ${j.title} at ${j.company}\n${j.description}`;

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
      default:
        throw new ApiError(404, "Unknown action.");
    }
  } catch (e: any) {
    if (e instanceof ApiError) throw e;
    const msg = String(e?.message || e);
    if (/API key|API_KEY|permission|401|403/i.test(msg)) throw new ApiError(401, "The API key was rejected. Check it in Settings.", "BAD_API_KEY");
    if (/429|quota|rate/i.test(msg)) throw new ApiError(429, "Free-tier limit reached. Wait a minute or use your own key in Settings.", "RATE_LIMIT");
    throw new ApiError(502, "The AI request failed. Try again.");
  }
}

export function keyFromHeaders(h: any): string | undefined {
  const raw = h?.["x-user-gemini-key"];
  const k = typeof raw === "string" ? raw.trim() : "";
  return k && k.length <= 256 ? k : undefined;
}
