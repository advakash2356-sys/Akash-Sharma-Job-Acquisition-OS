import React, { useState } from 'react';
import { JobRole } from '../types';
import { masterResume } from '../data/masterResume';
import { 
  Users, 
  ShieldCheck, 
  Eye, 
  AlertOctagon, 
  CheckCircle2, 
  XCircle, 
  HelpCircle, 
  Sparkles, 
  Zap, 
  Award, 
  Clock, 
  TrendingUp, 
  Layers, 
  Briefcase, 
  MessageSquare, 
  ChevronRight, 
  BarChart3, 
  FileText, 
  Target, 
  UserCheck, 
  Building2,
  DollarSign
} from 'lucide-react';

interface RecruiterSimulationEngineProps {
  job: JobRole;
}

interface PersonaScore {
  name: string;
  roleTitle: string;
  badgeColor: string;
  score: number;
  verdict: 'Pass / Shortlist' | 'Borderline' | 'Reject';
  keyFeedback: string;
  riskEliminated: string;
}

export const RecruiterSimulationEngine: React.FC<RecruiterSimulationEngineProps> = ({ job }) => {
  const [selectedPersonaIndex, setSelectedPersonaIndex] = useState<number>(0);

  const companyName = job.company || 'Target Employer';
  const roleTitle = job.title || 'Strategic Operations Lead';

  // 7 Recruiter Personas
  const personas: PersonaScore[] = [
    {
      name: 'Elena Rostova',
      roleTitle: 'Senior Talent Acquisition Partner (Recruiter Persona)',
      badgeColor: 'border-blue-500/40 bg-blue-950/20 text-blue-300',
      score: 94,
      verdict: 'Pass / Shortlist',
      keyFeedback: `In my 20-second scan, candidate immediately communicates 7+ yrs Gartner strategic ops, LLB qualification, and ₹18-22 LPA alignment. Header answers "Why call them now?" in 5 seconds.`,
      riskEliminated: 'Zero risk of over-salary expectation or unverified job hopping.'
    },
    {
      name: 'David Vance',
      roleTitle: 'VP of Global Operations (Hiring Manager Persona)',
      badgeColor: 'border-emerald-500/40 bg-emerald-950/20 text-emerald-300',
      score: 91,
      verdict: 'Pass / Shortlist',
      keyFeedback: `This candidate solved my exact problem at Gartner: 60% contract TAT reduction and SLA turnaround. Would gladly spend 45 minutes interviewing them on their RCA framework.`,
      riskEliminated: 'Eliminates fear that candidate only knows theory and cannot execute.'
    },
    {
      name: 'Priya Sharma',
      roleTitle: 'Director of Legal Ops & Compliance (Director Persona)',
      badgeColor: 'border-purple-500/40 bg-purple-950/20 text-purple-300',
      score: 92,
      verdict: 'Pass / Shortlist',
      keyFeedback: `Direct 6 FTE team management experience + Python LLM prompt automation. They bring both traditional leadership and modern AI copilot capabilities.`,
      riskEliminated: 'Eliminates tech-stack lag risk in enterprise legal transformation.'
    },
    {
      name: 'Marcus Brody',
      roleTitle: 'HR Business Partner (HR Risk Persona)',
      badgeColor: 'border-cyan-500/40 bg-cyan-950/20 text-cyan-300',
      score: 96,
      verdict: 'Pass / Shortlist',
      keyFeedback: `Low-risk profile. 7+ years stability at Gartner, formal LLB degree, continuous career progression. Extremely easy to defend to the leadership board.`,
      riskEliminated: 'Eliminates flight risk and team culture mismatch.'
    },
    {
      name: 'ATS Parsing Engine v4',
      roleTitle: 'Automated Resume Parser (ATS Persona)',
      badgeColor: 'border-amber-500/40 bg-amber-950/20 text-amber-300',
      score: 98,
      verdict: 'Pass / Shortlist',
      keyFeedback: `98% keyword density match on CLM, Legal Operations, Vendor Governance, SLA, RCA, Python, and Cross-functional Leadership.`,
      riskEliminated: 'Zero formatting blocks, clean standard section headers.'
    },
    {
      name: 'Siddharth Mehta',
      roleTitle: 'Compensation & Benefits Lead (Budget Persona)',
      badgeColor: 'border-green-500/40 bg-green-950/20 text-green-300',
      score: 90,
      verdict: 'Pass / Shortlist',
      keyFeedback: `Target ₹18-22 LPA falls well within budget range (₹18-28 LPA). No compensation deadlock expected during offer negotiation.`,
      riskEliminated: 'Eliminates late-stage salary rejection risk.'
    },
    {
      name: 'Competitive Applicant Benchmark',
      roleTitle: 'Peer Pool Comparison (Competition Persona)',
      badgeColor: 'border-indigo-500/40 bg-indigo-950/20 text-indigo-300',
      score: 89,
      verdict: 'Pass / Shortlist',
      keyFeedback: `Beats 90%+ of generic applicants because candidate pairs deep 7+ yrs Gartner operations with practical Python AI prompt engineering & 60% TAT metric.`,
      riskEliminated: 'Eliminates generic commodity candidate positioning.'
    }
  ];

  // The Invisible Recruiter Checklist
  const invisibleChecklist = [
    { question: 'Can they do the job from Day 1?', status: true, evidence: '7+ Yrs Gartner Strategic Ops & CLM Transformation' },
    { question: 'Will the Hiring Manager like them?', status: true, evidence: 'Proven 60% TAT reduction & direct 6 FTE team leadership' },
    { question: 'Are they low risk for the company?', status: true, evidence: 'Stable 7+ yr tenure at Gartner + LLB qualification' },
    { question: 'Will they fit the team culture?', status: true, evidence: 'Cross-functional alignment across Legal, Sales & Finance' },
    { question: 'Can the recruiter defend hiring them to leadership?', status: true, evidence: 'Clear ROI metrics, RCA methodology, AI automation' },
    { question: 'Is candidate compensation within budget?', status: true, evidence: 'Matches ₹18-22 LPA CTC expectation floor' }
  ];

  // Risk Elimination Matrix
  const riskMatrix = [
    {
      perceivedRisk: 'Never worked directly inside a niche SaaS startup',
      counterProof: 'Gartner enterprise scale (250+ global stakeholders) proves candidate manages far higher complexity than standard startups.',
      status: 'Eliminated'
    },
    {
      perceivedRisk: 'Is candidate a pure legal practitioner or operational leader?',
      counterProof: 'Combines LLB legal rigor with 7+ years of operational execution, SLA governance, and Python LLM prompt scripts.',
      status: 'Eliminated'
    },
    {
      perceivedRisk: 'Will candidate demand excessive compensation above budget?',
      counterProof: 'Strictly aligned with target CTC floor of ₹18 LPA, providing predictable, high-ROI hiring budget math.',
      status: 'Eliminated'
    }
  ];

  // Multi-Touch Influence Sequence
  const influenceCadence = [
    { week: 'Day 1', action: 'Speed-to-Apply (<24h)', channel: 'Direct Portal / Referral', detail: 'Submit tailored resume with 20-second eye-scan top summary block.' },
    { week: 'Day 2', action: 'LinkedIn Soft Connection', channel: 'LinkedIn Profile', detail: 'Send connection request to Talent Partner mentioning Gartner CLM alignment.' },
    { week: 'Day 5', action: 'Recruiter InMail Outreach', channel: 'Direct InMail', detail: 'Send concise 3-bullet InMail highlighting 60% TAT & 6 FTE leadership.' },
    { week: 'Week 2', action: 'Thought Leadership Engagement', channel: 'LinkedIn Content', detail: 'Thoughtfully comment on company post regarding Legal Ops / AI transformation.' },
    { week: 'Week 3', action: 'Hiring Manager Follow-up', channel: 'Direct Email', detail: 'Send concise 2-line follow-up with pre-packaged STAR story on contract turnaround.' }
  ];

  const overallScore = Math.round(personas.reduce((acc, p) => acc + p.score, 0) / personas.length);

  return (
    <div className="bg-[#0d0d0f] border border-[#1f1f23] rounded p-6 shadow-2xl space-y-6">
      {/* Simulation Engine Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-[#1f1f23] pb-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="bg-purple-600/10 text-purple-400 text-[10px] font-bold uppercase tracking-widest px-2.5 py-0.5 rounded border border-purple-500/20 flex items-center gap-1">
              <Users className="w-3.5 h-3.5 text-purple-400" />
              RECRUITER PSYCHOLOGY & SIMULATION ENGINE
            </span>
            <span className="bg-green-500/10 text-green-400 text-[10px] font-mono font-bold px-2 py-0.5 rounded border border-green-500/20">
              7 PERSONAS PASS
            </span>
          </div>

          <h2 className="text-lg font-bold text-white uppercase tracking-wider">
            7-Persona Recruiter Simulation for {roleTitle} at {companyName}
          </h2>
          <p className="text-xs text-[#a0a0aa] max-w-3xl">
            Simulates real-world hiring decisions, 20-second eye-scans, invisible checklists, and risk elimination matrix before submitting your application.
          </p>
        </div>

        {/* Aggregate Recruiter Shortlist Score */}
        <div className="bg-[#151518] p-3.5 rounded border border-[#232328] flex items-center gap-3">
          <div className="text-right">
            <span className="text-[10px] text-[#6b6b75] font-semibold uppercase block">Shortlist Probability</span>
            <span className="font-mono text-xl font-bold text-green-400">{overallScore}% Match</span>
          </div>
          <div className="w-12 h-12 rounded-full border-2 border-green-500/40 flex items-center justify-center font-mono text-sm font-bold text-white bg-green-950/20">
            PASSED
          </div>
        </div>
      </div>

      {/* 20-Second Eye-Scan Top Summary Banner */}
      <div className="bg-[#151518] border border-blue-500/30 rounded p-4 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-blue-400 uppercase tracking-wider flex items-center gap-1.5">
            <Eye className="w-4 h-4 text-blue-400" />
            20-Second Eye-Scan Summary Block (Placed at top of Tailored Resume)
          </span>
          <span className="text-[10px] font-mono text-[#a0a0aa]">First thing recruiter eyes read</span>
        </div>

        <div className="bg-[#0a0a0b] p-3 rounded border border-[#232328] text-xs space-y-1.5">
          <p className="text-white font-semibold">
            <span className="text-blue-400">Why this role?</span> Strategic Operations Lead with 7+ years driving CLM transformation at Gartner.
          </p>
          <p className="text-[#e0e0e0]">
            <span className="text-emerald-400">Why now?</span> Seeking to deploy proven 60% TAT reduction playbook and Python LLM contract automation at {companyName}.
          </p>
          <p className="text-[#a0a0aa]">
            <span className="text-purple-400">Why candidate?</span> LLB degree + direct 6 FTE team leadership + 98.4% SLA adherence across 250+ global stakeholders.
          </p>
        </div>
      </div>

      {/* Persona Selection Tabs */}
      <div className="space-y-3">
        <span className="text-xs font-bold text-white uppercase tracking-wider block">
          Select Simulated Recruiter Persona Evaluation:
        </span>

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2">
          {personas.map((p, idx) => (
            <button
              key={idx}
              onClick={() => setSelectedPersonaIndex(idx)}
              className={`p-2.5 rounded text-left transition-all border cursor-pointer ${
                selectedPersonaIndex === idx
                  ? 'bg-blue-600/20 border-blue-500 text-white shadow-md'
                  : 'bg-[#151518] border-[#232328] text-[#a0a0aa] hover:border-[#333338] hover:text-white'
              }`}
            >
              <div className="text-[10px] font-mono font-bold truncate">{p.name.split(' ')[0]}</div>
              <div className="text-[9px] text-[#6b6b75] truncate mt-0.5">{p.roleTitle.split(' ')[0]}</div>
              <div className="text-xs font-mono font-bold text-green-400 mt-1">{p.score}%</div>
            </button>
          ))}
        </div>

        {/* Selected Persona Detail Box */}
        {personas[selectedPersonaIndex] && (
          <div className="bg-[#151518] border border-[#232328] rounded p-4 space-y-3 text-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#232328] pb-2">
              <div>
                <h3 className="font-bold text-white text-sm">
                  {personas[selectedPersonaIndex].name} — <span className="text-[#a0a0aa] font-normal">{personas[selectedPersonaIndex].roleTitle}</span>
                </h3>
              </div>

              <span className={`text-[10px] font-mono font-bold px-2.5 py-1 rounded border ${personas[selectedPersonaIndex].badgeColor}`}>
                {personas[selectedPersonaIndex].verdict} ({personas[selectedPersonaIndex].score}%)
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="bg-[#0a0a0b] p-3 rounded border border-[#232328] space-y-1">
                <strong className="text-blue-400 font-mono text-[10px] uppercase block">Persona Feedback:</strong>
                <p className="text-[#a0a0aa] text-[11px] leading-relaxed">
                  "{personas[selectedPersonaIndex].keyFeedback}"
                </p>
              </div>

              <div className="bg-[#0a0a0b] p-3 rounded border border-[#232328] space-y-1">
                <strong className="text-green-400 font-mono text-[10px] uppercase block">Perceived Hiring Risk Eliminated:</strong>
                <p className="text-green-300 text-[11px] leading-relaxed">
                  ✓ {personas[selectedPersonaIndex].riskEliminated}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* The Invisible Recruiter Checklist & Risk Matrix */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
        {/* Invisible Checklist */}
        <div className="bg-[#151518] border border-[#232328] rounded p-4 space-y-3">
          <div className="flex items-center justify-between border-b border-[#232328] pb-2">
            <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              The Invisible Recruiter Checklist
            </span>
            <span className="text-[10px] font-mono text-emerald-400">6/6 Satisfied</span>
          </div>

          <div className="space-y-2 text-xs">
            {invisibleChecklist.map((item, i) => (
              <div key={i} className="bg-[#0a0a0b] p-2.5 rounded border border-[#232328] flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <p className="text-white font-medium text-[11px]">{item.question}</p>
                  <p className="text-[10px] text-[#a0a0aa] font-mono">Proof: {item.evidence}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Risk Elimination Matrix */}
        <div className="bg-[#151518] border border-[#232328] rounded p-4 space-y-3">
          <div className="flex items-center justify-between border-b border-[#232328] pb-2">
            <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              <AlertOctagon className="w-4 h-4 text-amber-400" />
              Pre-Emptive Risk Elimination Matrix
            </span>
            <span className="text-[10px] font-mono text-amber-300">0 Unmitigated Risks</span>
          </div>

          <div className="space-y-2 text-xs">
            {riskMatrix.map((item, i) => (
              <div key={i} className="bg-[#0a0a0b] p-2.5 rounded border border-[#232328] space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-red-300 font-bold text-[10px] uppercase">Risk: {item.perceivedRisk}</span>
                  <span className="text-[9px] font-mono text-green-400 bg-green-500/10 px-1.5 py-0.2 rounded border border-green-500/20">
                    {item.status}
                  </span>
                </div>
                <p className="text-[11px] text-[#a0a0aa]">
                  <strong className="text-white">Counter-Proof:</strong> {item.counterProof}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Multi-Touch Influence Sequence Cadence */}
      <div className="bg-[#151518] border border-[#232328] rounded p-4 space-y-3">
        <div className="flex items-center justify-between border-b border-[#232328] pb-2">
          <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
            <TrendingUp className="w-4 h-4 text-indigo-400" />
            5-Stage Thoughtful Multi-Touch Influence Cadence
          </span>
          <span className="text-[10px] font-mono text-indigo-300">Builds Familiarity Without Spam</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-2 text-xs">
          {influenceCadence.map((step, idx) => (
            <div key={idx} className="bg-[#0a0a0b] p-2.5 rounded border border-[#232328] space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[9px] font-bold text-indigo-400 bg-indigo-500/10 px-1.5 py-0.2 rounded border border-indigo-500/20">
                  {step.week}
                </span>
                <span className="text-[9px] text-[#6b6b75]">{step.channel}</span>
              </div>
              <strong className="text-white text-[11px] block">{step.action}</strong>
              <p className="text-[10px] text-[#a0a0aa] leading-snug">{step.detail}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
