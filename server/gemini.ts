import { GoogleGenAI, Type } from "@google/genai";
import { resolveGeminiKey } from "./userKey.js";
import { masterResume } from "../src/data/masterResume.js";

// Initialize Gemini Client
const getGeminiClient = () => {
  const apiKey = resolveGeminiKey();
  if (!apiKey) {
    throw new Error("No Gemini API key: set GEMINI_API_KEY or enter your key in the app (API key button).");
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
};

const MASTER_SYSTEM_PROMPT = `
You are the AI Scoring Engine & Career Assistant for Akash Sharma's Job Acquisition OS (v2.0 – ₹18 LPA Floor).

Candidate Profile & Verified Facts (DO NOT DEVIATE OR FABRICATE):
- Name: Akash Sharma
- Current Position: Team Lead, Operations & Process Architecture at Gartner (Mar 2020 – Present). STILL EMPLOYEED AT GARTNER.
- Gartner Tenure: 8+ Years (Dec 2018 – Present across Specialist & Team Lead roles).
- Prior Role: Process Associate at UnitedLex BPO Pvt. Ltd. (Jul 2017 – Dec 2018).
- Legal Degree: LLB (Bachelor of Laws) – Maharishi Dayanand University (MDU), Rohtak (2017).
- Key Metrics & Verified Achievements:
  - 6 direct reports managed; 20+ global office stakeholders trained.
  - Cut turnaround times (TAT) by up to 60% using structured Root Cause Analysis (RCA).
  - Authored 5+ operational playbooks used as institutional standards.
  - Primary liaison translating BRD/FRD business requirements to IT & platform governance.
  - Experienced with Salesforce CRM & CLM (Apttus), Microsoft 365 Copilot, Generative AI, and Privacy-by-Design ("Rural India AI").
- Certifications: Generative AI Mastermind Certification (Jul 2026), Microsoft 365 Copilot for Work, Career Essentials in Generative AI.
- Target CTC Floor: ₹18,00,000 (18 LPA) CTC minimum. Target range: ₹18–28 LPA.
- Target Titles: Strategy & Governance Lead / Operations & Process Architecture Lead / Legal Ops / CLM / AI-Enabled Operations Lead.

CRITICAL RESUME TAILORING TRUTH MANDATE:
1. NEVER LIE, FABRICATE, OVERCOMMIT, OR OVERSELL on the resume or cover letter.
2. Keep all dates, company names (Gartner, UnitedLex), degrees (LLB MDU Rohtak), and certifications strictly standard and accurate.
3. Only rephrase or fine-tune existing verified accomplishments to naturally weave in target ATS keywords from the job description.
4. Salary Floor: Minimum ₹18 LPA CTC. Roles <18 LPA must be marked ctcFloorPassed: false.
`;

export async function scoreJobDescription(jobInput: {
  title: string;
  company: string;
  description: string;
  location?: string;
  workMode?: string;
  shift?: string;
  ctcMinLpa?: number;
  ctcMaxLpa?: number;
  source?: string;
}) {
  const ai = getGeminiClient();

  const prompt = `Evaluate the following Job Description against Akash Sharma's Master Profile and 18 LPA Floor Hard Rules:

Job Title: ${jobInput.title}
Company: ${jobInput.company}
Location: ${jobInput.location || 'Not specified'}
Work Mode: ${jobInput.workMode || 'Not specified'}
Shift: ${jobInput.shift || 'Not specified'}
Quoted CTC Min (LPA): ${jobInput.ctcMinLpa || 'Not specified'}
Quoted CTC Max (LPA): ${jobInput.ctcMaxLpa || 'Not specified'}
Source: ${jobInput.source || 'Direct'}

Job Description Text:
${jobInput.description}

Provide a strict, mathematical 6-dimension scoring breakdown according to the Master Prompt rules.`;

  const response = await ai.models.generateContent({
    model: "gemini-3.6-flash",
    contents: prompt,
    config: {
      systemInstruction: MASTER_SYSTEM_PROMPT,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          salaryScore: { type: Type.INTEGER, description: "Score out of 25 for CTC >= 18 LPA floor clarity and upside" },
          titleSkillsScore: { type: Type.INTEGER, description: "Score out of 25 for Process + CLM + Legal Ops + AI match" },
          companyQualityScore: { type: Type.INTEGER, description: "Score out of 15 for company tier, growth and AI maturity" },
          locationShiftScore: { type: Type.INTEGER, description: "Score out of 15 for Remote / US-Shift / Delhi-NCR fit" },
          referralScore: { type: Type.INTEGER, description: "Score out of 10 for referral or Gartner network connection probability" },
          postingAgeScore: { type: Type.INTEGER, description: "Score out of 10 for posting fresh age and competition" },
          totalScore: { type: Type.INTEGER, description: "Sum of all 6 scores (0-100)" },
          ctcFloorPassed: { type: Type.BOOLEAN, description: "True if estimated or stated CTC is >= 18 LPA, false if < 18 LPA" },
          tier: { type: Type.STRING, description: "HIGH_PRIORITY (>=75), MEDIUM_PRIORITY (60-74), or DISCARD (<60 or CTC <18 LPA)" },
          pros: { type: Type.ARRAY, items: { type: Type.STRING }, description: "3-5 top advantages of this role for Akash" },
          redFlags: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Any warnings, low salary indicators, or location/onsite drawbacks" },
          skillGaps: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Specific terms or keywords to highlight or bridge in tailored resume" },
          recommendation: { type: Type.STRING, description: "Clear 1-2 sentence operational recommendation for Akash" },
          estimatedCtcMin: { type: Type.NUMBER, description: "Estimated CTC min in LPA if not explicitly stated" },
          estimatedCtcMax: { type: Type.NUMBER, description: "Estimated CTC max in LPA if not explicitly stated" },
        },
        required: [
          "salaryScore", "titleSkillsScore", "companyQualityScore", "locationShiftScore",
          "referralScore", "postingAgeScore", "totalScore", "ctcFloorPassed",
          "tier", "pros", "redFlags", "skillGaps", "recommendation"
        ]
      },
    },
  });

  if (!response.text) {
    throw new Error("No response text returned from Gemini API");
  }

  return JSON.parse(response.text);
}

export async function tailorResumeForJob(job: {
  title: string;
  company: string;
  description: string;
}) {
  const ai = getGeminiClient();

  const prompt = `Generate a tailored executive resume for Akash Sharma targeted specifically for this role:
  
Target Role: ${job.title} at ${job.company}

Job Description:
${job.description}

Master Resume Base:
${JSON.stringify(masterResume, null, 2)}

Strict Instructions:
1. Preserve all factual achievements (60% TAT reduction, 6 direct reports, 20+ stakeholders trained, 5+ SOP playbooks, Gartner 7+ years, LLB, live AI projects shipped).
2. DO NOT invent fake companies, degrees, or false metrics.
3. Adjust the Executive Summary and Bullet points to align seamlessly with ATS keywords from the target job description (e.g. emphasizing CLM software, process transformation, agentic AI, RCA, SLA management).
4. Emphasize the AI differentiator that justifies ₹18–28 LPA compensation.
5. Provide:
   - Tailored Executive Summary
   - Core Positioning Statement
   - Highlighted Skills Matrix
   - Customized Experience Highlights for Gartner & Legal Ops
   - Key ATS Keywords Matched`;

  const response = await ai.models.generateContent({
    model: "gemini-3.6-flash",
    contents: prompt,
    config: {
      systemInstruction: MASTER_SYSTEM_PROMPT,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          executiveSummary: { type: Type.STRING },
          corePositioning: { type: Type.STRING },
          keySkillsHighlighted: { type: Type.ARRAY, items: { type: Type.STRING } },
          experienceBullets: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                role: { type: Type.STRING },
                bullets: { type: Type.ARRAY, items: { type: Type.STRING } }
              }
            }
          },
          aiProjectsFocus: { type: Type.STRING },
          atsKeywordsMatched: { type: Type.ARRAY, items: { type: Type.STRING } },
          fullFormattedResumeText: { type: Type.STRING, description: "Complete ready-to-copy text resume in clean markdown formatting" }
        },
        required: ["executiveSummary", "corePositioning", "keySkillsHighlighted", "experienceBullets", "aiProjectsFocus", "atsKeywordsMatched", "fullFormattedResumeText"]
      }
    }
  });

  return JSON.parse(response.text || "{}");
}

export async function generateCoverLetter(job: {
  title: string;
  company: string;
  description: string;
}) {
  const ai = getGeminiClient();

  const prompt = `Draft a high-impact, professional executive Cover Letter for Akash Sharma targeting:
Role: ${job.title}
Company: ${job.company}
Job Description: ${job.description}

Key positioning to weave in:
- Strategic Operations & Process Transformation Leader (9+ yrs, 7+ Gartner)
- 60% TAT reduction via RCA & workflow restructuring
- Legal Ops & CLM expertise backed by formal LLB degree
- Agentic AI hands-on practitioner (building production AI tools & Copilot workflows)
- Proven leadership of 6 direct reports & 20+ executive stakeholders

Tone: Confident, executive, outcome-driven, direct, tailored. No fluff or generic SaaS buzzwords.`;

  const response = await ai.models.generateContent({
    model: "gemini-3.6-flash",
    contents: prompt,
    config: {
      systemInstruction: MASTER_SYSTEM_PROMPT,
    }
  });

  return { coverLetter: response.text };
}

export async function generateOutreachMessage(job: {
  title: string;
  company: string;
  description: string;
  contactName?: string;
  contactTitle?: string;
}) {
  const ai = getGeminiClient();

  const prompt = `Create high-converting cold outreach communications for Akash Sharma to send to the hiring manager or recruiter for this position:

Role: ${job.title} at ${job.company}
Target Contact: ${job.contactName || 'Hiring Manager / Talent Acquisition Leader'} (${job.contactTitle || 'Recruitment Lead'})
Job Description Summary: ${job.description.slice(0, 500)}...

Provide 3 distinct, punchy formats:
1. Hiring Manager Direct Email (Subject + 150-word crisp email highlighting 60% TAT cut, Gartner pedigree, LLB + Agentic AI)
2. LinkedIn InMail / Short Note (< 300 characters for high response rate)
3. Gartner Alumni / Warm Network Outreach (Friendly, authoritative peer outreach)
`;

  const response = await ai.models.generateContent({
    model: "gemini-3.6-flash",
    contents: prompt,
    config: {
      systemInstruction: MASTER_SYSTEM_PROMPT,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          emailSubject: { type: Type.STRING },
          emailBody: { type: Type.STRING },
          linkedinInMail: { type: Type.STRING },
          alumniWarmIntro: { type: Type.STRING },
          strategicAdvice: { type: Type.STRING, description: "Tip on when and how to follow up (e.g. strict 5-day cadence)" }
        },
        required: ["emailSubject", "emailBody", "linkedinInMail", "alumniWarmIntro", "strategicAdvice"]
      }
    }
  });

  return JSON.parse(response.text || "{}");
}
