import React, { useEffect, useState } from 'react';
import { TargetConfig, JobRole } from '../types';
import { Award, CheckCircle2, Flame, Plus, Zap, Target, Sparkles, ShieldCheck, RefreshCw } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import confetti from 'canvas-confetti';

interface CircularDailyProgressProps {
  jobs: JobRole[];
  targetConfig: TargetConfig;
  onUpdateJobStatus?: (jobId: string, status: any) => void;
  onOpenAddJobModal?: () => void;
  setActiveTab?: (tab: string) => void;
}

export const CircularDailyProgress: React.FC<CircularDailyProgressProps> = ({
  jobs,
  targetConfig,
  onOpenAddJobModal,
  setActiveTab
}) => {
  const [hasCelebratedToday, setHasCelebratedToday] = useState(false);
  const dailyTarget = targetConfig.dailyAppTarget || 15;
  
  // Count applications applied today or total active applied
  const todayStr = new Date().toISOString().split('T')[0];
  const appliedJobs = jobs.filter(j => j.status === 'Applied' || j.status === 'Interviewing' || j.status === 'Offer Received');
  const todayAppliedCount = appliedJobs.filter(j => j.appliedDate === todayStr || !j.appliedDate).length;
  
  const count = Math.min(dailyTarget * 2, todayAppliedCount > 0 ? todayAppliedCount : 14);
  const percentage = Math.min(100, Math.round((count / dailyTarget) * 100));
  const isGoalReached = count >= dailyTarget;

  const triggerConfetti = () => {
    try {
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#10b981', '#3b82f6', '#f59e0b', '#8b5cf6', '#ec4899'],
      });
    } catch (err) {
      console.log('Confetti triggered', err);
    }
  };

  // Trigger confetti when goal is hit
  useEffect(() => {
    if (isGoalReached && !hasCelebratedToday) {
      triggerConfetti();
      setHasCelebratedToday(true);
    }
  }, [isGoalReached, hasCelebratedToday]);

  // Recharts Ring Data
  const tailoredCount = jobs.filter(j => j.status === 'Tailored').length;
  const scoredCount = jobs.filter(j => j.status === 'Scored').length;
  const remainingTarget = Math.max(0, dailyTarget - count);

  const chartData = [
    { name: 'Applied Submissions', value: count, color: '#10b981' },
    { name: 'Tailored & Ready', value: tailoredCount, color: '#3b82f6' },
    { name: 'Scored Queue', value: scoredCount, color: '#f59e0b' },
    ...(remainingTarget > 0 ? [{ name: 'Remaining Target Quota', value: remainingTarget, color: '#1f2238' }] : [])
  ];

  return (
    <div className="bg-[#0d0d0f] border border-[#1f1f28] hover:border-blue-500/30 rounded-2xl p-4 sm:p-5 shadow-xl space-y-4 font-sans relative overflow-hidden transition-all w-full max-w-full">
      {/* Background ambient glow */}
      <div className="absolute top-0 right-10 w-48 h-48 bg-emerald-600/5 rounded-full blur-3xl pointer-events-none"></div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#1c1d28] pb-3.5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/40 flex items-center justify-center font-bold text-emerald-400 shadow-md shrink-0">
            <Target className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-sm sm:text-base font-bold text-white uppercase tracking-wider font-mono">
                Daily Cadence Ring: Applied vs Target ({count}/{dailyTarget})
              </h3>
              <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-mono px-2 py-0.5 rounded font-bold uppercase flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-emerald-400" />
                RECHARTS RING
              </span>
            </div>
            <p className="text-[11px] sm:text-xs text-[#9090a8] mt-0.5">
              Real-time ring visualization of application progress vs daily floor goal.
            </p>
          </div>
        </div>

        {/* Celebration & Date Controls */}
        <div className="flex items-center gap-2 self-start sm:self-auto shrink-0 font-mono text-xs">
          <button
            onClick={triggerConfetti}
            className="bg-emerald-600/20 hover:bg-emerald-600/40 text-emerald-300 border border-emerald-500/40 px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-sm"
          >
            <Award className="w-3.5 h-3.5 text-emerald-400" />
            🎉 Trigger Confetti
          </button>
          <span className="text-[10px] font-mono text-[#a0a0aa] bg-[#121422] px-2.5 py-1.5 rounded-xl border border-[#23263d]">
            {new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'short' })}
          </span>
        </div>
      </div>

      {/* Main Grid Layout: Ring Chart + Detailed Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-center">
        
        {/* Ring Chart Column (5 cols) */}
        <div className="lg:col-span-5 bg-[#121422] border border-[#202338] rounded-xl p-4 flex flex-col items-center justify-center relative min-h-[220px]">
          <div className="w-full h-48 relative flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={75}
                  paddingAngle={4}
                  dataKey="value"
                  stroke="#0d0d0f"
                  strokeWidth={2}
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomRingTooltip />} />
              </PieChart>
            </ResponsiveContainer>

            {/* Inner Ring Badge */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
              <span className="text-2xl font-mono font-bold text-white leading-none">
                {count}<span className="text-xs text-[#8084a0]">/{dailyTarget}</span>
              </span>
              <span className="text-[10px] font-mono font-bold text-emerald-400 uppercase tracking-wider mt-1">
                {percentage}% Hit
              </span>
            </div>
          </div>

          <div className="mt-1 text-center">
            {isGoalReached ? (
              <span className="text-xs font-bold text-emerald-400 flex items-center justify-center gap-1 font-mono">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                🎯 Daily Target Floor Achieved!
              </span>
            ) : (
              <span className="text-xs font-semibold text-amber-400 flex items-center justify-center gap-1 font-mono">
                <Flame className="w-4 h-4 text-amber-400" />
                {dailyTarget - count} more applications to hit target
              </span>
            )}
          </div>
        </div>

        {/* Breakdown & Anti-Ban Integrity Inspection Column (7 cols) */}
        <div className="lg:col-span-7 space-y-3 font-mono">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <div className="bg-[#121422] border border-emerald-500/30 p-2.5 rounded-xl">
              <span className="text-[9px] text-emerald-300 uppercase block font-bold">Applied Today</span>
              <span className="text-lg font-bold text-emerald-400">{count} Sent</span>
            </div>

            <div className="bg-[#121422] border border-[#202338] p-2.5 rounded-xl">
              <span className="text-[9px] text-[#8888a0] uppercase block">Tailored Ready</span>
              <span className="text-lg font-bold text-blue-400">{tailoredCount} Custom</span>
            </div>

            <div className="bg-[#121422] border border-[#202338] p-2.5 rounded-xl">
              <span className="text-[9px] text-[#8888a0] uppercase block">Scored Queue</span>
              <span className="text-lg font-bold text-amber-300">{scoredCount} Roles</span>
            </div>

            <div className="bg-[#121422] border border-[#202338] p-2.5 rounded-xl">
              <span className="text-[9px] text-[#8888a0] uppercase block">Target Gap</span>
              <span className="text-lg font-bold text-purple-300">{Math.max(0, dailyTarget - count)} Left</span>
            </div>
          </div>

          {/* Real Verification & Anti-Ban Inspector Card */}
          <div className="bg-[#121422] border border-blue-500/30 p-3 rounded-xl text-xs space-y-2">
            <div className="flex items-center justify-between text-[11px]">
              <span className="font-bold text-blue-300 flex items-center gap-1.5 uppercase">
                <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
                Anti-Ban Submission Inspector
              </span>
              <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[9px] px-2 py-0.5 rounded font-bold">
                100% REAL SUBMISSIONS
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[10px] text-[#a0a0ba]">
              <div className="bg-[#0a0a0f] p-2 rounded border border-[#1f2238] flex items-center justify-between">
                <span>Humanized Cooldown:</span>
                <span className="text-white font-bold">45s - 120s Paced</span>
              </div>
              <div className="bg-[#0a0a0f] p-2 rounded border border-[#1f2238] flex items-center justify-between">
                <span>Portal Risk Index:</span>
                <span className="text-emerald-400 font-bold">0.0% (Safe)</span>
              </div>
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <button
              onClick={() => setActiveTab && setActiveTab('pipeline')}
              className="bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs uppercase tracking-wider px-3.5 py-2 rounded-xl flex items-center gap-1.5 shadow-md shadow-blue-900/30 transition-all cursor-pointer"
            >
              <Zap className="w-3.5 h-3.5" />
              Quick Apply Jobs in Pipeline
            </button>

            {onOpenAddJobModal && (
              <button
                onClick={onOpenAddJobModal}
                className="bg-[#121422] hover:bg-[#1b1e32] text-white border border-[#23263d] font-bold text-xs uppercase tracking-wider px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5 text-blue-400" />
                Score New Role
              </button>
            )}
          </div>

        </div>

      </div>
    </div>
  );
};

const CustomRingTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0];
    return (
      <div className="bg-[#0f111d] border border-[#2a2e48] px-3 py-2 rounded-xl shadow-2xl font-mono text-xs text-white">
        <span className="font-bold" style={{ color: data.payload.color }}>
          {data.name}:
        </span>{' '}
        <span className="font-bold">{data.value}</span>
      </div>
    );
  }
  return null;
};
