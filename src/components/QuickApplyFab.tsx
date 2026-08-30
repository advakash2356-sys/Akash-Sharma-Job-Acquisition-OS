import React, { useState } from 'react';
import { JobRole } from '../types';
import { 
  Zap, 
  Send, 
  Sparkles, 
  ExternalLink, 
  Download, 
  CheckCircle2, 
  Building2, 
  DollarSign, 
  X,
  ArrowRight
} from 'lucide-react';
import { executeAndLaunchGmail, downloadEmlFile } from '../utils/documentExporter';

interface QuickApplyFabProps {
  jobs: JobRole[];
  onSelectJob?: (job: JobRole) => void;
  setActiveTab?: (tab: string) => void;
  onNotification?: (msg: string) => void;
}

export const QuickApplyFab: React.FC<QuickApplyFabProps> = ({
  jobs,
  onSelectJob,
  setActiveTab,
  onNotification
}) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [hasTriggered, setHasTriggered] = useState<boolean>(false);

  // Find the highest-scored job that is ready to be applied or top priority
  const unappliedJobs = jobs.filter(
    j => j.status === 'Scored' || j.status === 'Discovered' || j.status === 'Tailored'
  );
  const candidates = unappliedJobs.length > 0 ? unappliedJobs : jobs;
  const highestScoredJob = [...candidates].sort(
    (a, b) => (b.scores?.totalScore || 0) - (a.scores?.totalScore || 0)
  )[0];

  if (!highestScoredJob) return null;

  const targetEmail = highestScoredJob.contactPerson?.email || `hr@${highestScoredJob.company.toLowerCase().replace(/[^a-z0-9]/g, '')}.com`;
  const scoreVal = highestScoredJob.scores?.totalScore || 92;

  const handleTriggerQuickApply = () => {
    setHasTriggered(true);
    
    // Automatically trigger application flow via Gmail launcher
    executeAndLaunchGmail({
      toEmail: targetEmail,
      jobTitle: highestScoredJob.title,
      companyName: highestScoredJob.company,
      contactName: highestScoredJob.contactPerson?.name,
      customSummary: highestScoredJob.scores?.recommendation
    });

    if (onSelectJob) {
      onSelectJob(highestScoredJob);
    }

    if (onNotification) {
      onNotification(`⚡ Quick Apply Launched for ${highestScoredJob.title} @ ${highestScoredJob.company}!`);
    }

    setTimeout(() => setHasTriggered(false), 3000);
  };

  return (
    <div className="fixed bottom-20 sm:bottom-8 right-4 sm:right-8 z-40 flex flex-col items-end gap-2 font-sans">
      {/* Expanded Preview Card */}
      {isExpanded && (
        <div className="bg-[#0f1224] border-2 border-amber-500/60 rounded-2xl p-4 shadow-2xl w-80 sm:w-96 mb-1 backdrop-blur-xl animate-in fade-in slide-in-from-bottom-3 duration-200">
          <div className="flex items-center justify-between border-b border-[#20264c] pb-2.5 mb-3">
            <div className="flex items-center gap-2">
              <span className="bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-mono font-bold px-2 py-0.5 rounded">
                ⚡ HIGHEST SCORED OPPORTUNITY
              </span>
              <span className="text-xs font-mono font-bold text-emerald-400">
                {scoreVal}/100 Match
              </span>
            </div>
            <button
              onClick={() => setIsExpanded(false)}
              className="text-[#8e93be] hover:text-white p-1 rounded-lg hover:bg-[#1a2040] cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-2">
            <div>
              <h4 className="text-sm font-extrabold text-white line-clamp-1">
                {highestScoredJob.title}
              </h4>
              <p className="text-xs text-[#8e93be] font-semibold mt-0.5">
                {highestScoredJob.company} • {highestScoredJob.location}
              </p>
            </div>

            <div className="bg-[#141830] border border-[#232950] p-2.5 rounded-lg flex items-center justify-between text-xs font-mono">
              <div>
                <span className="text-[10px] text-[#70759f] block">COMPENSATION</span>
                <span className="font-extrabold text-emerald-400">
                  ₹{highestScoredJob.ctcMinLpa || 18}–{highestScoredJob.ctcMaxLpa || 24} LPA
                </span>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-[#70759f] block">WORK MODE</span>
                <span className="font-semibold text-blue-300">
                  {highestScoredJob.workMode || 'Remote'}
                </span>
              </div>
            </div>

            <p className="text-[11px] text-[#a0a5d4] leading-relaxed line-clamp-2">
              {highestScoredJob.scores?.recommendation || 'Top-tier fit for 7+ years Gartner Ops, CLM Transformation & Legal Operations.'}
            </p>

            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#1e2448] font-mono text-xs">
              <button
                onClick={handleTriggerQuickApply}
                className="bg-red-600 hover:bg-red-500 text-white font-bold py-2 px-3 rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-md"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Launch Gmail</span>
              </button>

              <button
                onClick={() => {
                  downloadEmlFile({
                    toEmail: targetEmail,
                    fromEmail: 'Adv.Akash2356@gmail.com',
                    jobTitle: highestScoredJob.title,
                    companyName: highestScoredJob.company,
                    contactName: highestScoredJob.contactPerson?.name,
                    customSummary: highestScoredJob.scores?.recommendation
                  });
                  if (onNotification) {
                    onNotification(`📥 Downloaded .EML draft for ${highestScoredJob.company}!`);
                  }
                }}
                className="bg-[#171c3a] hover:bg-[#252b56] text-purple-200 border border-purple-500/30 font-bold py-2 px-3 rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer"
              >
                <Download className="w-3.5 h-3.5 text-purple-300" />
                <span>.EML Draft</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Action Button */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="hidden sm:flex bg-[#0f1224]/90 hover:bg-[#1a2040] text-amber-300 border border-amber-500/40 text-xs font-mono font-bold px-3 py-2.5 rounded-2xl shadow-xl backdrop-blur-md items-center gap-1.5 cursor-pointer transition-all hover:scale-105"
          title="Preview Top Opportunity"
        >
          <span className="text-[11px] text-white">Top Pick:</span>
          <span className="text-amber-300 font-extrabold max-w-[140px] truncate">{highestScoredJob.company}</span>
          <span className="text-emerald-400">({scoreVal}%)</span>
        </button>

        <button
          onClick={handleTriggerQuickApply}
          className={`bg-gradient-to-r from-amber-500 via-orange-500 to-red-600 hover:from-amber-400 hover:to-red-500 text-white font-mono font-extrabold text-xs sm:text-sm px-4 sm:px-5 py-3.5 rounded-2xl shadow-2xl border-2 border-amber-300/60 flex items-center gap-2.5 cursor-pointer transition-all hover:scale-105 active:scale-95 group ${
            hasTriggered ? 'ring-4 ring-emerald-400 bg-emerald-600' : 'animate-bounce shadow-amber-500/30'
          }`}
          title={`Quick Apply to ${highestScoredJob.title} @ ${highestScoredJob.company} (${scoreVal}/100)`}
        >
          <div className="w-6 h-6 rounded-lg bg-black/20 flex items-center justify-center">
            <Zap className="w-4 h-4 text-amber-200 fill-amber-300" />
          </div>
          <div className="flex flex-col text-left leading-tight">
            <span className="text-[10px] text-amber-100 font-bold uppercase tracking-wider">Instant 1-Click</span>
            <span className="text-xs sm:text-sm font-black">Quick Apply</span>
          </div>
        </button>
      </div>
    </div>
  );
};
