import React, { useState } from 'react';
import { 
  Bot, 
  ShieldCheck, 
  AlertTriangle, 
  UserX, 
  UserCheck, 
  CheckCircle2, 
  XCircle, 
  Sparkles, 
  Zap, 
  Clock, 
  FileText, 
  RefreshCw, 
  Plus, 
  ArrowRight, 
  Activity, 
  Server, 
  Cpu, 
  Eye, 
  Award,
  Maximize2
} from 'lucide-react';

export interface GovernanceRoleTarget {
  id: string;
  roleTitle: string;
  assignedAgentId: string;
  assignedAgentName: string;
  targetMetric: string;
  deadline: string;
  currentProgress: number; // percentage 0 - 100
  strikes: number; // 0 to 3
  warningHistory: string[];
  status: 'OPTIMAL' | 'WARNING' | 'CRITICAL_3_STRIKES' | 'TERMINATED_REPLACED';
  upgradeCandidate?: string;
}

export const INITIAL_GOVERNANCE_TARGETS: GovernanceRoleTarget[] = [
  {
    id: 'gov-1',
    roleTitle: 'Recruiter Email Outreach Specialist',
    assignedAgentId: 'agent-outreach',
    assignedAgentName: 'Outreach Commander v1',
    targetMetric: 'Deliver ≥15 direct emails/day with 0 SMTP bounces',
    deadline: 'Daily 20:00 UTC (24h SLA)',
    currentProgress: 92,
    strikes: 1,
    warningHistory: [
      'Strike 1 (Yesterday): 1 Workday portal submission timed out due to Cloudflare captcha.'
    ],
    status: 'WARNING',
    upgradeCandidate: 'Outreach Commander v2 Pro (Bypass Anti-Captcha + Smart MX)'
  },
  {
    id: 'gov-2',
    roleTitle: 'ATS Resume Keyword Architect',
    assignedAgentId: 'agent-ats',
    assignedAgentName: 'ATS Resume Architect v1',
    targetMetric: 'Maintain ≥88% ATS match score across all target PDFs',
    deadline: 'Instant Render (<2 mins per role)',
    currentProgress: 100,
    strikes: 0,
    warningHistory: [],
    status: 'OPTIMAL'
  },
  {
    id: 'gov-3',
    roleTitle: 'LinkedIn & Naukri Talent Lead Scraper',
    assignedAgentId: 'agent-headhunter',
    assignedAgentName: 'Headhunter Scraper v1',
    targetMetric: 'Extract ≥10 verified primary recruiter contacts daily',
    deadline: 'Daily 18:00 UTC',
    currentProgress: 85,
    strikes: 2,
    warningHistory: [
      'Strike 1: Rate-limited on LinkedIn public profile search for 20 mins.',
      'Strike 2: Extract yield dropped to 6 contacts (below 10 contact threshold).'
    ],
    status: 'WARNING',
    upgradeCandidate: 'Headhunter Scraper v2 Ultra (Deep Hunter API + AI Verification)'
  },
  {
    id: 'gov-4',
    roleTitle: 'CTC & Compensation Floor Auditor',
    assignedAgentId: 'agent-market',
    assignedAgentName: 'Market Intelligence Bot v1',
    targetMetric: 'Filter out 100% of roles below ₹18 LPA CTC floor',
    deadline: 'Real-time (<30s scan per listing)',
    currentProgress: 98,
    strikes: 0,
    warningHistory: [],
    status: 'OPTIMAL'
  }
];

export interface BackendBottleneckReport {
  id: string;
  timestamp: string;
  subsystem: string;
  issueDescription: string;
  impactLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  remediationAction: string;
  inspectorAgentName: string;
}

export const INITIAL_BACKEND_BOTTLENECKS: BackendBottleneckReport[] = [
  {
    id: 'bot-101',
    timestamp: '10 mins ago',
    subsystem: 'Workday Portal Auto-Fill',
    issueDescription: 'Cloudflare turnstile captcha causing submission delays on 2 target roles.',
    impactLevel: 'MEDIUM',
    remediationAction: 'Inspector auto-routed jobs to 1-Click Manual Apply queue to prevent SLA breach.',
    inspectorAgentName: 'Inspector & Backend Performance Auditor'
  },
  {
    id: 'bot-102',
    timestamp: '1 hour ago',
    subsystem: 'SMTP Email Delivery Queue',
    issueDescription: 'Gmail API rate limit approaching 80% daily quota threshold.',
    impactLevel: 'LOW',
    remediationAction: 'Inspector throttled batch size to 3 emails/hour to preserve IP domain reputation.',
    inspectorAgentName: 'Inspector & Backend Performance Auditor'
  }
];

interface AgentGovernanceBoardProps {
  onTriggerAgentLoop?: () => void;
  isSyncing?: boolean;
}

export const AgentGovernanceBoard: React.FC<AgentGovernanceBoardProps> = ({
  onTriggerAgentLoop,
  isSyncing = false
}) => {
  const [targets, setTargets] = useState<GovernanceRoleTarget[]>(INITIAL_GOVERNANCE_TARGETS);
  const [bottlenecks, setBottlenecks] = useState<BackendBottleneckReport[]>(INITIAL_BACKEND_BOTTLENECKS);
  const [isInspectorScanning, setIsInspectorScanning] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Form for CEO to create new role target
  const [showAddDirectiveModal, setShowAddDirectiveModal] = useState<boolean>(false);
  const [newRoleTitle, setNewRoleTitle] = useState('');
  const [newTargetMetric, setNewTargetMetric] = useState('');
  const [newDeadline, setNewDeadline] = useState('Daily 20:00 UTC');

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleIssueStrike = (id: string) => {
    setTargets(prev => prev.map(t => {
      if (t.id === id) {
        const newStrikes = Math.min(3, t.strikes + 1);
        let newStatus = t.status;
        const newWarnings = [...t.warningHistory, `Strike ${newStrikes} issued by Inspector Agent: Failed deadline or quota target.`];

        if (newStrikes >= 3) {
          newStatus = 'CRITICAL_3_STRIKES';
          showToast(`🚨 AGENT TERMINATED! '${t.assignedAgentName}' reached 3 STRIKES! CEO is auto-hiring an upgraded replacement.`);
        } else {
          showToast(`⚠️ Strike ${newStrikes}/3 issued to '${t.assignedAgentName}'. Warning recorded in CEO ledger.`);
        }

        return {
          ...t,
          strikes: newStrikes,
          status: newStatus,
          warningHistory: newWarnings
        };
      }
      return t;
    }));
  };

  const handleCEOReplaceAgent = (id: string) => {
    setTargets(prev => prev.map(t => {
      if (t.id === id) {
        const upgradedName = t.upgradeCandidate || `${t.assignedAgentName} (v2 Upgraded Pro)`;
        showToast(`🎉 CEO ACTION EXECUTED! Hired upgraded replacement agent '${upgradedName}' with 0 strikes and enhanced skills.`);
        return {
          ...t,
          assignedAgentName: upgradedName,
          strikes: 0,
          currentProgress: 100,
          status: 'OPTIMAL',
          warningHistory: [`CEO Replacement Event: Hired '${upgradedName}' with enhanced credentials.`]
        };
      }
      return t;
    }));
  };

  const handleRunInspectorScan = () => {
    setIsInspectorScanning(true);
    setTimeout(() => {
      setIsInspectorScanning(false);
      showToast("🔍 Inspector Agent completed backend scan: Evaluated all 4 roles, zero critical blockages found.");
      if (onTriggerAgentLoop) onTriggerAgentLoop();
    }, 1200);
  };

  const handleAddDirective = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoleTitle || !newTargetMetric) return;

    const newTarget: GovernanceRoleTarget = {
      id: `gov-${Date.now()}`,
      roleTitle: newRoleTitle,
      assignedAgentId: `agent-custom-${Date.now()}`,
      assignedAgentName: `${newRoleTitle} Agent v1`,
      targetMetric: newTargetMetric,
      deadline: newDeadline,
      currentProgress: 100,
      strikes: 0,
      warningHistory: [],
      status: 'OPTIMAL'
    };

    setTargets(prev => [newTarget, ...prev]);
    setShowAddDirectiveModal(false);
    setNewRoleTitle('');
    setNewTargetMetric('');
    showToast(`🎯 CEO Directive Created! Assigned '${newTarget.roleTitle}' with strict target deadline.`);
  };

  return (
    <div className="bg-[#0d0d0f] border border-[#1f1f28] rounded-2xl p-5 sm:p-6 shadow-2xl space-y-6">
      {/* Toast Feedback */}
      {toastMessage && (
        <div className="bg-amber-500/20 border border-amber-500/50 text-amber-200 px-4 py-3 rounded-xl text-xs font-mono font-bold flex items-center gap-2 animate-bounce shadow-xl">
          <Sparkles className="w-4 h-4 text-amber-300 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#1c1d28] pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-mono px-2.5 py-0.5 rounded font-bold uppercase tracking-wider flex items-center gap-1.5">
              <Bot className="w-3.5 h-3.5 text-amber-400" />
              CEO EXECUTIVE DIRECTIVE & 3-STRIKE GOVERNANCE
            </span>
            <span className="bg-blue-500/10 text-blue-400 border border-blue-500/30 text-[10px] font-mono px-2 py-0.5 rounded font-bold flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-blue-400" />
              INSPECTOR AGENT AUDIT SYSTEM
            </span>
          </div>
          <h2 className="text-lg sm:text-xl font-bold text-white uppercase tracking-wider mt-1.5 flex items-center gap-2">
            <span>CEO Role Targets, Inspector Reports & 3-Strike Termination Engine</span>
          </h2>
          <p className="text-xs text-[#9090aa] mt-0.5 max-w-3xl">
            CEO sets role targets and deadlines. Dedicated Inspector Agent reviews backend performance and flags lag points. Agents exceeding 3 strikes are automatically terminated and upgraded replacements are hired.
          </p>
        </div>

        <div className="flex items-center gap-2 font-mono text-xs">
          <button
            onClick={() => setShowAddDirectiveModal(true)}
            className="bg-blue-600 hover:bg-blue-500 text-white font-mono text-xs font-bold px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition-all cursor-pointer shadow-lg shadow-blue-600/20"
          >
            <Plus className="w-4 h-4" />
            <span>Create CEO Target Directive</span>
          </button>

          <button
            onClick={handleRunInspectorScan}
            disabled={isInspectorScanning || isSyncing}
            className="bg-emerald-600 hover:bg-emerald-500 text-white font-mono text-xs font-bold px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition-all cursor-pointer shadow-lg shadow-emerald-950/50 disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isInspectorScanning ? 'animate-spin' : ''}`} />
            <span>{isInspectorScanning ? 'Inspector Scanning...' : 'Run Inspector Audit'}</span>
          </button>
        </div>
      </div>

      {/* INSPECTOR AGENT HIGHLIGHT CARD */}
      <div className="bg-gradient-to-r from-emerald-950/30 via-[#121422] to-blue-950/30 border border-emerald-500/40 rounded-xl p-4 sm:p-5 space-y-3 relative overflow-hidden shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-emerald-500/20 pb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/50 flex items-center justify-center font-bold text-emerald-300">
              <Eye className="w-5 h-5 text-emerald-300 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="font-bold text-white text-sm">Chief Inspector & Performance Auditor Agent</h4>
                <span className="bg-emerald-500/20 text-emerald-300 text-[9px] px-2 py-0.5 rounded font-mono font-bold uppercase border border-emerald-500/40">
                  SPECIALIZED AUDITOR
                </span>
              </div>
              <p className="text-xs text-[#a0a0b8]">
                Assigned by CEO to continuously inspect agent output, detect backend pipeline blockages, and enforce 3-strike SLAs.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 font-mono text-xs">
            <span className="bg-[#181a28] text-emerald-300 px-3 py-1 rounded-lg border border-emerald-500/30 text-[11px] font-bold">
              Status: Active 24/7 Inspector Loop
            </span>
          </div>
        </div>

        {/* Recent Backend Bottlenecks Detected by Inspector */}
        <div className="space-y-2 font-mono text-xs">
          <span className="text-[#8888a0] text-[10px] uppercase font-bold block">
            Latest Backend Lag & Blockage Audit Log (Reported directly to CEO):
          </span>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {bottlenecks.map(b => (
              <div key={b.id} className="bg-[#0b0c14] border border-[#202338] p-3 rounded-lg space-y-1">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-amber-300 font-bold">{b.subsystem}</span>
                  <span className="text-[#777788] text-[9px]">{b.timestamp}</span>
                </div>
                <p className="text-[#d0d2e5] text-xs font-sans">{b.issueDescription}</p>
                <div className="text-emerald-400 text-[10px] pt-1 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />
                  <span>{b.remediationAction}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CEO ROLE TARGETS & 3-STRIKE TERMINATION MATRIX */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wider flex items-center gap-2">
            <span>Active CEO Role Directives & 3-Strike Ledger</span>
            <span className="bg-amber-500/10 text-amber-400 text-[10px] px-2 py-0.5 rounded font-bold border border-amber-500/30">
              {targets.length} Roles Assigned
            </span>
          </h3>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {targets.map(target => {
            const isTerminated = target.strikes >= 3 || target.status === 'CRITICAL_3_STRIKES';

            return (
              <div
                key={target.id}
                className={`bg-[#11121d] border rounded-2xl p-4.5 space-y-3.5 transition-all shadow-md ${
                  isTerminated
                    ? 'border-red-500/60 bg-red-950/10'
                    : target.strikes > 0
                    ? 'border-amber-500/40 hover:border-amber-500/60'
                    : 'border-[#202336] hover:border-blue-500/40'
                }`}
              >
                {/* Header */}
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#1c1e2e] pb-2.5">
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-white text-sm">{target.roleTitle}</h4>
                      <span className={`text-[9px] font-mono px-2 py-0.5 rounded font-bold uppercase border ${
                        isTerminated
                          ? 'bg-red-500/20 text-red-300 border-red-500/50'
                          : target.strikes > 0
                          ? 'bg-amber-500/20 text-amber-300 border-amber-500/50'
                          : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50'
                      }`}>
                        {target.status}
                      </span>
                    </div>
                    <span className="text-[11px] text-[#8888a0] font-mono block mt-0.5">
                      Assigned Agent: <strong className="text-white">{target.assignedAgentName}</strong>
                    </span>
                  </div>

                  {/* STRIKE TRACKER VISUAL BADGE */}
                  <div className="flex items-center gap-1 bg-[#0b0c12] p-1.5 rounded-xl border border-[#202336] font-mono text-xs">
                    <span className="text-[#888898] text-[10px] mr-1 uppercase">Strikes:</span>
                    {[1, 2, 3].map(st => (
                      <span
                        key={st}
                        className={`w-5 h-5 rounded-md flex items-center justify-center font-extrabold text-[10px] border ${
                          st <= target.strikes
                            ? 'bg-red-600 text-white border-red-400 animate-pulse'
                            : 'bg-[#181a28] text-[#555566] border-[#2a2c42]'
                        }`}
                      >
                        {st <= target.strikes ? '❌' : st}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Target Metric & Deadline */}
                <div className="bg-[#0b0c12] p-3 rounded-xl border border-[#1d1f32] space-y-1.5 font-mono text-xs">
                  <div className="flex justify-between text-[#a0a0b8]">
                    <span>Specific Target:</span>
                    <span className="text-amber-300 font-bold">{target.targetMetric}</span>
                  </div>
                  <div className="flex justify-between text-[#a0a0b8]">
                    <span>SLA Deadline:</span>
                    <span className="text-blue-300 font-bold">{target.deadline}</span>
                  </div>
                </div>

                {/* Warning History */}
                {target.warningHistory.length > 0 && (
                  <div className="space-y-1 font-mono text-[11px]">
                    <span className="text-amber-400 text-[10px] font-bold uppercase block">
                      Inspector Warning Log:
                    </span>
                    {target.warningHistory.map((warn, i) => (
                      <div key={i} className="text-amber-200 bg-amber-950/30 p-2 rounded border border-amber-500/30 text-[10px]">
                        {warn}
                      </div>
                    ))}
                  </div>
                )}

                {/* CEO Control Actions */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-[#1c1e2e]">
                  <button
                    onClick={() => handleIssueStrike(target.id)}
                    disabled={isTerminated}
                    className="bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-mono font-bold px-3 py-1.5 rounded-xl transition-all cursor-pointer disabled:opacity-40 flex items-center gap-1.5"
                  >
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                    <span>Issue Strike + Warning</span>
                  </button>

                  {isTerminated ? (
                    <button
                      onClick={() => handleCEOReplaceAgent(target.id)}
                      className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-mono font-bold px-4 py-1.5 rounded-xl transition-all cursor-pointer shadow-lg shadow-emerald-950/50 flex items-center gap-1.5 animate-bounce"
                    >
                      <UserCheck className="w-3.5 h-3.5" />
                      <span>CEO: Hire Upgraded Agent</span>
                    </button>
                  ) : (
                    <span className="text-[10px] text-[#777788] font-mono">
                      {3 - target.strikes} strike(s) left before termination
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* CREATE NEW CEO DIRECTIVE MODAL */}
      {showAddDirectiveModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fade-in">
          <div className="bg-[#0c0d14] border border-blue-500/40 rounded-2xl w-full max-w-lg p-5 sm:p-6 shadow-2xl space-y-4 text-white font-sans">
            <div className="flex items-center justify-between border-b border-[#1f2238] pb-3">
              <h3 className="text-base font-bold font-mono text-white uppercase tracking-wider flex items-center gap-2">
                <Plus className="w-4 h-4 text-blue-400" />
                Define CEO Role Directive & Target
              </h3>
              <button
                onClick={() => setShowAddDirectiveModal(false)}
                className="text-[#888898] hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddDirective} className="space-y-3 text-xs font-mono">
              <div>
                <label className="block text-[#a0a0b8] uppercase mb-1">Role Title & Function</label>
                <input
                  type="text"
                  value={newRoleTitle}
                  onChange={(e) => setNewRoleTitle(e.target.value)}
                  placeholder="e.g. Compensation Counter-Offer Negotiator"
                  className="w-full bg-[#11121d] text-white p-2.5 rounded-xl border border-[#202235] focus:outline-none focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-[#a0a0b8] uppercase mb-1">Specific Target Metric</label>
                <input
                  type="text"
                  value={newTargetMetric}
                  onChange={(e) => setNewTargetMetric(e.target.value)}
                  placeholder="e.g. Negotiate counter-offer +15% above initial CTC offer"
                  className="w-full bg-[#11121d] text-white p-2.5 rounded-xl border border-[#202235] focus:outline-none focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-[#a0a0b8] uppercase mb-1">SLA Deadline</label>
                <input
                  type="text"
                  value={newDeadline}
                  onChange={(e) => setNewDeadline(e.target.value)}
                  placeholder="e.g. Within 12 hours of offer letter release"
                  className="w-full bg-[#11121d] text-white p-2.5 rounded-xl border border-[#202235] focus:outline-none focus:border-blue-500"
                  required
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddDirectiveModal(false)}
                  className="px-4 py-2 bg-[#161828] text-[#888898] hover:text-white rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold shadow-lg"
                >
                  Save & Assign CEO Directive
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
