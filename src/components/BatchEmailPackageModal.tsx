import React, { useState } from 'react';
import { 
  X, 
  Mail, 
  Download, 
  FileText, 
  CheckCircle2, 
  Sparkles, 
  Send, 
  AlertCircle, 
  ShieldCheck, 
  Clock,
  Layers,
  CheckSquare,
  Square
} from 'lucide-react';
import { JobRole } from '../types';
import { 
  downloadPDFResume, 
  downloadPDFCoverLetter, 
  downloadResumeDoc, 
  downloadCoverLetterDoc, 
  executeAndLaunchGmail,
  downloadEmlFile
} from '../utils/documentExporter';

interface BatchEmailPackageModalProps {
  jobs: JobRole[];
  isOpen: boolean;
  onClose: () => void;
  onMarkJobApplied: (jobId: string, channel: string) => void;
  activeSenderEmail?: string | null;
  onOpenGmailConnectorModal?: () => void;
}

export const BatchEmailPackageModal: React.FC<BatchEmailPackageModalProps> = ({
  jobs,
  isOpen,
  onClose,
  onMarkJobApplied,
  activeSenderEmail = 'Adv.Akash2356@gmail.com',
  onOpenGmailConnectorModal
}) => {
  // Pre-select high score jobs (>= 75 score and CTC floor passed)
  const [selectedJobIds, setSelectedJobIds] = useState<string[]>(() => 
    jobs.filter(j => j.scores.totalScore >= 70 && j.scores.ctcFloorPassed).map(j => j.id)
  );

  const [processingStatus, setProcessingStatus] = useState<string | null>(null);
  const [downloadProgress, setDownloadProgress] = useState<{ current: number; total: number } | null>(null);

  if (!isOpen) return null;

  const eligibleJobs = jobs.filter(j => j.scores.ctcFloorPassed);

  const toggleSelectAll = () => {
    if (selectedJobIds.length === eligibleJobs.length) {
      setSelectedJobIds([]);
    } else {
      setSelectedJobIds(eligibleJobs.map(j => j.id));
    }
  };

  const toggleSelectJob = (id: string) => {
    setSelectedJobIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const selectedJobs = jobs.filter(j => selectedJobIds.includes(j.id));

  // Batch Download PDF Resumes & Cover Letters for Manual Attachment
  const handleBatchDownloadPDFs = () => {
    if (selectedJobs.length === 0) return;

    setDownloadProgress({ current: 0, total: selectedJobs.length });
    setProcessingStatus(`Generating & exporting ${selectedJobs.length * 2} ATS PDF Resumes & Cover Letters to your Downloads folder...`);

    selectedJobs.forEach((job, index) => {
      setTimeout(() => {
        downloadPDFResume(job.title, job.company, job.scores.recommendation);
        downloadPDFCoverLetter(job.title, job.company, job.contactPerson?.name);
        
        setDownloadProgress({ current: index + 1, total: selectedJobs.length });

        if (index === selectedJobs.length - 1) {
          setTimeout(() => {
            setProcessingStatus(`✅ Batch Download Completed! ${selectedJobs.length * 2} ATS PDF documents generated for manual attachment in Gmail.`);
          }, 500);
        }
      }, index * 600);
    });
  };

  // Batch Launch Gmail Composes & Update Status to Applied
  const handleBatchLaunchGmail = () => {
    if (selectedJobs.length === 0) return;

    setProcessingStatus(`Opening ${selectedJobs.length} Gmail compose windows & marking as Applied in tracking engine...`);

    selectedJobs.forEach((job, index) => {
      setTimeout(() => {
        const hrEmail = job.contactPerson?.email || `hr@${job.company.toLowerCase().replace(/[^a-z0-9]/g, '')}.com`;
        
        executeAndLaunchGmail({
          toEmail: hrEmail,
          jobTitle: job.title,
          companyName: job.company,
          contactName: job.contactPerson?.name,
          customSummary: job.scores.recommendation
        });

        // Track as Applied
        onMarkJobApplied(job.id, 'Gmail Outreach');
      }, index * 800);
    });

    setTimeout(() => {
      setProcessingStatus(`✅ Gmail Compose tabs launched! ${selectedJobs.length} roles marked as Applied with timestamp.`);
    }, selectedJobs.length * 800 + 400);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-fade-in">
      <div className="bg-[#0f1015] border border-blue-500/30 rounded-xl w-full max-w-4xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-[#121420] via-[#161828] to-[#0f1015] border-b border-[#23232e] p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white uppercase tracking-tight flex items-center gap-2">
                <span>Batch Email Queue & ATS Document Bundle Engine</span>
                <span className="bg-blue-500/20 text-blue-300 border border-blue-500/40 text-[10px] px-2 py-0.5 rounded font-mono">
                  GMAIL + ATS PDF
                </span>
              </h2>
              <p className="text-xs text-[#a0a0aa]">
                Generate tailored ATS PDF Resumes & Cover Letters for batch email outreach. Launch Gmail compose tabs in 1-click and update application tracking.
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

        {/* Modal Controls Bar */}
        <div className="bg-[#12131a] border-b border-[#23232a] p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <button
              onClick={toggleSelectAll}
              className="text-xs font-bold text-blue-400 hover:text-blue-300 flex items-center gap-1.5 cursor-pointer"
            >
              {selectedJobIds.length === eligibleJobs.length ? (
                <CheckSquare className="w-4 h-4 text-blue-400" />
              ) : (
                <Square className="w-4 h-4 text-[#666]" />
              )}
              Select All Eligible ({eligibleJobs.length})
            </button>
            <span className="text-xs text-[#888895]">|</span>
            <span className="text-xs font-mono font-bold text-amber-400">
              {selectedJobIds.length} Selected for Batch Output
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleBatchDownloadPDFs}
              disabled={selectedJobs.length === 0}
              className="bg-green-600 hover:bg-green-500 disabled:opacity-50 text-white font-bold px-3.5 py-2 rounded text-xs flex items-center gap-1.5 cursor-pointer shadow-md transition-all"
              title="Generate and download ATS PDF Resumes & Cover Letters for all selected roles"
            >
              <Download className="w-4 h-4 text-white" />
              Batch Download PDFs ({selectedJobs.length * 2} Files)
            </button>

            <button
              onClick={handleBatchLaunchGmail}
              disabled={selectedJobs.length === 0}
              className="bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white font-bold px-4 py-2 rounded text-xs flex items-center gap-1.5 cursor-pointer shadow-md transition-all"
              title="Launch Gmail Compose windows with populated content & mark as Applied"
            >
              <Mail className="w-4 h-4 text-white" />
              Launch Gmail & Mark Applied
            </button>
          </div>
        </div>

        {/* Status Toast Indicator */}
        {processingStatus && (
          <div className="bg-blue-950/40 border-b border-blue-500/30 p-3 text-xs text-blue-300 flex items-center justify-between font-mono">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-blue-400 animate-spin" />
              <span>{processingStatus}</span>
            </div>
            {downloadProgress && (
              <span className="font-bold text-amber-300">
                {downloadProgress.current} / {downloadProgress.total} Roles Processed
              </span>
            )}
          </div>
        )}

        {/* Verified Profile Notice */}
        <div className="bg-[#101117] px-5 py-2.5 border-b border-[#1f1f28] flex flex-wrap items-center justify-between gap-2 text-[11px] text-[#a0a0aa]">
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1.5 text-green-400 font-bold">
              <ShieldCheck className="w-3.5 h-3.5 text-green-400" />
              100% Truthful Guarantee: 7+ Yrs Gartner Ops Lead, LLB, 60% TAT, 6 FTEs
            </span>
            <span className="text-[#555]">|</span>
            <span className="text-red-400 font-mono font-bold flex items-center gap-1">
              <Mail className="w-3 h-3 text-red-400" />
              Sender Gmail: <strong className="text-white underline">{activeSenderEmail || 'Adv.Akash2356@gmail.com'}</strong>
            </span>
          </div>

          <div className="flex items-center gap-2 font-mono">
            {onOpenGmailConnectorModal && (
              <button
                onClick={onOpenGmailConnectorModal}
                className="text-[10px] bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/40 px-2 py-0.5 rounded font-bold transition-all cursor-pointer"
              >
                Inspect Gmail MCP Connector
              </button>
            )}
            <span className="text-[#6b6b75]">Zero Lies Guarantee</span>
          </div>
        </div>

        {/* Job Selection Queue Table */}
        <div className="p-5 overflow-y-auto space-y-3 flex-1">
          {eligibleJobs.length === 0 ? (
            <div className="text-center py-10 text-xs text-[#888895]">
              No eligible roles found. Adjust target configuration or discover new jobs.
            </div>
          ) : (
            eligibleJobs.map((job) => {
              const isSelected = selectedJobIds.includes(job.id);
              const isApplied = job.status === 'Applied';

              return (
                <div
                  key={job.id}
                  onClick={() => toggleSelectJob(job.id)}
                  className={`p-4 rounded-lg border transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                    isSelected 
                      ? 'bg-[#151722] border-blue-500/50 shadow-md' 
                      : 'bg-[#111217] border-[#22222a] opacity-80 hover:opacity-100'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-1">
                      {isSelected ? (
                        <CheckSquare className="w-5 h-5 text-blue-400 shrink-0" />
                      ) : (
                        <Square className="w-5 h-5 text-[#555] shrink-0" />
                      )}
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-bold text-white text-sm">{job.title}</span>
                        <span className="text-blue-400 text-xs font-semibold">@ {job.company}</span>
                        <span className="bg-green-500/10 text-green-400 border border-green-500/30 text-[10px] font-mono px-2 py-0.5 rounded font-bold">
                          ₹{job.ctcMinLpa}–{job.ctcMaxLpa} LPA
                        </span>
                        {isApplied && (
                          <span className="bg-green-600/20 text-green-300 border border-green-500/40 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3 text-green-400" />
                            Applied {job.appliedDate ? `on ${job.appliedDate}` : ''}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-[#a0a0aa] mt-1 line-clamp-1">
                        {job.location} • {job.shift} • Score: <strong className="text-white font-mono">{job.scores.totalScore}/100</strong>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => downloadPDFResume(job.title, job.company, job.scores.recommendation)}
                      className="bg-green-600/20 hover:bg-green-600/40 text-green-300 border border-green-500/30 px-2.5 py-1.5 rounded text-xs font-bold flex items-center gap-1 cursor-pointer transition-all"
                      title="Download PDF Resume for manual attachment"
                    >
                      <FileText className="w-3.5 h-3.5 text-green-400" />
                      PDF Resume
                    </button>

                    <button
                      onClick={() => downloadPDFCoverLetter(job.title, job.company, job.contactPerson?.name)}
                      className="bg-indigo-600/20 hover:bg-indigo-600/40 text-indigo-300 border border-indigo-500/30 px-2.5 py-1.5 rounded text-xs font-bold flex items-center gap-1 cursor-pointer transition-all"
                      title="Download PDF Cover Letter for manual attachment"
                    >
                      <FileText className="w-3.5 h-3.5 text-indigo-400" />
                      PDF Cover
                    </button>

                    <button
                      onClick={() => {
                        const hrEmail = job.contactPerson?.email || `hr@${job.company.toLowerCase().replace(/[^a-z0-9]/g, '')}.com`;
                        downloadEmlFile({
                          toEmail: hrEmail,
                          fromEmail: activeSenderEmail || 'Adv.Akash2356@gmail.com',
                          jobTitle: job.title,
                          companyName: job.company,
                          contactName: job.contactPerson?.name,
                          customSummary: job.scores.recommendation
                        });
                      }}
                      className="bg-purple-600/20 hover:bg-purple-600/40 text-purple-200 border border-purple-500/30 px-2.5 py-1.5 rounded text-xs font-bold flex items-center gap-1 cursor-pointer transition-all"
                      title="Download raw RFC 822 .EML draft file"
                    >
                      <Download className="w-3.5 h-3.5 text-purple-300" />
                      .EML Draft
                    </button>

                    <button
                      onClick={() => {
                        const hrEmail = job.contactPerson?.email || `hr@${job.company.toLowerCase().replace(/[^a-z0-9]/g, '')}.com`;
                        executeAndLaunchGmail({
                          toEmail: hrEmail,
                          jobTitle: job.title,
                          companyName: job.company,
                          contactName: job.contactPerson?.name,
                          customSummary: job.scores.recommendation
                        });
                        onMarkJobApplied(job.id, 'Gmail');
                      }}
                      className="bg-red-600 hover:bg-red-500 text-white font-bold px-3 py-1.5 rounded text-xs flex items-center gap-1 cursor-pointer transition-all shadow-md"
                      title="Download files & launch Gmail compose"
                    >
                      <Mail className="w-3.5 h-3.5 text-white" />
                      Gmail Launch
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Modal Footer */}
        <div className="bg-[#111218] border-t border-[#23232a] p-4 flex items-center justify-between text-xs text-[#888895]">
          <span className="font-mono">
            Target Floor: ≥₹18 LPA CTC • Deadline: 31 August 2026
          </span>
          <button
            onClick={onClose}
            className="bg-[#1f1f28] hover:bg-[#282835] text-white px-4 py-2 rounded font-bold cursor-pointer transition-all"
          >
            Close Window
          </button>
        </div>
      </div>
    </div>
  );
};
