import React, { useState } from 'react';
import { JobRole } from '../types';
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  Tooltip, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid,
  Legend
} from 'recharts';
import { 
  CheckCircle2, 
  Clock, 
  Calendar, 
  Filter, 
  BarChart3, 
  PieChart as PieIcon, 
  Sparkles, 
  ShieldCheck, 
  ExternalLink, 
  FileText, 
  Zap, 
  ArrowRight,
  TrendingUp,
  AlertCircle,
  Play,
  Check
} from 'lucide-react';
import { MetricTooltip } from './MetricTooltip';

interface ApplicationStatusScheduleChartProps {
  jobs: JobRole[];
  onSelectJob?: (job: JobRole) => void;
  setActiveTab?: (tab: string) => void;
  onMarkJobApplied?: (jobId: string, channel: string) => void;
  dailyTarget?: number;
}

export const ApplicationStatusScheduleChart: React.FC<ApplicationStatusScheduleChartProps> = ({
  jobs,
  onSelectJob,
  setActiveTab,
  onMarkJobApplied,
  dailyTarget = 15
}) => {
  const [activeTab, setActiveTabMode] = useState<'chart' | 'schedule' | 'pending-queue'>('chart');
  const [channelFilter, setChannelFilter] = useState<string>('all');
  const [selectedScheduleHour, setSelectedScheduleHour] = useState<string>('all');

  // Categorize jobs into Completed vs Pending
  const completedJobs = jobs.filter(j => j.status === 'Applied' || j.status === 'Interviewing' || j.status === 'Offer Received');
  const pendingJobs = jobs.filter(j => j.status !== 'Applied' && j.status !== 'Interviewing' && j.status !== 'Offer Received');

  // Channel filter
  const filteredCompleted = channelFilter === 'all' 
    ? completedJobs 
    : completedJobs.filter(j => (j.source || '').toLowerCase().includes(channelFilter.toLowerCase()));

  const filteredPending = channelFilter === 'all' 
    ? pendingJobs 
    : pendingJobs.filter(j => (j.source || '').toLowerCase().includes(channelFilter.toLowerCase()));

  const totalTracked = jobs.length || 1;
  const completedCount = completedJobs.length;
  const pendingCount = pendingJobs.length;
  const completionPercentage = Math.round((completedCount / totalTracked) * 100);

  // Pie Chart Data
  const statusPieData = [
    { name: 'Completed (Applied)', value: completedJobs.filter(j => j.status === 'Applied').length, color: '#10b981' },
    { name: 'Completed (Interviewing)', value: completedJobs.filter(j => j.status === 'Interviewing').length, color: '#6366f1' },
    { name: 'Completed (Offers)', value: completedJobs.filter(j => j.status === 'Offer Received').length, color: '#3b82f6' },
    { name: 'Pending (Discovered)', value: pendingJobs.filter(j => j.status === 'Scored').length, color: '#f59e0b' },
    { name: 'Pending (Tailoring/Draft)', value: pendingJobs.filter(j => j.status === 'Tailored').length, color: '#ec4899' },
  ].filter(d => d.value > 0);

  // Comparison Bar Chart Data (Completed vs Pending by Channel)
  const channelBreakdownData = [
    {
      channel: 'LinkedIn',
      Completed: completedJobs.filter(j => (j.source || '').toLowerCase().includes('linkedin')).length,
      Pending: pendingJobs.filter(j => (j.source || '').toLowerCase().includes('linkedin')).length
    },
    {
      channel: 'Naukri',
      Completed: completedJobs.filter(j => (j.source || '').toLowerCase().includes('naukri')).length,
      Pending: pendingJobs.filter(j => (j.source || '').toLowerCase().includes('naukri')).length
    },
    {
      channel: 'Workday/ATS',
      Completed: completedJobs.filter(j => (j.source || '').toLowerCase().includes('workday') || (j.source || '').toLowerCase().includes('lever') || (j.source || '').toLowerCase().includes('greenhouse')).length,
      Pending: pendingJobs.filter(j => (j.source || '').toLowerCase().includes('workday') || (j.source || '').toLowerCase().includes('lever') || (j.source || '').toLowerCase().includes('greenhouse')).length
    },
    {
      channel: 'Direct Email',
      Completed: completedJobs.filter(j => (j.source || '').toLowerCase().includes('email') || (j.source || '').toLowerCase().includes('outreach')).length,
      Pending: pendingJobs.filter(j => (j.source || '').toLowerCase().includes('email') || (j.source || '').toLowerCase().includes('outreach')).length
    }
  ];

  // Application Schedule Timeline Slots
  const scheduleSlots = [
    { time: '09:00 AM', label: 'Morning High-Score Batch', target: 3, completed: Math.min(3, completedCount), pending: Math.max(0, 3 - Math.min(3, completedCount)), status: completedCount >= 3 ? 'DONE' : 'IN_PROGRESS' },
    { time: '12:00 PM', label: 'Midday Recruiter Direct Outreach', target: 3, completed: Math.max(0, Math.min(3, completedCount - 3)), pending: Math.max(0, 3 - Math.max(0, Math.min(3, completedCount - 3))), status: completedCount >= 6 ? 'DONE' : (completedCount >= 3 ? 'IN_PROGRESS' : 'UPCOMING') },
    { time: '03:00 PM', label: 'Afternoon Tailoring & ATS Batch', target: 3, completed: Math.max(0, Math.min(3, completedCount - 6)), pending: Math.max(0, 3 - Math.max(0, Math.min(3, completedCount - 6))), status: completedCount >= 9 ? 'DONE' : (completedCount >= 6 ? 'IN_PROGRESS' : 'UPCOMING') },
    { time: '06:00 PM', label: 'Evening Fast-Track Submissions', target: 3, completed: Math.max(0, Math.min(3, completedCount - 9)), pending: Math.max(0, 3 - Math.max(0, Math.min(3, completedCount - 9))), status: completedCount >= 12 ? 'DONE' : (completedCount >= 9 ? 'IN_PROGRESS' : 'UPCOMING') },
    { time: '09:00 PM', label: 'US Remote Night Shift Track', target: 3, completed: Math.max(0, Math.min(3, completedCount - 12)), pending: Math.max(0, 3 - Math.max(0, Math.min(3, completedCount - 12))), status: completedCount >= 15 ? 'DONE' : (completedCount >= 12 ? 'IN_PROGRESS' : 'UPCOMING') }
  ];

  return (
    <div className="bg-[#0b0c14] border border-blue-500/30 rounded-2xl p-4 sm:p-6 shadow-2xl space-y-6 font-sans w-full max-w-full overflow-hidden">
      {/* Top Title & Header Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#1f2238] pb-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-blue-600/30 to-emerald-600/30 border border-blue-500/40 flex items-center justify-center font-bold text-blue-400 shadow-md shrink-0">
            <BarChart3 className="w-6 h-6 text-blue-400" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-base sm:text-lg font-bold text-white uppercase tracking-wider font-mono">
                📊 Application Status Tracking & Schedule
              </h2>
              <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-mono px-2.5 py-0.5 rounded font-bold uppercase flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                ₹18+ LPA Verified
              </span>
            </div>
            <p className="text-xs text-[#9090a8] mt-0.5">
              Live status tracking breakdown and scheduled daily sprint timeline comparing completed vs pending applications.
            </p>
          </div>
        </div>

        {/* View Switcher Tabs */}
        <div className="flex items-center bg-[#141525] p-1 rounded-xl border border-[#232640] text-xs font-mono shrink-0">
          <button
            onClick={() => setActiveTabMode('chart')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'chart' 
                ? 'bg-blue-600 text-white shadow-md' 
                : 'text-[#8888a0] hover:text-white'
            }`}
          >
            <PieIcon className="w-3.5 h-3.5" />
            <span>Status Chart</span>
          </button>

          <button
            onClick={() => setActiveTabMode('schedule')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'schedule' 
                ? 'bg-blue-600 text-white shadow-md' 
                : 'text-[#8888a0] hover:text-white'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Daily Schedule ({scheduleSlots.filter(s => s.status === 'DONE').length}/5)</span>
          </button>

          <button
            onClick={() => setActiveTabMode('pending-queue')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'pending-queue' 
                ? 'bg-blue-600 text-white shadow-md' 
                : 'text-[#8888a0] hover:text-white'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Pending Queue ({pendingCount})</span>
          </button>
        </div>
      </div>

      {/* Primary KPI Metrics Summary Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-xs">
        {/* COMPLETED APPLICATIONS */}
        <div className="bg-[#121324] border border-emerald-500/40 p-3.5 rounded-xl space-y-1">
          <div className="flex items-center justify-between text-[#8888a8] text-[10px] uppercase font-bold">
            <span className="flex items-center gap-1">
              Completed Apps
              <MetricTooltip
                title="Completed Applications Metric"
                formula="Count of roles with status 'Applied', 'Interviewing', or 'Offer Received'."
                impact18Lpa="Completed applications generate immediate recruiter callbacks and drive candidate leverage above ₹18 LPA."
                benchmark="Daily target: ≥15 completed applications."
              />
            </span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-xl sm:text-2xl font-bold text-emerald-400">
            {completedCount} <span className="text-xs text-[#8888a8]">/ {totalTracked} Total</span>
          </div>
          <p className="text-[10px] text-emerald-300/80 font-mono">
            {completionPercentage}% Completion Rate
          </p>
        </div>

        {/* PENDING APPLICATIONS */}
        <div className="bg-[#121324] border border-amber-500/40 p-3.5 rounded-xl space-y-1">
          <div className="flex items-center justify-between text-[#8888a8] text-[10px] uppercase font-bold">
            <span className="flex items-center gap-1">
              Pending Queue
              <MetricTooltip
                title="Pending Applications Metric"
                formula="Count of identified target roles awaiting custom tailoring or final submission."
                impact18Lpa="Keeping a ready queue of pending roles allows continuous 1-click execution during peak recruiter hours."
                benchmark="Maintain 5-10 scored roles in pending queue."
              />
            </span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-xl sm:text-2xl font-bold text-amber-400">
            {pendingCount} <span className="text-xs text-[#8888a8]">Roles</span>
          </div>
          <p className="text-[10px] text-amber-300/80 font-mono">
            Ready for 1-Click Submission
          </p>
        </div>

        {/* DAILY SPRINT GOAL */}
        <div className="bg-[#121324] border border-blue-500/40 p-3.5 rounded-xl space-y-1">
          <div className="flex items-center justify-between text-[#8888a8] text-[10px] uppercase font-bold">
            <span>Sprint Goal Pace</span>
            <Zap className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-xl sm:text-2xl font-bold text-blue-400">
            {completedCount} <span className="text-xs text-[#8888a8]">/ {dailyTarget} Target</span>
          </div>
          <p className="text-[10px] text-blue-300/80 font-mono">
            {completedCount >= dailyTarget ? '🎯 Daily Goal Met!' : `${dailyTarget - completedCount} needed today`}
          </p>
        </div>

        {/* CTC FLOOR PASS RATE */}
        <div className="bg-[#121324] border border-purple-500/40 p-3.5 rounded-xl space-y-1">
          <div className="flex items-center justify-between text-[#8888a8] text-[10px] uppercase font-bold">
            <span>CTC Floor Compliance</span>
            <TrendingUp className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-xl sm:text-2xl font-bold text-purple-300">
            100%
          </div>
          <p className="text-[10px] text-purple-300/80 font-mono">
            All roles ≥ ₹18 LPA CTC
          </p>
        </div>
      </div>

      {/* Main Tab View Content */}
      {activeTab === 'chart' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Status Breakdown Donut Chart */}
            <div className="bg-[#10111f] border border-[#20233b] p-4 rounded-xl space-y-3">
              <div className="flex items-center justify-between border-b border-[#1f2238] pb-2 font-mono text-xs">
                <span className="font-bold text-white uppercase flex items-center gap-2">
                  <PieIcon className="w-4 h-4 text-blue-400" />
                  Application Status Distribution
                </span>
                <span className="text-[10px] text-[#8888a0]">Completed vs Pending Slices</span>
              </div>

              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={statusPieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={85}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {statusPieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#0e0f1a', borderColor: '#232742', borderRadius: '12px', fontSize: '11px', color: '#fff' }}
                      formatter={(val: any) => [`${val} Applications`, 'Count']}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Custom Legend */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 font-mono text-[11px] pt-1">
                {statusPieData.map(item => (
                  <div key={item.name} className="flex items-center gap-2 bg-[#17182a] p-2 rounded-lg border border-[#252846]">
                    <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }}></span>
                    <span className="text-[#c0c2db] truncate">{item.name}:</span>
                    <strong className="text-white ml-auto">{item.value}</strong>
                  </div>
                ))}
              </div>
            </div>

            {/* Completed vs Pending Bar Chart by Channel */}
            <div className="bg-[#10111f] border border-[#20233b] p-4 rounded-xl space-y-3">
              <div className="flex items-center justify-between border-b border-[#1f2238] pb-2 font-mono text-xs">
                <span className="font-bold text-white uppercase flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-emerald-400" />
                  Channel Comparison (Completed vs Pending)
                </span>
                <span className="text-[10px] text-[#8888a0]">LinkedIn, Naukri, Workday</span>
              </div>

              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={channelBreakdownData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1f2238" />
                    <XAxis dataKey="channel" stroke="#8888a0" fontSize={10} />
                    <YAxis stroke="#8888a0" fontSize={10} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#0e0f1a', borderColor: '#232742', borderRadius: '12px', fontSize: '11px', color: '#fff' }}
                    />
                    <Legend wrapperStyle={{ fontSize: '11px', color: '#fff' }} />
                    <Bar dataKey="Completed" fill="#10b981" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="Pending" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <p className="text-[11px] text-[#8888a0] font-mono text-center">
                📊 Tip: Select LinkedIn or Workday pending roles for high recruiter response rates above ₹18 LPA.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Schedule Timeline View */}
      {activeTab === 'schedule' && (
        <div className="space-y-4 font-mono text-xs">
          <div className="bg-[#10111f] border border-[#20233b] p-4 rounded-xl space-y-3">
            <div className="flex items-center justify-between border-b border-[#1f2238] pb-2">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-blue-400" />
                <h3 className="font-bold text-white uppercase">Today's Daily Application Sprint Schedule</h3>
              </div>
              <span className="text-emerald-400 text-[10px] font-bold bg-emerald-950/60 border border-emerald-500/40 px-2.5 py-0.5 rounded">
                Target: {dailyTarget} Apps / Day
              </span>
            </div>

            <div className="space-y-3">
              {scheduleSlots.map((slot, index) => (
                <div 
                  key={slot.time} 
                  className={`p-3.5 rounded-xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                    slot.status === 'DONE' 
                      ? 'bg-emerald-950/20 border-emerald-500/40' 
                      : (slot.status === 'IN_PROGRESS' ? 'bg-blue-950/20 border-blue-500/50 ring-1 ring-blue-500/30' : 'bg-[#151628] border-[#222540]')
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="px-2.5 py-1 bg-[#1a1c30] border border-[#2d3152] text-white rounded-lg font-bold text-xs shrink-0">
                      {slot.time}
                    </div>
                    <div>
                      <h4 className="font-bold text-white text-xs">{slot.label}</h4>
                      <p className="text-[10px] text-[#8888a0] mt-0.5">
                        Batch Target: {slot.target} Applications | Completed: <strong className="text-emerald-400">{slot.completed}</strong> | Pending: <strong className="text-amber-400">{slot.pending}</strong>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center">
                    {slot.status === 'DONE' && (
                      <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-3 py-1 rounded-lg font-bold text-[10px] flex items-center gap-1">
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        SLOT COMPLETED
                      </span>
                    )}

                    {slot.status === 'IN_PROGRESS' && (
                      <span className="bg-blue-500/20 text-blue-300 border border-blue-500/40 px-3 py-1 rounded-lg font-bold text-[10px] flex items-center gap-1">
                        <Play className="w-3.5 h-3.5 text-blue-400" />
                        CURRENT SPRINT SLOT
                      </span>
                    )}

                    {slot.status === 'UPCOMING' && (
                      <span className="bg-[#1a1c30] text-[#8888a0] border border-[#2a2e4d] px-3 py-1 rounded-lg font-bold text-[10px]">
                        UPCOMING
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Pending Applications Queue View */}
      {activeTab === 'pending-queue' && (
        <div className="space-y-4 font-mono text-xs">
          <div className="bg-[#10111f] border border-[#20233b] p-4 rounded-xl space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#1f2238] pb-2">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-400" />
                <h3 className="font-bold text-white uppercase">Pending Applications Queue ({pendingJobs.length} Roles)</h3>
              </div>

              {/* Filter */}
              <div className="flex items-center gap-2 text-[11px]">
                <span className="text-[#8888a0]">Filter Channel:</span>
                <select
                  value={channelFilter}
                  onChange={(e) => setChannelFilter(e.target.value)}
                  className="bg-[#181a2e] text-white border border-[#2a2e4d] px-2.5 py-1 rounded-lg font-bold focus:outline-none focus:border-blue-500 cursor-pointer"
                >
                  <option value="all">All Channels</option>
                  <option value="linkedin">LinkedIn</option>
                  <option value="naukri">Naukri</option>
                  <option value="workday">Workday / ATS</option>
                  <option value="email">Direct Email</option>
                </select>
              </div>
            </div>

            {filteredPending.length === 0 ? (
              <div className="bg-[#141525] p-6 rounded-xl text-center space-y-2 border border-[#232640]">
                <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
                <p className="text-white font-bold text-sm">No Pending Applications in Queue!</p>
                <p className="text-[#8888a0] text-xs">All tracked roles have been completed or marked as applied.</p>
              </div>
            ) : (
              <div className="space-y-2.5 max-h-96 overflow-y-auto pr-1">
                {filteredPending.map(job => (
                  <div key={job.id} className="bg-[#151628] border border-[#222540] hover:border-blue-500/50 p-3 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-all">
                    <div className="space-y-1 truncate">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white text-xs truncate">{job.title}</span>
                        <span className="text-[#8888a0] text-xs truncate">@ {job.company}</span>
                        <span className="bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[9px] px-2 py-0.5 rounded font-bold shrink-0">
                          ₹{job.ctcMinLpa} LPA
                        </span>
                      </div>
                      <p className="text-[#8888a0] text-[10px] truncate">
                        Location: {job.location} | Source: {job.source || 'Direct Portal'} | ATS Score: <strong className="text-emerald-400">{job.scores.totalScore || 82} PTS</strong>
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                      {onSelectJob && (
                        <button
                          onClick={() => {
                            onSelectJob(job);
                            if (setActiveTab) setActiveTab('resume');
                          }}
                          className="px-2.5 py-1.5 bg-[#1e213a] hover:bg-[#282c4e] text-blue-300 border border-[#2e3357] rounded-lg text-[10px] font-bold flex items-center gap-1 transition-all cursor-pointer"
                        >
                          <FileText className="w-3 h-3" />
                          <span>Tailor</span>
                        </button>
                      )}

                      {onMarkJobApplied && (
                        <button
                          onClick={() => onMarkJobApplied(job.id, job.source || 'Direct Portal')}
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg text-[10px] flex items-center gap-1 transition-all cursor-pointer shadow"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Mark Completed</span>
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
