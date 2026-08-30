import React, { useState } from 'react';
import { JobRole, TargetConfig } from '../types';
import { 
  Zap, 
  Target, 
  TrendingUp, 
  CheckCircle2, 
  Award, 
  Flame, 
  Plus, 
  Minus, 
  Send, 
  Sparkles,
  ArrowRight,
  Clock,
  ShieldCheck
} from 'lucide-react';

interface DailySprintMeterProps {
  jobs: JobRole[];
  targetConfig: TargetConfig;
  setTargetConfig?: React.Dispatch<React.SetStateAction<TargetConfig>>;
  setActiveTab?: (tab: string) => void;
  onOpenBatchEmailModal?: () => void;
  onOpenPlatformTrackerModal?: () => void;
}

export const DailySprintMeter: React.FC<DailySprintMeterProps> = ({
  jobs,
  targetConfig,
  setTargetConfig,
  setActiveTab,
  onOpenBatchEmailModal,
  onOpenPlatformTrackerModal
}) => {
  const [isEditingTarget, setIsEditingTarget] = useState(false);
  const [tempTarget, setTempTarget] = useState<number>(targetConfig.dailyAppTarget || 15);

  const todayStr = new Date().toISOString().split('T')[0];

  // Applied jobs count
  const appliedJobs = jobs.filter(
    j => j.status === 'Applied' || j.status === 'Interviewing' || j.status === 'Offer Received'
  );

  // Count applied today (or fallback to recent applications if today's date string matches or count of total applied)
  const todayApps = appliedJobs.filter(j => j.appliedDate === todayStr).length;
  // If no date-stamped applications for today yet, use count of applied jobs capped or calculated
  const effectiveAppsCount = todayApps > 0 ? todayApps : Math.min(appliedJobs.length, targetConfig.dailyAppTarget);

  const dailyTarget = targetConfig.dailyAppTarget || 15;
  const progressPercent = Math.min(100, Math.round((effectiveAppsCount / dailyTarget) * 100));
  const remainingApps = Math.max(0, dailyTarget - effectiveAppsCount);

  // Sprint Velocity Status Determination
  let paceStatus = 'ON_PACE';
  let paceColor = 'text-blue-400 bg-blue-500/10 border-blue-500/30';
  let paceMessage = 'Steady acquisition rate on track for daily quota.';

  if (progressPercent >= 100) {
    paceStatus = 'TARGET_ACHIEVED';
    paceColor = 'text-emerald-400 bg-emerald-500/20 border-emerald-500/40';
    paceMessage = '🔥 Daily sprint target 100% achieved! Acquisition velocity maxed.';
  } else if (progressPercent >= 60) {
    paceStatus = 'HIGH_VELOCITY';
    paceColor = 'text-amber-400 bg-amber-500/10 border-amber-500/30';
    paceMessage = '⚡ Over halfway to goal! Complete remaining applications to lock streak.';
  } else if (progressPercent < 30) {
    paceStatus = 'ACCELERATION_NEEDED';
    paceColor = 'text-purple-400 bg-purple-500/10 border-purple-500/30';
    paceMessage = '🚀 Launch batch applications to reach today\'s CTC floor target.';
  }

  const handleSaveTarget = () => {
    if (setTargetConfig) {
      setTargetConfig(prev => ({ ...prev, dailyAppTarget: tempTarget }));
    }
    setIsEditingTarget(false);
  };

  const handleAdjustTarget = (delta: number) => {
    const newTarget = Math.max(1, tempTarget + delta);
    setTempTarget(newTarget);
    if (setTargetConfig) {
      setTargetConfig(prev => ({ ...prev, dailyAppTarget: newTarget }));
    }
  };

  return (
    <div className="bg-[#0b0c12] border border-[#1f2238] rounded-2xl p-5 shadow-2xl space-y-4 font-sans relative overflow-hidden">
      {/* Background ambient glow */}
      <div 
        className="absolute -right-16 -top-16 w-56 h-56 rounded-full blur-3xl pointer-events-none transition-all duration-500 opacity-20"
        style={{
          backgroundColor: progressPercent >= 100 ? '#10b981' : progressPercent >= 60 ? '#f59e0b' : '#3b82f6'
        }}
      ></div>

      {/* Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#1c1f35] pb-3.5 relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 border border-blue-400/40 flex items-center justify-center text-white shadow-lg shrink-0">
            <Target className="w-5 h-5 text-amber-300" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm sm:text-base font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2">
                Daily Sprint Meter
                <span className="text-[10px] bg-blue-500/20 text-blue-300 border border-blue-500/30 px-2 py-0.5 rounded font-bold">
                  24H SPRINT
                </span>
              </h2>
            </div>
            <p className="text-xs text-[#8084a8] mt-0.5 font-mono">
              Real-time submission tracking against daily target floor of <strong className="text-white">{dailyTarget} applications/day</strong>.
            </p>
          </div>
        </div>

        {/* Pace Status Badge */}
        <div className="flex items-center gap-2 self-start sm:self-auto shrink-0 font-mono">
          <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-lg border flex items-center gap-1.5 ${paceColor}`}>
            <Flame className="w-3.5 h-3.5" />
            {paceStatus.replace('_', ' ')}
          </span>

          {/* Quick Target Adjust Controls */}
          <div className="bg-[#121424] border border-[#232742] rounded-lg px-2 py-1 flex items-center gap-1">
            <span className="text-[10px] text-[#707498] font-bold uppercase mr-1">Target:</span>
            <button
              onClick={() => handleAdjustTarget(-1)}
              className="text-[#9094b8] hover:text-white p-0.5 hover:bg-[#1f233a] rounded transition-all cursor-pointer"
              title="Decrease Daily Target"
            >
              <Minus className="w-3 h-3" />
            </button>
            <span className="text-xs font-bold text-amber-300 px-1">{dailyTarget}</span>
            <button
              onClick={() => handleAdjustTarget(1)}
              className="text-[#9094b8] hover:text-white p-0.5 hover:bg-[#1f233a] rounded transition-all cursor-pointer"
              title="Increase Daily Target"
            >
              <Plus className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Sprint Progress Meter Gauge */}
      <div className="space-y-3 relative z-10 font-mono">
        {/* Count & Percentage Display */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
          <div className="flex items-baseline gap-2">
            <span className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              {effectiveAppsCount}
            </span>
            <span className="text-base sm:text-lg text-[#8084a8] font-bold">
              / {dailyTarget} <span className="text-xs text-[#606488] font-normal">Applications Completed Today</span>
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right">
              <span className="text-xs text-[#8084a8] block">Sprint Completion:</span>
              <span className={`text-xl font-extrabold ${progressPercent >= 100 ? 'text-emerald-400' : progressPercent >= 60 ? 'text-amber-400' : 'text-blue-400'}`}>
                {progressPercent}%
              </span>
            </div>
          </div>
        </div>

        {/* Visual Progress Bar Gauge with Animated Pulse */}
        <div className="relative w-full h-4 bg-[#121424] border border-[#232742] rounded-full overflow-hidden p-0.5 shadow-inner">
          <div 
            className={`h-full rounded-full transition-all duration-700 relative overflow-hidden ${
              progressPercent >= 100 
                ? 'bg-gradient-to-r from-emerald-600 via-teal-500 to-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.5)]' 
                : progressPercent >= 60 
                ? 'bg-gradient-to-r from-blue-600 via-amber-500 to-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.4)]' 
                : 'bg-gradient-to-r from-indigo-600 via-blue-500 to-cyan-400 shadow-[0_0_15px_rgba(59,130,246,0.4)]'
            }`}
            style={{ width: `${Math.max(4, progressPercent)}%` }}
          >
            {/* Shimmer light animation */}
            <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
          </div>
        </div>

        {/* Milestone Sub-Metrics Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
          <div className="bg-[#10121d] border border-[#1b1e33] p-2.5 rounded-xl space-y-0.5">
            <span className="text-[10px] text-[#707498] uppercase block font-bold">Applications Sent:</span>
            <span className="text-sm font-bold text-white">{effectiveAppsCount} / {dailyTarget}</span>
          </div>

          <div className="bg-[#10121d] border border-[#1b1e33] p-2.5 rounded-xl space-y-0.5">
            <span className="text-[10px] text-[#707498] uppercase block font-bold">Remaining Apps:</span>
            <span className={`text-sm font-bold ${remainingApps === 0 ? 'text-emerald-400' : 'text-amber-300'}`}>
              {remainingApps === 0 ? '0 (Goal Met!)' : `${remainingApps} needed`}
            </span>
          </div>

          <div className="bg-[#10121d] border border-[#1b1e33] p-2.5 rounded-xl space-y-0.5">
            <span className="text-[10px] text-[#707498] uppercase block font-bold">Pace Multiplier:</span>
            <span className="text-sm font-bold text-blue-400">
              {(effectiveAppsCount / (dailyTarget / 24 || 1)).toFixed(1)}x / Hr
            </span>
          </div>

          <div className="bg-[#10121d] border border-[#1b1e33] p-2.5 rounded-xl space-y-0.5">
            <span className="text-[10px] text-[#707498] uppercase block font-bold">Target Offer Floor:</span>
            <span className="text-sm font-bold text-green-400">≥ ₹{targetConfig.targetSalaryMinLpa || 18} LPA</span>
          </div>
        </div>

        {/* Strategic Guidance & Quick Action Launcher Bar */}
        <div className="bg-[#0e101a] border border-[#1c1f33] p-3 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-[#a0a4c8]">
            <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
            <span>{paceMessage}</span>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {onOpenBatchEmailModal && (
              <button
                onClick={onOpenBatchEmailModal}
                className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-3 py-1.5 rounded-lg border border-blue-400/40 text-[11px] transition-all flex items-center gap-1 cursor-pointer uppercase tracking-wider"
              >
                <Send className="w-3 h-3" />
                Batch Email Launcher
              </button>
            )}

            {onOpenPlatformTrackerModal && (
              <button
                onClick={onOpenPlatformTrackerModal}
                className="bg-[#161a2e] hover:bg-[#232948] text-purple-300 border border-purple-500/30 font-bold px-3 py-1.5 rounded-lg text-[11px] transition-all flex items-center gap-1 cursor-pointer"
              >
                <Zap className="w-3 h-3 text-purple-400" />
                1-Click Platform Apply
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
