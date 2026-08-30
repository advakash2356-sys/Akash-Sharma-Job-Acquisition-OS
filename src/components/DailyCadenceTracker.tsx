import React, { useState } from 'react';
import { JobRole, DailyActivityLog, TargetConfig } from '../types';
import { 
  BarChart3, 
  Clock, 
  Calendar, 
  CheckCircle2, 
  Plus, 
  TrendingUp, 
  AlertCircle, 
  Award,
  Send,
  Briefcase,
  Target
} from 'lucide-react';

interface DailyCadenceTrackerProps {
  jobs: JobRole[];
  targetConfig: TargetConfig;
}

export const DailyCadenceTracker: React.FC<DailyCadenceTrackerProps> = ({
  jobs,
  targetConfig
}) => {
  const [logs, setLogs] = useState<DailyActivityLog[]>([
    {
      date: '2026-07-28',
      discovered: 6,
      scored: 6,
      applied: 4,
      outreachSent: 4,
      interviewsBooked: 1,
      offersReceived: 0,
      notes: 'Submitted custom tailored applications to Deloitte USI and Fractal Analytics with cold emails to Gartner Alumni.'
    },
    {
      date: '2026-07-27',
      discovered: 8,
      scored: 8,
      applied: 5,
      outreachSent: 5,
      interviewsBooked: 0,
      offersReceived: 0,
      notes: 'Focused on Legal Ops & CLM roles. Subject line test A resulted in 2 recruiter opens.'
    }
  ]);

  const [newLogNotes, setNewLogNotes] = useState('');
  const [appsTodayInput, setAppsTodayInput] = useState(4);
  const [outreachTodayInput, setOutreachTodayInput] = useState(4);

  // Calculate follow-up alerts (applied > 5 days ago)
  const today = new Date();
  const followUpRoles = jobs.filter(job => {
    if (job.status !== 'Applied') return false;
    if (!job.dateAdded) return false;
    const addedDate = new Date(job.dateAdded);
    const diffDays = Math.floor((today.getTime() - addedDate.getTime()) / (1000 * 3600 * 24));
    return diffDays >= 5;
  });

  const handleAddDailyLog = (e: React.FormEvent) => {
    e.preventDefault();
    const todayStr = new Date().toISOString().split('T')[0];
    const newLog: DailyActivityLog = {
      date: todayStr,
      discovered: 5,
      scored: 5,
      applied: Number(appsTodayInput),
      outreachSent: Number(outreachTodayInput),
      interviewsBooked: 0,
      offersReceived: 0,
      notes: newLogNotes || 'Logged daily operations execution.'
    };

    setLogs(prev => [newLog, ...prev.filter(l => l.date !== todayStr)]);
    setNewLogNotes('');
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-[#0d0d0f] border border-[#1f1f23] rounded p-5 shadow-lg flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-bold text-blue-400 uppercase tracking-wider flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            09:00 – 23:30 Daily Operating Window
          </span>
          <h2 className="text-base font-bold text-white uppercase tracking-wider">
            Execution Cadence & Conversion Engine
          </h2>
          <p className="text-xs text-[#a0a0aa]">
            Target: Minimum {targetConfig.dailyAppTarget} high-score applications / value outreach daily. Strictly follow up after 5 days.
          </p>
        </div>

        <div className="bg-[#0a0a0b] p-3 rounded border border-[#232328] flex items-center gap-4 text-xs font-mono">
          <div className="text-center">
            <span className="text-[#6b6b75] text-[10px] block uppercase tracking-wider">Daily App Target</span>
            <span className="text-base font-bold text-white">{targetConfig.dailyAppTarget} / day</span>
          </div>
          <div className="w-px h-8 bg-[#232328]"></div>
          <div className="text-center">
            <span className="text-[#6b6b75] text-[10px] block uppercase tracking-wider">Follow-Up Cadence</span>
            <span className="text-base font-bold text-green-400">5 Days</span>
          </div>
        </div>
      </div>

      {/* 5-Day Follow-Up Alert Section */}
      {followUpRoles.length > 0 && (
        <div className="bg-[#151518] border border-[#232328] rounded p-4 text-xs space-y-2">
          <div className="flex items-center gap-2 font-bold text-white uppercase tracking-wider">
            <AlertCircle className="w-4 h-4 text-amber-400" />
            <span>Strict 5-Day Follow-Up Cadence Triggered ({followUpRoles.length} Roles)</span>
          </div>
          <p className="text-[#a0a0aa]">
            The following roles were applied &gt; 5 days ago without response. Send follow-up InMail / email today:
          </p>
          <div className="space-y-1.5 pt-1">
            {followUpRoles.map(job => (
              <div key={job.id} className="bg-[#0a0a0b] p-2.5 rounded border border-[#232328] flex items-center justify-between">
                <div>
                  <span className="font-bold text-white">{job.title}</span> — <span className="text-[#a0a0aa]">{job.company}</span>
                  <span className="text-[10px] text-[#6b6b75] ml-2 font-mono">Applied on {job.dateAdded}</span>
                </div>
                <button className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-2.5 py-1 rounded text-[11px] uppercase tracking-wider">
                  Send 5-Day Follow Up
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Daily Logger Form */}
        <div className="bg-[#0d0d0f] border border-[#1f1f23] rounded p-5 shadow-lg space-y-4">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2 border-b border-[#1f1f23] pb-2">
            <Calendar className="w-4 h-4 text-blue-400" />
            Log Today's Operations ({new Date().toISOString().split('T')[0]})
          </h3>

          <form onSubmit={handleAddDailyLog} className="space-y-3 text-xs">
            <div>
              <label className="block text-[#a0a0aa] font-semibold uppercase tracking-wider text-[10px] mb-1">High-Score Applications Sent</label>
              <input
                type="number"
                value={appsTodayInput}
                onChange={(e) => setAppsTodayInput(Number(e.target.value))}
                className="w-full bg-[#0a0a0b] text-white rounded p-2.5 border border-[#232328] focus:outline-none focus:border-blue-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-[#a0a0aa] font-semibold uppercase tracking-wider text-[10px] mb-1">Direct Outreach Messages Sent</label>
              <input
                type="number"
                value={outreachTodayInput}
                onChange={(e) => setOutreachTodayInput(Number(e.target.value))}
                className="w-full bg-[#0a0a0b] text-white rounded p-2.5 border border-[#232328] focus:outline-none focus:border-blue-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-[#a0a0aa] font-semibold uppercase tracking-wider text-[10px] mb-1">Evening Review Notes / A/B Test Findings</label>
              <textarea
                rows={3}
                value={newLogNotes}
                onChange={(e) => setNewLogNotes(e.target.value)}
                placeholder="Record subject line conversion, resume version tested, recruiter feedback..."
                className="w-full bg-[#0a0a0b] text-white rounded p-2.5 border border-[#232328] focus:outline-none focus:border-blue-500 text-xs"
              ></textarea>
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold uppercase tracking-wider p-2.5 rounded text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-blue-900/30 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Save Daily Execution Log
            </button>
          </form>
        </div>

        {/* Right Column: Execution History & Conversion Metrics */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-[#0d0d0f] border border-[#1f1f23] rounded p-5 shadow-lg space-y-4">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2 border-b border-[#1f1f23] pb-2">
              <BarChart3 className="w-4 h-4 text-green-400" />
              Recent Execution Logs & Conversion Feedback
            </h3>

            <div className="space-y-3">
              {logs.map((log, i) => (
                <div key={i} className="bg-[#0a0a0b] p-4 rounded border border-[#232328] space-y-2 text-xs">
                  <div className="flex items-center justify-between border-b border-[#1f1f23] pb-2 font-mono">
                    <span className="font-bold text-white">{log.date} LOG</span>
                    <div className="flex items-center gap-3 text-[#a0a0aa]">
                      <span>Applications: <strong className="text-green-400">{log.applied}</strong></span>
                      <span>Outreach: <strong className="text-blue-400">{log.outreachSent}</strong></span>
                    </div>
                  </div>
                  <p className="text-[#a0a0aa] text-[11px] leading-relaxed">
                    {log.notes}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
