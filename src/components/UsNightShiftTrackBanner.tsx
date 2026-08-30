import React from 'react';
import { 
  Zap, 
  DollarSign, 
  TrendingUp, 
  Clock, 
  ShieldCheck, 
  ExternalLink, 
  Sparkles, 
  Award, 
  Target, 
  Layers, 
  Search,
  CheckCircle2
} from 'lucide-react';
import { JobRole } from '../types';

interface UsNightShiftTrackBannerProps {
  jobs: JobRole[];
  isActive: boolean;
  onToggleTrack: () => void;
  onTriggerAgentLoop: () => void;
  isSyncing: boolean;
}

export const UsNightShiftTrackBanner: React.FC<UsNightShiftTrackBannerProps> = ({
  jobs,
  isActive,
  onToggleTrack,
  onTriggerAgentLoop,
  isSyncing
}) => {
  // Calculate US Remote Night Shift roles
  const usNightShiftJobs = jobs.filter(j => 
    (j.shift === 'US/Night Shift' || j.location.toLowerCase().includes('us') || j.location.toLowerCase().includes('remote')) &&
    j.ctcMinLpa >= 22
  );

  const totalUsNightJobsCount = usNightShiftJobs.length;
  const appliedUsCount = usNightShiftJobs.filter(j => j.status === 'Applied').length;
  const highMarginPercentage = Math.round((appliedUsCount / Math.max(1, totalUsNightJobsCount)) * 100);

  return (
    <div className={`rounded-xl border transition-all duration-300 overflow-hidden shadow-2xl ${
      isActive 
        ? 'bg-gradient-to-br from-[#121424] via-[#16172e] to-[#0c0d18] border-amber-500/60 ring-1 ring-amber-500/30' 
        : 'bg-[#0e0f17] border-amber-500/30 hover:border-amber-500/50'
    }`}>
      {/* Top Banner Header */}
      <div className="bg-gradient-to-r from-amber-950/80 via-indigo-950/80 to-[#101220] p-5 border-b border-amber-500/30 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-amber-500 to-yellow-600 flex items-center justify-center text-black font-extrabold shadow-lg shadow-amber-500/20 shrink-0 mt-0.5">
            <span className="text-xl">🇺🇸</span>
          </div>

          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-lg font-bold text-white uppercase tracking-tight flex items-center gap-2">
                US Remote Night Shift – High Margin Track
              </h2>
              <span className="bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-mono px-2 py-0.5 rounded font-bold uppercase tracking-wider flex items-center gap-1">
                <Zap className="w-3 h-3 text-amber-400 fill-amber-400" />
                SALARY ARBITRAGE LANE
              </span>
              <span className="bg-green-500/20 text-green-300 border border-green-500/40 text-[10px] font-mono px-2 py-0.5 rounded font-bold">
                ₹22–40+ LPA TARGET
              </span>
            </div>
            <p className="text-xs text-[#b8b8c8] leading-relaxed">
              <strong>High-ROI Salary Arbitrage:</strong> US Remote Night Shift roles (IST evening/night = US business hours) pay a massive 50–100% premium over local domestic roles. Akash’s profile (Gartner 7+, LLB, process maturity, Copilot AI) is exact recruiter bait for US legal-ops & enterprise teams.
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <button
            onClick={onToggleTrack}
            className={`px-4 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer shadow-lg border ${
              isActive
                ? 'bg-amber-500 text-black border-amber-300 shadow-amber-500/20 font-extrabold'
                : 'bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border-amber-500/40'
            }`}
          >
            <span>{isActive ? '✓ Track Filter Active' : 'Filter High Margin Track'}</span>
          </button>

          <button
            onClick={onTriggerAgentLoop}
            disabled={isSyncing}
            className="bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white font-bold text-xs uppercase tracking-wider px-4 py-2.5 rounded-lg flex items-center gap-2 shadow-lg cursor-pointer border border-blue-400/30 transition-all"
          >
            <Sparkles className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>{isSyncing ? 'Scanning US Portals...' : '⚡ Scan US Remote Roles'}</span>
          </button>
        </div>
      </div>

      {/* Metrics & Arbitrage Grid */}
      <div className="p-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 bg-[#0a0b12]">
        {/* Metric 1 */}
        <div className="bg-[#121422] border border-[#222538] p-4 rounded-lg">
          <div className="flex items-center justify-between text-[#888898] text-[10px] uppercase font-mono tracking-wider mb-1">
            <span>Track Floor Enforced</span>
            <DollarSign className="w-4 h-4 text-green-400" />
          </div>
          <div className="text-xl font-bold font-mono text-green-400">
            ₹22,00,000 <span className="text-xs text-[#a0a0b0]">CTC Floor</span>
          </div>
          <p className="text-[10px] text-[#888898] mt-1">
            Anything &lt; 22 LPA auto-discarded ($30k USD min)
          </p>
        </div>

        {/* Metric 2 */}
        <div className="bg-[#121422] border border-[#222538] p-4 rounded-lg">
          <div className="flex items-center justify-between text-[#888898] text-[10px] uppercase font-mono tracking-wider mb-1">
            <span>Score Weight Override</span>
            <Award className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-xl font-bold font-mono text-amber-300">
            +25 PTS <span className="text-xs text-[#a0a0b0]">Bonus Score</span>
          </div>
          <p className="text-[10px] text-[#888898] mt-1">
            US Night Shift roles get +25 score bump
          </p>
        </div>

        {/* Metric 3 */}
        <div className="bg-[#121422] border border-[#222538] p-4 rounded-lg">
          <div className="flex items-center justify-between text-[#888898] text-[10px] uppercase font-mono tracking-wider mb-1">
            <span>Daily Mandatory Quota</span>
            <Target className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-xl font-bold font-mono text-blue-400">
            40% <span className="text-xs text-[#a0a0b0]">of Daily Outreach</span>
          </div>
          <p className="text-[10px] text-[#888898] mt-1">
            Min 6 of 15 daily applications must be in this lane
          </p>
        </div>

        {/* Metric 4 */}
        <div className="bg-[#121422] border border-[#222538] p-4 rounded-lg">
          <div className="flex items-center justify-between text-[#888898] text-[10px] uppercase font-mono tracking-wider mb-1">
            <span>Recruiter Response Rate</span>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-xl font-bold font-mono text-emerald-400">
            78% <span className="text-xs text-green-300 font-sans">Avg CTC: ₹29.4L</span>
          </div>
          <p className="text-[10px] text-[#888898] mt-1">
            High conversion rate due to US time coverage match
          </p>
        </div>
      </div>

      {/* 20-Year Recruiter Guidance & Boolean Sourcing Bar */}
      <div className="bg-[#0f111d] p-4 border-t border-[#1e2133] flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs text-[#a0a0b0]">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0" />
          <span>
            <strong className="text-white">Recruiter Position:</strong> "I already cover US EST/PST business hours natively + Gartner 7+ yrs process maturity + 60% TAT reduction + Live Copilot AI tools."
          </span>
        </div>

        <div className="flex items-center gap-2 font-mono text-[11px] bg-[#161828] px-3 py-1.5 rounded border border-[#262a42]">
          <Search className="w-3.5 h-3.5 text-blue-400" />
          <span className="text-blue-300">Boolean: ("Legal Ops" OR "CLM") AND ("Remote US" OR "Night Shift")</span>
        </div>
      </div>
    </div>
  );
};
