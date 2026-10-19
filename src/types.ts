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
  education?: '8' | '10' | '12' | 'iti' | 'diploma' | 'graduate' | '';
  workPrefs?: string[];
  wantsGovt?: boolean;
}

export type JobStatus = 'Saved' | 'Applied' | 'Interviewing' | 'Offer' | 'Rejected';
export const JOB_STATUSES: JobStatus[] = ['Saved', 'Applied', 'Interviewing', 'Offer', 'Rejected'];

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
  coverLetter?: string;
  outreach?: { emailSubject: string; emailBody: string; linkedinMessage: string; followUp: string };
  interviews: Interview[];
  source?: string;
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
    /** Government notice. official=true means url is a .gov.in/.nic.in page; otherwise it is an aggregator page. */
    govt?: { lastDate: string; official: boolean; via: string };
  };
}

export const emptyProfile: Profile = {
  name: '', headline: '', email: '', phone: '', location: '', links: '', targetRoles: '', minCtc: '', dailyTarget: '5', aiInstructions: '', resumeText: '',
};
