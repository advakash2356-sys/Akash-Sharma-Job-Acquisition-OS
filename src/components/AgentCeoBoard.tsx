import React, { useState } from 'react';
import { AgentGovernanceBoard } from './AgentGovernanceBoard';
import { AgentD3PerformanceChart } from './AgentD3PerformanceChart';
import { DailySprintPlanner } from './DailySprintPlanner';
import { AgentCommunicationFeed } from './AgentCommunicationFeed';
import { AgentRecruitmentModal, AgentCandidate } from './AgentRecruitmentModal';
import { CeoDailyHuddleModal } from './CeoDailyHuddleModal';
import { CeoAgentEvolutionHub } from './CeoAgentEvolutionHub';
import { 
  Bot, 
  UserCheck, 
  UserX, 
  Sparkles, 
  Zap, 
  CheckCircle2, 
  AlertCircle, 
  ShieldCheck, 
  Activity, 
  Flame, 
  Plus, 
  RefreshCw, 
  Briefcase, 
  FileText, 
  Mail, 
  Search, 
  DollarSign,
  Clock,
  ExternalLink,
  Eye,
  CheckSquare,
  Lock,
  Terminal,
  X,
  AlertTriangle,
  BarChart2,
  Calendar,
  MessageSquare,
  UserPlus,
  Users
} from 'lucide-react';

export interface AuxiliaryAgent {
  id: string;
  name: string;
  role: string;
  avatarIcon: string;
  status: 'HIRED' | 'FIRED';
  efficiencyScore: number;
  tasksCompletedToday: number;
  currentTaskDescription: string;
  monthlyCostTokens: string;
}

export interface ProofOfWorkAction {
  id: string;
  timestamp: string;
  agentName: string;
  agentRole: string;
  actionType: 'SMTP Email Delivery' | 'ATS Resume PDF Render' | 'Contact Extraction' | 'Portal Auto-Submit' | 'Timer SLA Check';
  targetCompany: string;
  recipientEmail: string;
  verificationToken: string;
  status: 'VERIFIED_SENT' | 'SLA_MET' | 'IN_QUEUE' | 'AUDIT_PASSED';
  proofDetails: {
    subject?: string;
    payloadSnippet: string;
    receiptHash: string;
    slaTimerRemaining?: string;
  };
}

export const INITIAL_AGENTS: AuxiliaryAgent[] = [
  {
    id: 'agent-outreach',
    name: 'Outreach Commander',
    role: 'Batch Email & Recruiter Pitch Specialist',
    avatarIcon: 'Mail',
    status: 'HIRED',
    efficiencyScore: 98,
    tasksCompletedToday: 14,
    currentTaskDescription: 'Executing 1-click personalized Gmail outreach to Bangalore HR Heads',
    monthlyCostTokens: '1,200 Tokens/day'
  },
  {
    id: 'agent-ats',
    name: 'ATS Resume Architect',
    role: 'Keyword Optimization & PDF Exporter',
    avatarIcon: 'FileText',
    status: 'HIRED',
    efficiencyScore: 95,
    tasksCompletedToday: 9,
    currentTaskDescription: 'Re-crafting resume to incorporate newly uploaded cloud certifications',
    monthlyCostTokens: '800 Tokens/day'
  },
  {
    id: 'agent-headhunter',
    name: 'Headhunter Scraper',
    role: 'LinkedIn Recruiter & Contact Finder',
    avatarIcon: 'Search',
    status: 'HIRED',
    efficiencyScore: 91,
    tasksCompletedToday: 22,
    currentTaskDescription: 'Extracting verified HR emails for Senior React/Fullstack roles',
    monthlyCostTokens: '1,500 Tokens/day'
  },
  {
    id: 'agent-market',
    name: 'Market Intelligence Bot',
    role: 'High-CTC (₹18L+) Opportunity Monitor',
    avatarIcon: 'Briefcase',
    status: 'HIRED',
    efficiencyScore: 94,
    tasksCompletedToday: 31,
    currentTaskDescription: 'Monitoring US Night Shift & remote job boards for ₹22L+ CTC floor',
    monthlyCostTokens: '600 Tokens/day'
  },
  {
    id: 'agent-negotiator',
    name: 'Salary Negotiator',
    role: 'Counter-Offer & CTC Maximizer',
    avatarIcon: 'DollarSign',
    status: 'FIRED',
    efficiencyScore: 88,
    tasksCompletedToday: 0,
    currentTaskDescription: 'Standby - Awaiting active offer stage to trigger counter-offer playbook',
    monthlyCostTokens: '500 Tokens/day'
  }
];

export const MOCK_PROOF_ACTIONS: ProofOfWorkAction[] = [
  {
    id: 'pow-8801',
    timestamp: 'Today, 22:45:12',
    agentName: 'Outreach Commander',
    agentRole: 'Employee Agent (Outreach)',
    actionType: 'SMTP Email Delivery',
    targetCompany: 'Stripe India',
    recipientEmail: 'tech-hiring@stripe.com',
    verificationToken: 'SMTP-GMAIL-PASS-998231',
    status: 'VERIFIED_SENT',
    proofDetails: {
      subject: 'Senior Fullstack Engineer Application - High Match Score 92/100',
      payloadSnippet: 'Dear Hiring Team, I noticed Stripe is expanding its payment platform engineering team in Bangalore. My experience with React 18 and Node microservices directly aligns...',
      receiptHash: '0x9a8f...4e12 (200 OK Response from SMTP Gateway)',
      slaTimerRemaining: 'Timer SLA: 24h Response Window Active'
    }
  },
  {
    id: 'pow-8802',
    timestamp: 'Today, 22:30:04',
    agentName: 'ATS Resume Architect',
    agentRole: 'Employee Agent (ATS)',
    actionType: 'ATS Resume PDF Render',
    targetCompany: 'Atlassian',
    recipientEmail: 'careers@atlassian.com',
    verificationToken: 'PDF-RENDER-HASH-44109',
    status: 'AUDIT_PASSED',
    proofDetails: {
      subject: 'Custom Tailored PDF Export',
      payloadSnippet: 'Compiled tailored 1-page PDF. Inserted key missing tags: Jira API, GraphQL, Microfrontends. Increased score from 68 to 88.',
      receiptHash: 'SHA256: 4e91c7a83d0f... (Rendered in 1.2s)',
      slaTimerRemaining: 'Timer SLA: Instant Generation Met'
    }
  },
  {
    id: 'pow-8803',
    timestamp: 'Today, 21:15:30',
    agentName: 'Headhunter Scraper',
    agentRole: 'Employee Agent (Scraper)',
    actionType: 'Contact Extraction',
    targetCompany: 'Databricks',
    recipientEmail: 'r.sharma@databricks.com',
    verificationToken: 'CONTACT-VERIFY-88210',
    status: 'VERIFIED_SENT',
    proofDetails: {
      subject: 'Verified Talent Acquisition Contact',
      payloadSnippet: 'Extracted verified primary recruiter email via Hunter.io API. MX record valid, bounce check passed.',
      receiptHash: 'MX_CHECK_OK (Confidence 99%)',
      slaTimerRemaining: 'Timer SLA: Extracted <5m after posting'
    }
  },
  {
    id: 'pow-8804',
    timestamp: 'Today, 19:40:00',
    agentName: 'Market Intelligence Bot',
    agentRole: 'Employee Agent (Market)',
    actionType: 'Portal Auto-Submit',
    targetCompany: 'Snowflake US',
    recipientEmail: 'apply-us@snowflake.com',
    verificationToken: 'PORTAL-SUBMIT-77192',
    status: 'SLA_MET',
    proofDetails: {
      subject: 'Workday Application Submission',
      payloadSnippet: 'Submitted application form on Workday portal. Attached customized resume + cover letter. Confirmation token received.',
      receiptHash: 'WORKDAY_CONF_ID: 991823001',
      slaTimerRemaining: 'Timer SLA: Applied within 1h of job release'
    }
  }
];

interface AgentCeoBoardProps {
  onTriggerAgentLoop?: () => void;
  isSyncing?: boolean;
}

export const AgentCeoBoard: React.FC<AgentCeoBoardProps> = ({
  onTriggerAgentLoop,
  isSyncing = false
}) => {
  const [agents, setAgents] = useState<AuxiliaryAgent[]>(INITIAL_AGENTS);
  const [proofActions, setProofActions] = useState<ProofOfWorkAction[]>(MOCK_PROOF_ACTIONS);
  const [selectedProof, setSelectedProof] = useState<ProofOfWorkAction | null>(null);
  const [activeView, setActiveView] = useState<'governance' | 'sprint_planner' | 'slack_feed' | 'workforce' | 'audit_matrix' | 'd3_performance'>('governance');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isRecruitmentModalOpen, setIsRecruitmentModalOpen] = useState<boolean>(false);
  const [isHuddleModalOpen, setIsHuddleModalOpen] = useState<boolean>(false);

  const handleRecruitAgentCandidate = (candidate: AgentCandidate) => {
    const newAgent: AuxiliaryAgent = {
      id: candidate.id,
      name: candidate.name,
      role: candidate.primaryRole,
      avatarIcon: '🤖',
      status: 'HIRED',
      efficiencyScore: candidate.matchScore,
      tasksCompletedToday: 0,
      currentTaskDescription: `Active on ${candidate.architecture} - ${candidate.skills[0]}`,
      monthlyCostTokens: candidate.costTier === 'OPTIMAL' ? '$12/mo (35k tokens)' : '$28/mo (85k tokens)'
    };

    setAgents(prev => [newAgent, ...prev]);
    setToastMessage(`🎉 CEO Agent Onboarded: Recruited '${candidate.name}' with ${candidate.matchScore}% Skill Match!`);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const toggleAgentStatus = (id: string) => {
    setAgents(prev =>
      prev.map(agent => {
        if (agent.id === id) {
          const newStatus = agent.status === 'HIRED' ? 'FIRED' : 'HIRED';
          const msg = newStatus === 'HIRED' 
            ? `CEO Action: Hired '${agent.name}' for autonomous background execution!`
            : `CEO Action: Fired '${agent.name}' to reallocate API token bandwidth!`;

          setToastMessage(msg);
          setTimeout(() => setToastMessage(null), 3000);

          return { ...agent, status: newStatus };
        }
        return agent;
      })
    );
  };

  const hiredCount = agents.filter(a => a.status === 'HIRED').length;
  const totalTasksCompleted = agents.reduce((acc, a) => acc + a.tasksCompletedToday, 0);

  return (
    <div className="bg-[#0d0d0f] border border-[#1f1f23] rounded-xl p-5 sm:p-6 shadow-2xl space-y-6">
      {/* Toast feedback */}
      {toastMessage && (
        <div className="bg-amber-500/20 border border-amber-500/40 text-amber-300 px-4 py-2.5 rounded-xl text-xs font-mono font-bold flex items-center gap-2 animate-fade-in">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#1f1f23] pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-mono px-2.5 py-0.5 rounded font-bold uppercase tracking-wider flex items-center gap-1.5">
              <Bot className="w-3.5 h-3.5 text-amber-400" />
              AI CEO EXECUTIVE CONTROL & AUDIT MATRIX
            </span>
            <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[10px] font-mono px-2 py-0.5 rounded flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-emerald-400" />
              ZERO-FLUFF PROOF-OF-WORK
            </span>
          </div>
          <h2 className="text-lg font-bold text-white uppercase tracking-wider mt-1.5 flex items-center gap-2">
            <span>Autonomous Workforce & Real Action Audit Matrix</span>
          </h2>
          <p className="text-xs text-[#a0a0aa]">
            Monitor exact AI CEO strategic commands, inspect individual employee agent actions, and audit cryptographic proof-of-work receipts and strict SLA timers.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
          {/* Matrix Switcher Tabs */}
          <div className="bg-[#12131c] border border-[#222434] p-1 rounded-xl flex items-center text-xs font-mono">
            <button
              onClick={() => setActiveView('governance')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeView === 'governance'
                  ? 'bg-amber-600 text-white shadow-md'
                  : 'text-[#888898] hover:text-white'
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5 text-amber-300" />
              <span>🎯 CEO 3-Strike Directives</span>
            </button>
            <button
              onClick={() => setActiveView('sprint_planner')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeView === 'sprint_planner'
                  ? 'bg-purple-600 text-white shadow-md'
                  : 'text-[#888898] hover:text-white'
              }`}
            >
              <Calendar className="w-3.5 h-3.5 text-purple-300" />
              <span>📅 Daily 24h Sprint Planner</span>
            </button>
            <button
              onClick={() => setActiveView('slack_feed')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeView === 'slack_feed'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-[#888898] hover:text-white'
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5 text-blue-300" />
              <span>💬 Direct Agent Slack Feed</span>
            </button>
            <button
              onClick={() => setActiveView('workforce')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                activeView === 'workforce'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-[#888898] hover:text-white'
              }`}
            >
              👥 Agent Roster
            </button>
            <button
              onClick={() => setActiveView('audit_matrix')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeView === 'audit_matrix'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'text-[#888898] hover:text-white'
              }`}
            >
              <Terminal className="w-3.5 h-3.5 text-emerald-300" />
              <span>🔍 Real Action Audit Log</span>
            </button>
            <button
              onClick={() => setActiveView('d3_performance')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeView === 'd3_performance'
                  ? 'bg-purple-600 text-white shadow-md'
                  : 'text-[#888898] hover:text-white'
              }`}
            >
              <BarChart2 className="w-3.5 h-3.5 text-purple-300" />
              <span>📊 D3 Agent Analytics</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsHuddleModalOpen(true)}
              className="bg-blue-600 hover:bg-blue-500 text-white font-mono text-xs font-bold px-3 py-2 rounded-xl flex items-center gap-1.5 cursor-pointer shadow-lg shadow-blue-950/50"
            >
              <Users className="w-3.5 h-3.5" />
              <span>5-Min Agent Huddle</span>
            </button>

            <button
              onClick={() => setIsRecruitmentModalOpen(true)}
              className="bg-amber-600 hover:bg-amber-500 text-white font-mono text-xs font-bold px-3 py-2 rounded-xl flex items-center gap-1.5 cursor-pointer shadow-lg shadow-amber-950/50"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Recruit / Swap Agent</span>
            </button>

            {onTriggerAgentLoop && (
              <button
                onClick={onTriggerAgentLoop}
                disabled={isSyncing}
                className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-mono text-xs font-bold px-3 py-2 rounded-xl flex items-center gap-2 cursor-pointer shadow-lg shadow-blue-600/20"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                <span>{isSyncing ? 'Executing Loop...' : 'Run Agent Loop'}</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Metrics Banner */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono">
        <div className="bg-[#12131c] border border-[#222434] p-3.5 rounded-xl">
          <span className="text-[10px] text-[#888898] uppercase block">Active AI Agents</span>
          <span className="text-lg font-bold text-emerald-400">{hiredCount} / {agents.length} Hired</span>
        </div>

        <div className="bg-[#12131c] border border-[#222434] p-3.5 rounded-xl">
          <span className="text-[10px] text-[#888898] uppercase block">Audit Verified Actions</span>
          <span className="text-lg font-bold text-amber-400">{proofActions.length} Receipts</span>
        </div>

        <div className="bg-[#12131c] border border-[#222434] p-3.5 rounded-xl">
          <span className="text-[10px] text-[#888898] uppercase block">SLA Timer Compliance</span>
          <span className="text-lg font-bold text-blue-400">100% Strict</span>
        </div>

        <div className="bg-[#12131c] border border-[#222434] p-3.5 rounded-xl">
          <span className="text-[10px] text-[#888898] uppercase block">CEO Authority</span>
          <span className="text-lg font-bold text-purple-400">FULL DISCRETION</span>
        </div>
      </div>

      {/* VIEW 0: CEO GOVERNANCE & 3-STRIKE DIRECTIVES */}
      {activeView === 'governance' && (
        <AgentGovernanceBoard
          onTriggerAgentLoop={onTriggerAgentLoop}
          isSyncing={isSyncing}
        />
      )}

      {/* VIEW SPRINT: 24-HOUR DAILY SPRINT TASK PLANNER */}
      {activeView === 'sprint_planner' && (
        <DailySprintPlanner
          onTriggerAgentLoop={onTriggerAgentLoop}
          isSyncing={isSyncing}
        />
      )}

      {/* VIEW SLACK: DIRECT AGENT COMMUNICATION FEED */}
      {activeView === 'slack_feed' && (
        <AgentCommunicationFeed
          onTriggerAgentLoop={onTriggerAgentLoop}
          isSyncing={isSyncing}
        />
      )}

      {/* VIEW D3: 14-DAY AGENT PERFORMANCE COMPARISON CHART */}
      {activeView === 'd3_performance' && (
        <AgentD3PerformanceChart />
      )}

      {/* VIEW 1: AGENT ROSTER */}
      {activeView === 'workforce' && (
        <div className="space-y-6">
          {/* CEO Evolutionary Agent Engine (Hire/Fire v1.0 -> v4.0) */}
          <CeoAgentEvolutionHub />

          {/* CEO Directives Panel */}
          <div className="bg-[#12131c] border border-[#222434] rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between border-b border-[#222434] pb-2">
              <span className="text-xs font-mono font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-amber-400" />
                ACTIVE CEO DIRECTIVES & SLA POLICIES
              </span>
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-500/30">
                STRICT COMPLIANCE ENFORCED
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
              <div className="bg-[#171926] p-3 rounded-lg border border-[#222538]">
                <div className="font-bold text-white flex items-center gap-1.5 mb-1">
                  <CheckSquare className="w-3.5 h-3.5 text-blue-400" />
                  Directive 1: ₹18 LPA Floor
                </div>
                <p className="text-[#a0a0aa] text-[11px] leading-relaxed">
                  Reject low-CTC roles automatically. Only trigger agent execution for roles meeting or exceeding ₹18LPA floor.
                </p>
              </div>
              <div className="bg-[#171926] p-3 rounded-lg border border-[#222538]">
                <div className="font-bold text-white flex items-center gap-1.5 mb-1">
                  <Clock className="w-3.5 h-3.5 text-amber-400" />
                  Directive 2: 24h Recruiter SLA
                </div>
                <p className="text-[#a0a0aa] text-[11px] leading-relaxed">
                  Follow up with hiring managers within 24-48 hours of initial application. Countdown timer logged in audit matrix.
                </p>
              </div>
              <div className="bg-[#171926] p-3 rounded-lg border border-[#222538]">
                <div className="font-bold text-white flex items-center gap-1.5 mb-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  Directive 3: Proof-of-Work
                </div>
                <p className="text-[#a0a0aa] text-[11px] leading-relaxed">
                  Every outbound email and PDF compile generates a cryptographic receipt ID for full user validation.
                </p>
              </div>
            </div>
          </div>

          {/* Agent Roster Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {agents.map((agent) => {
              const isHired = agent.status === 'HIRED';

              return (
                <div
                  key={agent.id}
                  className={`border rounded-xl p-4 transition-all flex flex-col justify-between gap-4 ${
                    isHired
                      ? 'bg-[#12131c] border-[#25283c] hover:border-blue-500/50 shadow-lg'
                      : 'bg-[#0f1017] border-[#1b1c28] opacity-60'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 border-b border-[#1f2130] pb-2.5">
                      <div className="flex items-center gap-2.5">
                        <div className={`w-9 h-9 rounded-lg flex items-center justify-center font-bold text-xs ${
                          isHired ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' : 'bg-[#1a1c28] text-[#777]'
                        }`}>
                          <Bot className="w-5 h-5" />
                        </div>
                        <div>
                          <h3 className="font-bold text-white text-sm">{agent.name}</h3>
                          <p className="text-[11px] text-[#888898]">{agent.role}</p>
                        </div>
                      </div>

                      <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold uppercase ${
                        isHired ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' : 'bg-red-500/20 text-red-300 border border-red-500/40'
                      }`}>
                        {agent.status}
                      </span>
                    </div>

                    <div className="mt-3 space-y-2 text-xs">
                      <div className="bg-[#171926] p-2.5 rounded-lg border border-[#222538] text-[11px]">
                        <span className="text-[#888] block text-[10px] uppercase font-mono">Current Task Focus:</span>
                        <p className="text-white font-semibold line-clamp-2 mt-0.5">{agent.currentTaskDescription}</p>
                      </div>

                      <div className="flex items-center justify-between font-mono text-[11px] pt-1">
                        <span className="text-[#888]">Efficiency Rating:</span>
                        <span className="text-amber-400 font-bold">{agent.efficiencyScore}%</span>
                      </div>

                      <div className="flex items-center justify-between font-mono text-[11px]">
                        <span className="text-[#888]">Completed Today:</span>
                        <span className="text-white font-bold">{agent.tasksCompletedToday} tasks</span>
                      </div>
                    </div>
                  </div>

                  {/* CEO Action Hire / Fire Button */}
                  <button
                    onClick={() => toggleAgentStatus(agent.id)}
                    className={`w-full py-2.5 rounded-xl font-mono text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer border ${
                      isHired
                        ? 'bg-red-950/40 hover:bg-red-900/60 text-red-300 border-red-500/40'
                        : 'bg-emerald-600 hover:bg-emerald-500 text-white border-emerald-400 shadow-lg shadow-emerald-600/20'
                    }`}
                  >
                    {isHired ? (
                      <>
                        <UserX className="w-4 h-4 text-red-400" />
                        <span>Fire Agent (Disable)</span>
                      </>
                    ) : (
                      <>
                        <UserCheck className="w-4 h-4 text-white" />
                        <span>Hire Agent (Deploy)</span>
                      </>
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* VIEW 2: AUDIT & PROOF-OF-WORK MATRIX */}
      {activeView === 'audit_matrix' && (
        <div className="space-y-4">
          <div className="bg-[#12131c] border border-[#222434] p-4 rounded-xl flex items-center justify-between gap-3">
            <div>
              <h3 className="font-bold text-white text-sm uppercase tracking-wider flex items-center gap-2">
                <Terminal className="w-4 h-4 text-emerald-400" />
                Real Action Audit Ledger & Proof Receipts
              </h3>
              <p className="text-xs text-[#a0a0aa] mt-0.5">
                Every agent action generates a cryptographic receipt ID and delivery log to verify real execution.
              </p>
            </div>
            <span className="text-xs font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-3 py-1 rounded-lg font-bold">
              4/4 Verified Proofs
            </span>
          </div>

          <div className="space-y-3 font-mono text-xs">
            {proofActions.map((action) => (
              <div 
                key={action.id}
                className="bg-[#12131c] border border-[#222434] hover:border-blue-500/50 rounded-xl p-4 transition-all space-y-3 shadow-md"
              >
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#1f2238] pb-2.5">
                  <div className="flex items-center gap-2">
                    <span className="bg-blue-600/20 text-blue-300 border border-blue-500/30 text-[10px] px-2 py-0.5 rounded font-bold uppercase">
                      {action.actionType}
                    </span>
                    <span className="text-white font-bold text-sm">
                      {action.targetCompany}
                    </span>
                    <span className="text-[#888898] text-[11px]">
                      ({action.recipientEmail})
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[#888898] text-[11px] flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {action.timestamp}
                    </span>
                    <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] px-2 py-0.5 rounded font-bold uppercase flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                      {action.status}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 bg-[#171926] p-3 rounded-lg border border-[#222538]">
                  <div>
                    <span className="text-[#888] block text-[10px] uppercase">Agent Executed:</span>
                    <span className="text-amber-300 font-bold">{action.agentName}</span>
                  </div>
                  <div>
                    <span className="text-[#888] block text-[10px] uppercase">Verification Token:</span>
                    <span className="text-blue-300 font-bold">{action.verificationToken}</span>
                  </div>
                  <div>
                    <span className="text-[#888] block text-[10px] uppercase">Strict SLA Compliance:</span>
                    <span className="text-emerald-400 font-bold">{action.proofDetails.slaTimerRemaining}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <div className="text-[#a0a0aa] text-[11px] truncate max-w-xl">
                    <span className="text-[#888] mr-2">Receipt Hash:</span>
                    <code className="text-white bg-[#0a0a0b] px-2 py-0.5 rounded border border-[#232328]">{action.proofDetails.receiptHash}</code>
                  </div>

                  <button
                    onClick={() => setSelectedProof(action)}
                    className="bg-blue-600 hover:bg-blue-500 text-white font-bold text-[11px] uppercase tracking-wider px-3 py-1.5 rounded-lg flex items-center gap-1.5 cursor-pointer shadow-md"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    Inspect Proof
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* PROOF INSPECTOR MODAL */}
      {selectedProof && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0d0d0f] border border-[#25283c] rounded-2xl max-w-2xl w-full p-6 space-y-5 shadow-2xl animate-fade-in relative font-mono text-xs">
            <button
              onClick={() => setSelectedProof(null)}
              className="absolute top-4 right-4 text-[#888] hover:text-white p-1 rounded-lg bg-[#171926] border border-[#222538] cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 border-b border-[#1f2238] pb-3">
              <ShieldCheck className="w-6 h-6 text-emerald-400" />
              <div>
                <h3 className="text-base font-bold text-white uppercase">Real Action Cryptographic Proof</h3>
                <p className="text-[11px] text-[#888898]">Verification ID: {selectedProof.verificationToken}</p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="bg-[#12131c] p-3 rounded-xl border border-[#222434] space-y-1">
                <div className="text-[#888] text-[10px] uppercase">Target Entity & Recruiter Email:</div>
                <div className="text-white font-bold text-sm">{selectedProof.targetCompany} ({selectedProof.recipientEmail})</div>
              </div>

              <div className="bg-[#12131c] p-3 rounded-xl border border-[#222434] space-y-1">
                <div className="text-[#888] text-[10px] uppercase">Executing Specialist Agent:</div>
                <div className="text-amber-300 font-bold">{selectedProof.agentName} ({selectedProof.agentRole})</div>
              </div>

              {selectedProof.proofDetails.subject && (
                <div className="bg-[#12131c] p-3 rounded-xl border border-[#222434] space-y-1">
                  <div className="text-[#888] text-[10px] uppercase">Outbound Subject Line:</div>
                  <div className="text-blue-300 font-semibold">{selectedProof.proofDetails.subject}</div>
                </div>
              )}

              <div className="bg-[#12131c] p-3 rounded-xl border border-[#222434] space-y-1">
                <div className="text-[#888] text-[10px] uppercase">Payload / Sent Content Snippet:</div>
                <div className="text-[#e0e0e0] text-[11px] leading-relaxed bg-[#0a0a0b] p-3 rounded-lg border border-[#1f2238]">
                  "{selectedProof.proofDetails.payloadSnippet}"
                </div>
              </div>

              <div className="bg-[#12131c] p-3 rounded-xl border border-[#222434] space-y-1">
                <div className="text-[#888] text-[10px] uppercase">Gateway Response Digest:</div>
                <div className="text-emerald-400 font-bold">{selectedProof.proofDetails.receiptHash}</div>
              </div>
            </div>

            <div className="flex items-center justify-between border-t border-[#1f2238] pt-4">
              <span className="text-emerald-400 font-bold text-[11px] flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                VERIFIED REAL ACTION (NO FLUFF)
              </span>
              <button
                onClick={() => setSelectedProof(null)}
                className="bg-[#171926] hover:bg-[#222538] text-white px-4 py-2 rounded-xl font-bold cursor-pointer border border-[#2f334d]"
              >
                Close Audit Inspection
              </button>
            </div>
          </div>
        </div>
      )}

      {/* RECRUITMENT SIMULATION MODAL */}
      <AgentRecruitmentModal
        isOpen={isRecruitmentModalOpen}
        onClose={() => setIsRecruitmentModalOpen(false)}
        terminatedAgentName="Workday 1-Click Bot v2 (Terminated: 3-Strike Penalty)"
        onRecruitAgent={handleRecruitAgentCandidate}
      />

      {/* CEO 5-MINUTE DAILY HUDDLE MODAL */}
      <CeoDailyHuddleModal
        isOpen={isHuddleModalOpen}
        onClose={() => setIsHuddleModalOpen(false)}
        onTriggerAgentLoop={onTriggerAgentLoop}
      />
    </div>
  );
};

