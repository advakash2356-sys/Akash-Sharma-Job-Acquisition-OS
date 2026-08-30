import React from 'react';
import { JobRole } from '../types';
import { 
  FileSearch, 
  Wand2, 
  Send, 
  ArrowRight, 
  CheckCircle2, 
  Sparkles, 
  Layers, 
  TrendingUp, 
  Filter,
  Plus
} from 'lucide-react';

interface PipelineProgressWidgetProps {
  jobs: JobRole[];
  setActiveTab?: (tab: string) => void;
  onOpenAddJobModal?: () => void;
}

export const PipelineProgressWidget: React.FC<PipelineProgressWidgetProps> = ({
  jobs,
  setActiveTab,
  onOpenAddJobModal
}) => {
  const totalJobs = jobs.length;

  // Real-time counts
  const scoredCount = jobs.filter(j => j.status === 'Scored').length;
  const tailoredCount = jobs.filter(j => j.status === 'Tailored').length;
  const appliedCount = jobs.filter(j => j.status === 'Applied' || j.status === 'Interviewing' || j.status === 'Offer Received').length;
  
  // Secondary status counts for complete matrix context
  const interviewingCount = jobs.filter(j => j.status === 'Interviewing').length;
  const offerCount = jobs.filter(j => j.status === 'Offer Received').length;

  // Conversion rates calculation
  const scoredToTailoredRate = scoredCount + tailoredCount + appliedCount > 0 
    ? Math.round(((tailoredCount + appliedCount) / Math.max(1, totalJobs)) * 100) 
    : 0;

  const tailoredToAppliedRate = tailoredCount + appliedCount > 0 
    ? Math.round((appliedCount / Math.max(1, tailoredCount + appliedCount)) * 100) 
    : 0;

  const matrixItems = [
    {
      id: 'scored',
      title: 'Scored Roles',
      count: scoredCount,
      percentage: totalJobs > 0 ? Math.round((scoredCount / totalJobs) * 100) : 0,
      label: 'Qualified & Evaluated',
      statusTag: 'Scored',
      colorTheme: {
        bg: 'bg-amber-500/10',
        border: 'border-amber-500/30',
        hoverBorder: 'hover:border-amber-500/60',
        text: 'text-amber-400',
        badgeBg: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
        barFill: 'bg-amber-400',
        glow: 'from-amber-500/10'
      },
      icon: FileSearch,
      description: 'Match score >75%. Awaiting AI resume customization.'
    },
    {
      id: 'tailored',
      title: 'Tailored Assets',
      count: tailoredCount,
      percentage: totalJobs > 0 ? Math.round((tailoredCount / totalJobs) * 100) : 0,
      label: 'Custom Resume & Pitch',
      statusTag: 'Tailored',
      colorTheme: {
        bg: 'bg-blue-500/10',
        border: 'border-blue-500/30',
        hoverBorder: 'hover:border-blue-500/60',
        text: 'text-blue-400',
        badgeBg: 'bg-blue-500/20 text-blue-300 border-blue-500/40',
        barFill: 'bg-blue-400',
        glow: 'from-blue-500/10'
      },
      icon: Wand2,
      description: 'Keywords optimized for ATS. Ready for portal launch.'
    },
    {
      id: 'applied',
      title: 'Applied Submissions',
      count: appliedCount,
      percentage: totalJobs > 0 ? Math.round((appliedCount / totalJobs) * 100) : 0,
      label: 'Submissions Sent',
      statusTag: 'Applied',
      colorTheme: {
        bg: 'bg-emerald-500/10',
        border: 'border-emerald-500/30',
        hoverBorder: 'hover:border-emerald-500/60',
        text: 'text-emerald-400',
        badgeBg: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
        barFill: 'bg-emerald-400',
        glow: 'from-emerald-500/10'
      },
      icon: Send,
      description: 'Active in recruiter channels. Verification logged.'
    }
  ];

  return (
    <div className="bg-[#0d0d0f] border border-[#1f1f28] hover:border-purple-500/30 rounded-2xl p-4 sm:p-5 shadow-xl space-y-4 font-sans relative overflow-hidden transition-all w-full max-w-full">
      {/* Background ambient glow */}
      <div className="absolute top-0 right-1/4 w-60 h-60 bg-blue-600/5 rounded-full blur-3xl pointer-events-none"></div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#1c1d28] pb-3.5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-500/15 border border-purple-500/40 flex items-center justify-center font-bold text-purple-400 shadow-md shrink-0">
            <Layers className="w-5 h-5 text-purple-400" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-sm sm:text-base font-bold text-white uppercase tracking-wider font-mono">
                Pipeline Progress Matrix (Scored → Tailored → Applied)
              </h3>
              <span className="bg-purple-500/20 text-purple-300 border border-purple-500/40 text-[10px] font-mono px-2 py-0.5 rounded font-bold uppercase flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-purple-400" />
                REAL-TIME MATRIX
              </span>
            </div>
            <p className="text-[11px] sm:text-xs text-[#9090a8] mt-0.5">
              Live funnel tracking throughput from initial evaluation to recruiter submission.
            </p>
          </div>
        </div>

        {/* Quick Actions & Total Badge */}
        <div className="flex items-center gap-2 self-start sm:self-auto shrink-0 font-mono text-xs">
          <span className="text-[11px] font-mono text-[#a0a0ba] bg-[#121422] px-3 py-1.5 rounded-xl border border-[#23263d]">
            Total In System: <strong className="text-white">{totalJobs} Roles</strong>
          </span>
          {onOpenAddJobModal && (
            <button
              onClick={onOpenAddJobModal}
              className="bg-purple-600/20 hover:bg-purple-600/40 text-purple-300 border border-purple-500/40 px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-sm"
            >
              <Plus className="w-3.5 h-3.5 text-purple-400" />
              Add Role
            </button>
          )}
        </div>
      </div>

      {/* Real-time Color-Coded Matrix Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
        {matrixItems.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.id}
              className={`bg-[#121422] border ${item.colorTheme.border} ${item.colorTheme.hoverBorder} rounded-xl p-4 transition-all relative overflow-hidden flex flex-col justify-between space-y-3 shadow-md group`}
            >
              {/* Subtle inner top glow */}
              <div className={`absolute top-0 inset-x-0 h-1 bg-gradient-to-r ${item.colorTheme.glow} to-transparent pointer-events-none`}></div>

              {/* Card Top Row */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`w-8 h-8 rounded-lg ${item.colorTheme.bg} border ${item.colorTheme.border} flex items-center justify-center shrink-0`}>
                    <Icon className={`w-4 h-4 ${item.colorTheme.text}`} />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                      {item.title}
                    </h4>
                    <span className="text-[10px] text-[#8084a0] font-mono block">
                      {item.label}
                    </span>
                  </div>
                </div>

                <span className={`text-[10px] font-mono px-2 py-0.5 rounded border font-bold ${item.colorTheme.badgeBg}`}>
                  {item.percentage}%
                </span>
              </div>

              {/* Count Display */}
              <div className="flex items-baseline justify-between pt-1 font-mono">
                <span className={`text-3xl font-extrabold ${item.colorTheme.text} leading-none tracking-tight`}>
                  {item.count}
                </span>
                <span className="text-xs text-[#707490]">
                  {item.count === 1 ? '1 role' : `${item.count} roles`}
                </span>
              </div>

              {/* Progress Bar */}
              <div className="space-y-1">
                <div className="w-full bg-[#0a0b12] h-2 rounded-full overflow-hidden border border-[#1f2238]">
                  <div 
                    className={`h-full ${item.colorTheme.barFill} transition-all duration-500 rounded-full`} 
                    style={{ width: `${Math.max(4, item.percentage)}%` }}
                  ></div>
                </div>
                <p className="text-[10px] text-[#8084a0] font-mono line-clamp-1 pt-0.5">
                  {item.description}
                </p>
              </div>

              {/* Card Footer Filter Action */}
              <button
                onClick={() => setActiveTab && setActiveTab('pipeline')}
                className="w-full bg-[#0a0b12] hover:bg-[#181a2e] text-[#a0a0ba] hover:text-white border border-[#1f2238] hover:border-purple-500/40 py-1.5 px-2.5 rounded-lg text-[10px] font-mono font-bold flex items-center justify-between transition-all cursor-pointer group-hover:border-opacity-100"
              >
                <span className="flex items-center gap-1">
                  <Filter className="w-3 h-3 text-purple-400" />
                  View in Pipeline
                </span>
                <ArrowRight className="w-3 h-3 text-[#707490] group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>
          );
        })}
      </div>

      {/* Bottom Conversion Funnel Summary Bar */}
      <div className="bg-[#121422] border border-[#202338] rounded-xl p-3 flex flex-col sm:flex-row items-center justify-between gap-3 font-mono text-xs text-[#a0a0ba]">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5">
            <TrendingUp className="w-4 h-4 text-emerald-400" />
            <span className="font-bold text-white">Funnel Conversion Metrics:</span>
          </div>
          <div className="flex items-center gap-2 text-[11px]">
            <span className="bg-[#0a0a0f] px-2.5 py-1 rounded border border-[#1f2238] text-amber-300">
              Scored → Tailored: <strong>{scoredToTailoredRate}%</strong>
            </span>
            <span className="text-[#505478]">→</span>
            <span className="bg-[#0a0a0f] px-2.5 py-1 rounded border border-[#1f2238] text-emerald-300">
              Tailored → Applied: <strong>{tailoredToAppliedRate}%</strong>
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3 text-[11px] shrink-0">
          <span className="flex items-center gap-1 text-emerald-400">
            <CheckCircle2 className="w-3.5 h-3.5" />
            {interviewingCount} Active Interviews
          </span>
          {offerCount > 0 && (
            <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2 py-0.5 rounded font-bold">
              🎉 {offerCount} Offers
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
