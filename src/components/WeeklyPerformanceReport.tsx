import React, { useState } from 'react';
import { JobRole } from '../types';
import { 
  FileText, 
  Download, 
  Calendar, 
  TrendingUp, 
  CheckCircle2, 
  Flame, 
  Printer, 
  Sparkles, 
  X, 
  Award, 
  Clock 
} from 'lucide-react';

interface WeeklyPerformanceReportProps {
  jobs: JobRole[];
  isPanicMode: boolean;
}

export const WeeklyPerformanceReport: React.FC<WeeklyPerformanceReportProps> = ({
  jobs,
  isPanicMode
}) => {
  const [isOpen, setIsOpen] = useState(false);

  // Compute weekly metrics
  const targetDate = new Date('2026-08-31');
  const today = new Date();
  const daysRemaining = Math.max(0, Math.ceil((targetDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)));

  const totalJobsInPipeline = jobs.length;
  const totalApplied = jobs.filter(j => j.status === 'Applied' || j.status === 'Interviewing' || j.status === 'Offer Received').length;
  const totalInterviews = jobs.filter(j => j.status === 'Interviewing' || j.status === 'Offer Received').length;
  const totalOffers = jobs.filter(j => j.status === 'Offer Received').length;

  const conversionRate = totalApplied > 0 ? Math.round((totalInterviews / totalApplied) * 100) : 0;
  const dailyPaceNeeded = Math.ceil((100 - totalApplied) / Math.max(1, daysRemaining));

  const handlePrintReport = () => {
    window.print();
  };

  return (
    <>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-mono text-xs font-bold px-3.5 py-2 rounded-xl flex items-center gap-2 cursor-pointer shadow-lg shadow-blue-600/30 transition-all border border-blue-400/40"
      >
        <FileText className="w-3.5 h-3.5 text-white" />
        <span>Weekly Performance Report</span>
      </button>

      {/* Report Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-fade-in">
          <div className="bg-[#0d0d0f] border border-[#272a40] rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-6 relative text-white">
            {/* Close button */}
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 text-[#888] hover:text-white p-1 rounded-lg hover:bg-[#1a1c28] cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header */}
            <div className="border-b border-[#222438] pb-4">
              <div className="flex items-center gap-2">
                <span className="bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-mono px-2.5 py-0.5 rounded font-bold uppercase tracking-wider flex items-center gap-1.5">
                  <Award className="w-3.5 h-3.5 text-amber-400" />
                  CONFIDENTIAL EXECUTIVE REPORT
                </span>
                <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[10px] font-mono px-2 py-0.5 rounded">
                  WEEK ENDING 30 JULY 2026
                </span>
              </div>

              <h2 className="text-xl font-extrabold uppercase tracking-wider mt-2 flex items-center gap-2">
                <span>31 August 2026 Goal Performance Audit</span>
              </h2>
              <p className="text-xs text-[#a0a0b0]">
                Weekly job acquisition throughput, interview conversion metrics, and 31-day countdown gap analysis.
              </p>
            </div>

            {/* Summary Metrics Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-xs">
              <div className="bg-[#12131c] border border-[#222434] p-3 rounded-xl">
                <span className="text-[10px] text-[#888898] uppercase block">Applications Sent</span>
                <span className="text-xl font-bold text-blue-400">{totalApplied}</span>
              </div>

              <div className="bg-[#12131c] border border-[#222434] p-3 rounded-xl">
                <span className="text-[10px] text-[#888898] uppercase block">Interviews Secured</span>
                <span className="text-xl font-bold text-emerald-400">{totalInterviews}</span>
              </div>

              <div className="bg-[#12131c] border border-[#222434] p-3 rounded-xl">
                <span className="text-[10px] text-[#888898] uppercase block">Conversion Ratio</span>
                <span className="text-xl font-bold text-amber-400">{conversionRate}%</span>
              </div>

              <div className="bg-[#12131c] border border-[#222434] p-3 rounded-xl">
                <span className="text-[10px] text-[#888898] uppercase block">Days to Deadline</span>
                <span className="text-xl font-bold text-red-400">{daysRemaining} Days</span>
              </div>
            </div>

            {/* AI CEO Strategic Audit */}
            <div className="bg-[#121422] border border-[#22253d] p-4 rounded-xl space-y-2 text-xs">
              <h3 className="font-bold text-amber-300 uppercase tracking-wide flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>AI CEO Executive Performance Assessment</span>
              </h3>
              <p className="text-[#c0c0d0] leading-relaxed">
                With <strong>{daysRemaining} days remaining</strong> until the strictly enforced <strong>31 August 2026 deadline</strong>, your current conversion rate stands at <strong className="text-amber-400">{conversionRate}%</strong>. To guarantee multiple offers before the hard cutoff, you must sustain a velocity of at least <strong className="text-emerald-400">{isPanicMode ? '30' : dailyPaceNeeded} applications per day</strong>.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-3 border-t border-[#222438] pt-4">
              <button
                onClick={handlePrintReport}
                className="bg-[#1a1d2e] hover:bg-[#252a42] text-white border border-[#333752] font-mono text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-2 cursor-pointer"
              >
                <Printer className="w-4 h-4 text-amber-400" />
                <span>Print / Save as PDF</span>
              </button>

              <button
                onClick={() => setIsOpen(false)}
                className="bg-blue-600 hover:bg-blue-500 text-white font-mono text-xs font-bold px-4 py-2 rounded-xl cursor-pointer"
              >
                Close Audit Report
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
