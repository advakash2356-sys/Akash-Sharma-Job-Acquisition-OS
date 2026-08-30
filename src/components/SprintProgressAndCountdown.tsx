import React, { useState, useEffect } from 'react';
import { TargetConfig } from '../types';
import { 
  Clock, 
  Target, 
  Flame, 
  Sparkles, 
  CheckCircle2, 
  Zap, 
  Timer, 
  ArrowUpRight 
} from 'lucide-react';

interface SprintProgressAndCountdownProps {
  todayAppliedCount: number;
  dailyTarget: number;
  targetConfig: TargetConfig;
  isPanicMode: boolean;
  onOpenBatchEmailModal?: () => void;
}

export const SprintProgressAndCountdown: React.FC<SprintProgressAndCountdownProps> = ({
  todayAppliedCount,
  dailyTarget,
  targetConfig,
  isPanicMode,
  onOpenBatchEmailModal
}) => {
  // Circular progress calculations
  const progressPct = Math.min(100, Math.round((todayAppliedCount / dailyTarget) * 100));
  const remainingApps = Math.max(0, dailyTarget - todayAppliedCount);
  
  const radius = 48;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progressPct / 100) * circumference;

  // Real-time dynamic Time-to-Apply Countdown Widget
  const [timeLeft, setTimeLeft] = useState<{ hours: number; minutes: number; seconds: number }>({
    hours: 0,
    minutes: 0,
    seconds: 0
  });
  const [dayProgressPct, setDayProgressPct] = useState<number>(50);

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date();
      // End of today sprint: 23:59:59 local time
      const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
      const diffMs = Math.max(0, endOfDay.getTime() - now.getTime());

      const hours = Math.floor(diffMs / (1000 * 60 * 60));
      const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diffMs % (1000 * 60)) / 1000);

      setTimeLeft({ hours, minutes, seconds });

      // Daily elapsed percentage (00:00 to 24:00)
      const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
      const totalMsInDay = endOfDay.getTime() - startOfDay.getTime();
      const elapsedMs = now.getTime() - startOfDay.getTime();
      const elapsedPct = Math.min(100, Math.max(0, Math.round((elapsedMs / totalMsInDay) * 100)));
      setDayProgressPct(elapsedPct);
    };

    calculateTimeLeft();
    const interval = setInterval(calculateTimeLeft, 1000);
    return () => clearInterval(interval);
  }, []);

  const formatDigit = (num: number) => num.toString().padStart(2, '0');

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 font-sans">
      {/* CIRCULAR PROGRESS INDICATOR (7 Columns on large screens) */}
      <div className="lg:col-span-7 bg-[#0b0d18] border-2 border-[#1e2342] hover:border-emerald-500/50 rounded-2xl p-5 sm:p-6 shadow-xl relative overflow-hidden transition-all flex flex-col justify-between">
        <div className="flex items-center justify-between border-b border-[#1a1f3c] pb-3 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <Target className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-white font-mono uppercase tracking-wider">
                Daily Acquisition Velocity
              </h3>
              <p className="text-xs text-[#8288b4]">
                Target: {dailyTarget} customized submissions / day (≥ ₹18L CTC)
              </p>
            </div>
          </div>

          <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${
            progressPct >= 100 
              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' 
              : progressPct >= 60 
              ? 'bg-amber-500/20 text-amber-300 border-amber-500/40' 
              : 'bg-blue-500/20 text-blue-300 border-blue-500/40'
          }`}>
            {progressPct >= 100 ? 'GOAL MET' : 'IN PROGRESS'}
          </span>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-6">
          {/* SVG Circular Progress Meter */}
          <div className="relative flex items-center justify-center shrink-0">
            <svg className="w-36 h-36 transform -rotate-90">
              {/* Background Track Circle */}
              <circle
                cx="72"
                cy="72"
                r={radius}
                stroke="#181d38"
                strokeWidth="10"
                fill="transparent"
              />
              {/* Progress Value Circle */}
              <circle
                cx="72"
                cy="72"
                r={radius}
                stroke={progressPct >= 100 ? '#10b981' : progressPct >= 60 ? '#f59e0b' : '#3b82f6'}
                strokeWidth="10"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                fill="transparent"
                className="transition-all duration-1000 ease-out"
              />
            </svg>

            {/* Inner Center Text */}
            <div className="absolute flex flex-col items-center justify-center text-center">
              <span className="text-2xl font-black text-white font-mono tracking-tight leading-none">
                {todayAppliedCount}
                <span className="text-xs text-[#8288b4] font-semibold">/{dailyTarget}</span>
              </span>
              <span className="text-[11px] font-extrabold text-emerald-400 font-mono mt-0.5">
                {progressPct}%
              </span>
            </div>
          </div>

          {/* Detailed Metric Description */}
          <div className="space-y-3 flex-1 text-center sm:text-left">
            <div>
              <div className="text-xs font-mono uppercase text-[#7c82b0] tracking-wider">
                Sprint Target Status
              </div>
              <div className="text-base sm:text-lg font-extrabold text-white mt-0.5">
                {remainingApps === 0 
                  ? '🎉 Daily Quota Fully Satisfied!' 
                  : `${remainingApps} Applications Left to Reach Target`}
              </div>
            </div>

            <div className="bg-[#12152b] border border-[#22284e] p-3 rounded-xl space-y-1.5 text-xs text-[#9da2cc]">
              <div className="flex items-center justify-between text-[11px] font-mono">
                <span className="text-[#7c82b0]">Dispatched Today:</span>
                <span className="font-bold text-white">{todayAppliedCount} roles</span>
              </div>
              <div className="flex items-center justify-between text-[11px] font-mono">
                <span className="text-[#7c82b0]">Salary Floor Rule:</span>
                <span className="font-bold text-emerald-400">Strictly ≥ ₹{targetConfig.targetMinCtc || 18} LPA</span>
              </div>
              <div className="flex items-center justify-between text-[11px] font-mono">
                <span className="text-[#7c82b0]">Sprint Type:</span>
                <span className="font-bold text-amber-300">{isPanicMode ? 'High-Velocity Panic Sprint' : 'Standard Selective'}</span>
              </div>
            </div>

            {onOpenBatchEmailModal && remainingApps > 0 && (
              <button
                onClick={onOpenBatchEmailModal}
                className="w-full bg-blue-600 hover:bg-blue-500 text-white font-mono text-xs font-bold py-2 px-3 rounded-lg border border-blue-400/40 transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-md"
              >
                <Zap className="w-3.5 h-3.5 text-amber-300" />
                <span>Launch Batch Apply to Close Daily Goal ({remainingApps} remaining)</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* TIME-TO-APPLY COUNTDOWN WIDGET (5 Columns on large screens) */}
      <div className="lg:col-span-5 bg-[#0b0d18] border-2 border-amber-500/30 hover:border-amber-400 rounded-2xl p-5 sm:p-6 shadow-xl relative overflow-hidden transition-all flex flex-col justify-between">
        <div className="absolute -top-12 -right-12 w-40 h-40 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="space-y-3 relative z-10">
          <div className="flex items-center justify-between border-b border-[#1a1f3c] pb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
                <Timer className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-extrabold text-white font-mono uppercase tracking-wider">
                  Time-to-Apply Sprint
                </h3>
                <p className="text-xs text-[#8288b4]">
                  Countdown to today's daily window cutoff
                </p>
              </div>
            </div>
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500"></span>
            </span>
          </div>

          {/* Digital Clock Numbers */}
          <div className="grid grid-cols-3 gap-2 text-center py-2">
            <div className="bg-[#12162c] border border-[#22284e] p-2.5 rounded-xl">
              <div className="text-2xl sm:text-3xl font-black text-white font-mono tracking-tight">
                {formatDigit(timeLeft.hours)}
              </div>
              <div className="text-[10px] uppercase font-mono font-bold text-amber-300 mt-0.5">
                Hours
              </div>
            </div>

            <div className="bg-[#12162c] border border-[#22284e] p-2.5 rounded-xl">
              <div className="text-2xl sm:text-3xl font-black text-white font-mono tracking-tight">
                {formatDigit(timeLeft.minutes)}
              </div>
              <div className="text-[10px] uppercase font-mono font-bold text-amber-300 mt-0.5">
                Mins
              </div>
            </div>

            <div className="bg-[#12162c] border border-[#22284e] p-2.5 rounded-xl">
              <div className="text-2xl sm:text-3xl font-black text-amber-400 font-mono tracking-tight animate-pulse">
                {formatDigit(timeLeft.seconds)}
              </div>
              <div className="text-[10px] uppercase font-mono font-bold text-amber-300 mt-0.5">
                Secs
              </div>
            </div>
          </div>

          {/* Progress bar representing sprint day elapsed */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-[11px] font-mono text-[#8288b4]">
              <span>Day Cycle Progress</span>
              <span className="text-white font-bold">{dayProgressPct}% elapsed</span>
            </div>
            <div className="h-2 w-full bg-[#181d38] rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full transition-all duration-500"
                style={{ width: `${dayProgressPct}%` }}
              />
            </div>
          </div>
        </div>

        {/* Bottom Notice */}
        <div className="pt-3 border-t border-[#181d3a] flex items-center justify-between text-[11px] font-mono text-[#8a90ba] relative z-10">
          <span className="flex items-center gap-1 text-emerald-400">
            <Clock className="w-3.5 h-3.5" />
            <span>Optimal response window</span>
          </span>
          <span className="text-[#a0a5d4]">
            Cutoff: 23:59 IST
          </span>
        </div>
      </div>
    </div>
  );
};
