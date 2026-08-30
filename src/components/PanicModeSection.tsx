import React, { useState } from 'react';
import { 
  Flame, 
  AlertTriangle, 
  Zap, 
  CheckCircle2, 
  Clock, 
  Target, 
  ShieldAlert, 
  ArrowRight, 
  Sparkles, 
  Crosshair, 
  UserCheck 
} from 'lucide-react';
import { JobRole } from '../types';

interface PanicModeSectionProps {
  isPanicMode: boolean;
  onTogglePanicMode: () => void;
  jobs: JobRole[];
  onSelectJob?: (job: JobRole) => void;
  setActiveTab?: (tab: string) => void;
}

interface DailySprintTask {
  id: string;
  timeSlot: string;
  title: string;
  description: string;
  completed: boolean;
  intensity: 'EXTREME' | 'HIGH' | 'CRITICAL';
}

export const PanicModeSection: React.FC<PanicModeSectionProps> = ({
  isPanicMode,
  onTogglePanicMode,
  jobs,
  onSelectJob,
  setActiveTab
}) => {
  const [sprintTasks, setSprintTasks] = useState<DailySprintTask[]>([
    {
      id: 'task-1',
      timeSlot: '07:00 AM - 08:30 AM',
      title: 'Batch Gmail Outreach to 15 Target HR Heads',
      description: 'Execute automated 1-click personalized pitch emails with PDF resume attachments.',
      completed: true,
      intensity: 'EXTREME'
    },
    {
      id: 'task-2',
      timeSlot: '09:00 AM - 11:00 AM',
      title: 'Apply to 10 High-CTC Roles (₹22L+ Floor)',
      description: 'Focus on US Night Shift & Bangalore remote engineering roles using platform tracker.',
      completed: false,
      intensity: 'CRITICAL'
    },
    {
      id: 'task-3',
      timeSlot: '01:00 PM - 02:30 PM',
      title: 'Upload Updated Certification & Re-tailor ATS Score',
      description: 'Incorporate latest cloud certifications into base resume to boost ATS score past 92.',
      completed: false,
      intensity: 'HIGH'
    },
    {
      id: 'task-4',
      timeSlot: '04:00 PM - 05:30 PM',
      title: 'Recruiter Coach Simulation Drill',
      description: 'Pass 3 high-intensity mock interview scenarios with AI Recruiter Headhunter.',
      completed: false,
      intensity: 'EXTREME'
    },
    {
      id: 'task-5',
      timeSlot: '07:00 PM - 08:30 PM',
      title: 'Direct LinkedIn Recruiter InMail Blitz',
      description: 'Send direct InMail follow-ups to hiring managers for active interview pipelines.',
      completed: false,
      intensity: 'CRITICAL'
    }
  ]);

  const toggleTask = (id: string) => {
    setSprintTasks(prev =>
      prev.map(t => (t.id === id ? { ...t, completed: !t.completed } : t))
    );
  };

  const completedCount = sprintTasks.filter(t => t.completed).length;

  return (
    <div className={`rounded-xl p-5 sm:p-6 shadow-2xl transition-all duration-300 border ${
      isPanicMode 
        ? 'bg-gradient-to-r from-red-950/90 via-[#180a0a] to-amber-950/80 border-red-500/80 ring-1 ring-red-500/40' 
        : 'bg-[#0d0d0f] border-[#1f1f23]'
    }`}>
      {/* Top Controller Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
        <div className="flex items-center gap-3">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 shadow-lg ${
            isPanicMode 
              ? 'bg-red-600 text-white shadow-red-600/50' 
              : 'bg-amber-500/20 border border-amber-500/40 text-amber-400'
          }`}>
            <Flame className={`w-6 h-6 ${isPanicMode ? 'fill-current' : ''}`} />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className={`text-[10px] font-mono px-2 py-0.5 rounded border font-bold uppercase tracking-wider ${
                isPanicMode ? 'bg-red-500/20 text-red-300 border-red-500/40' : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
              }`}>
                {isPanicMode ? '⚠️ 31 AUG DEADLINE EMERGENCY PROTOCOL' : 'HYPER-INTENSITY SPRINT ENGINE'}
              </span>
            </div>
            <h2 className="text-lg font-extrabold text-white uppercase tracking-tight mt-1 flex items-center gap-2">
              <span>{isPanicMode ? '31-Day Survival Panic Mode (30 Apps/Day Target)' : 'High-Urgency Panic Mode Sprint'}</span>
            </h2>
          </div>
        </div>

        {/* Panic Toggle Switch */}
        <button
          onClick={onTogglePanicMode}
          className={`px-4 py-2.5 rounded-xl font-mono text-xs font-extrabold uppercase tracking-wider flex items-center gap-2 border cursor-pointer transition-all shadow-xl ${
            isPanicMode
              ? 'bg-red-600 hover:bg-red-500 text-white border-red-400 shadow-red-600/40'
              : 'bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border-amber-500/40'
          }`}
        >
          <Zap className="w-4 h-4 text-amber-400 fill-current" />
          <span>{isPanicMode ? 'DISABLE PANIC MODE' : 'ENABLE PANIC MODE (30 APPS/DAY)'}</span>
        </button>
      </div>

      {/* Panic Mode Active Banner & Task Checklist */}
      {isPanicMode ? (
        <div className="mt-5 space-y-5 animate-fade-in">
          {/* Frightening AI CEO Directive */}
          <div className="bg-red-950/60 border border-red-500/50 p-4 rounded-xl flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
            <div className="text-xs space-y-1">
              <p className="text-white font-bold uppercase tracking-wide">
                🔥 AI CEO DIRECTIVE: 31 AUGUST 2026 HARD DEADLINE LOCK
              </p>
              <p className="text-red-200 leading-relaxed">
                <strong className="text-white">Time is running out!</strong> The target deadline is strictly 31 August 2026. Daily application target is automatically scaled to <strong>30 Applications/Day</strong>. AI Agents are set to max aggressiveness for cold recruiter outreach.
              </p>
            </div>
          </div>

          {/* Daily Sprint Checklist */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-extrabold text-white uppercase tracking-wider flex items-center gap-1.5">
                <Target className="w-4 h-4 text-red-400" />
                <span>Today's High-Intensity Execution Checklist ({completedCount}/{sprintTasks.length} Completed)</span>
              </span>
              <span className="text-amber-400 font-mono font-bold">
                {Math.round((completedCount / sprintTasks.length) * 100)}% Execution Score
              </span>
            </div>

            <div className="space-y-2">
              {sprintTasks.map((task) => (
                <div
                  key={task.id}
                  onClick={() => toggleTask(task.id)}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                    task.completed
                      ? 'bg-emerald-950/20 border-emerald-500/30 text-emerald-300 opacity-80'
                      : 'bg-[#150a0a] border-red-500/40 hover:border-red-400 text-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 ${
                      task.completed ? 'bg-emerald-500 border-emerald-400 text-black' : 'border-red-500/50 bg-black/40'
                    }`}>
                      {task.completed && <CheckCircle2 className="w-4 h-4 text-black stroke-[3]" />}
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono text-amber-400 font-bold">{task.timeSlot}</span>
                        <span className={`text-[9px] font-mono px-1.5 py-0.2 rounded font-bold uppercase ${
                          task.intensity === 'EXTREME' ? 'bg-red-500/30 text-red-300 border border-red-500/40' : 'bg-amber-500/30 text-amber-300'
                        }`}>
                          {task.intensity}
                        </span>
                      </div>
                      <h4 className={`text-sm font-bold ${task.completed ? 'line-through text-emerald-400' : 'text-white'}`}>
                        {task.title}
                      </h4>
                      <p className="text-xs text-[#a0a0b0] mt-0.5 line-clamp-1">
                        {task.description}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (setActiveTab) setActiveTab('outreach');
                    }}
                    className="bg-red-600/30 hover:bg-red-600/50 text-red-200 border border-red-500/40 text-[11px] font-bold px-3 py-1.5 rounded-lg shrink-0 flex items-center gap-1 cursor-pointer"
                  >
                    <span>Execute</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="mt-4 text-xs text-[#888898] flex items-center justify-between">
          <span>Standard daily cadence target active (10 Applications/Day). Enable Panic Mode to trigger 30 Apps/Day Emergency Sprints.</span>
          <span className="font-mono text-amber-400 font-bold">Target: 31 August 2026</span>
        </div>
      )}
    </div>
  );
};
