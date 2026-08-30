import React, { useState } from 'react';
import { 
  Users, 
  Clock, 
  Bot, 
  AlertTriangle, 
  CheckCircle2, 
  Sparkles, 
  ArrowRight, 
  RefreshCw, 
  X, 
  Zap, 
  ShieldAlert, 
  ShieldCheck, 
  MessageSquare, 
  Play, 
  Check, 
  Flame, 
  HelpCircle,
  TrendingUp,
  UserCheck
} from 'lucide-react';

export interface HuddleAgentCheckIn {
  agentId: string;
  agentName: string;
  agentRole: string;
  avatar: string;
  assignedTask: string;
  completionPercentage: number;
  statusSummary: string;
  hasBlocker: boolean;
  blockerDetail?: string;
  recommendedReassignment?: string;
  reassignedToAgent?: string;
  huddleState: 'PENDING' | 'REVIEWING' | 'RESOLVED' | 'REASSIGNED';
}

export const INITIAL_HUDDLE_AGENTS: HuddleAgentCheckIn[] = [
  {
    agentId: 'huddle-1',
    agentName: 'Outreach Specialist v1',
    agentRole: 'Recruiter Direct Emailing',
    avatar: '✉️',
    assignedTask: 'Cold Emailing 5 Engineering VPs at Stripe & Coinbase',
    completionPercentage: 80,
    statusSummary: '4/5 emails dispatched successfully. Opened rate is 60%. Remaining 1 email awaiting secondary verified contact.',
    hasBlocker: false,
    huddleState: 'PENDING'
  },
  {
    agentId: 'huddle-2',
    agentName: 'Workday 1-Click Bot',
    agentRole: 'Portal Submissions',
    avatar: '🤖',
    assignedTask: 'Submit 8 Staff SWE Applications via Workday',
    completionPercentage: 35,
    statusSummary: 'Stuck on Google Staff SWE Workday portal due to Cloudflare Turnstile Captcha verification block.',
    hasBlocker: true,
    blockerDetail: 'Cloudflare Turnstile Captcha loop detected on myworkdayjobs.com (3 retries failed).',
    recommendedReassignment: 'Reassign Google Staff SWE task to Headhunter Scraper for direct recruiter InMail outreach.',
    reassignedToAgent: 'Headhunter Lead Scraper',
    huddleState: 'PENDING'
  },
  {
    agentId: 'huddle-3',
    agentName: 'ATS Resume Architect v1',
    agentRole: 'Keyword Tailoring',
    avatar: '📄',
    assignedTask: 'Tailor 10 Custom Resumes for Fintech & AI roles',
    completionPercentage: 100,
    statusSummary: '10/10 resumes generated with 92%+ ATS match score. All PDFs pushed to cloud storage bucket.',
    hasBlocker: false,
    huddleState: 'PENDING'
  },
  {
    agentId: 'huddle-4',
    agentName: 'CTC Floor Auditor',
    agentRole: 'Compensation Thresholds',
    avatar: '💰',
    assignedTask: 'Filter candidate job feed against ₹18 LPA CTC floor',
    completionPercentage: 90,
    statusSummary: 'Filtered 45 incoming listings. 2 roles rejected due to non-negotiable below-floor budget.',
    hasBlocker: false,
    huddleState: 'PENDING'
  },
  {
    agentId: 'huddle-5',
    agentName: 'Headhunter Lead Scraper',
    agentRole: 'Contact Scraper',
    avatar: '🔍',
    assignedTask: 'Mine 12 LinkedIn Recruiter Contacts',
    completionPercentage: 50,
    statusSummary: '6 contacts extracted with verified work email addresses. LinkedIn rate limit alert at 70%.',
    hasBlocker: true,
    blockerDetail: 'LinkedIn API search limit warning triggered. Query delay slowed down by 5 minutes per batch.',
    recommendedReassignment: 'Shift secondary scraping pool to Naukri & Indeed recruiters for remainder of shift.',
    reassignedToAgent: 'Outreach Specialist v1',
    huddleState: 'PENDING'
  }
];

interface CeoDailyHuddleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTriggerAgentLoop?: () => void;
}

export const CeoDailyHuddleModal: React.FC<CeoDailyHuddleModalProps> = ({
  isOpen,
  onClose,
  onTriggerAgentLoop
}) => {
  const [huddleAgents, setHuddleAgents] = useState<HuddleAgentCheckIn[]>(INITIAL_HUDDLE_AGENTS);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [huddleFinished, setHuddleFinished] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const currentAgent = huddleAgents[currentIndex];

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleApproveStatus = (id: string) => {
    setHuddleAgents(prev => prev.map(a => 
      a.agentId === id ? { ...a, huddleState: 'RESOLVED' } : a
    ));
    showToast(`✅ Approved status for ${currentAgent.agentName}!`);
    advanceToNext();
  };

  const handleReassignTask = (id: string) => {
    setHuddleAgents(prev => prev.map(a => 
      a.agentId === id ? { ...a, huddleState: 'REASSIGNED', hasBlocker: false } : a
    ));
    showToast(`🔀 Reassigned task from ${currentAgent.agentName} to ${currentAgent.reassignedToAgent}!`);
    advanceToNext();
  };

  const advanceToNext = () => {
    if (currentIndex < huddleAgents.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      setHuddleFinished(true);
      if (onTriggerAgentLoop) onTriggerAgentLoop();
    }
  };

  const resolvedCount = huddleAgents.filter(a => a.huddleState === 'RESOLVED' || a.huddleState === 'REASSIGNED').length;
  const reassignmentsCount = huddleAgents.filter(a => a.huddleState === 'REASSIGNED').length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-fade-in font-sans">
      <div className="bg-[#0b0c14] border border-blue-500/40 rounded-2xl w-full max-w-2xl p-5 sm:p-6 shadow-2xl space-y-5 text-white max-h-[90vh] overflow-y-auto relative">
        {/* Toast Alert */}
        {toastMessage && (
          <div className="bg-blue-500/20 border border-blue-500/50 text-blue-200 px-4 py-2 rounded-xl text-xs font-mono font-bold flex items-center gap-2 animate-bounce shadow-xl">
            <Sparkles className="w-4 h-4 text-blue-300 shrink-0" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-[#1f2238] pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/15 border border-blue-500/40 flex items-center justify-center font-bold text-blue-400 shadow-md">
              <Users className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white uppercase tracking-wider font-mono">
                  CEO 5-Minute Daily Agent Standup Huddle
                </h3>
                <span className="bg-blue-500/20 text-blue-300 border border-blue-500/40 text-[10px] font-mono px-2 py-0.5 rounded font-bold uppercase flex items-center gap-1">
                  <Clock className="w-3 h-3 text-emerald-400 animate-pulse" />
                  5-MIN CHECK-IN
                </span>
              </div>
              <p className="text-xs text-[#9090a8] mt-0.5">
                Interactive executive check-in with auxiliary agents to review status summaries, clear blockers, and reassign tasks.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-[#888898] hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Huddle Progress Bar */}
        <div className="bg-[#121320] border border-[#23263d] p-3 rounded-xl space-y-1.5 font-mono text-xs">
          <div className="flex justify-between text-[#8888a0]">
            <span>Huddle Progress ({resolvedCount} / {huddleAgents.length} Agents Reviewed)</span>
            <span className="text-blue-300 font-bold">{Math.round((resolvedCount / huddleAgents.length) * 100)}% Complete</span>
          </div>
          <div className="w-full h-2 bg-[#181a28] rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-emerald-400 transition-all duration-300"
              style={{ width: `${(resolvedCount / huddleAgents.length) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* MAIN HUDDLE STEP CAROUSEL */}
        {!huddleFinished ? (
          <div className="bg-[#0f101b] border border-[#20233a] p-5 rounded-2xl space-y-4">
            {/* Agent Info Header */}
            <div className="flex items-center justify-between border-b border-[#1c1e33] pb-3">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{currentAgent.avatar}</span>
                <div>
                  <h4 className="font-bold text-white text-sm">{currentAgent.agentName}</h4>
                  <p className="text-xs text-[#8888a0] font-mono">{currentAgent.agentRole}</p>
                </div>
              </div>

              <span className={`px-2.5 py-1 rounded-lg font-mono text-xs font-bold uppercase border ${
                currentAgent.hasBlocker
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 animate-pulse'
                  : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
              }`}>
                {currentAgent.hasBlocker ? '⚠️ BLOCKER REPORTED' : '✅ ON TRACK'}
              </span>
            </div>

            {/* Assigned Task & Progress */}
            <div className="bg-[#080911] p-3 rounded-xl border border-[#1a1c2e] space-y-2 font-mono text-xs">
              <div className="flex justify-between text-[#8888a0]">
                <span>Assigned Task Directive:</span>
                <span className="text-amber-300 font-bold">{currentAgent.completionPercentage}% Done</span>
              </div>
              <p className="text-white font-bold">{currentAgent.assignedTask}</p>
            </div>

            {/* Agent Status Summary */}
            <div className="space-y-1.5">
              <span className="text-xs text-[#8888a0] font-mono uppercase font-bold block">Agent Status Summary Report:</span>
              <div className="bg-[#131424] p-3.5 rounded-xl border border-[#22253f] text-xs text-white leading-relaxed font-sans">
                {currentAgent.statusSummary}
              </div>
            </div>

            {/* Blocker & Reassignment Card */}
            {currentAgent.hasBlocker && (
              <div className="bg-amber-950/20 border border-amber-500/40 p-3.5 rounded-xl space-y-2 font-mono text-xs">
                <div className="flex items-center gap-2 text-amber-300 font-bold">
                  <AlertTriangle className="w-4 h-4 text-amber-400" />
                  <span>High-Priority Operational Blocker:</span>
                </div>
                <p className="text-amber-200/90 leading-relaxed text-[11px]">{currentAgent.blockerDetail}</p>
                
                {currentAgent.recommendedReassignment && (
                  <div className="pt-2 border-t border-amber-500/20 text-[11px] text-[#b0b0cc]">
                    <span className="text-purple-300 font-bold">Proposed CEO Action: </span>
                    <span>{currentAgent.recommendedReassignment}</span>
                  </div>
                )}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-[#1a1c2e] font-mono text-xs">
              <span className="text-[#666678]">
                Agent {currentIndex + 1} of {huddleAgents.length}
              </span>

              <div className="flex items-center gap-2">
                {currentAgent.hasBlocker && (
                  <button
                    onClick={() => handleReassignTask(currentAgent.agentId)}
                    className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-xl font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-lg shadow-amber-950/50"
                  >
                    <Zap className="w-3.5 h-3.5" />
                    <span>Reassign Task Directive</span>
                  </button>
                )}

                <button
                  onClick={() => handleApproveStatus(currentAgent.agentId)}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-lg shadow-blue-950/50"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{currentAgent.hasBlocker ? 'Override & Continue' : 'Approve & Next Agent'}</span>
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* HUDDLE FINISHED SUMMARY SCREEN */
          <div className="bg-[#0f101b] border border-emerald-500/40 p-6 rounded-2xl text-center space-y-4 font-mono">
            <div className="w-12 h-12 bg-emerald-500/20 border border-emerald-500/40 rounded-2xl mx-auto flex items-center justify-center text-emerald-400">
              <CheckCircle2 className="w-6 h-6" />
            </div>

            <div>
              <h4 className="text-lg font-bold text-white uppercase">CEO Daily Huddle Completed!</h4>
              <p className="text-xs text-[#8888a0] mt-1">
                All 5 auxiliary agents have been reviewed. Operational blockers addressed and directives updated.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 max-w-sm mx-auto text-xs pt-2">
              <div className="bg-[#141524] p-3 rounded-xl border border-[#23263d]">
                <span className="text-[#8888a0] block text-[10px]">Reviewed Agents</span>
                <span className="text-emerald-400 font-bold text-base">{resolvedCount} / 5</span>
              </div>
              <div className="bg-[#141524] p-3 rounded-xl border border-[#23263d]">
                <span className="text-[#8888a0] block text-[10px]">Tasks Reassigned</span>
                <span className="text-amber-400 font-bold text-base">{reassignmentsCount} Directives</span>
              </div>
            </div>

            <button
              onClick={onClose}
              className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-lg transition-all cursor-pointer"
            >
              Close Huddle & Resume Autonomous Run
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
