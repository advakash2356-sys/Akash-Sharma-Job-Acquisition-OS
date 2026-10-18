export interface Profile {
  name: string;
  headline: string;
  email: string;
  phone: string;
  location: string;
  links: string;
  targetRoles: string;
  minCtc: string;
  /** Plain-text resume. This is what every AI feature reads. */
  resumeText: string;
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
}

export const emptyProfile: Profile = {
  name: '', headline: '', email: '', phone: '', location: '', links: '', targetRoles: '', minCtc: '', resumeText: '',
};
