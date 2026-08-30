import React, { useState } from 'react';
import { 
  Calendar, 
  CheckSquare, 
  Clock, 
  Plus, 
  Bot, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle, 
  Play, 
  UserCheck, 
  Target, 
  Trash2, 
  Zap, 
  ShieldAlert,
  ArrowRight
} from 'lucide-react';

export interface SprintTask {
  id: string;
  title: string;
  ownerAgentName: string;
  ownerAgentRole: string;
  targetQuota: string;
  deadline: string; // e.g., "22:00 UTC (In 4h)"
  priority: 'CRITICAL' | 'HIGH' | 'NORMAL';
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'LAGGING';
  progressPercentage: number;
}

export const INITIAL_SPRINT_TASKS: SprintTask[] = [
  {
    id: 'sprint-101',
    title: 'Submit 8 Staff/Principal Backend Engineer Applications via Workday Portal',
    ownerAgentName: 'Workday 1-Click Bot',
    ownerAgentRole: 'Portal Submissions',
    targetQuota: '8 Applications',
    deadline: 'Today 18:00 UTC',
    priority: 'CRITICAL',
    status: 'IN_PROGRESS',
    progressPercentage: 75
  },
  {
    id: 'sprint-102',
    title: 'Tailor Resumes & Extract Keywords for 10 Fintech/AI Startup Listings',
    ownerAgentName: 'ATS Resume Architect',
    ownerAgentRole: 'Keyword Optimization',
    targetQuota: '10 Custom Resumes',
    deadline: 'Today 16:30 UTC',
    priority: 'HIGH',
    status: 'COMPLETED',
    progressPercentage: 100
  },
  {
    id: 'sprint-103',
    title: 'Direct Email Outreach to 5 Engineering VP / Hiring Managers',
    ownerAgentName: 'Outreach Specialist',
    ownerAgentRole: 'Recruiter Direct Contact',
    targetQuota: '5 Cold Emails Delivered',
    deadline: 'Today 21:00 UTC',
    priority: 'CRITICAL',
    status: 'IN_PROGRESS',
    progressPercentage: 60
  },
  {
    id: 'sprint-104',
    title: 'Filter & Mine 12 Verified Headhunter Contacts on LinkedIn & Naukri',
    ownerAgentName: 'Headhunter Lead Scraper',
    ownerAgentRole: 'Contact Scraper',
    targetQuota: '12 Verified Contacts',
    deadline: 'Today 20:00 UTC',
    priority: 'NORMAL',
    status: 'LAGGING',
    progressPercentage: 30
  }
];

interface DailySprintPlannerProps {
  onTriggerAgentLoop?: () => void;
  isSyncing?: boolean;
}

export const DailySprintPlanner: React.FC<DailySprintPlannerProps> = ({
  onTriggerAgentLoop,
  isSyncing = false
}) => {
  const [tasks, setTasks] = useState<SprintTask[]>(INITIAL_SPRINT_TASKS);
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Modal Form State
  const [title, setTitle] = useState('');
  const [ownerAgentName, setOwnerAgentName] = useState('Outreach Specialist');
  const [targetQuota, setTargetQuota] = useState('5 Direct Submissions');
  const [deadline, setDeadline] = useState('Today 22:00 UTC');
  const [priority, setPriority] = useState<'CRITICAL' | 'HIGH' | 'NORMAL'>('HIGH');

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleToggleStatus = (id: string) => {
    setTasks(prev => prev.map(t => {
      if (t.id === id) {
        let newStatus: SprintTask['status'] = 'IN_PROGRESS';
        let newProgress = 50;

        if (t.status === 'PENDING') {
          newStatus = 'IN_PROGRESS';
          newProgress = 50;
        } else if (t.status === 'IN_PROGRESS' || t.status === 'LAGGING') {
          newStatus = 'COMPLETED';
          newProgress = 100;
          showToast(`🎉 Task Completed! '${t.ownerAgentName}' fulfilled target: ${t.targetQuota}`);
        } else if (t.status === 'COMPLETED') {
          newStatus = 'PENDING';
          newProgress = 0;
        }

        return {
          ...t,
          status: newStatus,
          progressPercentage: newProgress
        };
      }
      return t;
    }));
  };

  const handleDeleteTask = (id: string) => {
    setTasks(prev => prev.filter(t => t.id !== id));
    showToast('🗑️ CEO Task deleted from daily sprint planner.');
  };

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !ownerAgentName) return;

    const newTask: SprintTask = {
      id: `sprint-${Date.now()}`,
      title,
      ownerAgentName,
      ownerAgentRole: 'Delegated Auxiliary Role',
      targetQuota,
      deadline,
      priority,
      status: 'IN_PROGRESS',
      progressPercentage: 20
    };

    setTasks(prev => [newTask, ...prev]);
    setShowCreateModal(false);
    setTitle('');
    showToast(`🎯 CEO Delegated Task! Assigned '${ownerAgentName}' to target: ${targetQuota}`);
  };

  const completedCount = tasks.filter(t => t.status === 'COMPLETED').length;
  const totalCount = tasks.length;
  const overallPercentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return (
    <div className="bg-[#0d0d0f] border border-[#1f1f28] hover:border-purple-500/30 rounded-2xl p-5 sm:p-6 shadow-2xl space-y-5 font-sans relative overflow-hidden transition-all">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="bg-purple-500/20 border border-purple-500/50 text-purple-200 px-4 py-2.5 rounded-xl text-xs font-mono font-bold flex items-center gap-2 animate-bounce shadow-xl">
          <Sparkles className="w-4 h-4 text-purple-300 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#1c1d28] pb-3.5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-500/15 border border-purple-500/40 flex items-center justify-center font-bold text-purple-400 shadow-md">
            <Calendar className="w-5 h-5 text-purple-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-white uppercase tracking-wider font-mono">
                24-Hour Daily Sprint Task Planner
              </h3>
              <span className="bg-purple-500/20 text-purple-300 border border-purple-500/40 text-[10px] font-mono px-2 py-0.5 rounded font-bold uppercase flex items-center gap-1">
                <Target className="w-3 h-3 text-purple-300" />
                CEO OPERATIONAL DIRECTIVES
              </span>
            </div>
            <p className="text-xs text-[#9090a8] mt-0.5">
              CEO agent delegates daily 24-hour execution tasks to auxiliary agents with strict SLAs, ownership, and target output quotas.
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-purple-600 hover:bg-purple-500 text-white font-mono text-xs font-bold px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition-all cursor-pointer shadow-lg shadow-purple-950/50"
        >
          <Plus className="w-4 h-4" />
          <span>Assign 24h Sprint Task</span>
        </button>
      </div>

      {/* Sprint Operational Progress Bar */}
      <div className="bg-[#12131e] border border-[#23263d] p-3.5 rounded-xl space-y-2 font-mono text-xs">
        <div className="flex items-center justify-between text-[#8888a0]">
          <span className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-amber-400" />
            <span>Daily 24-Hour Sprint Output Goal:</span>
            <strong className="text-white">{completedCount} / {totalCount} Tasks Completed</strong>
          </span>
          <span className="text-purple-300 font-bold">{overallPercentage}% Execution Pace</span>
        </div>

        <div className="w-full h-2.5 bg-[#181a28] rounded-full overflow-hidden p-0.5 border border-[#2a2d48]">
          <div 
            className="h-full bg-gradient-to-r from-purple-500 via-blue-500 to-emerald-400 rounded-full transition-all duration-500"
            style={{ width: `${overallPercentage}%` }}
          ></div>
        </div>
      </div>

      {/* Task List Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        {tasks.map(task => {
          const isCompleted = task.status === 'COMPLETED';
          const isLagging = task.status === 'LAGGING';

          return (
            <div
              key={task.id}
              className={`bg-[#11121d] border rounded-2xl p-4 space-y-3 transition-all ${
                isCompleted
                  ? 'border-emerald-500/40 bg-emerald-950/10'
                  : isLagging
                  ? 'border-amber-500/50 bg-amber-950/10'
                  : 'border-[#202336] hover:border-purple-500/40'
              }`}
            >
              {/* Header */}
              <div className="flex items-start justify-between gap-2">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className={`text-[9px] font-mono px-2 py-0.5 rounded font-bold uppercase border ${
                      task.priority === 'CRITICAL'
                        ? 'bg-red-500/20 text-red-300 border-red-500/40'
                        : task.priority === 'HIGH'
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                        : 'bg-blue-500/20 text-blue-300 border-blue-500/40'
                    }`}>
                      {task.priority}
                    </span>
                    <span className={`text-[9px] font-mono px-2 py-0.5 rounded font-bold uppercase border ${
                      isCompleted
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                        : isLagging
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                        : 'bg-purple-500/20 text-purple-300 border-purple-500/40'
                    }`}>
                      {task.status}
                    </span>
                  </div>
                  <h4 className="font-bold text-white text-sm leading-snug">{task.title}</h4>
                </div>

                <button
                  onClick={() => handleDeleteTask(task.id)}
                  className="text-[#666678] hover:text-red-400 p-1 rounded transition-colors"
                  title="Remove Task"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Agent Ownership & Target Metrics */}
              <div className="bg-[#0b0c12] p-2.5 rounded-xl border border-[#1d1f32] space-y-1 font-mono text-xs">
                <div className="flex justify-between text-[#8888a0]">
                  <span>Owner Agent:</span>
                  <span className="text-purple-300 font-bold">{task.ownerAgentName}</span>
                </div>
                <div className="flex justify-between text-[#8888a0]">
                  <span>Target Quota:</span>
                  <span className="text-amber-300 font-bold">{task.targetQuota}</span>
                </div>
                <div className="flex justify-between text-[#8888a0]">
                  <span>SLA Deadline:</span>
                  <span className="text-blue-300 font-bold">{task.deadline}</span>
                </div>
              </div>

              {/* Progress & Quick Toggle Action */}
              <div className="flex items-center justify-between gap-3 pt-1">
                <div className="flex-1 space-y-1 font-mono text-[10px]">
                  <div className="flex justify-between text-[#8888a0]">
                    <span>Task Progress</span>
                    <span className="text-white font-bold">{task.progressPercentage}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-[#181a28] rounded-full overflow-hidden">
                    <div 
                      className={`h-full transition-all duration-300 ${
                        isCompleted ? 'bg-emerald-400' : isLagging ? 'bg-amber-400' : 'bg-purple-500'
                      }`}
                      style={{ width: `${task.progressPercentage}%` }}
                    ></div>
                  </div>
                </div>

                <button
                  onClick={() => handleToggleStatus(task.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-md ${
                    isCompleted
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30'
                      : 'bg-purple-600 text-white hover:bg-purple-500'
                  }`}
                >
                  {isCompleted ? (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Done</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-3.5 h-3.5 text-white" />
                      <span>Advance</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* CREATE TASK MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fade-in">
          <div className="bg-[#0c0d14] border border-purple-500/40 rounded-2xl w-full max-w-lg p-5 sm:p-6 shadow-2xl space-y-4 text-white font-sans">
            <div className="flex items-center justify-between border-b border-[#1f2238] pb-3">
              <h3 className="text-base font-bold font-mono text-white uppercase tracking-wider flex items-center gap-2">
                <Plus className="w-4 h-4 text-purple-400" />
                Assign 24h CEO Sprint Task Directive
              </h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-[#888898] hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateTask} className="space-y-3 text-xs font-mono">
              <div>
                <label className="block text-[#a0a0b8] uppercase mb-1">Task Directive Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Send cold InMail to 6 Hiring Managers at Microsoft & Google"
                  className="w-full bg-[#11121d] text-white p-2.5 rounded-xl border border-[#202235] focus:outline-none focus:border-purple-500"
                  required
                />
              </div>

              <div>
                <label className="block text-[#a0a0b8] uppercase mb-1">Assigned Auxiliary Agent</label>
                <select
                  value={ownerAgentName}
                  onChange={(e) => setOwnerAgentName(e.target.value)}
                  className="w-full bg-[#11121d] text-white p-2.5 rounded-xl border border-[#202235] focus:outline-none focus:border-purple-500"
                >
                  <option value="Outreach Specialist">Outreach Specialist (Cold Emailing)</option>
                  <option value="ATS Resume Architect">ATS Resume Architect (Resume Tailoring)</option>
                  <option value="Workday 1-Click Bot">Workday 1-Click Bot (Portal Submissions)</option>
                  <option value="Headhunter Lead Scraper">Headhunter Lead Scraper (Lead Mining)</option>
                  <option value="Compensation Floor Auditor">Compensation Floor Auditor (CTC Filtering)</option>
                </select>
              </div>

              <div>
                <label className="block text-[#a0a0b8] uppercase mb-1">Target Quota</label>
                <input
                  type="text"
                  value={targetQuota}
                  onChange={(e) => setTargetQuota(e.target.value)}
                  placeholder="e.g. 8 Verified Submissions"
                  className="w-full bg-[#11121d] text-white p-2.5 rounded-xl border border-[#202235] focus:outline-none focus:border-purple-500"
                  required
                />
              </div>

              <div>
                <label className="block text-[#a0a0b8] uppercase mb-1">SLA Deadline</label>
                <input
                  type="text"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  placeholder="e.g. Today 22:00 UTC"
                  className="w-full bg-[#11121d] text-white p-2.5 rounded-xl border border-[#202235] focus:outline-none focus:border-purple-500"
                  required
                />
              </div>

              <div>
                <label className="block text-[#a0a0b8] uppercase mb-1">Priority Level</label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as any)}
                  className="w-full bg-[#11121d] text-white p-2.5 rounded-xl border border-[#202235] focus:outline-none focus:border-purple-500"
                >
                  <option value="CRITICAL">CRITICAL (Immediate Action)</option>
                  <option value="HIGH">HIGH (24h Quota)</option>
                  <option value="NORMAL">NORMAL (Standard Pipeline)</option>
                </select>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 bg-[#161828] text-[#888898] hover:text-white rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl font-bold shadow-lg"
                >
                  Assign CEO Sprint Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
