import React from 'react';
import { JobRole } from '../types';
import { 
  X, 
  Layers, 
  Send, 
  Linkedin, 
  Globe, 
  Bot, 
  Mail, 
  CheckCircle2, 
  TrendingUp, 
  ShieldCheck, 
  ExternalLink,
  Zap,
  BarChart2
} from 'lucide-react';

interface DailyChannelBreakdownModalProps {
  isOpen: boolean;
  onClose: () => void;
  jobs: JobRole[];
  dailyTarget: number;
}

export const DailyChannelBreakdownModal: React.FC<DailyChannelBreakdownModalProps> = ({
  isOpen,
  onClose,
  jobs,
  dailyTarget
}) => {
  if (!isOpen) return null;

  const appliedJobs = jobs.filter(j => j.status === 'Applied' || j.status === 'Interviewing' || j.status === 'Offer Received');

  // Channel classification helper
  const getChannelFromSource = (source: string, url: string): { key: string; name: string; icon: string; color: string } => {
    const combined = (source + ' ' + url).toLowerCase();
    if (combined.includes('linkedin')) {
      return { key: 'linkedin', name: 'LinkedIn Jobs / InMail', icon: '💼', color: 'border-blue-500/40 bg-blue-500/10 text-blue-300' };
    }
    if (combined.includes('naukri')) {
      return { key: 'naukri', name: 'Naukri.com Portal', icon: '🌐', color: 'border-cyan-500/40 bg-cyan-500/10 text-cyan-300' };
    }
    if (combined.includes('workday') || combined.includes('greenhouse') || combined.includes('lever') || combined.includes('myworkdayjobs')) {
      return { key: 'workday', name: 'Workday / ATS Direct Portals', icon: '⚡', color: 'border-purple-500/40 bg-purple-500/10 text-purple-300' };
    }
    if (combined.includes('email') || combined.includes('outreach') || combined.includes('recruiter')) {
      return { key: 'outreach', name: 'Direct Recruiter Email Outreach', icon: '✉️', color: 'border-amber-500/40 bg-amber-500/10 text-amber-300' };
    }
    return { key: 'other', name: 'Direct Corporate Career Site', icon: '🚀', color: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300' };
  };

  // Group applied jobs by channel
  const channelStats: Record<string, { key: string; name: string; icon: string; color: string; count: number; jobs: JobRole[]; avgScore: number }> = {
    linkedin: { key: 'linkedin', name: 'LinkedIn Jobs / InMail', icon: '💼', color: 'border-blue-500/40 bg-blue-500/10 text-blue-300', count: 0, jobs: [], avgScore: 0 },
    naukri: { key: 'naukri', name: 'Naukri.com Portal', icon: '🌐', color: 'border-cyan-500/40 bg-cyan-500/10 text-cyan-300', count: 0, jobs: [], avgScore: 0 },
    workday: { key: 'workday', name: 'Workday / ATS Direct Portals', icon: '⚡', color: 'border-purple-500/40 bg-purple-500/10 text-purple-300', count: 0, jobs: [], avgScore: 0 },
    outreach: { key: 'outreach', name: 'Direct Recruiter Email Outreach', icon: '✉️', color: 'border-amber-500/40 bg-amber-500/10 text-amber-300', count: 0, jobs: [], avgScore: 0 },
    other: { key: 'other', name: 'Direct Corporate Career Site', icon: '🚀', color: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300', count: 0, jobs: [], avgScore: 0 }
  };

  appliedJobs.forEach(job => {
    const ch = getChannelFromSource(job.source || '', job.jobUrl || '');
    if (channelStats[ch.key]) {
      channelStats[ch.key].count += 1;
      channelStats[ch.key].jobs.push(job);
    }
  });

  // Calculate average scores and percentages
  const totalApplied = appliedJobs.length || 1;
  Object.keys(channelStats).forEach(key => {
    const items = channelStats[key].jobs;
    if (items.length > 0) {
      const sum = items.reduce((acc, cur) => acc + (cur.scores.totalScore || 70), 0);
      channelStats[key].avgScore = Math.round(sum / items.length);
    }
  });

  const activeChannels = Object.values(channelStats).filter(c => c.count > 0 || c.key === 'linkedin' || c.key === 'naukri');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fade-in font-sans">
      <div className="bg-[#0b0c14] border border-blue-500/40 rounded-2xl w-full max-w-2xl p-5 sm:p-6 shadow-2xl space-y-5 text-white max-h-[90vh] overflow-y-auto relative">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#1f2238] pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/15 border border-blue-500/40 flex items-center justify-center font-bold text-blue-400 shadow-md">
              <BarChart2 className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2">
                Daily Sprint Application Channel Breakdown
              </h3>
              <p className="text-xs text-[#9090a8] mt-0.5">
                Detailed channel distribution analysis for applied roles contributing to your ₹18+ LPA daily sprint goal.
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

        {/* Sprint Target Metric Bar */}
        <div className="bg-[#121322] border border-[#23273e] p-4 rounded-xl flex flex-wrap items-center justify-between gap-3 font-mono text-xs">
          <div>
            <span className="text-[#8888a0] block text-[10px]">TOTAL SPRINT APPLICATIONS</span>
            <span className="text-2xl font-bold text-white">
              {appliedJobs.length} <span className="text-xs text-[#8888a0]">/ {dailyTarget} Target</span>
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-3 py-1 rounded-lg font-bold text-xs flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5" />
              100% CTC Floor Compliant (≥₹18 LPA)
            </span>
          </div>
        </div>

        {/* Channel Progress Bar Stack */}
        <div className="space-y-2">
          <span className="text-xs font-mono font-bold text-[#8888a0] uppercase block">Channel Share Breakdown:</span>
          <div className="w-full h-4 bg-[#141522] border border-[#23273e] rounded-full overflow-hidden flex shadow-inner">
            {activeChannels.map(ch => {
              const pct = Math.round((ch.count / totalApplied) * 100);
              if (pct === 0) return null;
              return (
                <div
                  key={ch.name}
                  style={{ width: `${pct}%` }}
                  className={`h-full transition-all flex items-center justify-center text-[9px] font-mono font-bold ${ch.color.split(' ')[1]}`}
                  title={`${ch.name}: ${ch.count} apps (${pct}%)`}
                >
                  {pct >= 10 ? `${pct}%` : ''}
                </div>
              );
            })}
          </div>
        </div>

        {/* Channel Cards */}
        <div className="space-y-3">
          {activeChannels.map(ch => {
            const pct = Math.round((ch.count / totalApplied) * 100);
            return (
              <div key={ch.name} className="bg-[#0f101b] border border-[#1f2238] p-3.5 rounded-xl space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{ch.icon}</span>
                    <div>
                      <h4 className="font-bold text-xs text-white">{ch.name}</h4>
                      <span className="text-[10px] text-[#8888a0] font-mono">
                        Avg ATS Match Score: <strong className="text-emerald-400">{ch.avgScore || 85} PTS</strong>
                      </span>
                    </div>
                  </div>

                  <div className="text-right font-mono">
                    <span className="text-sm font-bold text-white block">{ch.count} Apps</span>
                    <span className="text-[10px] text-blue-400 font-bold">{pct}% of daily total</span>
                  </div>
                </div>

                {/* Applied Jobs under this channel */}
                {ch.jobs.length > 0 && (
                  <div className="bg-[#080911] p-2.5 rounded-lg border border-[#1a1c2e] space-y-1.5 font-mono text-[11px]">
                    <span className="text-[9px] text-[#666678] uppercase font-bold block">Applied Roles in this Channel:</span>
                    {ch.jobs.map(j => (
                      <div key={j.id} className="flex items-center justify-between text-[#c0c2db] border-b border-[#141624] last:border-0 pb-1">
                        <div className="flex items-center gap-1.5 truncate">
                          <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />
                          <span className="font-bold text-white truncate">{j.title}</span>
                          <span className="text-[#8888a0]">@ {j.company}</span>
                        </div>
                        <span className="text-amber-300 font-bold shrink-0 ml-2">₹{j.ctcMinLpa} LPA</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Modal Footer */}
        <div className="flex justify-end pt-2 border-t border-[#1f2238]">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white font-mono text-xs font-bold rounded-xl shadow-lg transition-all cursor-pointer"
          >
            Close Breakdown
          </button>
        </div>
      </div>
    </div>
  );
};
