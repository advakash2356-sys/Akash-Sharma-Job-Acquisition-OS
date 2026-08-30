import React, { useState } from 'react';
import { 
  PieChart, 
  Pie, 
  Cell, 
  Tooltip, 
  ResponsiveContainer, 
  Legend 
} from 'recharts';
import { JobRole, JobStatus } from '../types';
import { 
  PieChart as PieIcon, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  Briefcase, 
  ExternalLink, 
  Calendar, 
  ChevronRight, 
  Filter, 
  X, 
  Sparkles, 
  Search, 
  FileText, 
  Mail, 
  ShieldCheck, 
  Flame, 
  UserCheck 
} from 'lucide-react';
import { 
  downloadPDFResume, 
  downloadPDFCoverLetter, 
  executeAndLaunchGmail, 
  getPlatformSearchUrls 
} from '../utils/documentExporter';

interface DashboardAnalyticsProps {
  jobs: JobRole[];
  onSelectJob?: (job: JobRole) => void;
  setActiveTab?: (tab: string) => void;
  onMarkJobApplied?: (jobId: string, channel: string) => void;
  onFilterByStatus?: (status: string | null) => void;
}

export interface StatusSlice {
  name: string;
  statusKey: string;
  value: number;
  color: string;
  description: string;
  jobs: JobRole[];
}

export const DashboardAnalytics: React.FC<DashboardAnalyticsProps> = ({
  jobs,
  onSelectJob,
  setActiveTab,
  onMarkJobApplied,
  onFilterByStatus
}) => {
  const [activeFilterStatus, setActiveFilterStatus] = useState<string | null>(null);
  const [selectedJobForModal, setSelectedJobForModal] = useState<JobRole | null>(null);

  // Group jobs into primary status buckets
  const appliedJobs = jobs.filter(j => j.status === 'Applied');
  const scoredJobs = jobs.filter(j => j.status === 'Scored' && j.scores.ctcFloorPassed);
  const pendingJobs = jobs.filter(j => (j.status === 'Tailored' || j.status === 'Scored') && j.scores.ctcFloorPassed);
  const interviewingJobs = jobs.filter(j => j.status === 'Interviewing');
  const offerJobs = jobs.filter(j => j.status === 'Offer Received');
  const discardedJobs = jobs.filter(j => !j.scores.ctcFloorPassed || j.status === 'Discarded');

  const totalJobs = jobs.length;

  const pieSlices: StatusSlice[] = [
    {
      name: 'Applied',
      statusKey: 'Applied',
      value: appliedJobs.length,
      color: '#10b981', // emerald-500
      description: 'Applications submitted & currently tracked in pipeline',
      jobs: appliedJobs
    },
    {
      name: 'Scored & Qualified',
      statusKey: 'Scored',
      value: scoredJobs.length,
      color: '#6366f1', // indigo-500
      description: 'High-score opportunities passing salary & skill criteria',
      jobs: scoredJobs
    },
    {
      name: 'Pending Action',
      statusKey: 'Pending',
      value: pendingJobs.length,
      color: '#f59e0b', // amber-500
      description: 'Roles ready for ATS tailoring & batch email outreach',
      jobs: pendingJobs
    },
    {
      name: 'Interviewing',
      statusKey: 'Interviewing',
      value: interviewingJobs.length,
      color: '#3b82f6', // blue-500
      description: 'Active recruiter screens & interview rounds',
      jobs: interviewingJobs
    },
    {
      name: 'Offers Received',
      statusKey: 'Offer Received',
      value: offerJobs.length,
      color: '#8b5cf6', // purple-500
      description: 'Offers cleared and undergoing evaluation',
      jobs: offerJobs
    }
  ].filter(s => s.value > 0 || s.statusKey === 'Applied' || s.statusKey === 'Scored');

  // Handle Pie Slice Click or Status Filter Click
  const handleSliceClick = (slice: StatusSlice | any) => {
    const key = slice?.statusKey || slice?.payload?.statusKey || slice?.name;
    if (activeFilterStatus === key) {
      setActiveFilterStatus(null);
      if (onFilterByStatus) onFilterByStatus(null);
    } else {
      setActiveFilterStatus(key);
      if (onFilterByStatus) onFilterByStatus(key);
    }
  };

  // Filtered job list based on click
  const filteredDisplayJobs = activeFilterStatus 
    ? pieSlices.find(s => s.statusKey === activeFilterStatus)?.jobs || jobs.filter(j => j.status === activeFilterStatus)
    : jobs;

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data: StatusSlice = payload[0].payload;
      const pct = Math.round((data.value / Math.max(1, totalJobs)) * 100);
      return (
        <div className="bg-[#0f111a] border border-[#2d3148] p-3 rounded-lg shadow-2xl text-xs space-y-1">
          <div className="flex items-center gap-2 font-bold" style={{ color: data.color }}>
            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: data.color }}></span>
            <span>{data.name}</span>
          </div>
          <p className="text-white font-mono font-bold text-sm">
            {data.value} Jobs ({pct}%)
          </p>
          <p className="text-[#a0a0b0] text-[11px] leading-tight max-w-xs">
            {data.description}
          </p>
          <p className="text-amber-400 font-mono text-[10px] pt-1">
            ⚡ Click slice to filter the live job roster
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-[#0d0d0f] border border-[#1f1f23] rounded-xl p-5 sm:p-6 shadow-2xl space-y-6">
      {/* Component Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#1f1f23] pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-blue-500/20 text-blue-400 border border-blue-500/30 text-[10px] font-mono px-2.5 py-0.5 rounded font-bold uppercase tracking-wider flex items-center gap-1.5">
              <PieIcon className="w-3.5 h-3.5 text-blue-400" />
              RECHARTS DASHBOARD ANALYTICS
            </span>
            <span className="bg-green-500/10 text-green-400 border border-green-500/30 text-[10px] font-mono px-2 py-0.5 rounded">
              DAILY STATUS MONITOR
            </span>
          </div>
          <h2 className="text-lg font-bold text-white uppercase tracking-wider mt-1.5 flex items-center gap-2">
            <span>Interactive Application Status Distribution</span>
          </h2>
          <p className="text-xs text-[#a0a0aa]">
            Real-time visual breakdown of job statuses (Applied, Scored, Pending). <strong className="text-amber-300">Click any pie section or chip</strong> to isolate and filter specific roles.
          </p>
        </div>

        {activeFilterStatus && (
          <button
            onClick={() => {
              setActiveFilterStatus(null);
              if (onFilterByStatus) onFilterByStatus(null);
            }}
            className="bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-mono px-3 py-1.5 rounded-lg flex items-center gap-1.5 cursor-pointer transition-all self-start sm:self-auto"
          >
            <X className="w-3.5 h-3.5 text-amber-400" />
            <span>Clear Filter: <strong>{activeFilterStatus}</strong></span>
          </button>
        )}
      </div>

      {/* Main Interactive Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        {/* Recharts Pie Chart Canvas */}
        <div className="lg:col-span-6 bg-[#12131c] border border-[#222434] rounded-xl p-5 flex flex-col items-center justify-center relative min-h-[290px]">
          <div className="w-full h-64 relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieSlices}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={95}
                  paddingAngle={4}
                  dataKey="value"
                  onClick={(entry: any) => handleSliceClick(entry?.payload || entry)}
                  className="cursor-pointer transition-all duration-300 hover:opacity-90"
                >
                  {pieSlices.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.color} 
                      stroke="#0d0d0f" 
                      strokeWidth={2}
                      className={`cursor-pointer focus:outline-none transition-transform ${
                        activeFilterStatus === entry.statusKey ? 'scale-110 stroke-amber-400 stroke-2' : 'hover:scale-105'
                      }`}
                    />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>

            {/* Inner Center Overlay Count */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-3xl font-mono font-bold text-white leading-none">
                {totalJobs}
              </span>
              <span className="text-[10px] uppercase tracking-wider text-[#888898] mt-1 font-mono">
                Total Tracked
              </span>
            </div>
          </div>

          <div className="text-[11px] text-amber-400 font-mono text-center mt-2 flex items-center justify-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
            <span>Click pie slice to filter job roster</span>
          </div>
        </div>

        {/* Status Clickable Filter Cards */}
        <div className="lg:col-span-6 space-y-2.5">
          {pieSlices.map((slice) => {
            const isSelected = activeFilterStatus === slice.statusKey;
            const pct = Math.round((slice.value / Math.max(1, totalJobs)) * 100);

            return (
              <div
                key={slice.statusKey}
                onClick={() => handleSliceClick(slice)}
                className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                  isSelected
                    ? 'bg-[#1b1e2e] border-amber-400 shadow-lg ring-1 ring-amber-400/50'
                    : 'bg-[#12131c] hover:bg-[#181a26] border-[#222434] hover:border-blue-500/40'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div 
                    className="w-3.5 h-9 rounded-full shrink-0 shadow-md"
                    style={{ backgroundColor: slice.color }}
                  ></div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-white">
                        {slice.name}
                      </span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-black/40 text-[#a0a0aa]">
                        {pct}%
                      </span>
                      {isSelected && (
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold">
                          FILTER ACTIVE
                        </span>
                      )}
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
                  <ChevronRight className={`w-4 h-4 ${isSelected ? 'text-amber-400 translate-x-1' : 'text-[#666]'}`} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Filtered Job Roster Display */}
      <div className="bg-[#12131c] border border-[#222434] rounded-xl p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#202230] pb-3">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-blue-400" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              {activeFilterStatus ? `Filtered Jobs: ${activeFilterStatus}` : 'All Tracked Applications'} ({filteredDisplayJobs.length})
            </h3>
          </div>

          <span className="text-xs text-[#888898] font-mono">
            Click job title or buttons to execute 1-click ATS & Gmail workflows
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[400px] overflow-y-auto pr-1">
          {filteredDisplayJobs.length === 0 ? (
            <div className="col-span-2 text-center py-8 text-xs text-[#888898]">
              No jobs matching the selected status filter.
            </div>
          ) : (
            filteredDisplayJobs.map((job) => {
              const urls = getPlatformSearchUrls(job.title, job.company);

              return (
                <div 
                  key={job.id} 
                  className="bg-[#161724] border border-[#222436] hover:border-blue-500/40 p-4 rounded-lg flex flex-col justify-between gap-3 transition-all"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="font-bold text-white text-sm line-clamp-1">{job.title}</h4>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#202334] text-blue-300 font-bold shrink-0">
                        {job.status}
                      </span>
                    </div>

                    <p className="text-xs text-blue-400 font-semibold mt-0.5">
                      {job.company} • <span className="text-green-400 font-mono">₹{job.ctcMinLpa}–{job.ctcMaxLpa} LPA</span>
                    </p>

                    <p className="text-[11px] text-[#888898] mt-1 line-clamp-2">
                      {job.location} • Shift: {job.shift} • Score: <strong className="text-white font-mono">{job.scores.totalScore}/100</strong>
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-between gap-2 pt-2 border-t border-[#202230]">
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => downloadPDFResume(job.title, job.company, job.scores.recommendation)}
                        className="bg-green-600/20 hover:bg-green-600/30 text-green-300 border border-green-500/30 text-[10px] px-2 py-1 rounded font-bold cursor-pointer"
                      >
                        PDF Resume
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
                        className="bg-red-600/20 hover:bg-red-600/30 text-red-300 border border-red-500/30 text-[10px] px-2 py-1 rounded font-bold flex items-center gap-1 cursor-pointer"
                      >
                        <Mail className="w-3 h-3 text-red-400" />
                        Gmail
                      </button>
                    </div>

                    <button
                      onClick={() => {
                        if (onSelectJob) onSelectJob(job);
                        if (setActiveTab) setActiveTab('pipeline');
                      }}
                      className="bg-[#202334] hover:bg-[#2a2e45] text-white text-[11px] px-2.5 py-1 rounded font-bold cursor-pointer"
                    >
                      View Details
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
