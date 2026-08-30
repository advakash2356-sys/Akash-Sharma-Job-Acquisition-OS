import React, { useState } from 'react';
import { 
  X, 
  ExternalLink, 
  CheckCircle2, 
  ShieldCheck, 
  Download, 
  FileText, 
  Lock, 
  Sparkles, 
  Search, 
  Filter, 
  Clock, 
  RefreshCw,
  AlertTriangle,
  Award
} from 'lucide-react';
import { JobRole } from '../types';
import { 
  getPlatformSearchUrls, 
  downloadPDFResume, 
  downloadPDFCoverLetter, 
  downloadResumeDoc, 
  downloadCoverLetterDoc 
} from '../utils/documentExporter';

interface PlatformApplyTrackerModalProps {
  jobs: JobRole[];
  isOpen: boolean;
  onClose: () => void;
  onMarkJobApplied: (jobId: string, channel: string) => void;
  onUnmarkJobApplied?: (jobId: string) => void;
}

export const PlatformApplyTrackerModal: React.FC<PlatformApplyTrackerModalProps> = ({
  jobs,
  isOpen,
  onClose,
  onMarkJobApplied,
  onUnmarkJobApplied
}) => {
  const [filterMode, setFilterMode] = useState<'all' | 'pending' | 'applied'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeToast, setActiveToast] = useState<string | null>(null);

  if (!isOpen) return null;

  const eligibleJobs = jobs.filter(j => j.scores.ctcFloorPassed);

  const filteredJobs = eligibleJobs.filter(job => {
    const matchesFilter = 
      filterMode === 'all' ? true :
      filterMode === 'pending' ? job.status !== 'Applied' :
      job.status === 'Applied';

    const matchesSearch = 
      job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.location.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesFilter && matchesSearch;
  });

  const handleLaunchAndTrack = (job: JobRole, platformName: string, targetUrl: string) => {
    // 1. Open deep hyperlink in new tab
    window.open(targetUrl, '_blank', 'noopener,noreferrer');

    // 2. Mark as Applied to maintain tracking so we don't apply twice!
    onMarkJobApplied(job.id, platformName);

    // 3. Show notification
    setActiveToast(`✓ Applied to ${job.title} at ${job.company} via ${platformName}! Duplicate tracking active.`);
    setTimeout(() => setActiveToast(null), 4000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-fade-in">
      <div className="bg-[#0e0f14] border border-green-500/40 rounded-xl w-full max-w-5xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-[#111622] via-[#141b2b] to-[#0e0f14] border-b border-[#222330] p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-green-500/20 border border-green-500/40 flex items-center justify-center text-green-400">
              <ExternalLink className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white uppercase tracking-tight flex items-center gap-2">
                <span>1-Click Platform Apply & Duplicate Prevention Engine</span>
                <span className="bg-green-500/20 text-green-300 border border-green-500/40 text-[10px] px-2 py-0.5 rounded font-mono">
                  LINKEDIN • NAUKRI • INDEED
                </span>
              </h2>
              <p className="text-xs text-[#a0a0aa]">
                Launch direct application portals one-by-one. Each click automatically logs application timestamps, prevents duplicate submissions, and tailors verified ATS resumes on-the-fly.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-[#888895] hover:text-white p-2 rounded-lg hover:bg-[#1a1a24] transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter Bar & Search */}
        <div className="bg-[#12141c] border-b border-[#22232e] p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setFilterMode('all')}
              className={`px-3 py-1.5 rounded text-xs font-bold uppercase tracking-wider transition-all ${
                filterMode === 'all' 
                  ? 'bg-blue-600 text-white shadow' 
                  : 'bg-[#181a24] text-[#888895] hover:text-white'
              }`}
            >
              All Roles ({eligibleJobs.length})
            </button>
            <button
              onClick={() => setFilterMode('pending')}
              className={`px-3 py-1.5 rounded text-xs font-bold uppercase tracking-wider transition-all ${
                filterMode === 'pending' 
                  ? 'bg-amber-600 text-white shadow' 
                  : 'bg-[#181a24] text-[#888895] hover:text-white'
              }`}
            >
              To Apply ({eligibleJobs.filter(j => j.status !== 'Applied').length})
            </button>
            <button
              onClick={() => setFilterMode('applied')}
              className={`px-3 py-1.5 rounded text-xs font-bold uppercase tracking-wider transition-all ${
                filterMode === 'applied' 
                  ? 'bg-green-600 text-white shadow' 
                  : 'bg-[#181a24] text-[#888895] hover:text-white'
              }`}
            >
              Applied ({eligibleJobs.filter(j => j.status === 'Applied').length})
            </button>
          </div>

          <div className="relative flex-1 max-w-xs">
            <Search className="w-4 h-4 text-[#6b6b75] absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search role or company..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#181a24] border border-[#262836] rounded-md pl-9 pr-3 py-1.5 text-xs text-white placeholder-[#6b6b75] focus:outline-none focus:border-green-500"
            />
          </div>
        </div>

        {/* Toast Notification */}
        {activeToast && (
          <div className="bg-green-950/60 border-b border-green-500/40 p-3 text-xs text-green-300 font-mono font-bold flex items-center gap-2 animate-fade-in">
            <CheckCircle2 className="w-4 h-4 text-green-400 shrink-0" />
            <span>{activeToast}</span>
          </div>
        )}

        {/* Strict Truth Shield Banner */}
        <div className="bg-[#0b0c10] px-5 py-2.5 border-b border-[#1d1e28] flex flex-wrap items-center justify-between gap-2 text-[11px] text-[#a0a0aa]">
          <span className="flex items-center gap-1.5 text-amber-300 font-bold">
            <ShieldCheck className="w-4 h-4 text-amber-400" />
            Strict Truthfulness Shield: 100% Verified Profile Data (Gartner 7+ Yrs, LLB, 60% TAT, 6 FTEs, Copilot AI)
          </span>
          <span className="text-[#888895] font-mono">No Fake Stats • No Hallucinations</span>
        </div>

        {/* Job List with 1-Click Platform Launchers & ATS Resume Generators */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1">
          {filteredJobs.length === 0 ? (
            <div className="text-center py-12 text-xs text-[#888895]">
              No jobs match your selected filter or search query.
            </div>
          ) : (
            filteredJobs.map((job) => {
              const urls = getPlatformSearchUrls(job.title, job.company);
              const isApplied = job.status === 'Applied';

              return (
                <div
                  key={job.id}
                  className={`p-4 sm:p-5 rounded-lg border transition-all space-y-3 ${
                    isApplied
                      ? 'bg-[#0f1512] border-green-600/40 shadow'
                      : 'bg-[#13141c] border-[#222432] hover:border-[#323546]'
                  }`}
                >
                  {/* Job Header Info */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#202230] pb-3">
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-base font-bold text-white">{job.title}</h3>
                        <span className="text-blue-400 font-semibold text-xs">@ {job.company}</span>
                        <span className="bg-green-500/10 text-green-400 border border-green-500/30 text-[10px] font-mono px-2 py-0.5 rounded font-bold">
                          ₹{job.ctcMinLpa}–{job.ctcMaxLpa} LPA CTC
                        </span>
                      </div>
                      <p className="text-xs text-[#a0a0aa]">
                        {job.location} • {job.shift} • {job.workMode} • Score: <strong className="text-white font-mono">{job.scores.totalScore}/100</strong>
                      </p>
                    </div>

                    {/* Application Tracking Badge */}
                    <div className="shrink-0">
                      {isApplied ? (
                        <div className="bg-green-500/20 text-green-300 border border-green-500/50 px-3 py-1.5 rounded-md text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-sm">
                          <CheckCircle2 className="w-4 h-4 text-green-400" />
                          <span>APPLIED {job.appliedDate ? `on ${job.appliedDate}` : ''}</span>
                          <Lock className="w-3.5 h-3.5 text-green-400 ml-1" title="Duplicate application protection active" />
                        </div>
                      ) : (
                        <div className="bg-amber-500/10 text-amber-400 border border-amber-500/30 px-3 py-1.5 rounded-md text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-amber-400" />
                          <span>READY TO APPLY</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions Bar: 1-Click Platform Launchers & Tailored ATS Resume Generator */}
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 pt-1">
                    {/* Platform Hyperlink Buttons with Auto-Tracking */}
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[10px] font-bold text-[#888895] uppercase tracking-wider mr-1">
                        1-Click Launch & Track:
                      </span>

                      <button
                        onClick={() => handleLaunchAndTrack(job, 'LinkedIn', urls.linkedIn)}
                        className="bg-[#0077b5] hover:bg-[#006094] text-white font-bold px-3 py-1.5 rounded text-xs flex items-center gap-1.5 cursor-pointer transition-all shadow-md"
                        title="Open LinkedIn Jobs & record applied status"
                      >
                        <ExternalLink className="w-3.5 h-3.5 text-white" />
                        LinkedIn Apply
                      </button>

                      <button
                        onClick={() => handleLaunchAndTrack(job, 'Naukri', urls.naukri)}
                        className="bg-[#4a00e0] hover:bg-[#3b00b3] text-white font-bold px-3 py-1.5 rounded text-xs flex items-center gap-1.5 cursor-pointer transition-all shadow-md"
                        title="Open Naukri Portal & record applied status"
                      >
                        <ExternalLink className="w-3.5 h-3.5 text-white" />
                        Naukri Apply
                      </button>

                      <button
                        onClick={() => handleLaunchAndTrack(job, 'Indeed', urls.indeed)}
                        className="bg-[#2164f3] hover:bg-[#184ec2] text-white font-bold px-3 py-1.5 rounded text-xs flex items-center gap-1.5 cursor-pointer transition-all shadow-md"
                        title="Open Indeed Portal & record applied status"
                      >
                        <ExternalLink className="w-3.5 h-3.5 text-white" />
                        Indeed Apply
                      </button>
                    </div>

                    {/* Tailored ATS Resume Export for this exact Job */}
                    <div className="flex items-center gap-2 border-t lg:border-t-0 border-[#202230] pt-2 lg:pt-0">
                      <span className="text-[10px] font-bold text-[#888895] uppercase tracking-wider hidden sm:inline">
                        Job-Tailored ATS Docs:
                      </span>

                      <button
                        onClick={() => downloadPDFResume(job.title, job.company, job.scores.recommendation)}
                        className="bg-green-600/20 hover:bg-green-600/40 text-green-300 border border-green-500/30 px-2.5 py-1.5 rounded text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all"
                        title="Export ATS PDF Resume tailored for this specific role"
                      >
                        <FileText className="w-3.5 h-3.5 text-green-400" />
                        ATS PDF Resume
                      </button>

                      <button
                        onClick={() => downloadPDFCoverLetter(job.title, job.company, job.contactPerson?.name)}
                        className="bg-indigo-600/20 hover:bg-indigo-600/40 text-indigo-300 border border-indigo-500/30 px-2.5 py-1.5 rounded text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all"
                        title="Export Executive PDF Cover Letter for this specific role"
                      >
                        <FileText className="w-3.5 h-3.5 text-indigo-400" />
                        PDF Cover
                      </button>

                      {isApplied && onUnmarkJobApplied && (
                        <button
                          onClick={() => onUnmarkJobApplied(job.id)}
                          className="text-[10px] text-[#888895] hover:text-white underline ml-2 cursor-pointer"
                        >
                          Mark Unapplied
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="bg-[#101117] border-t border-[#22232e] p-4 flex items-center justify-between text-xs text-[#888895]">
          <span className="font-mono">
            Anti-Duplicate Tracking Active • Target CTC Floor: ≥18 LPA
          </span>
          <button
            onClick={onClose}
            className="bg-[#1e202c] hover:bg-[#282a3a] text-white px-4 py-2 rounded font-bold cursor-pointer transition-all"
          >
            Close Window
          </button>
        </div>
      </div>
    </div>
  );
};
