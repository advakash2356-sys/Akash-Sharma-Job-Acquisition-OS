import React, { useState } from 'react';
import { 
  PieChart, 
  Pie, 
  Cell, 
  Tooltip, 
  ResponsiveContainer, 
  Legend 
} from 'recharts';
import { JobRole } from '../types';
import { 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  Briefcase, 
  ExternalLink, 
  Calendar, 
  ChevronRight, 
  X, 
  Sparkles, 
  PieChart as PieIcon,
  Filter,
  ArrowRight,
  ShieldCheck,
  TrendingUp,
  FileText,
  Mail,
  Zap,
  Flame,
  UserCheck
} from 'lucide-react';
import { 
  downloadPDFResume, 
  downloadPDFCoverLetter, 
  executeAndLaunchGmail, 
  getPlatformSearchUrls 
} from '../utils/documentExporter';

interface ApplicationPieTrackerProps {
  jobs: JobRole[];
  onSelectJob: (job: JobRole) => void;
  setActiveTab: (tab: string) => void;
  onMarkJobApplied?: (jobId: string, channel: string) => void;
}

interface SliceData {
  name: string;
  value: number;
  color: string;
  key: 'applied' | 'pending' | 'interviewing' | 'offer' | 'discarded';
  description: string;
  jobs: JobRole[];
}

export const ApplicationPieTracker: React.FC<ApplicationPieTrackerProps> = ({
  jobs,
  onSelectJob,
  setActiveTab,
  onMarkJobApplied
}) => {
  const [selectedSlice, setSelectedSlice] = useState<SliceData | null>(null);
  const [selectedDateFilter, setSelectedDateFilter] = useState<string | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState<boolean>(false);

  // Status Categorization
  const appliedJobs = jobs.filter(j => j.status === 'Applied');
  const pendingJobs = jobs.filter(j => (j.status === 'Scored' || j.status === 'Tailored') && j.scores.ctcFloorPassed);
  const interviewingJobs = jobs.filter(j => j.status === 'Interviewing');
  const offerJobs = jobs.filter(j => j.status === 'Offer Received');
  const discardedJobs = jobs.filter(j => !j.scores.ctcFloorPassed);

  const totalTracked = jobs.length;
  const doneTotal = appliedJobs.length + interviewingJobs.length + offerJobs.length;
  const pendingTotal = pendingJobs.length;

  // Pie Chart Data Slice Configuration
  const slices: SliceData[] = [
    {
      name: 'Applied (Done)',
      value: appliedJobs.length,
      color: '#10b981', // emerald-500
      key: 'applied' as const,
      description: 'Submitted applications awaiting HR response',
      jobs: appliedJobs
    },
    {
      name: 'Pending Application',
      value: pendingJobs.length,
      color: '#f59e0b', // amber-500
      key: 'pending' as const,
      description: 'High-score opportunities ready for 1-click apply or batch outreach',
      jobs: pendingJobs
    },
    {
      name: 'Active Interviews',
      value: interviewingJobs.length,
      color: '#6366f1', // indigo-500
      key: 'interviewing' as const,
      description: 'Active recruiter screens & technical interview rounds',
      jobs: interviewingJobs
    },
    {
      name: 'Offers Received',
      value: offerJobs.length,
      color: '#3b82f6', // blue-500
      key: 'offer' as const,
      description: 'Formal employment offers in evaluation',
      jobs: offerJobs
    },
    {
      name: 'Discarded (<₹18L)',
      value: discardedJobs.length,
      color: '#ef4444', // red-500
      key: 'discarded' as const,
      description: 'Low-ball roles filtered out by the ₹18 LPA hard floor',
      jobs: discardedJobs
    }
  ].filter(s => s.value > 0 || s.key === 'applied' || s.key === 'pending');

  // Daily Application Tracking History (Starting from Today)
  const todayStr = new Date().toISOString().split('T')[0];

  // Group applications by date
  const dateMap: { [date: string]: { applied: JobRole[]; pending: number } } = {};
  
  // Ensure today is always present
  dateMap[todayStr] = { applied: [], pending: pendingJobs.length };

  jobs.forEach(job => {
    if (job.appliedDate) {
      if (!dateMap[job.appliedDate]) {
        dateMap[job.appliedDate] = { applied: [], pending: 0 };
      }
      dateMap[job.appliedDate].applied.push(job);
    }
  });

  // Sort dates descending starting from today
  const sortedDates = Object.keys(dateMap).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

  const handleSliceClick = (slice: SliceData) => {
    setSelectedSlice(slice);
    setIsDetailModalOpen(true);
  };

  const CustomPieTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data: SliceData = payload[0].payload;
      const pct = Math.round((data.value / Math.max(1, totalTracked)) * 100);
      return (
        <div className="bg-[#0f111a] border border-[#2d3148] p-3 rounded-lg shadow-2xl text-xs space-y-1">
          <div className="flex items-center gap-2 font-bold" style={{ color: data.color }}>
            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: data.color }}></span>
            <span>{data.name}</span>
          </div>
          <p className="text-white font-mono font-bold text-sm">
            {data.value} Roles ({pct}%)
          </p>
          <p className="text-[#a0a0b0] text-[11px] leading-tight max-w-xs">
            {data.description}
          </p>
          <p className="text-amber-400 font-mono text-[10px] pt-1">
            ⚡ Click pie slice to inspect all {data.value} roles
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-[#0d0d0f] border border-[#1f1f23] rounded-xl p-5 sm:p-6 shadow-2xl space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#1f1f23] pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-gradient-to-r from-blue-600/20 to-indigo-600/20 text-blue-400 border border-blue-500/30 text-[10px] font-mono px-2.5 py-0.5 rounded font-bold uppercase tracking-wider flex items-center gap-1.5">
              <PieIcon className="w-3.5 h-3.5 text-blue-400" />
              INTERACTIVE PIE ANALYTICS
            </span>
            <span className="bg-green-500/10 text-green-400 border border-green-500/30 text-[10px] font-mono px-2 py-0.5 rounded">
              {doneTotal} DONE • {pendingTotal} PENDING
            </span>
          </div>
          <h2 className="text-lg font-bold text-white uppercase tracking-wider mt-1.5 flex items-center gap-2">
            <span>Application Conversion Pie & Daily History Tracker</span>
          </h2>
          <p className="text-xs text-[#a0a0aa]">
            Interactive pie chart tracking completed vs pending applications. <strong className="text-amber-300">Click any pie slice</strong> to open the detailed target roster.
          </p>
        </div>

        <div className="flex items-center gap-2 font-mono text-xs bg-[#151518] px-3 py-1.5 rounded border border-[#232328] text-[#a0a0aa] shrink-0">
          <Calendar className="w-4 h-4 text-blue-400" />
          <span>Tracking From: <strong className="text-white">{todayStr}</strong></span>
        </div>
      </div>

      {/* Main Grid: Interactive Pie Chart + Category Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        {/* Left Col: Interactive Recharts Pie Chart (Col 6) */}
        <div className="lg:col-span-6 bg-[#13141c] border border-[#222434] rounded-xl p-5 flex flex-col items-center justify-center relative min-h-[300px]">
          <div className="w-full h-64 relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={slices}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={95}
                  paddingAngle={4}
                  dataKey="value"
                  onClick={(entry: any) => handleSliceClick(entry?.payload || entry)}
                  className="cursor-pointer transition-all duration-300 hover:opacity-90"
                >
                  {slices.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.color} 
                      stroke="#0d0d0f" 
                      strokeWidth={2}
                      className="cursor-pointer focus:outline-none hover:scale-105 transition-transform"
                    />
                  ))}
                </Pie>
                <Tooltip content={<CustomPieTooltip />} />
              </PieChart>
            </ResponsiveContainer>

            {/* Inner Center Overlay Count */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-3xl font-mono font-bold text-white leading-none">
                {totalTracked}
              </span>
              <span className="text-[10px] uppercase tracking-wider text-[#888898] mt-1 font-mono">
                Total Roles
              </span>
            </div>
          </div>

          <p className="text-[11px] text-amber-400 font-mono text-center mt-2 flex items-center justify-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
            Click any pie slice to open & inspect detailed applications
          </p>
        </div>

        {/* Right Col: Clickable Category Roster Cards (Col 6) */}
        <div className="lg:col-span-6 space-y-3">
          {slices.map((slice) => {
            const pct = Math.round((slice.value / Math.max(1, totalTracked)) * 100);

            return (
              <div
                key={slice.key}
                onClick={() => handleSliceClick(slice)}
                className="bg-[#13141c] hover:bg-[#181a26] border border-[#222434] hover:border-blue-500/50 rounded-lg p-3.5 transition-all cursor-pointer flex items-center justify-between gap-3 group"
              >
                <div className="flex items-center gap-3">
                  <div 
                    className="w-4 h-10 rounded-full shrink-0 shadow-md"
                    style={{ backgroundColor: slice.color }}
                  ></div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-white group-hover:text-blue-300 transition-colors">
                        {slice.name}
                      </span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-black/40 text-[#a0a0aa]">
                        {pct}%
                      </span>
                    </div>
                    <p className="text-xs text-[#888898] line-clamp-1 mt-0.5">
                      {slice.description}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-lg font-mono font-bold text-white">
                    {slice.value}
                  </span>
                  <ChevronRight className="w-4 h-4 text-[#666] group-hover:text-white group-hover:translate-x-1 transition-all" />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Daily Application Timeline Tracker (Starting from Today) */}
      <div className="bg-[#12131b] border border-[#222432] rounded-xl p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#202230] pb-3">
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Calendar className="w-4 h-4 text-green-400" />
              <span>Daily Application Velocity Log (Tracked Every Day)</span>
            </h3>
            <p className="text-xs text-[#a0a0a0]">
              Continuous daily audit starting from today (<strong className="text-white">{todayStr}</strong>). Verifies consistency against the 15 apps/day target.
            </p>
          </div>

          <div className="text-xs text-green-400 font-mono bg-green-500/10 px-3 py-1 rounded border border-green-500/30 flex items-center gap-1.5 self-start sm:self-auto">
            <CheckCircle2 className="w-3.5 h-3.5 text-green-400" />
            <span>Today Active ({dateMap[todayStr]?.applied.length || 0} Applied)</span>
          </div>
        </div>

        {/* Daily History Row List */}
        <div className="space-y-3">
          {sortedDates.map((date) => {
            const dayAppliedJobs = dateMap[date]?.applied || [];
            const count = dayAppliedJobs.length;
            const isToday = date === todayStr;
            const targetMet = count >= 15;

            return (
              <div 
                key={date}
                className={`p-4 rounded-lg border transition-all ${
                  isToday 
                    ? 'bg-[#161828] border-blue-500/40 shadow-lg' 
                    : 'bg-[#0f1017] border-[#202230]'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg font-mono font-bold text-xs shrink-0 ${
                      isToday ? 'bg-blue-600 text-white' : 'bg-[#181a26] text-[#a0a0aa]'
                    }`}>
                      {isToday ? 'TODAY' : date}
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white text-sm">
                          {count} Applications Completed
                        </span>
                        {targetMet ? (
                          <span className="bg-green-500/20 text-green-300 text-[10px] font-mono px-2 py-0.5 rounded border border-green-500/40 font-bold">
                            Goal Met (≥15)
                          </span>
                        ) : (
                          <span className="bg-amber-500/10 text-amber-400 text-[10px] font-mono px-2 py-0.5 rounded border border-amber-500/30">
                            {isToday ? `${Math.max(0, 15 - count)} Remaining Today` : 'In Progress'}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-[#888898] mt-0.5">
                        {isToday ? 'Daily target active. Tracking all applications submitted today.' : `Historical log for ${date}`}
                      </p>
                    </div>
                  </div>

                  {/* Right: Quick Inspection of Roles applied on this date */}
                  {dayAppliedJobs.length > 0 && (
                    <button
                      onClick={() => {
                        setSelectedSlice({
                          name: `Applications Completed on ${date}`,
                          value: dayAppliedJobs.length,
                          color: '#10b981',
                          key: 'applied',
                          description: `All job applications marked as applied on ${date}`,
                          jobs: dayAppliedJobs
                        });
                        setIsDetailModalOpen(true);
                      }}
                      className="bg-[#1e202e] hover:bg-[#282a3d] text-blue-300 border border-[#32364d] text-xs font-bold px-3 py-1.5 rounded flex items-center gap-1.5 cursor-pointer transition-all self-end sm:self-auto"
                    >
                      <span>View {dayAppliedJobs.length} Roles</span>
                      <ExternalLink className="w-3.5 h-3.5 text-blue-400" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* INTERACTIVE DETAIL DRILL-DOWN MODAL */}
      {isDetailModalOpen && selectedSlice && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-fade-in">
          <div className="bg-[#0f1017] border border-blue-500/40 rounded-xl w-full max-w-4xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-[#121422] via-[#16182a] to-[#0f1017] border-b border-[#222434] p-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div 
                  className="w-10 h-10 rounded-lg flex items-center justify-center font-bold text-white shadow-lg shrink-0"
                  style={{ backgroundColor: selectedSlice.color }}
                >
                  <Briefcase className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white uppercase tracking-tight flex items-center gap-2">
                    <span>{selectedSlice.name} Roster</span>
                    <span className="bg-blue-500/20 text-blue-300 border border-blue-500/40 text-[10px] font-mono px-2 py-0.5 rounded">
                      {selectedSlice.jobs.length} Roles
                    </span>
                  </h2>
                  <p className="text-xs text-[#a0a0aa]">
                    {selectedSlice.description}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsDetailModalOpen(false)}
                className="text-[#888898] hover:text-white p-2 rounded-lg hover:bg-[#1f2130] transition-all cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Role List */}
            <div className="p-5 overflow-y-auto space-y-3 flex-1">
              {selectedSlice.jobs.length === 0 ? (
                <div className="text-center py-10 text-xs text-[#888898]">
                  No roles currently fall under this category.
                </div>
              ) : (
                selectedSlice.jobs.map((job) => {
                  const urls = getPlatformSearchUrls(job.title, job.company);

                  return (
                    <div
                      key={job.id}
                      className="p-4 rounded-lg bg-[#141520] border border-[#222434] hover:border-blue-500/40 transition-all space-y-3"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#202230] pb-2">
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-bold text-white text-base">{job.title}</span>
                            <span className="text-blue-400 text-xs font-semibold">@ {job.company}</span>
                            <span className="bg-green-500/10 text-green-400 border border-green-500/30 text-[10px] font-mono px-2 py-0.5 rounded font-bold">
                              ₹{job.ctcMinLpa}–{job.ctcMaxLpa} LPA
                            </span>
                          </div>
                          <p className="text-xs text-[#a0a0aa] mt-1">
                            {job.location} • {job.shift} • Score: <strong className="text-white font-mono">{job.scores.totalScore}/100</strong>
                          </p>
                        </div>

                        <div className="shrink-0">
                          <span className="text-[10px] font-mono px-2.5 py-1 rounded bg-[#1e202e] text-blue-300 border border-[#2d3148] uppercase tracking-wider font-bold">
                            {job.status}
                          </span>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <button
                            onClick={() => downloadPDFResume(job.title, job.company, job.scores.recommendation)}
                            className="bg-green-600/20 hover:bg-green-600/40 text-green-300 border border-green-500/30 text-xs px-2.5 py-1.5 rounded font-bold flex items-center gap-1 cursor-pointer"
                          >
                            <FileText className="w-3.5 h-3.5 text-green-400" />
                            ATS PDF Resume
                          </button>

                          <button
                            onClick={() => downloadPDFCoverLetter(job.title, job.company, job.contactPerson?.name)}
                            className="bg-indigo-600/20 hover:bg-indigo-600/40 text-indigo-300 border border-indigo-500/30 text-xs px-2.5 py-1.5 rounded font-bold flex items-center gap-1 cursor-pointer"
                          >
                            <FileText className="w-3.5 h-3.5 text-indigo-400" />
                            PDF Cover
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
                              if (onMarkJobApplied) onMarkJobApplied(job.id, 'Gmail');
                            }}
                            className="bg-red-600 hover:bg-red-500 text-white font-bold text-xs px-3 py-1.5 rounded flex items-center gap-1 cursor-pointer"
                          >
                            <Mail className="w-3.5 h-3.5 text-white" />
                            Launch Gmail
                          </button>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              window.open(urls.linkedIn, '_blank');
                              if (onMarkJobApplied) onMarkJobApplied(job.id, 'LinkedIn');
                            }}
                            className="bg-[#0077b5] hover:bg-[#006094] text-white font-bold text-xs px-2.5 py-1.5 rounded flex items-center gap-1 cursor-pointer"
                          >
                            <ExternalLink className="w-3.5 h-3.5 text-white" />
                            LinkedIn Apply
                          </button>

                          <button
                            onClick={() => {
                              setIsDetailModalOpen(false);
                              onSelectJob(job);
                              setActiveTab('pipeline');
                            }}
                            className="bg-[#1e202e] hover:bg-[#282a3d] text-white text-xs px-3 py-1.5 rounded border border-[#2d3148] cursor-pointer"
                          >
                            Open Details
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Footer */}
            <div className="bg-[#111218] border-t border-[#222434] p-4 flex items-center justify-between text-xs text-[#888898]">
              <span className="font-mono">
                Click any role to launch tailored application workflows
              </span>
              <button
                onClick={() => setIsDetailModalOpen(false)}
                className="bg-[#1e202e] hover:bg-[#282a3d] text-white px-4 py-2 rounded font-bold cursor-pointer transition-all"
              >
                Close Roster
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
