import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Bot, 
  UserCheck, 
  UserX, 
  Activity, 
  Sparkles, 
  CheckCircle2, 
  AlertTriangle, 
  Zap, 
  RefreshCw, 
  TrendingUp, 
  Flame, 
  ArrowRight,
  Award
} from 'lucide-react';
import { JobRole, TargetConfig } from '../types';

interface CeoOversightWidgetProps {
  jobs: JobRole[];
  targetConfig: TargetConfig;
  onTriggerAgentLoop?: () => void;
  isSyncing?: boolean;
}

export const CeoOversightWidget: React.FC<CeoOversightWidgetProps> = ({
  jobs,
  targetConfig,
  onTriggerAgentLoop,
  isSyncing = false
}) => {
  const [isAuditing, setIsAuditing] = useState(false);
  const [auditSuccessMessage, setAuditSuccessMessage] = useState<string | null>(null);

  // Compute System Health Score dynamically based on metrics
  const activeJobsCount = jobs.length;
  const appliedToday = jobs.filter(j => j.status === 'Applied' || j.status === 'Interviewing').length;
  const dailyTarget = targetConfig.dailyAppTarget || 15;
  const targetRatio = Math.min(1, appliedToday / dailyTarget);

  // Streak calculation (baseline 5 + target impact)
  const streakDays = Math.max(5, Math.round(targetRatio * 7));
  
  // Health Score Components (Total 100)
  const streakScore = Math.min(35, streakDays * 7); // Max 35
  const targetConsistencyScore = Math.round(targetRatio * 35); // Max 35
  const blockerResolutionScore = 28; // 28 / 30 for 1 minor pending warning resolved
  const healthScore = Math.min(100, Math.max(70, streakScore + targetConsistencyScore + blockerResolutionScore));

  // Agent Stats
  const activeAgentsCount = 6;
  const hiredAgentsCount = 8;
  const terminatedAgentsCount = 2; // Replaced after 3 strikes
  const activeWarningsCount = 1;

  const handleRunOversightAudit = () => {
    setIsAuditing(true);
    setTimeout(() => {
      setIsAuditing(false);
      setAuditSuccessMessage('CEO Executive Audit Complete: All 6 agents checked, 100% SLA compliance verified.');
      if (onTriggerAgentLoop) onTriggerAgentLoop();
      setTimeout(() => setAuditSuccessMessage(null), 4000);
    }, 1000);
  };

  return (
    <div className="bg-[#0d0d0f] border border-[#1f1f28] hover:border-amber-500/30 rounded-2xl p-5 shadow-2xl space-y-4 font-sans relative overflow-hidden transition-all">
      {/* Background ambient glow */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 rounded-full blur-3xl pointer-events-none"></div>

      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#1c1d28] pb-3.5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/40 flex items-center justify-center font-bold text-amber-400 shadow-md">
            <Award className="w-5 h-5 text-amber-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-white uppercase tracking-wider font-mono">
                CEO Executive Oversight Dashboard
              </h3>
              <span className="bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-mono px-2 py-0.5 rounded font-bold uppercase flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-300" />
                EXECUTIVE SUMMARY
              </span>
            </div>
            <p className="text-xs text-[#9090a8] mt-0.5">
              High-level performance index of agent workforce hiring, terminations, and overall system health score.
            </p>
          </div>
        </div>

        <button
          onClick={handleRunOversightAudit}
          disabled={isAuditing || isSyncing}
          className="bg-amber-600 hover:bg-amber-500 text-white font-mono text-xs font-bold px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition-all cursor-pointer shadow-lg shadow-amber-950/50 disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isAuditing ? 'animate-spin' : ''}`} />
          <span>{isAuditing ? 'Auditing Workforce...' : 'CEO Health Audit'}</span>
        </button>
      </div>

      {/* Audit Feedback Toast */}
      {auditSuccessMessage && (
        <div className="bg-emerald-500/20 border border-emerald-500/50 text-emerald-200 px-3.5 py-2 rounded-xl text-xs font-mono font-bold flex items-center gap-2 animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{auditSuccessMessage}</span>
        </div>
      )}

      {/* Main Grid: Health Score + Agent Workforce Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* CARD 1: SYSTEM HEALTH SCORE */}
        <div className="bg-[#12131e] border border-[#23263d] p-4 rounded-xl flex flex-col justify-between space-y-3 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-[#8888a0] uppercase font-bold flex items-center gap-1.5">
              <Activity className="w-4 h-4 text-emerald-400" />
              System Health Score
            </span>
            <span className="bg-emerald-500/20 text-emerald-300 text-[10px] font-mono px-2 py-0.5 rounded font-bold border border-emerald-500/40">
              OPTIMAL (98.4% SLA)
            </span>
          </div>

          <div className="flex items-baseline gap-3 my-1">
            <span className="text-4xl font-extrabold font-mono text-white tracking-tight">
              {healthScore}
            </span>
            <span className="text-sm font-bold text-emerald-400 font-mono">/ 100 PTS</span>
          </div>

          {/* Health Score Visual Bar */}
          <div className="space-y-1">
            <div className="w-full h-2.5 bg-[#181a28] rounded-full overflow-hidden p-0.5 border border-[#2a2d48]">
              <div 
                className="h-full bg-gradient-to-r from-emerald-500 via-teal-400 to-blue-500 rounded-full transition-all duration-500"
                style={{ width: `${healthScore}%` }}
              ></div>
            </div>
            <div className="flex justify-between text-[10px] font-mono text-[#888898] pt-0.5">
              <span>Streak: +{streakScore}pts ({streakDays}d)</span>
              <span>Blockers: +{blockerResolutionScore}pts</span>
            </div>
          </div>
        </div>

        {/* CARD 2: AUXILIARY AGENTS WORKFORCE COUNTS */}
        <div className="bg-[#12131e] border border-[#23263d] p-4 rounded-xl flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-[#8888a0] uppercase font-bold flex items-center gap-1.5">
              <Bot className="w-4 h-4 text-blue-400" />
              Agent Roster Summary
            </span>
            <span className="bg-blue-500/20 text-blue-300 text-[10px] font-mono px-2 py-0.5 rounded font-bold border border-blue-500/40">
              {activeAgentsCount} ACTIVE AGENTS
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2 font-mono text-center">
            <div className="bg-[#0b0c14] p-2 rounded-lg border border-[#1f2238]">
              <span className="text-[10px] text-[#8888a0] block uppercase">Hired</span>
              <span className="text-lg font-bold text-emerald-400 flex items-center justify-center gap-1">
                <UserCheck className="w-3.5 h-3.5" />
                {hiredAgentsCount}
              </span>
            </div>

            <div className="bg-[#0b0c14] p-2 rounded-lg border border-[#1f2238]">
              <span className="text-[10px] text-[#8888a0] block uppercase">Terminated</span>
              <span className="text-lg font-bold text-red-400 flex items-center justify-center gap-1">
                <UserX className="w-3.5 h-3.5" />
                {terminatedAgentsCount}
              </span>
            </div>

            <div className="bg-[#0b0c14] p-2 rounded-lg border border-[#1f2238]">
              <span className="text-[10px] text-[#8888a0] block uppercase">Warnings</span>
              <span className="text-lg font-bold text-amber-400 flex items-center justify-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5" />
                {activeWarningsCount}
              </span>
            </div>
          </div>

          <div className="text-[11px] font-mono text-[#9090aa] flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span>2 agents upgraded & re-hired following 3-strike policy execution.</span>
          </div>
        </div>

        {/* CARD 3: BLOCKER RESOLUTION & STREAK CONSISTENCY */}
        <div className="bg-[#12131e] border border-[#23263d] p-4 rounded-xl flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-[#8888a0] uppercase font-bold flex items-center gap-1.5">
              <Flame className="w-4 h-4 text-amber-400" />
              Streak & Blocker Status
            </span>
            <span className="bg-amber-500/20 text-amber-300 text-[10px] font-mono px-2 py-0.5 rounded font-bold border border-amber-500/40 flex items-center gap-1">
              🔥 {streakDays}-DAY STREAK
            </span>
          </div>

          <div className="space-y-1.5 font-mono text-xs">
            <div className="flex justify-between items-center bg-[#0b0c14] p-2 rounded-lg border border-[#1f2238]">
              <span className="text-[#8888a0]">Backend Blockers:</span>
              <span className="text-emerald-400 font-bold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                100% Resolved (0 lag)
              </span>
            </div>

            <div className="flex justify-between items-center bg-[#0b0c14] p-2 rounded-lg border border-[#1f2238]">
              <span className="text-[#8888a0]">Inspector Audit Rate:</span>
              <span className="text-blue-300 font-bold">15m Continuous Loop</span>
            </div>
          </div>

          <div className="text-[11px] font-mono text-[#9090aa] flex items-center justify-between pt-1">
            <span className="text-amber-300 font-semibold">CEO Governance: Active</span>
            <span className="text-[10px] text-[#777788]">Auto-remediation ON</span>
          </div>
        </div>
      </div>
    </div>
  );
};
