import React, { useState } from 'react';
import { 
  ShieldCheck, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  TrendingUp, 
  Zap, 
  Bot, 
  FileText, 
  Mail, 
  Filter, 
  Award, 
  AlertTriangle,
  RefreshCw,
  Search,
  Sparkles,
  ChevronRight
} from 'lucide-react';
import { AgentHealthCheckWidget } from './AgentHealthCheckWidget';

export interface AuditTaskItem {
  id: string;
  timeAgo: string;
  agentName: string;
  category: 'OUTREACH' | 'RESUME_ATS' | 'CONTACT_EXTRACTION' | 'CTC_AUDIT' | 'PORTAL_APPLY';
  impactDescription: string;
  plainEnglishSummary: string;
  status: 'COMPLETED' | 'FAILED' | 'RETIRED_RESOLVED';
  technicalLogRef: string;
  impactMetrics: {
    timeSavedMinutes: number;
    valueGenerated: string;
  };
}

export const INITIAL_AUDIT_TASKS: AuditTaskItem[] = [
  {
    id: 'audit-201',
    timeAgo: '15 mins ago',
    agentName: 'Outreach Specialist',
    category: 'OUTREACH',
    impactDescription: 'Sent 5 direct emails with tailored ATS PDF resumes to hiring managers at Stripe & Atlassian.',
    plainEnglishSummary: 'Delivered customized job applications directly to the decision makers’ inboxes instead of generic job portals. 2 recruiters opened within 1 hour.',
    status: 'COMPLETED',
    technicalLogRef: 'LOG-SMTP-200-OK-99812',
    impactMetrics: {
      timeSavedMinutes: 45,
      valueGenerated: '5 Recruiter Direct Delivery'
    }
  },
  {
    id: 'audit-202',
    timeAgo: '42 mins ago',
    agentName: 'ATS Resume Architect',
    category: 'RESUME_ATS',
    impactDescription: 'Tailored 3 PDF resumes specifically inserting missing keywords (GraphQL, Microfrontends, System Design).',
    plainEnglishSummary: 'Reworded work experience bullets to match target job descriptions. Raised average ATS candidate ranking from 68% to 89%.',
    status: 'COMPLETED',
    technicalLogRef: 'LOG-PDF-RENDER-SHA256-4192',
    impactMetrics: {
      timeSavedMinutes: 60,
      valueGenerated: '+21% ATS Rank Increase'
    }
  },
  {
    id: 'audit-203',
    timeAgo: '1 hour ago',
    agentName: 'Headhunter Scraper',
    category: 'CONTACT_EXTRACTION',
    impactDescription: 'Extracted verified primary recruiter email contacts for Databricks & Snowflake roles.',
    plainEnglishSummary: 'Discovered the direct email address of the Senior Talent Lead on LinkedIn and validated MX records.',
    status: 'COMPLETED',
    technicalLogRef: 'LOG-HUNTER-API-MX-OK',
    impactMetrics: {
      timeSavedMinutes: 30,
      valueGenerated: '2 Verified Recruiter Contacts'
    }
  },
  {
    id: 'audit-204',
    timeAgo: '2 hours ago',
    agentName: 'Market Intelligence Bot',
    category: 'CTC_AUDIT',
    impactDescription: 'Audited 15 new listings; flagged and auto-archived 3 low-CTC roles below ₹18 LPA.',
    plainEnglishSummary: 'Protected your time by rejecting roles paying under ₹18,00,000 CTC, keeping your focus strictly on high-paying offers.',
    status: 'COMPLETED',
    technicalLogRef: 'LOG-CTC-FLOOR-FILTER-991',
    impactMetrics: {
      timeSavedMinutes: 25,
      valueGenerated: '3 Low-CTC Roles Filtered'
    }
  },
  {
    id: 'audit-205',
    timeAgo: '3 hours ago',
    agentName: 'Outreach Specialist',
    category: 'PORTAL_APPLY',
    impactDescription: 'Workday portal form submission for Snowflake US timed out due to Cloudflare captcha.',
    plainEnglishSummary: 'Portal automation hit a mandatory captcha check. System automatically paused application and routed it to your 1-Click Apply queue.',
    status: 'FAILED',
    technicalLogRef: 'LOG-WORKDAY-CAPTCHA-TIMEOUT',
    impactMetrics: {
      timeSavedMinutes: 0,
      valueGenerated: 'Queued for 1-Click Manual Verification'
    }
  },
  {
    id: 'audit-206',
    timeAgo: '5 hours ago',
    agentName: 'Agent CEO (Executive Director)',
    category: 'CTC_AUDIT',
    impactDescription: 'Ran 24-hour SLA check across all active applications; triggered follow-up ping for 4 stale applications.',
    plainEnglishSummary: 'Checked all pending jobs. Identified 4 roles with no updates in >14 days and scheduled automatic follow-up reminders.',
    status: 'COMPLETED',
    technicalLogRef: 'LOG-SLA-TIMER-24H-VERIFIED',
    impactMetrics: {
      timeSavedMinutes: 40,
      valueGenerated: '4 Stale Roles Followed Up'
    }
  }
];

interface SystemAuditViewProps {
  onTriggerAgentLoop?: () => void;
  isSyncing?: boolean;
}

export const SystemAuditView: React.FC<SystemAuditViewProps> = ({
  onTriggerAgentLoop,
  isSyncing = false
}) => {
  const [tasks, setTasks] = useState<AuditTaskItem[]>(INITIAL_AUDIT_TASKS);
  const [filterStatus, setFilterStatus] = useState<'ALL' | 'COMPLETED' | 'FAILED'>('ALL');
  const [searchTerm, setSearchTerm] = useState<string>('');

  const completedTasks = tasks.filter(t => t.status === 'COMPLETED');
  const failedTasks = tasks.filter(t => t.status === 'FAILED');

  const totalMinutesSaved = tasks.reduce((sum, t) => sum + t.impactMetrics.timeSavedMinutes, 0);
  const successRate = Math.round((completedTasks.length / tasks.length) * 100);

  const filteredTasks = tasks.filter(t => {
    const matchesStatus = filterStatus === 'ALL' || t.status === filterStatus;
    const matchesSearch = searchTerm === '' ||
      t.plainEnglishSummary.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.agentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.impactDescription.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Executive Impact Banner */}
      <div className="bg-[#0d0d0f] border border-[#1f1f28] rounded-2xl p-5 sm:p-6 shadow-xl space-y-4 relative overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#1c1d28] pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[10px] font-mono px-2.5 py-0.5 rounded font-bold uppercase tracking-wider flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                24-HOUR EXECUTIVE SYSTEM AUDIT
              </span>
              <span className="bg-blue-500/10 text-blue-400 border border-blue-500/30 text-[10px] font-mono px-2 py-0.5 rounded">
                NON-TECHNICAL AUDIT LEDGER
              </span>
            </div>
            <h2 className="text-xl font-bold text-white uppercase tracking-wider mt-2 flex items-center gap-2">
              <span>Autonomous Agent Decision & Impact Audit</span>
            </h2>
            <p className="text-xs text-[#a0a0aa] mt-0.5 max-w-3xl">
              Track real-world business outcomes generated by the Agent CEO and employee agents over the last 24 hours — zero technical jargon, 100% verifiable impact.
            </p>
          </div>

          {onTriggerAgentLoop && (
            <button
              onClick={onTriggerAgentLoop}
              disabled={isSyncing}
              className="bg-blue-600 hover:bg-blue-500 text-white font-mono text-xs font-bold px-4 py-2.5 rounded-xl flex items-center gap-2 transition-all cursor-pointer shadow-lg shadow-blue-600/20 disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>{isSyncing ? 'Running Audit Scan...' : 'Re-Run System Audit'}</span>
            </button>
          )}
        </div>

        {/* 24-Hour Metrics Summary Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-xs">
          <div className="bg-[#12131e] border border-[#222436] p-4 rounded-xl">
            <span className="text-[#888898] text-[10px] uppercase block">24h Success Rate</span>
            <span className="text-emerald-400 font-bold text-xl">{successRate}% SLA</span>
            <span className="text-[10px] text-[#777] block mt-1">{completedTasks.length} Successful / {failedTasks.length} Failed</span>
          </div>

          <div className="bg-[#12131e] border border-[#222436] p-4 rounded-xl">
            <span className="text-[#888898] text-[10px] uppercase block">Total Time Saved Today</span>
            <span className="text-amber-400 font-bold text-xl">{(totalMinutesSaved / 60).toFixed(1)} Hours</span>
            <span className="text-[10px] text-[#777] block mt-1">Manual effort eliminated</span>
          </div>

          <div className="bg-[#12131e] border border-[#222436] p-4 rounded-xl">
            <span className="text-[#888898] text-[10px] uppercase block">Recruiter Inbound Inboxes</span>
            <span className="text-blue-400 font-bold text-xl">5 Direct Emails</span>
            <span className="text-[10px] text-[#777] block mt-1">Bypassed generic portals</span>
          </div>

          <div className="bg-[#12131e] border border-[#222436] p-4 rounded-xl">
            <span className="text-[#888898] text-[10px] uppercase block">Flagged & Filtered</span>
            <span className="text-purple-400 font-bold text-xl">3 Sub-CTC Roles</span>
            <span className="text-[10px] text-[#777] block mt-1">Filtered &lt;18 LPA offers</span>
          </div>
        </div>
      </div>

      {/* REAL-TIME AGENT HEALTH CHECK & PORTAL API CONNECTIVITY WIDGET */}
      <AgentHealthCheckWidget />

      {/* Filter and Search Bar */}
      <div className="bg-[#0d0d0f] border border-[#1f1f28] rounded-xl p-4 flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-[#666] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search audit actions (e.g. Stripe, ATS, email)..."
            className="w-full bg-[#11121d] text-[#e0e0e0] text-xs font-mono rounded-lg pl-9 pr-3 py-2 border border-[#202235] focus:outline-none focus:border-blue-500"
          />
        </div>

        <div className="flex items-center gap-2 font-mono text-xs w-full md:w-auto">
          <button
            onClick={() => setFilterStatus('ALL')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
              filterStatus === 'ALL'
                ? 'bg-blue-600 text-white shadow'
                : 'bg-[#12131e] text-[#888898] hover:text-white border border-[#222436]'
            }`}
          >
            All Actions ({tasks.length})
          </button>

          <button
            onClick={() => setFilterStatus('COMPLETED')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              filterStatus === 'COMPLETED'
                ? 'bg-emerald-600 text-white shadow'
                : 'bg-[#12131e] text-emerald-400 border border-[#222436] hover:bg-emerald-950/20'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>Completed ({completedTasks.length})</span>
          </button>

          <button
            onClick={() => setFilterStatus('FAILED')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              filterStatus === 'FAILED'
                ? 'bg-red-600 text-white shadow'
                : 'bg-[#12131e] text-red-400 border border-[#222436] hover:bg-red-950/20'
            }`}
          >
            <XCircle className="w-3.5 h-3.5 text-red-400" />
            <span>Failed / Retried ({failedTasks.length})</span>
          </button>
        </div>
      </div>

      {/* Task Audit List */}
      <div className="space-y-3">
        {filteredTasks.map((task) => {
          const isCompleted = task.status === 'COMPLETED';

          return (
            <div
              key={task.id}
              className={`bg-[#0d0d0f] border rounded-2xl p-4 transition-all space-y-3 shadow-md ${
                isCompleted
                  ? 'border-[#1f2233] hover:border-emerald-500/40'
                  : 'border-red-500/40 bg-red-950/10'
              }`}
            >
              {/* Top Row Header */}
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#1c1e2e] pb-2.5">
                <div className="flex items-center gap-2.5">
                  <span className={`p-1.5 rounded-lg font-bold font-mono text-[10px] uppercase border ${
                    isCompleted
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                      : 'bg-red-500/20 text-red-300 border-red-500/40'
                  }`}>
                    {isCompleted ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <XCircle className="w-4 h-4 text-red-400" />}
                  </span>

                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-white text-sm">{task.agentName}</h4>
                      <span className="bg-[#181a28] text-blue-300 font-mono text-[10px] px-2 py-0.5 rounded border border-[#2b2e45]">
                        {task.category.replace('_', ' ')}
                      </span>
                    </div>
                    <span className="text-[11px] text-[#888898] font-mono flex items-center gap-1 mt-0.5">
                      <Clock className="w-3 h-3 text-[#666]" />
                      Executed {task.timeAgo}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 font-mono text-xs">
                  <span className="bg-[#131522] text-[#a0a0b8] px-2.5 py-1 rounded-lg border border-[#23263b] text-[11px]">
                    Saved ~{task.impactMetrics.timeSavedMinutes} mins
                  </span>

                  <span className={`px-2.5 py-1 rounded-lg font-bold text-[10px] uppercase border ${
                    isCompleted
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                      : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                  }`}>
                    {task.status}
                  </span>
                </div>
              </div>

              {/* Plain English Outcome */}
              <div className="space-y-1.5">
                <span className="text-[10px] font-mono uppercase tracking-wider text-[#888898] block">
                  Plain English Impact & Decision Outcome:
                </span>
                <p className="text-white text-xs leading-relaxed font-sans font-medium bg-[#131522] p-3 rounded-xl border border-[#222538]">
                  "{task.plainEnglishSummary}"
                </p>
              </div>

              {/* Technical Description & Ref Code */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-1 font-mono text-[11px] text-[#888898]">
                <div className="text-[11px] text-[#a0a0b8]">
                  <span className="text-[#666] mr-1">Action:</span>
                  {task.impactDescription}
                </div>

                <div className="text-[10px] bg-[#08080c] px-2 py-0.5 rounded border border-[#1b1c28]">
                  <span className="text-[#666] mr-1">Audit Ref:</span>
                  <code className="text-amber-300">{task.technicalLogRef}</code>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
