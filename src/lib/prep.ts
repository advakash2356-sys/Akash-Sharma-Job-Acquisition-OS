export const STAGES = [
  { id: 'recruiter', label: 'Recruiter screen', focus: 'motivation, basics, notice period, pay expectations, communication, red flags in the CV' },
  { id: 'hm', label: 'Hiring manager', focus: 'how the candidate would do this exact job, past results, judgement, team fit' },
  { id: 'technical', label: 'Technical / case', focus: 'role skills tested hands-on: a case, exercise, drafting task, or practical test suited to the role and seniority' },
  { id: 'final', label: 'Final / HR', focus: 'values, culture, long-term plans, references, final doubts' },
  { id: 'salary', label: 'Salary negotiation', focus: 'pay range, total package, notice period, joining date, how to counter politely' },
] as const;
export type StageId = (typeof STAGES)[number]['id'];
export interface StagePrep {
  focus: string;
  questions: { question: string; why: string; star: { situation: string; task: string; action: string; result: string }; factUsed: string }[];
  redFlags: { flag: string; howToAddress: string }[];
  askThem: string[];
  generatedAt?: string;
}
export interface MockTurn { role: 'interviewer' | 'candidate'; text: string; feedback?: string; score?: number }
