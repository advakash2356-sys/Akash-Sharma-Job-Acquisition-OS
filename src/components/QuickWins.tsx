import React from 'react';
import { JobRole } from '../types';
import { 
  Sparkles, 
  Zap, 
  ExternalLink, 
  Download, 
  CheckCircle2, 
  TrendingUp, 
  Briefcase, 
  Clock, 
  Building2, 
  DollarSign, 
  Send,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';
import { executeAndLaunchGmail, downloadEmlFile } from '../utils/documentExporter';

interface QuickWinsProps {
  jobs: JobRole[];
  onSelectJob?: (job: JobRole) => void;
  setActiveTab?: (tab: string) => void;
  onOpenBatchEmailModal?: () => void;
}

export const QuickWins: React.FC<QuickWinsProps> = ({
  jobs,
  onSelectJob,
  setActiveTab,
  onOpenBatchEmailModal
}) => {
  // Find top 3 most relevant, high-scoring, and easily-applyable jobs
  // Priority: Scored / Discovered / Tailored roles with highest totalScore and ctcFloorPassed
  const availableToApply = jobs.filter(
    j => j.status === 'Scored' || j.status === 'Discovered' || j.status === 'Tailored'
  );

  const sortedCandidates = [...(availableToApply.length >= 3 ? availableToApply : jobs)]
    .sort((a, b) => (b.scores?.totalScore || 0) - (a.scores?.totalScore || 0))
    .slice(0, 3);

  return (
    <div className="bg-[#0b0d18] border border-[#1e2342] rounded-2xl p-5 sm:p-6 space-y-4 shadow-2xl relative overflow-hidden">
      {/* Ambient background glow */}
      <div className="absolute top-0 right-1/4 w-80 h-32 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#1b203c] pb-3.5 relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-600/20 border border-amber-500/40 flex items-center justify-center text-amber-300 shadow-md shrink-0">
            <Zap className="w-5 h-5 text-amber-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-extrabold text-white uppercase tracking-wider font-mono flex items-center gap-2">
                Quick Wins: Top 3 High-Probability Roles
              </h2>
              <span className="text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/40 px-2 py-0.5 rounded font-bold font-mono">
                ZERO FATIGUE
              </span>
            </div>
            <p className="text-xs text-[#8e93be] mt-0.5 font-sans">
              Hand-picked highest match opportunities ready for immediate 1-click submission.
            </p>
          </div>
        </div>

        {onOpenBatchEmailModal && (
          <button
            onClick={onOpenBatchEmailModal}
            className="self-start sm:self-auto bg-blue-600 hover:bg-blue-500 text-white font-mono text-xs font-bold px-3.5 py-1.5 rounded-lg border border-blue-400/40 transition-all flex items-center gap-1.5 cursor-pointer shrink-0 shadow-sm"
          >
            <Send className="w-3.5 h-3.5" />
            Batch Apply All 3
          </button>
        )}
      </div>

      {/* 3 Quick Win Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 relative z-10 font-sans">
        {sortedCandidates.map((job, idx) => {
          const rankLabel = idx === 0 ? '🏆 #1 TOP PICK' : idx === 1 ? '⚡ #2 HIGH MATCH' : '🎯 #3 FAST TRACK';
          const badgeColor = idx === 0 
            ? 'bg-amber-500/20 text-amber-300 border-amber-500/40' 
            : idx === 1 
            ? 'bg-blue-500/20 text-blue-300 border-blue-500/40' 
            : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';

          const targetEmail = job.contactPerson?.email || `hr@${job.company.toLowerCase().replace(/[^a-z0-9]/g, '')}.com`;

          return (
            <div 
              key={job.id}
              className="bg-[#101324] border border-[#22274c] hover:border-amber-500/50 rounded-xl p-4.5 space-y-3 flex flex-col justify-between transition-all group shadow-lg"
            >
              <div className="space-y-2.5">
                {/* Top Rank Badge & Match Score */}
                <div className="flex items-center justify-between gap-2">
                  <span className={`text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${badgeColor}`}>
                    {rankLabel}
                  </span>
                  <div className="flex items-center gap-1 text-xs font-mono font-extrabold text-emerald-400">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    <span>{job.scores?.totalScore || 90}/100</span>
                  </div>
                </div>

                {/* Job Title & Company */}
                <div>
                  <h3 className="text-sm sm:text-base font-extrabold text-white group-hover:text-amber-300 transition-colors line-clamp-1">
                    {job.title}
                  </h3>
                  <div className="flex items-center gap-2 text-xs text-[#8e93be] mt-0.5">
                    <span className="font-semibold text-white/90">{job.company}</span>
                    <span>•</span>
                    <span>{job.location}</span>
                  </div>
                </div>

                {/* Compensation & Work Mode */}
                <div className="bg-[#141830] border border-[#232950] p-2.5 rounded-lg flex items-center justify-between font-mono text-xs">
                  <div>
                    <span className="text-[10px] text-[#70759f] block uppercase">Package Offer</span>
                    <span className="font-extrabold text-emerald-400 text-sm">
                      ₹{job.ctcMinLpa || 18}–{job.ctcMaxLpa || 24} LPA
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-[#70759f] block uppercase">Work Mode</span>
                    <span className="font-semibold text-blue-300 text-xs">
                      {job.workMode || 'Remote / Hybrid'}
                    </span>
                  </div>
                </div>

                {/* Key Reason / Match Highlights */}
                <div className="text-xs text-[#9ea3ce] leading-relaxed bg-[#0c0e1b] p-2.5 rounded-lg border border-[#1b1f3c]">
                  <div className="flex items-center gap-1 text-[11px] font-bold text-amber-300 mb-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>Why This is a Quick Win:</span>
                  </div>
                  <p className="line-clamp-2 text-[11px]">
                    {job.scores?.recommendation || 'High alignment with 7+ yrs Gartner CLM Transformation & LLB Legal background.'}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 space-y-2 border-t border-[#1c2140]">
                <div className="grid grid-cols-2 gap-2 font-mono">
                  <button
                    onClick={() => {
                      executeAndLaunchGmail({
                        toEmail: targetEmail,
                        jobTitle: job.title,
                        companyName: job.company,
                        contactName: job.contactPerson?.name,
                        customSummary: job.scores?.recommendation
                      });
                    }}
                    className="bg-red-600 hover:bg-red-500 text-white font-bold py-1.5 px-2 rounded-lg text-xs flex items-center justify-center gap-1 transition-all cursor-pointer shadow-sm"
                    title="Launch customized Gmail compose window"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Gmail Apply</span>
                  </button>

                  <button
                    onClick={() => {
                      downloadEmlFile({
                        toEmail: targetEmail,
                        fromEmail: 'Adv.Akash2356@gmail.com',
                        jobTitle: job.title,
                        companyName: job.company,
                        contactName: job.contactPerson?.name,
                        customSummary: job.scores?.recommendation
                      });
                    }}
                    className="bg-[#181d3a] hover:bg-[#252c56] text-purple-200 border border-purple-500/30 font-bold py-1.5 px-2 rounded-lg text-xs flex items-center justify-center gap-1 transition-all cursor-pointer"
                    title="Download RFC 822 .EML draft"
                  >
                    <Download className="w-3.5 h-3.5 text-purple-300" />
                    <span>.EML Draft</span>
                  </button>
                </div>

                <button
                  onClick={() => {
                    if (onSelectJob) onSelectJob(job);
                    if (setActiveTab) setActiveTab('pipeline');
                  }}
                  className="w-full bg-[#12162c] hover:bg-[#1d2346] text-[#8e93be] hover:text-white border border-[#232950] font-mono text-[11px] font-semibold py-1 rounded-lg flex items-center justify-center gap-1 transition-all cursor-pointer"
                >
                  <span>Review Match & Full Dossier</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
