export type ScoreTier = 'HIGH_PRIORITY' | 'MEDIUM_PRIORITY' | 'DISCARD';

export type JobStatus = 
  | 'Discovered'
  | 'Scored'
  | 'Tailored'
  | 'Applied'
  | 'Interviewing'
  | 'Offer Received'
  | 'Archived'
  | 'Rejected';

export interface SuccessProbabilityBreakdown {
  overallPercentage: number; // e.g. 88 (0-100%)
  keywordMatchConfidence: number; // e.g. 92% based on resume keyword overlap
  historicalConversionRate: number; // e.g. 80% based on application channel performance
  riskLevel: 'VERY_HIGH' | 'HIGH' | 'MODERATE' | 'LOW';
  keyDrivers: string[];
}

export interface ScoreBreakdown {
  salaryScore: number; // Max 25
  titleSkillsScore: number; // Max 25
  companyQualityScore: number; // Max 15
  locationShiftScore: number; // Max 15
  referralScore: number; // Max 10
  postingAgeScore: number; // Max 10
  totalScore: number; // Max 100
  ctcFloorPassed: boolean; // Must be >= 18 LPA
  tier: ScoreTier;
  pros: string[];
  redFlags: string[];
  skillGaps: string[];
  recommendation: string;
  successProbability?: SuccessProbabilityBreakdown;
}

export interface InterviewRound {
  id: string;
  roundNumber: number;
  roundTitle: string; // e.g. "Recruiter Screening", "Hiring Manager Technical", "Legal Ops Case Study", "Executive Leadership", "HR & Negotiation"
  scheduledDate?: string; // e.g. "2026-08-02T14:30"
  interviewerName?: string;
  interviewerTitle?: string;
  meetingLink?: string;
  status: 'Scheduled' | 'Completed' | 'Passed' | 'Rejected' | 'Needs Follow-Up';
  prepNotes?: string;
  feedbackNotes?: string;
  questionsAsked?: string[];
}

export type RoleCategory = 
  | 'Legal Ops & CLM Transformation' 
  | 'Strategic Operations Lead' 
  | 'Enterprise AI & Process Automation' 
  | 'General Manager / Director';

export type CompanyCultureCategory = 
  | 'Top-Tier Consulting (Deloitte / EY)' 
  | 'High-Growth Tech & LegalTech' 
  | 'Corporate GCC / MNC' 
  | 'Gartner Alumni / Warm Network';

export type TemplateChannel = 'LinkedIn InMail' | 'Cold Email' | '5-Day Follow-Up' | 'Warm Alumni Intro';

export interface ColdEmailTemplate {
  id: string;
  title: string;
  roleCategory: RoleCategory;
  cultureCategory: CompanyCultureCategory;
  channel: TemplateChannel;
  subject: string;
  body: string;
  description: string;
  conversionRateEstimate: string; // e.g. "55% Response Rate"
  keyHighlights: string[];
}

export interface JobRole {
  id: string;
  title: string;
  company: string;
  location: string;
  workMode: 'Remote' | 'Hybrid NCR' | 'Onsite NCR' | 'Non-NCR Onsite';
  shift: 'US/Night Shift' | 'Day Shift' | 'Flexible';
  ctcMinLpa: number;
  ctcMaxLpa: number;
  salaryUnclear: boolean;
  source: 'LinkedIn' | 'Naukri' | 'Gartner Alumni' | 'Legal Ops Community' | 'Company Page' | 'Referral';
  jobUrl?: string;
  description: string;
  dateAdded: string;
  appliedDate?: string;
  followUpDate?: string;
  status: JobStatus;
  scores: ScoreBreakdown;
  tailoredResumeId?: string;
  coverLetter?: string;
  outreachMessage?: string;
  contactPerson?: {
    name: string;
    title: string;
    linkedinUrl?: string;
    email?: string;
  };
  notes?: string;
  estimatedHoursSpent?: number;
  interviews?: InterviewRound[];
}

export interface MasterResumeData {
  name: string;
  title: string;
  contact: {
    email: string;
    phone: string;
    location: string;
    linkedin: string;
    github?: string;
  };
  executiveSummary: string;
  corePositioning: string;
  keyMetrics: {
    tatReduction: string;
    teamSize: string;
    stakeholdersTrained: string;
    playbooksAuthored: string;
    liveAiProducts: string[];
    yearsExp: string;
    gartnerTenure: string;
  };
  skills: {
    strategicOps: string[];
    legalOpsClm: string[];
    aiAutomation: string[];
    leadership: string[];
  };
  experience: {
    company: string;
    role: string;
    period: string;
    location: string;
    achievements: string[];
  }[];
  education: {
    degree: string;
    institution: string;
    year: string;
    details?: string;
  }[];
  aiProjects: {
    name: string;
    description: string;
    techStack: string[];
    impact: string;
  }[];
}

export interface TargetConfig {
  targetMinCtc: number; // Default 18
  targetMaxCtc: number; // Default 28
  targetRangeMode: '18-22 LPA' | '22-28 LPA Push';
  shiftPreference: 'Pure Remote US-Shift' | 'Delhi-NCR Hybrid Acceptable' | 'Any Remote';
  whitelistedCompanies: string[];
  blacklistedCompanies: string[];
  dailyAppTarget: number; // Default 15
  workingHours: string; // e.g., "09:00 - 23:30"
  targetDeadline: string; // "28 August 2026"
}

export interface OutreachMessage {
  type: 'Hiring Manager Cold Mail' | 'Recruiter InMail' | 'Gartner Alumni Warm Intro';
  subject: string;
  body: string;
}

export interface DailyActivityLog {
  date: string;
  discovered: number;
  scored: number;
  applied: number;
  outreachSent: number;
  interviewsBooked: number;
  offersReceived: number;
  notes: string;
}
