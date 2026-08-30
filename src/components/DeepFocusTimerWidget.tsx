import React, { useState, useEffect } from 'react';
import { JobRole } from '../types';
import { 
  Clock, 
  Play, 
  Pause, 
  RotateCcw, 
  CheckCircle2, 
  Sparkles, 
  Flame, 
  Zap, 
  Target, 
  ShieldCheck, 
  FileText,
  ChevronDown,
  Timer,
  BarChart3
} from 'lucide-react';

export interface DeepFocusSessionLog {
  id: string;
  jobId: string;
  company: string;
  title: string;
  ctc: number;
  durationSeconds: number;
  completedAt: string;
}

interface DeepFocusTimerWidgetProps {
  jobs: JobRole[];
  onMarkJobApplied?: (jobId: string, channel: string) => void;
  onUpdateJobStatus?: (jobId: string, status: any) => void;
  onSelectJob?: (job: JobRole) => void;
}

export const DeepFocusTimerWidget: React.FC<DeepFocusTimerWidgetProps> = ({
  jobs,
  onMarkJobApplied,
  onUpdateJobStatus,
  onSelectJob
}) => {
  const [selectedJobId, setSelectedJobId] = useState<string>('');
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [secondsElapsed, setSecondsElapsed] = useState<number>(0);
  const [focusLogs, setFocusLogs] = useState<DeepFocusSessionLog[]>(() => {
    try {
      const saved = localStorage.getItem('deep_focus_session_logs');
      return saved ? JSON.parse(saved) : [
        { id: 'f-1', jobId: 'job-stripe', company: 'Stripe', title: 'Staff SWE', ctc: 24, durationSeconds: 382, completedAt: 'Today 03:15 PM' },
        { id: 'f-2', jobId: 'job-coinbase', company: 'Coinbase', title: 'Senior AI Engineer', ctc: 26, durationSeconds: 295, completedAt: 'Today 02:40 PM' }
      ];
    } catch (e) {
      return [];
    }
  });

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Initialize selected job if empty
  useEffect(() => {
    if (!selectedJobId && jobs.length > 0) {
      const unapplied = jobs.find(j => j.status !== 'Applied' && j.status !== 'Interviewing' && j.status !== 'Offer Received');
      if (unapplied) setSelectedJobId(unapplied.id);
      else setSelectedJobId(jobs[0].id);
    }
  }, [jobs, selectedJobId]);

  // Stopwatch timer effect
  useEffect(() => {
    let interval: any = null;
    if (isRunning) {
      interval = setInterval(() => {
        setSecondsElapsed(prev => prev + 1);
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isRunning]);

  const activeJob = jobs.find(j => j.id === selectedJobId) || jobs[0];

  const formatTime = (totalSecs: number) => {
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStartTimer = () => {
    setIsRunning(true);
  };

  const handlePauseTimer = () => {
    setIsRunning(false);
  };

  const handleResetTimer = () => {
    setIsRunning(false);
    setSecondsElapsed(0);
  };

  const handleCompleteFocusSession = () => {
    if (!activeJob) return;

    const formattedDur = `${Math.floor(secondsElapsed / 60)}m ${secondsElapsed % 60}s`;
    
    // Log focus session
    const newLog: DeepFocusSessionLog = {
      id: `focus-${Date.now()}`,
      jobId: activeJob.id,
      company: activeJob.company,
      title: activeJob.title,
      ctc: activeJob.ctcMinLpa || 18,
      durationSeconds: Math.max(15, secondsElapsed),
      completedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const updatedLogs = [newLog, ...focusLogs];
    setFocusLogs(updatedLogs);
    try {
      localStorage.setItem('deep_focus_session_logs', JSON.stringify(updatedLogs));
    } catch (e) {}

    // Mark job as applied
    if (onMarkJobApplied) {
      onMarkJobApplied(activeJob.id, activeJob.source || 'Deep Focus Session');
    } else if (onUpdateJobStatus) {
      onUpdateJobStatus(activeJob.id, 'Applied');
    }

    setToastMessage(`⚡ Deep Focus Completed (${formattedDur})! Marked '${activeJob.company}' as Applied.`);
    setTimeout(() => setToastMessage(null), 4000);

    // Reset timer
    setIsRunning(false);
    setSecondsElapsed(0);
  };

  // Stats calculation
  const totalFocusSeconds = focusLogs.reduce((acc, l) => acc + l.durationSeconds, 0);
  const avgDurationSecs = focusLogs.length > 0 ? Math.round(totalFocusSeconds / focusLogs.length) : 0;
  const fastestSecs = focusLogs.length > 0 ? Math.min(...focusLogs.map(l => l.durationSeconds)) : 0;

  return (
    <div className="bg-[#0b0c14] border border-blue-500/30 hover:border-blue-500/50 rounded-2xl p-5 shadow-xl space-y-4 font-sans relative overflow-hidden transition-all">
      {/* Background ambient glow */}
      <div className="absolute -top-10 -left-10 w-40 h-40 bg-blue-600/10 rounded-full blur-2xl pointer-events-none"></div>

      {/* Toast Alert */}
      {toastMessage && (
        <div className="bg-emerald-500/20 border border-emerald-500/50 text-emerald-200 px-3.5 py-2 rounded-xl text-xs font-mono font-bold flex items-center gap-2 shadow-xl">
          <Sparkles className="w-4 h-4 text-emerald-300 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#1f2238] pb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/40 flex items-center justify-center font-bold text-amber-400 shadow-md">
            <Timer className="w-5 h-5 text-amber-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-white uppercase tracking-wider font-mono">
                ⚡ Deep Focus Tailor & Apply Timer
              </h3>
              <span className="bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-mono px-2 py-0.5 rounded font-bold uppercase flex items-center gap-1">
                <Flame className="w-3 h-3 text-amber-400" />
                HIGH VELOCITY MODE
              </span>
            </div>
            <p className="text-xs text-[#9090a8] mt-0.5">
              Track exact tailoring and application time for targeted roles to optimize application throughput for ₹18+ LPA positions.
            </p>
          </div>
        </div>

        {/* Aggregate Focus Stats Badges */}
        <div className="flex items-center gap-2 font-mono text-xs">
          <div className="bg-[#131424] border border-[#232742] px-3 py-1.5 rounded-xl flex items-center gap-2">
            <Clock className="w-3.5 h-3.5 text-blue-400" />
            <span className="text-[#8888a0]">Avg Apply Time:</span>
            <span className="text-white font-bold">{formatTime(avgDurationSecs)}</span>
          </div>

          <div className="bg-[#131424] border border-[#232742] px-3 py-1.5 rounded-xl flex items-center gap-2">
            <Zap className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-[#8888a0]">Fastest Session:</span>
            <span className="text-emerald-300 font-bold">{formatTime(fastestSecs)}</span>
          </div>
        </div>
      </div>

      {/* Timer Controls & Active Role Selection Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Left: Role Selector & Focus Prompt */}
        <div className="bg-[#10111d] p-4 rounded-xl border border-[#20233a] space-y-3 font-mono text-xs">
          <label className="text-[#8888a0] font-bold uppercase block text-[10px]">
            Target Role for Deep Focus Session:
          </label>

          <select
            value={selectedJobId}
            onChange={(e) => {
              setSelectedJobId(e.target.value);
              setSecondsElapsed(0);
              setIsRunning(false);
            }}
            className="w-full bg-[#181a2e] text-white border border-[#2a2e4d] p-2.5 rounded-xl font-bold focus:outline-none focus:border-blue-500 cursor-pointer"
          >
            {jobs.map(j => (
              <option key={j.id} value={j.id}>
                {j.company} - {j.title} (₹{j.ctcMinLpa || 18} LPA) • [{j.status}]
              </option>
            ))}
          </select>

          {activeJob && (
            <div className="bg-[#17182a] p-3 rounded-lg border border-[#252846] space-y-1.5 text-[11px] font-sans">
              <div className="flex items-center justify-between">
                <span className="font-bold text-white">{activeJob.title}</span>
                <span className="text-amber-300 font-bold font-mono">₹{activeJob.ctcMinLpa} LPA Floor</span>
              </div>
              <p className="text-[#9090a8] text-[11px] truncate">
                Location: {activeJob.location} | Source: {activeJob.source || 'Direct Portal'}
              </p>

              {onSelectJob && (
                <button
                  onClick={() => onSelectJob(activeJob)}
                  className="text-blue-400 hover:text-blue-300 font-mono text-[10px] font-bold flex items-center gap-1 underline pt-1 cursor-pointer"
                >
                  <FileText className="w-3 h-3" />
                  <span>Open Full Resume Tailor for this Role ➔</span>
                </button>
              )}
            </div>
          )}
        </div>

        {/* Right: Stopwatch Display & Main Buttons */}
        <div className="bg-[#10111d] p-4 rounded-xl border border-[#20233a] flex flex-col justify-between items-center space-y-3">
          <div className="text-center space-y-1">
            <span className="text-[10px] font-mono text-[#8888a0] uppercase font-bold tracking-widest block">
              DEEP FOCUS ELAPSED TIME
            </span>
            <div className="text-4xl font-mono font-black text-white tracking-widest bg-[#181a2e] px-6 py-2 rounded-2xl border border-blue-500/40 shadow-inner inline-block">
              {formatTime(secondsElapsed)}
            </div>
          </div>

          <div className="flex items-center gap-2 w-full justify-center font-mono text-xs">
            {!isRunning ? (
              <button
                onClick={handleStartTimer}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl flex items-center gap-2 transition-all cursor-pointer shadow-lg shadow-emerald-950/50"
              >
                <Play className="w-4 h-4" />
                <span>Start Focus Session</span>
              </button>
            ) : (
              <button
                onClick={handlePauseTimer}
                className="px-5 py-2.5 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-xl flex items-center gap-2 transition-all cursor-pointer shadow-lg shadow-amber-950/50"
              >
                <Pause className="w-4 h-4" />
                <span>Pause Timer</span>
              </button>
            )}

            <button
              onClick={handleResetTimer}
              className="p-2.5 bg-[#181a2e] hover:bg-[#20233d] text-[#8888a0] hover:text-white border border-[#292d4c] rounded-xl transition-all cursor-pointer"
              title="Reset Timer"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            <button
              onClick={handleCompleteFocusSession}
              disabled={secondsElapsed < 5}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white font-bold rounded-xl flex items-center gap-2 transition-all cursor-pointer shadow-lg shadow-blue-950/50"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Mark Applied & Log Stats</span>
            </button>
          </div>
        </div>
      </div>

      {/* Focus History Log preview */}
      {focusLogs.length > 0 && (
        <div className="bg-[#0f101b] border border-[#1f2238] p-3 rounded-xl space-y-2 font-mono text-xs">
          <div className="flex items-center justify-between text-[#8888a0] text-[10px] font-bold uppercase">
            <span>Recent Deep Focus Session Logs:</span>
            <span>{focusLogs.length} Sessions Logged</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
            {focusLogs.slice(0, 4).map(log => (
              <div key={log.id} className="bg-[#151628] p-2 rounded-lg border border-[#222540] flex items-center justify-between">
                <div className="truncate">
                  <span className="font-bold text-white block truncate">{log.company} - {log.title}</span>
                  <span className="text-[10px] text-[#8888a0]">{log.completedAt}</span>
                </div>
                <span className="text-emerald-300 font-bold bg-emerald-950/50 border border-emerald-500/30 px-2 py-0.5 rounded text-[10px] shrink-0 ml-2">
                  ⏱️ {formatTime(log.durationSeconds)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
