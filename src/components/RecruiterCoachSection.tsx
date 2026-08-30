import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  Flame, 
  ShieldAlert, 
  Clock, 
  RefreshCw, 
  CheckCircle2, 
  Award, 
  Target, 
  HeartHandshake, 
  AlertTriangle,
  Zap,
  ExternalLink,
  Lock,
  MessageSquare,
  TrendingUp,
  Brain,
  Mail,
  FileText
} from 'lucide-react';
import { JobRole } from '../types';

interface RecruiterCoachSectionProps {
  jobs: JobRole[];
  onTriggerAgentLoop: () => void;
  isSyncing: boolean;
  lastSyncTime: Date;
  onOpenBatchEmailModal?: () => void;
  onOpenPlatformTrackerModal?: () => void;
}

export const RecruiterCoachSection: React.FC<RecruiterCoachSectionProps> = ({
  jobs,
  onTriggerAgentLoop,
  isSyncing,
  lastSyncTime,
  onOpenBatchEmailModal,
  onOpenPlatformTrackerModal
}) => {
  const [secondsToNextAutoSync, setSecondsToNextAutoSync] = useState<number>(300); // 5 min auto-refresh cycle
  const [activeTab, setActiveTab] = useState<'pep' | 'secrets' | 'notice'>('pep');

  // Days to target deadline: 31 August 2026
  const targetDate = new Date('2026-08-31T23:59:59');
  const now = new Date();
  const diffTime = targetDate.getTime() - now.getTime();
  const daysLeft = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));

  // Auto Refresh Timer Effect
  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsToNextAutoSync((prev) => {
        if (prev <= 1) {
          onTriggerAgentLoop();
          return 300; // Reset 5 min cycle
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [onTriggerAgentLoop]);

  const formatTimer = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="bg-gradient-to-r from-[#0f1118] via-[#0d0d12] to-[#14101d] border border-blue-500/30 rounded-lg p-5 sm:p-6 shadow-2xl relative overflow-hidden space-y-6">
      {/* Decorative background ambient glows */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none"></div>

      {/* Top Banner: 20-Year Recruiter Coach & Agentic Trigger Header */}
      <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-[#23232a] pb-5">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded flex items-center gap-1.5 shadow-sm">
              <Flame className="w-3.5 h-3.5 text-amber-400 animate-bounce" />
              20-Year Recruiter & Performance Coach Mode
            </span>
            <span className="bg-blue-500/10 text-blue-400 border border-blue-500/30 text-[10px] font-mono uppercase tracking-wider px-2.5 py-1 rounded flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              TARGET DEADLINE: 31 AUGUST 2026 ({daysLeft} DAYS REMAINING)
            </span>
          </div>

          <h2 className="text-xl sm:text-2xl font-black text-white uppercase tracking-tight flex items-center gap-2">
            <span>Executive Job OS Execution Engine</span>
            <span className="text-blue-500 font-mono text-sm font-bold">v2.0</span>
          </h2>

          <p className="text-xs sm:text-sm text-[#a0a0aa] max-w-3xl leading-relaxed">
            Powered by a 20-year veteran hiring manager framework. Continuous autonomous market discovery, strict ₹18 LPA CTC floor enforcement, and tactical mindset conditioning to eliminate job search burnout.
          </p>
        </div>

        {/* Action Trigger Button & Auto Refresh Status */}
        <div className="flex flex-col sm:items-end gap-2.5 shrink-0">
          <div className="flex flex-wrap items-center gap-2">
            {onOpenBatchEmailModal && (
              <button
                onClick={onOpenBatchEmailModal}
                className="bg-red-600/20 hover:bg-red-600/40 text-red-300 border border-red-500/40 text-xs font-bold px-3 py-2 rounded flex items-center gap-1.5 cursor-pointer transition-all shadow-md"
                title="Create batch of Gmail outreach emails with ATS PDF Resumes attached"
              >
                <Mail className="w-3.5 h-3.5 text-red-400" />
                <span>Batch Email & PDF Exporter</span>
              </button>
            )}

            {onOpenPlatformTrackerModal && (
              <button
                onClick={onOpenPlatformTrackerModal}
                className="bg-green-600/20 hover:bg-green-600/40 text-green-300 border border-green-500/40 text-xs font-bold px-3 py-2 rounded flex items-center gap-1.5 cursor-pointer transition-all shadow-md"
                title="Apply 1-by-1 on LinkedIn/Naukri with anti-duplicate tracking & on-the-fly ATS customization"
              >
                <ExternalLink className="w-3.5 h-3.5 text-green-400" />
                <span>1-Click Apply & Tracker</span>
              </button>
            )}

            <button
              onClick={onTriggerAgentLoop}
              disabled={isSyncing}
              className={`bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs uppercase tracking-wider px-4 py-2 rounded flex items-center justify-center gap-2 shadow-xl shadow-blue-900/40 transition-all cursor-pointer border border-blue-400/30 ${
                isSyncing ? 'opacity-75 cursor-wait' : ''
              }`}
            >
              <RefreshCw className={`w-3.5 h-3.5 text-white ${isSyncing ? 'animate-spin' : ''}`} />
              <span>{isSyncing ? 'Scanning...' : '⚡ Agent Loop'}</span>
            </button>
          </div>

          <div className="flex items-center gap-2 text-[10px] text-[#888895] font-mono">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-ping"></span>
            <span>Auto-Refresh Calendar Loop Active • Next sync in <strong className="text-green-400 font-bold">{formatTimer(secondsToNextAutoSync)}</strong></span>
          </div>
        </div>
      </div>

      {/* Main Recruiter Advice & Mindset Section */}
      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Recruiter Coaching Tab Nav & Main Message (8 cols) */}
        <div className="lg:col-span-8 space-y-4">
          <div className="flex items-center gap-2 border-b border-[#1f1f23] pb-2">
            <button
              onClick={() => setActiveTab('pep')}
              className={`px-3 py-1.5 rounded text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 ${
                activeTab === 'pep'
                  ? 'bg-blue-600/20 text-blue-400 border border-blue-500/40 shadow'
                  : 'text-[#888895] hover:text-white'
              }`}
            >
              <HeartHandshake className="w-3.5 h-3.5" />
              Daily Recruiter Pep Talk
            </button>
            <button
              onClick={() => setActiveTab('secrets')}
              className={`px-3 py-1.5 rounded text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 ${
                activeTab === 'secrets'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow'
                  : 'text-[#888895] hover:text-white'
              }`}
            >
              <Brain className="w-3.5 h-3.5" />
              20-Yr Recruiter Hacks
            </button>
            <button
              onClick={() => setActiveTab('notice')}
              className={`px-3 py-1.5 rounded text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 ${
                activeTab === 'notice'
                  ? 'bg-red-500/20 text-red-300 border border-red-500/40 shadow'
                  : 'text-[#888895] hover:text-white'
              }`}
            >
              <Lock className="w-3.5 h-3.5" />
              60-Day Notice Strategy
            </button>
          </div>

          {activeTab === 'pep' && (
            <div className="bg-[#0b0c10] border border-[#1f1f28] rounded-md p-4 space-y-3">
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-amber-400" />
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  Recruiter Coach Reality Check: Overcoming Market Fatigue
                </h3>
              </div>
              <p className="text-xs text-[#c0c0cc] leading-relaxed italic border-l-2 border-amber-500 pl-3">
                “Listen to me closely. This job market can feel like absolute burnout if you treat ghosting personally. As a recruiter who has placed 1,000+ candidates: 80% of applicants send generic resumes that get trashed by ATS filters. You have <strong>8+ years of Gartner Operations leadership</strong>, an <strong>LLB degree</strong>, and <strong>agentic AI / Copilot workflow expertise</strong>. You belong in the top 1% of candidates for ₹22–28 LPA positions.”
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs pt-1">
                <div className="bg-[#141419] p-2.5 rounded border border-[#23232a]">
                  <span className="text-[10px] text-amber-400 font-bold block uppercase">Rule 1: Batch Action</span>
                  <span className="text-[#a0a0aa] text-[11px]">Hit 15 high-score applications daily using 1-click Gmail & PDF exports.</span>
                </div>
                <div className="bg-[#141419] p-2.5 rounded border border-[#23232a]">
                  <span className="text-[10px] text-green-400 font-bold block uppercase">Rule 2: Floor Discipline</span>
                  <span className="text-[#a0a0aa] text-[11px]">Never negotiate below ₹18 LPA. Target range is ₹22–28 LPA.</span>
                </div>
                <div className="bg-[#141419] p-2.5 rounded border border-[#23232a]">
                  <span className="text-[10px] text-blue-400 font-bold block uppercase">Rule 3: Target Aug 31</span>
                  <span className="text-[#a0a0aa] text-[11px]">{daysLeft} days remaining. Every single day counts toward offer closure.</span>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'secrets' && (
            <div className="bg-[#0b0c10] border border-[#1f1f28] rounded-md p-4 space-y-3">
              <div className="flex items-center gap-2">
                <Brain className="w-5 h-5 text-blue-400" />
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  Inside the Recruiter’s Mind: How to Stand Out
                </h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="bg-[#141419] p-3 rounded border border-[#23232a] space-y-1">
                  <span className="font-bold text-blue-400 block">1. The 10-Second Eye Scan</span>
                  <p className="text-[#a0a0aa] text-[11px]">
                    Recruiters look for 3 keywords immediately: <em>Gartner Operations Lead</em>, <em>60% TAT Reduction</em>, and <em>LLB Legal Ops</em>. Our tailored resume places these at the exact top.
                  </p>
                </div>
                <div className="bg-[#141419] p-3 rounded border border-[#23232a] space-y-1">
                  <span className="font-bold text-indigo-400 block">2. Salary Anchoring</span>
                  <p className="text-[#a0a0aa] text-[11px]">
                    When asked for expectations, respond: <em>“Given my Gartner team lead tenure and AI Copilot process automation, I am evaluating roles budgeted between ₹22 and ₹28 LPA.”</em>
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'notice' && (
            <div className="bg-[#0b0c10] border border-red-500/30 rounded-md p-4 space-y-3">
              <div className="flex items-center gap-2">
                <Lock className="w-5 h-5 text-red-400" />
                <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <span>60-Day Notice Period & Stealth Search Protocol</span>
                  <span className="bg-red-500/20 text-red-300 text-[9px] px-2 py-0.5 rounded font-mono">CONFIDENTIAL</span>
                </h3>
              </div>
              <div className="bg-red-950/20 border border-red-500/30 rounded p-3 text-xs space-y-2">
                <div className="flex items-start gap-2 text-red-200">
                  <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-red-300 block">CRITICAL RECRUITER STRATEGY: DO NOT MARK "ON NOTICE PERIOD" IN APPLICATIONS</strong>
                    <p className="text-[#c0c0cc] text-[11px] mt-1">
                      Declaring in applications or cover letters that you are currently "on notice period" weakens competitive leverage and alerts your current ecosystem early.
                    </p>
                  </div>
                </div>
                <div className="border-t border-red-500/20 pt-2 text-[11px] text-[#e0e0e0] space-y-1 font-mono">
                  <p>• <strong>Official Current Notice Period:</strong> 60 Days</p>
                  <p>• <strong>Recruiter Screening Answer:</strong> <em>“My standard notice period is 60 days, but I have accrued leave and alignment with leadership to negotiate an early buyout or 30-day release for the right executive role.”</em></p>
                  <p>• <strong>Target Offer Closing Date:</strong> 31 August 2026</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Key Metric Countdown & Platform Quick Access (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-[#0b0c10] border border-[#1f1f28] rounded-md p-4 space-y-3">
            <span className="text-[10px] font-bold text-[#888895] uppercase tracking-wider block">
              30-Day Sprint Progress Ticker
            </span>

            <div className="flex items-center justify-between">
              <div>
                <span className="text-3xl font-mono font-black text-white">{daysLeft}</span>
                <span className="text-xs text-[#a0a0aa] block">Days to Aug 31 Target</span>
              </div>
              <div className="w-12 h-12 rounded-full border-4 border-blue-500 border-t-amber-400 flex items-center justify-center font-mono font-bold text-xs text-white">
                {Math.round(((60 - daysLeft) / 60) * 100)}%
              </div>
            </div>

            <div className="w-full bg-[#1f1f25] h-2 rounded-full overflow-hidden">
              <div 
                className="bg-gradient-to-r from-blue-500 via-indigo-500 to-amber-400 h-full transition-all duration-500"
                style={{ width: `${Math.min(100, Math.round(((60 - daysLeft) / 60) * 100))}%` }}
              ></div>
            </div>

            <div className="pt-2 border-t border-[#1f1f23] text-[11px] text-[#a0a0aa] space-y-1">
              <div className="flex justify-between">
                <span>Total Jobs Discovered:</span>
                <strong className="text-white font-mono">{jobs.length}</strong>
              </div>
              <div className="flex justify-between">
                <span>Eligible Floor Passed (≥18L):</span>
                <strong className="text-green-400 font-mono">{jobs.filter(j => j.scores.ctcFloorPassed).length}</strong>
              </div>
              <div className="flex justify-between">
                <span>High-Score Roles (≥75):</span>
                <strong className="text-amber-400 font-mono">{jobs.filter(j => j.scores.totalScore >= 75).length}</strong>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
