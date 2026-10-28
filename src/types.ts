export interface Profile {
  name: string;
  headline: string;
  email: string;
  phone: string;
  location: string;
  links: string;
  targetRoles: string;
  minCtc: string;
  /** Applications the user wants to send per day. */
  dailyTarget: string;
  /** Extra instructions appended to every AI request (tone, constraints). */
  aiInstructions: string;
  /** One sentence in the user's own words, placed verbatim in cover letters. */
  coverOwnLine?: string;
  /** Plain-text resume. This is what every AI feature reads. */
  resumeText: string;
  /** Comma-separated skills pulled from the resume by AI (editable). */
  skills?: string;
  /** Short experience summary pulled from the resume by AI (editable). */
  experience?: string;
  /** ISO time the guided auto-setup last finished. */
  setupDone?: string;
  /** Short form instead of a resume (blue-collar and fresher flow). */
  manual?: boolean;
  age?: string;
  /** Notice period and start date the user typed (merged from Recruiter-Scraper availability). */
  noticePeriod?: string;
  availableFrom?: string;
  education?: '8' | '10' | '12' | 'iti' | 'diploma' | 'graduate' | '';
  workPrefs?: string[];
  wantsGovt?: boolean;
  /** Where the candidate can work: residence, work authorisations, relocation, modes, shift. Defaults are inferred; every field is editable. */
  elig?: Partial<import('./lib/eligibility').Candidate>;
}

// Pipeline idea (stages + per-stage dates + next action) informed by JobSync (MIT, Gsync) and JobHunter (MIT); no code copied. See THIRD_PARTY_NOTICES.md.
export type JobStatus = 'Saved' | 'Applied' | 'Screening' | 'Interviewing' | 'Offer' | 'Accepted' | 'Rejected' | 'Withdrawn';
export const JOB_STATUSES: JobStatus[] = ['Saved', 'Applied', 'Screening', 'Interviewing', 'Offer', 'Accepted', 'Rejected', 'Withdrawn'];
export const OPEN_STATUSES: JobStatus[] = ['Saved', 'Applied', 'Screening', 'Interviewing', 'Offer'];

export interface JobScore {
  score: number;
  verdict: string;
  strengths: string[];
  gaps: string[];
  keywords: string[];
  recommendation: string;
}

export interface RecruiterReview {
  shortlist: 'Yes' | 'Maybe' | 'No';
  sixSecondRead: string;
  strengths: string[];
  concerns: string[];
  atsRisks: string[];
  fixes: string[];
}

export interface InterviewPrep {
  questions: { question: string; why: string; answerOutline: string }[];
  askThem: string[];
  research: string[];
}

export interface Interview {
  id: string;
  round: string;
  date: string; // yyyy-mm-ddThh:mm
  notes: string;
  link?: string;
  source?: 'manual' | 'calendar' | 'email' | 'ics';
  extId?: string;
}

export interface Job {
  id: string;
  title: string;
  company: string;
  url: string;
  description: string;
  status: JobStatus;
  createdAt: string;
  appliedAt?: string;
  notes: string;
  /** Pay in the user's own unit (e.g. LPA). Optional. */
  salaryMin?: number;
  salaryMax?: number;
  offerAmount?: number;
  score?: JobScore;
  tailoredResume?: string;
  /** Structured ATS resume (JSON Resume subset) tailored to THIS job. tailoredResume holds its plain text. */
  tailoredResumeDoc?: import('./lib/resumeDoc').ResumeDoc;
  /** When each document for this job was generated and downloaded (ISO). Labels and the guided flow read this. */
  docsAt?: { resume?: string; cover?: string; outreach?: string; downloaded?: string };
  /** Constrained layout spec (template, accent, order, density) applied by the resume renderer. */
  resumeStyle?: import('./lib/resumeStyle').StyleSpec;
  coverLetter?: string;
  /** Sentences auto-removed from AI drafts because the fact check could not find them in the resume or job post. */
  removedClaims?: { cover?: string[]; outreach?: string[] };
  outreach?: { emailSubject: string; emailBody: string; linkedinMessage: string; followUp: string };
  interviews: Interview[];
  /** Date (yyyy-mm-dd) each stage was reached. */
  stageAt?: Partial<Record<JobStatus, string>>;
  /** The next thing to do for this job, with an optional due date (reminder). */
  nextAction?: { text: string; due?: string; done?: boolean };
  /** Per-stage prep and mock interview transcripts. */
  stagePrep?: Partial<Record<string, import('./lib/prep').StagePrep>>;
  mock?: Partial<Record<string, import('./lib/prep').MockTurn[]>>;
  source?: string;
  /** Follow-up notes the user marked as sent (cadence stops after 2). */
  followUpsSent?: number;
  /** Last reply the user pasted and how it was classified. */
  reply?: { text: string; kind: string; at: string };
  recruiterReview?: RecruiterReview;
  interviewPrep?: InterviewPrep;
  prepDone?: string[];
  /** Set when this job is a real posting found through FreeHire's public job API. Verify it is still open before applying. */
  found?: {
    provider: 'freehire';
    id: string;
    source: string;
    postedAt: string;
    location: string;
    fit?: { score: number; kind: 'ai' | 'keyword'; summary: string };
    /** Work mode and the eligibility decision for this candidate, with the reason shown as a badge. */
    mode?: import('./lib/eligibility').WorkMode;
    decision?: import('./lib/eligibility').Decision;
    evidence?: string[];
    /** Government notice. official=true means url is a .gov.in/.nic.in page; otherwise it is an aggregator page. */
    govt?: { lastDate: string; official: boolean; via: string };
  };
}

export const emptyProfile: Profile = {
  name: '', headline: '', email: '', phone: '', location: '', links: '', targetRoles: '', minCtc: '', dailyTarget: '5', aiInstructions: '', resumeText: '',
};
