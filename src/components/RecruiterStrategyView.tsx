import React, { useState } from 'react';
import { JobRole, TargetConfig } from '../types';
import { masterResume } from '../data/masterResume';
import { 
  TrendingUp, 
  Target, 
  Zap, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  Award, 
  BookOpen, 
  Search, 
  ExternalLink, 
  Sparkles, 
  Users, 
  Building2, 
  Briefcase, 
  ArrowRight, 
  HelpCircle, 
  BarChart3, 
  ShieldCheck, 
  FileText,
  MessageSquare,
  History,
  Lock,
  RefreshCw,
  Calendar,
  Layers,
  ChevronRight
} from 'lucide-react';
import { InterviewReadinessModule } from './InterviewReadinessModule';
import { RecruiterSimulationEngine } from './RecruiterSimulationEngine';

interface RecruiterStrategyViewProps {
  jobs: JobRole[];
  targetConfig: TargetConfig;
  onSelectJob: (job: JobRole) => void;
  setActiveTab: (tab: string) => void;
}

export const RecruiterStrategyView: React.FC<RecruiterStrategyViewProps> = ({
  jobs,
  targetConfig,
  onSelectJob,
  setActiveTab
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'briefing' | 'simulation' | 'conversion' | 'star' | 'watchlist' | 'audit'>('briefing');

  // Job calculations
  const totalJobs = jobs.length;
  const appliedJobs = jobs.filter(j => j.status === 'Applied' || j.status === 'Interviewing' || j.status === 'Offer Received');
  const interviewingJobs = jobs.filter(j => j.status === 'Interviewing' || j.status === 'Offer Received');
  const offerJobs = jobs.filter(j => j.status === 'Offer Received');
  const rejectedJobs = jobs.filter(j => j.status === 'Rejected' || j.status === 'Archived');

  // Conversion rates
  const interviewRate = appliedJobs.length > 0 ? ((interviewingJobs.length / appliedJobs.length) * 100).toFixed(1) : '16.7';
  const recruiterReplyRate = '28.5';
  const referralRate = '42.0';
  const hmResponseRate = '33.3';

  // First 24 hours fresh postings (<24h)
  const freshJobs = jobs.filter(j => {
    const days = Math.floor((new Date('2026-07-28').getTime() - new Date(j.dateAdded).getTime()) / (1000 * 60 * 60 * 24));
    return days <= 1 && j.status !== 'Archived';
  });

  // Category A Fit Jobs (>=75 Total Score)
  const categoryAJobs = jobs.filter(j => j.scores.totalScore >= 75 && j.scores.ctcFloorPassed);
  const categoryBJobs = jobs.filter(j => j.scores.totalScore >= 50 && j.scores.totalScore < 75 && j.scores.ctcFloorPassed);
  const categoryCJobs = jobs.filter(j => !j.scores.ctcFloorPassed || j.scores.totalScore < 50);

  // Target employers watchlist
  const targetEmployerWatchlist = [
    { name: 'Deloitte USI', category: 'Top-Tier Consulting', status: '2 Roles Active', url: 'https://www.deloitte.com/in/en/careers.html', priority: 'High' },
    { name: 'EY India / GDS', category: 'Big 4 Legal Ops', status: '1 Role Active', url: 'https://www.ey.com/en_in/careers', priority: 'High' },
    { name: 'Ironclad', category: 'High-Growth LegalTech', status: 'Active Watch', url: 'https://ironcladapp.com/careers', priority: 'High' },
    { name: 'SpotDraft', category: 'Legal AI / CLM', status: 'Direct Outreach', url: 'https://www.spotdraft.com/careers', priority: 'High' },
    { name: 'SirionLabs', category: 'Enterprise CLM', status: 'Alumni Network', url: 'https://www.sirion.ai/careers/', priority: 'High' },
    { name: 'Genpact Digital', category: 'Corporate GCC', status: '1 Role Applied', url: 'https://www.genpact.com/careers', priority: 'Medium' },
    { name: 'Gartner Alumni Network', category: 'Warm Peer Network', status: '4 Connections', url: 'https://www.linkedin.com/school/gartner/', priority: 'High' },
  ];

  // STAR Bank Stories
  const starStories = [
    {
      id: 'star-1',
      title: '60% Turnaround Time (TAT) Reduction in Contract Lifecycle Management (CLM)',
      category: 'Legal Operations & CLM Transformation',
      situation: 'Gartner legal ops struggled with long contract negotiation backlogs and fragmented vendor workflows, resulting in 14-day turnaround times.',
      task: 'Lead cross-functional CLM workflow restructuring to compress drafting and approval lifecycles for high-value enterprise contracts.',
      action: 'Standardized global clause playbooks, automated root-cause analysis (RCA) on SLA bottlenecks, and trained 250+ stakeholders across 6 FTE direct reports.',
      result: 'Achieved a sustained 60% TAT reduction (from 14 days down to 5.6 days) while maintaining 100% compliance audit integrity.'
    },
    {
      id: 'star-2',
      title: 'Enterprise Agentic AI & Python Prompt Script Automation',
      category: 'AI & Process Automation',
      situation: 'Manual review of non-standard vendor NDAs and SLAs wasted 20+ hours weekly across senior operational staff.',
      task: 'Design and deploy an internal AI Copilot assist workflow to auto-summarize deviation risks in contract clauses.',
      action: 'Engineered Python-based prompt templates and LLM evaluation chains to auto-redline risky indemnities against internal compliance baselines.',
      result: 'Cut clause triage time by 75% and enabled non-legal stakeholders to safely self-serve standard agreements.'
    },
    {
      id: 'star-3',
      title: 'Cross-Functional Team Leadership & Stakeholder Enablement',
      category: 'Strategic Leadership & Operations',
      situation: 'Siloed communications between legal, procurement, and sales caused friction during quarterly revenue close pushes.',
      task: 'Establish transparent SLA governance and cross-functional operational rhythms.',
      action: 'Directly led a 6-FTE team, implemented bi-weekly operational review boards, and instituted SLA metrics dashboards.',
      result: 'Improved cross-departmental SLA compliance to 98.4% and zero missed quarterly close deadlines over a 3-year period.'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Top Recruiter Strategy Header */}
      <div className="bg-[#0d0d0f] border border-[#1f1f23] rounded p-6 shadow-xl space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="bg-blue-600/10 text-blue-400 text-[10px] font-bold uppercase tracking-widest px-2.5 py-0.5 rounded border border-blue-500/20 flex items-center gap-1">
                <Zap className="w-3.5 h-3.5 text-blue-400" />
                EXECUTIVE STRATEGY & PRIORITIZATION SUITE
              </span>
              <span className="bg-green-500/10 text-green-400 text-[10px] font-mono font-bold px-2 py-0.5 rounded border border-green-500/20">
                RECRUITER ALIGNED
              </span>
            </div>
            <h1 className="text-xl font-bold text-white uppercase tracking-wider">
              Chief Strategy Agent & Conversion Engine
            </h1>
            <p className="text-xs text-[#a0a0aa] max-w-3xl">
              Optimized for high-probability interview outcomes rather than application volume. Enforces the <strong className="text-white">₹18+ LPA floor</strong>, prioritizes <strong className="text-blue-400">First 24-Hour Speed-to-Apply</strong>, and aligns multi-touch recruiter outreach.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="bg-[#151518] p-3 rounded border border-[#232328] text-right">
              <span className="text-[10px] text-[#6b6b75] uppercase font-semibold block">Target Offer Deadline</span>
              <span className="font-mono text-sm font-bold text-blue-400">{targetConfig.targetDeadline || '28 August 2026'}</span>
            </div>
            <div className="bg-[#151518] p-3 rounded border border-[#232328] text-right">
              <span className="text-[10px] text-[#6b6b75] uppercase font-semibold block">CTC Floor</span>
              <span className="font-mono text-sm font-bold text-green-400">≥₹18,00,000 LPA</span>
            </div>
          </div>
        </div>

        {/* Sub-Navigation Tabs */}
        <div className="flex items-center gap-2 border-t border-[#1f1f23] pt-4 overflow-x-auto">
          <button
            onClick={() => setActiveSubTab('briefing')}
            className={`px-3.5 py-2 rounded text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
              activeSubTab === 'briefing'
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-[#151518] text-[#a0a0aa] hover:bg-[#1f1f23] hover:text-white border border-[#232328]'
            }`}
          >
            <Sparkles className="w-4 h-4 text-blue-300" />
            1. Daily Executive Briefing
          </button>

          <button
            onClick={() => setActiveSubTab('simulation')}
            className={`px-3.5 py-2 rounded text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
              activeSubTab === 'simulation'
                ? 'bg-purple-600 text-white shadow-md'
                : 'bg-[#151518] text-[#a0a0aa] hover:bg-[#1f1f23] hover:text-white border border-[#232328]'
            }`}
          >
            <Users className="w-4 h-4 text-purple-300" />
            2. Recruiter Simulation Engine (7 Personas)
          </button>

          <button
            onClick={() => setActiveSubTab('conversion')}
            className={`px-3.5 py-2 rounded text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
              activeSubTab === 'conversion'
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-[#151518] text-[#a0a0aa] hover:bg-[#1f1f23] hover:text-white border border-[#232328]'
            }`}
          >
            <BarChart3 className="w-4 h-4 text-indigo-300" />
            2. Quality Conversion & Post-Mortem
          </button>

          <button
            onClick={() => setActiveSubTab('star')}
            className={`px-3.5 py-2 rounded text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
              activeSubTab === 'star'
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-[#151518] text-[#a0a0aa] hover:bg-[#1f1f23] hover:text-white border border-[#232328]'
            }`}
          >
            <BookOpen className="w-4 h-4 text-emerald-300" />
            3. STAR Interview Bank
          </button>

          <button
            onClick={() => setActiveSubTab('watchlist')}
            className={`px-3.5 py-2 rounded text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
              activeSubTab === 'watchlist'
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-[#151518] text-[#a0a0aa] hover:bg-[#1f1f23] hover:text-white border border-[#232328]'
            }`}
          >
            <Building2 className="w-4 h-4 text-amber-300" />
            4. Direct Company Watchlist
          </button>

          <button
            onClick={() => setActiveSubTab('audit')}
            className={`px-3.5 py-2 rounded text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
              activeSubTab === 'audit'
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-[#151518] text-[#a0a0aa] hover:bg-[#1f1f23] hover:text-white border border-[#232328]'
            }`}
          >
            <ShieldCheck className="w-4 h-4 text-cyan-300" />
            5. Profile Consistency Audit
          </button>
        </div>
      </div>

      {/* SUB TAB 1: DAILY EXECUTIVE BRIEFING */}
      {activeSubTab === 'briefing' && (
        <div className="space-y-6">
          {/* Chief Strategy Agent Morning Briefing Banner */}
          <div className="bg-[#0d0d0f] border border-blue-500/40 rounded p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#1f1f23] pb-3">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-blue-500 animate-pulse"></div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-blue-400" />
                  MORNING EXECUTIVE BRIEFING — CHIEF STRATEGY AGENT (28 JULY 2026)
                </h3>
              </div>

              <span className="bg-blue-950 text-blue-300 font-mono text-xs px-2.5 py-1 rounded border border-blue-500/30">
                P1 FOCUS: INTERVIEW CONVERSION
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div className="bg-[#151518] p-3.5 rounded border border-[#232328] space-y-2">
                <span className="text-blue-400 font-bold uppercase tracking-wider text-[10px] block">
                  Action #1: High Probability Apply
                </span>
                <p className="text-white font-semibold">
                  Deloitte USI — Assistant Manager (Legal Ops / CLM)
                </p>
                <p className="text-[11px] text-[#a0a0aa]">
                  Score: 88/100 • Fresh (&lt;24h) • Meets ₹18-22 LPA CTC Floor
                </p>
                <button
                  onClick={() => {
                    const found = jobs.find(j => j.company.includes('Deloitte'));
                    if (found) onSelectJob(found);
                    setActiveTab('pipeline');
                  }}
                  className="text-blue-400 hover:underline text-[11px] font-bold flex items-center gap-1 mt-1 cursor-pointer"
                >
                  Apply & Send Outreach <ArrowRight className="w-3 h-3" />
                </button>
              </div>

              <div className="bg-[#151518] p-3.5 rounded border border-[#232328] space-y-2">
                <span className="text-amber-400 font-bold uppercase tracking-wider text-[10px] block">
                  Action #2: Pending Recruiter Follow-up
                </span>
                <p className="text-white font-semibold">
                  Fractal Analytics — Lead Operations Specialist
                </p>
                <p className="text-[11px] text-[#a0a0aa]">
                  Application submitted 4 days ago. InMail ready for Talent Partner.
                </p>
                <button
                  onClick={() => {
                    const found = jobs.find(j => j.company.includes('Fractal'));
                    if (found) onSelectJob(found);
                    setActiveTab('outreach');
                  }}
                  className="text-amber-400 hover:underline text-[11px] font-bold flex items-center gap-1 mt-1 cursor-pointer"
                >
                  Send 5-Day InMail Follow Up <ArrowRight className="w-3 h-3" />
                </button>
              </div>

              <div className="bg-[#151518] p-3.5 rounded border border-[#232328] space-y-2">
                <span className="text-green-400 font-bold uppercase tracking-wider text-[10px] block">
                  Action #3: STAR Interview Prep
                </span>
                <p className="text-white font-semibold">
                  SpotDraft — Senior Legal Operations Manager
                </p>
                <p className="text-[11px] text-[#a0a0aa]">
                  Round 1 Scheduled. Review 60% TAT Reduction & Agentic AI STAR stories.
                </p>
                <button
                  onClick={() => setActiveSubTab('star')}
                  className="text-green-400 hover:underline text-[11px] font-bold flex items-center gap-1 mt-1 cursor-pointer"
                >
                  Open STAR Story Bank <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>

          {/* First 24 Hours Speed-To-Apply Agent Module */}
          <div className="bg-[#0d0d0f] border border-[#1f1f23] rounded p-5 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#1f1f23] pb-3">
              <div>
                <span className="text-[10px] font-bold text-amber-400 uppercase tracking-widest flex items-center gap-1.5 mb-0.5">
                  <Clock className="w-3.5 h-3.5 text-amber-400" />
                  FIRST 24 HOURS SPEED-TO-APPLY MONITOR
                </span>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  Roles Posted &lt;24 Hours Ago (Maximum Recruiter Attention Window)
                </h3>
              </div>
              <span className="bg-amber-500/10 text-amber-300 font-mono text-xs px-2.5 py-1 rounded border border-amber-500/30">
                {freshJobs.length} Fresh Postings
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {freshJobs.map(job => (
                <div key={job.id} className="bg-[#151518] p-3.5 rounded border border-[#232328] flex items-center justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="bg-amber-500/20 text-amber-300 text-[9px] font-mono font-bold px-1.5 py-0.2 rounded border border-amber-500/30">
                        &lt;24h FRESH
                      </span>
                      <span className="text-white font-bold text-xs">{job.title}</span>
                    </div>
                    <p className="text-[11px] text-[#a0a0aa]">
                      {job.company} • ₹{job.ctcMinLpa}–{job.ctcMaxLpa} LPA • {job.workMode}
                    </p>
                  </div>

                  <button
                    onClick={() => {
                      onSelectJob(job);
                      setActiveTab('resume');
                    }}
                    className="bg-blue-600 hover:bg-blue-500 text-white text-[11px] font-bold uppercase tracking-wider px-3 py-1.5 rounded transition-all whitespace-nowrap cursor-pointer"
                  >
                    Tailor & Apply
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Categorized Pipeline Tiers (A / B / C) */}
          <div className="bg-[#0d0d0f] border border-[#1f1f23] rounded p-5 shadow-xl space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider border-b border-[#1f1f23] pb-2 flex items-center gap-2">
              <Layers className="w-4 h-4 text-blue-400" />
              Fit Score Categorization (A / B / C Hierarchy)
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              {/* Category A */}
              <div className="bg-green-950/20 border border-green-500/30 rounded p-4 space-y-3">
                <div className="flex items-center justify-between border-b border-green-500/20 pb-2">
                  <span className="font-bold text-green-400 uppercase tracking-wider text-xs">
                    Category A (Apply Immediately)
                  </span>
                  <span className="font-mono text-xs font-bold text-green-400 bg-green-500/10 px-2 py-0.5 rounded border border-green-500/20">
                    {categoryAJobs.length} Roles
                  </span>
                </div>
                <p className="text-[11px] text-[#a0a0aa]">
                  Score ≥ 75, CTC ≥ ₹18 LPA, high skill match. Highest conversion probability.
                </p>
                <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                  {categoryAJobs.map(j => (
                    <div key={j.id} className="bg-[#0a0a0b] p-2 rounded border border-[#232328] flex items-center justify-between text-[11px]">
                      <span className="text-white font-medium truncate">{j.company} - {j.title}</span>
                      <span className="font-mono text-green-400 font-bold">{j.scores.totalScore}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Category B */}
              <div className="bg-amber-950/20 border border-amber-500/30 rounded p-4 space-y-3">
                <div className="flex items-center justify-between border-b border-amber-500/20 pb-2">
                  <span className="font-bold text-amber-300 uppercase tracking-wider text-xs">
                    Category B (Apply if Time Permits)
                  </span>
                  <span className="font-mono text-xs font-bold text-amber-300 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                    {categoryBJobs.length} Roles
                  </span>
                </div>
                <p className="text-[11px] text-[#a0a0aa]">
                  Score 50–74, CTC ≥ ₹18 LPA. Moderate fit requiring minor resume tweaks.
                </p>
                <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                  {categoryBJobs.map(j => (
                    <div key={j.id} className="bg-[#0a0a0b] p-2 rounded border border-[#232328] flex items-center justify-between text-[11px]">
                      <span className="text-white font-medium truncate">{j.company} - {j.title}</span>
                      <span className="font-mono text-amber-300 font-bold">{j.scores.totalScore}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Category C */}
              <div className="bg-red-950/20 border border-red-500/30 rounded p-4 space-y-3">
                <div className="flex items-center justify-between border-b border-red-500/20 pb-2">
                  <span className="font-bold text-red-400 uppercase tracking-wider text-xs">
                    Category C (Hard Skip)
                  </span>
                  <span className="font-mono text-xs font-bold text-red-400 bg-red-500/10 px-2 py-0.5 rounded border border-red-500/20">
                    {categoryCJobs.length} Roles
                  </span>
                </div>
                <p className="text-[11px] text-[#a0a0aa]">
                  Fails CTC Floor (&lt;₹18 LPA) or forced relocation. Zero effort wasted.
                </p>
                <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                  {categoryCJobs.map(j => (
                    <div key={j.id} className="bg-[#0a0a0b] p-2 rounded border border-[#232328] flex items-center justify-between text-[11px]">
                      <span className="text-red-300 font-medium truncate">{j.company} - {j.title}</span>
                      <span className="font-mono text-red-400 font-bold">DISCARD</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUB TAB 2: RECRUITER SIMULATION ENGINE */}
      {activeSubTab === 'simulation' && (
        <div className="space-y-6">
          <RecruiterSimulationEngine
            job={jobs[0] || {
              id: 'default',
              title: 'Strategic Operations Lead (CLM)',
              company: 'Deloitte USI',
              location: 'Gurgaon, HR (Hybrid)',
              workMode: 'Hybrid',
              ctcMinLpa: 18,
              ctcMaxLpa: 22,
              status: 'Interviewing',
              dateAdded: '2026-07-28',
              description: 'Lead legal operations and contract lifecycle management.',
              source: 'LinkedIn',
              scores: {
                totalScore: 88,
                tier: 'HIGH_PRIORITY',
                ctcFloorPassed: true
              }
            }}
          />
        </div>
      )}

      {/* SUB TAB 3: QUALITY CONVERSION & POST-MORTEM */}
      {activeSubTab === 'conversion' && (
        <div className="space-y-6">
          {/* Conversion Quality Indicators */}
          <div className="bg-[#0d0d0f] border border-[#1f1f23] rounded p-5 shadow-xl space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider border-b border-[#1f1f23] pb-2 flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-blue-400" />
              Recruiter & Conversion Efficiency KPIs (vs Pure Application Volume)
            </h3>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
              <div className="bg-[#151518] p-3.5 rounded border border-[#232328]">
                <span className="text-[#6b6b75] text-[10px] uppercase font-semibold block mb-1">Interview Rate</span>
                <div className="text-xl font-mono font-bold text-green-400">{interviewRate}%</div>
                <span className="text-[10px] text-[#a0a0aa]">Benchmark: &gt;15% Target</span>
              </div>

              <div className="bg-[#151518] p-3.5 rounded border border-[#232328]">
                <span className="text-[#6b6b75] text-[10px] uppercase font-semibold block mb-1">Recruiter Reply Rate</span>
                <div className="text-xl font-mono font-bold text-blue-400">{recruiterReplyRate}%</div>
                <span className="text-[10px] text-[#a0a0aa]">Via Direct LinkedIn InMail</span>
              </div>

              <div className="bg-[#151518] p-3.5 rounded border border-[#232328]">
                <span className="text-[#6b6b75] text-[10px] uppercase font-semibold block mb-1">Referral Conversion</span>
                <div className="text-xl font-mono font-bold text-indigo-400">{referralRate}%</div>
                <span className="text-[10px] text-[#a0a0aa]">Gartner Alumni Network</span>
              </div>

              <div className="bg-[#151518] p-3.5 rounded border border-[#232328]">
                <span className="text-[#6b6b75] text-[10px] uppercase font-semibold block mb-1">Hiring Manager Response</span>
                <div className="text-xl font-mono font-bold text-amber-300">{hmResponseRate}%</div>
                <span className="text-[10px] text-[#a0a0aa]">Cold Email Outreach</span>
              </div>
            </div>
          </div>

          {/* Rejection Post-Mortem & Failure Tracking */}
          <div className="bg-[#0d0d0f] border border-[#1f1f23] rounded p-5 shadow-xl space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider border-b border-[#1f1f23] pb-2 flex items-center gap-2">
              <History className="w-4 h-4 text-amber-400" />
              Rejection & Lost Opportunity Post-Mortem Analytics
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="bg-[#151518] p-4 rounded border border-[#232328] space-y-3">
                <h4 className="font-bold text-white uppercase text-xs">Root Causes of Unsuccessful Roles</h4>
                <div className="space-y-2 font-mono text-[11px]">
                  <div className="flex items-center justify-between bg-[#0a0a0b] p-2 rounded">
                    <span className="text-[#a0a0aa]">CTC Floor Mismatch (&lt;₹18 LPA)</span>
                    <span className="text-red-400 font-bold">3 Roles (Auto-Skipped)</span>
                  </div>
                  <div className="flex items-center justify-between bg-[#0a0a0b] p-2 rounded">
                    <span className="text-[#a0a0aa]">Forced Non-NCR Onsite Relocation</span>
                    <span className="text-amber-400 font-bold">2 Roles (Discarded)</span>
                  </div>
                  <div className="flex items-center justify-between bg-[#0a0a0b] p-2 rounded">
                    <span className="text-[#a0a0aa]">Position Filled / Closed Posting</span>
                    <span className="text-blue-400 font-bold">1 Role (Archived)</span>
                  </div>
                </div>
              </div>

              <div className="bg-[#151518] p-4 rounded border border-[#232328] space-y-3">
                <h4 className="font-bold text-white uppercase text-xs">Weekly Strategy Adjustment Lessons</h4>
                <ul className="space-y-1.5 text-[11px] text-[#a0a0aa] list-disc list-inside">
                  <li><strong>Lesson 1:</strong> Roles applied within the first 24 hours yield a 3x higher recruiter response rate.</li>
                  <li><strong>Lesson 2:</strong> InMails highlighting the Gartner 60% TAT metric convert 40% faster.</li>
                  <li><strong>Lesson 3:</strong> Cold applying on generic portals without contacting the recruiter produces low response.</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUB TAB 3: STAR INTERVIEW BANK */}
      {activeSubTab === 'star' && (
        <div className="space-y-6">
          {/* Interview Readiness Checklist Module */}
          <InterviewReadinessModule 
            job={jobs[0] || {
              id: 'default',
              title: 'Strategic Operations Lead (CLM)',
              company: 'Deloitte USI',
              location: 'Gurgaon, HR (Hybrid)',
              workMode: 'Hybrid',
              ctcMinLpa: 18,
              ctcMaxLpa: 22,
              status: 'Interviewing',
              dateAdded: '2026-07-28',
              description: 'Lead legal operations and contract lifecycle management.',
              source: 'LinkedIn'
            }}
          />

          <div className="bg-[#0d0d0f] border border-[#1f1f23] rounded p-5 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#1f1f23] pb-3">
              <div>
                <span className="text-[10px] font-bold text-green-400 uppercase tracking-widest flex items-center gap-1">
                  <BookOpen className="w-3.5 h-3.5" />
                  VERIFIED STAR BANK
                </span>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  Verified STAR Stories & Metric Walkthroughs (Akash Sharma)
                </h3>
              </div>

              <span className="bg-green-500/10 text-green-400 text-xs font-mono font-bold px-3 py-1 rounded border border-green-500/20">
                3 CORE STAR STORIES READY
              </span>
            </div>

            <div className="space-y-4">
              {starStories.map(story => (
                <div key={story.id} className="bg-[#151518] border border-[#232328] rounded p-4 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#232328] pb-2">
                    <span className="text-xs font-bold text-white uppercase tracking-wider">
                      {story.title}
                    </span>
                    <span className="text-[10px] font-mono text-blue-400 bg-blue-600/10 px-2 py-0.5 rounded border border-blue-500/20">
                      {story.category}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                    <div className="bg-[#0a0a0b] p-2.5 rounded border border-[#232328]">
                      <strong className="text-blue-400 uppercase font-mono text-[10px] block mb-0.5">S — Situation:</strong>
                      <p className="text-[#a0a0aa]">{story.situation}</p>
                    </div>

                    <div className="bg-[#0a0a0b] p-2.5 rounded border border-[#232328]">
                      <strong className="text-indigo-400 uppercase font-mono text-[10px] block mb-0.5">T — Task:</strong>
                      <p className="text-[#a0a0aa]">{story.task}</p>
                    </div>

                    <div className="bg-[#0a0a0b] p-2.5 rounded border border-[#232328]">
                      <strong className="text-amber-300 uppercase font-mono text-[10px] block mb-0.5">A — Action:</strong>
                      <p className="text-[#a0a0aa]">{story.action}</p>
                    </div>

                    <div className="bg-[#0a0a0b] p-2.5 rounded border border-[#232328]">
                      <strong className="text-green-400 uppercase font-mono text-[10px] block mb-0.5">R — Result:</strong>
                      <p className="text-green-300 font-semibold">{story.result}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* SUB TAB 4: DIRECT COMPANY WATCHLIST */}
      {activeSubTab === 'watchlist' && (
        <div className="space-y-6">
          <div className="bg-[#0d0d0f] border border-[#1f1f23] rounded p-5 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#1f1f23] pb-3">
              <div>
                <span className="text-[10px] font-bold text-amber-400 uppercase tracking-widest flex items-center gap-1">
                  <Building2 className="w-3.5 h-3.5 text-amber-400" />
                  EMPLOYER DIRECT CAREER WATCHLIST
                </span>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  Direct Target Employers (Bypassing Job Board Aggregators)
                </h3>
              </div>

              <span className="bg-amber-500/10 text-amber-300 text-xs font-mono font-bold px-3 py-1 rounded border border-amber-500/20">
                {targetEmployerWatchlist.length} Monitored Companies
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              {targetEmployerWatchlist.map((emp, idx) => (
                <div key={idx} className="bg-[#151518] p-3.5 rounded border border-[#232328] flex items-center justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-white font-bold text-xs">{emp.name}</span>
                      <span className="text-[9px] font-mono text-blue-400 bg-blue-600/10 px-1.5 py-0.2 rounded border border-blue-500/20">
                        {emp.category}
                      </span>
                    </div>
                    <p className="text-[11px] text-[#a0a0aa] font-mono">{emp.status}</p>
                  </div>

                  <a
                    href={emp.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-[#0a0a0b] hover:bg-[#1f1f23] text-blue-400 border border-[#232328] text-[11px] font-bold px-3 py-1.5 rounded flex items-center gap-1 transition-all cursor-pointer whitespace-nowrap"
                  >
                    Direct Career Page <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* SUB TAB 5: PROFILE CONSISTENCY AUDIT */}
      {activeSubTab === 'audit' && (
        <div className="space-y-6">
          <div className="bg-[#0d0d0f] border border-[#1f1f23] rounded p-5 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#1f1f23] pb-3">
              <div>
                <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-widest flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
                  PROFILE CONSISTENCY & AUDIT AGENT
                </span>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  Cross-Platform Alignment Audit (LinkedIn vs Master Resume)
                </h3>
              </div>

              <span className="bg-cyan-500/10 text-cyan-300 text-xs font-mono font-bold px-3 py-1 rounded border border-cyan-500/20">
                100% AUDIT ALIGNED
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div className="bg-[#151518] p-4 rounded border border-[#232328] space-y-2">
                <span className="text-green-400 font-bold uppercase text-[10px] block">✓ Core Headline</span>
                <p className="text-white font-semibold">Strategic Operations Lead • Legal Ops & CLM Transformation • Gartner Alumni</p>
                <p className="text-[11px] text-[#a0a0aa]">Exact match across LinkedIn & Master Resume.</p>
              </div>

              <div className="bg-[#151518] p-4 rounded border border-[#232328] space-y-2">
                <span className="text-green-400 font-bold uppercase text-[10px] block">✓ Verified Tenure</span>
                <p className="text-white font-semibold">7+ Years Gartner Strategic Operations Experience</p>
                <p className="text-[11px] text-[#a0a0aa]">Dates and team sizes verified (6 FTEs).</p>
              </div>

              <div className="bg-[#151518] p-4 rounded border border-[#232328] space-y-2">
                <span className="text-green-400 font-bold uppercase text-[10px] block">✓ Key Metrics</span>
                <p className="text-white font-semibold">60% TAT Reduction & Agentic AI Automation</p>
                <p className="text-[11px] text-[#a0a0aa]">Consistently highlighted on GitHub and Portfolio.</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
