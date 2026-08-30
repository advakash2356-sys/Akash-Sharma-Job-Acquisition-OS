import React, { useState } from 'react';
import { JobRole } from '../types';
import { 
  DollarSign, 
  Clock, 
  TrendingUp, 
  Zap, 
  Award, 
  Briefcase, 
  Building2, 
  ChevronRight, 
  Plus, 
  Minus,
  Sparkles,
  ShieldCheck,
  BarChart3
} from 'lucide-react';

interface RoiEfficiencySectionProps {
  jobs: JobRole[];
  onSelectJob: (job: JobRole) => void;
  setActiveTab: (tab: string) => void;
}

export const RoiEfficiencySection: React.FC<RoiEfficiencySectionProps> = ({
  jobs,
  onSelectJob,
  setActiveTab
}) => {
  const eligibleJobs = jobs.filter(j => j.scores.ctcFloorPassed);

  // Local state to allow user overrides for estimated hours per job
  const [hoursOverrides, setHoursOverrides] = useState<Record<string, number>>({});

  const calculateHoursForJob = (job: JobRole): number => {
    if (hoursOverrides[job.id] !== undefined) {
      return hoursOverrides[job.id];
    }
    if (job.estimatedHoursSpent !== undefined) {
      return job.estimatedHoursSpent;
    }
    
    // Default baseline heuristics:
    let hours = 0.25; // Discovery & Scoring
    if (job.status === 'Tailored') hours += 0.5;
    if (job.status === 'Applied') hours += 1.0;
    if (job.status === 'Interviewing') {
      const interviewCount = job.interviews?.length || 3;
      hours += 1.0 + (interviewCount * 2.5); // 1h app + 2.5h per round
    }
    if (job.status === 'Offer Received') {
      const interviewCount = job.interviews?.length || 4;
      hours += 1.0 + (interviewCount * 2.5) + 2.0; // negotiation
    }
    return Number(hours.toFixed(1));
  };

  const calculateRoiForJob = (job: JobRole) => {
    const hours = calculateHoursForJob(job);
    const avgCtcLpa = (job.ctcMinLpa + job.ctcMaxLpa) / 2;
    const totalCtcInr = avgCtcLpa * 100000; // e.g. 25 LPA = 2,500,000 INR
    const hourlyRoiInr = hours > 0 ? Math.round(totalCtcInr / hours) : 0;
    
    let tier: 'S-Tier' | 'A-Tier' | 'B-Tier' = 'B-Tier';
    if (hourlyRoiInr >= 1500000) tier = 'S-Tier';
    else if (hourlyRoiInr >= 1000000) tier = 'A-Tier';

    return {
      hours,
      avgCtcLpa,
      totalCtcInr,
      hourlyRoiInr,
      tier
    };
  };

  const jobRois = eligibleJobs.map(job => ({
    job,
    ...calculateRoiForJob(job)
  })).sort((a, b) => b.hourlyRoiInr - a.hourlyRoiInr);

  const totalHoursInvested = jobRois.reduce((acc, curr) => acc + curr.hours, 0);
  const totalPipelineCtcValue = jobRois.reduce((acc, curr) => acc + curr.totalCtcInr, 0);
  const avgHourlyRoi = totalHoursInvested > 0 ? Math.round(totalPipelineCtcValue / totalHoursInvested) : 0;

  const topRoiRole = jobRois[0];

  const handleAdjustHours = (jobId: string, current: number, delta: number) => {
    const newHours = Math.max(0.25, Number((current + delta).toFixed(1)));
    setHoursOverrides(prev => ({
      ...prev,
      [jobId]: newHours
    }));
  };

  return (
    <div className="bg-[#0d0d0f] border border-[#1f1f23] rounded p-5 shadow-lg space-y-5">
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-[#1f1f23] pb-3">
        <div>
          <span className="text-[10px] font-bold text-blue-400 uppercase tracking-wider flex items-center gap-1.5">
            <TrendingUp className="w-3.5 h-3.5" />
            Time Invested vs. Expected Salary (ROI Matrix)
          </span>
          <h2 className="text-base font-bold text-white uppercase tracking-wider mt-0.5">
            Application Effort Efficiency & Financial Yield Calculator
          </h2>
          <p className="text-xs text-[#a0a0aa]">
            Quantifies the financial return per hour invested across candidate sourcing, resume tailoring, and multi-round interviews.
          </p>
        </div>

        <div className="bg-[#0a0a0b] p-2.5 rounded border border-[#232328] flex items-center gap-4 text-xs font-mono shrink-0">
          <div>
            <span className="text-[#6b6b75] text-[9px] block uppercase tracking-wider">Avg Pipeline ROI</span>
            <span className="text-sm font-bold text-green-400">₹{(avgHourlyRoi / 100000).toFixed(2)} LPA / hr</span>
          </div>
          <div className="w-px h-6 bg-[#232328]"></div>
          <div>
            <span className="text-[#6b6b75] text-[9px] block uppercase tracking-wider">Total Time Invested</span>
            <span className="text-sm font-bold text-white">{totalHoursInvested.toFixed(1)} Hours</span>
          </div>
        </div>
      </div>

      {/* Metric Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        
        {/* Top ROI Role */}
        <div className="bg-[#151518] p-3.5 rounded border border-[#232328] space-y-1">
          <span className="text-[10px] text-[#6b6b75] uppercase tracking-wider font-semibold block">
            Highest Hourly Yield Opportunity
          </span>
          {topRoiRole ? (
            <div>
              <div className="text-sm font-bold text-white truncate">{topRoiRole.job.company}</div>
              <div className="text-xs text-[#a0a0aa] truncate">{topRoiRole.job.title}</div>
              <div className="text-xs font-mono font-bold text-green-400 mt-1">
                ₹{(topRoiRole.hourlyRoiInr / 100000).toFixed(2)} LPA / hr ({topRoiRole.hours}h spent)
              </div>
            </div>
          ) : (
            <div className="text-xs text-[#6b6b75]">No jobs scored yet</div>
          )}
        </div>

        {/* Big-4 / GCC Efficiency Insights */}
        <div className="bg-[#151518] p-3.5 rounded border border-[#232328] space-y-1">
          <span className="text-[10px] text-[#6b6b75] uppercase tracking-wider font-semibold block">
            High-Yield Channel Insight
          </span>
          <div className="text-xs font-bold text-white flex items-center gap-1.5">
            <Building2 className="w-3.5 h-3.5 text-blue-400 shrink-0" />
            Big-4 Consulting & Corporate GCCs
          </div>
          <p className="text-[11px] text-[#a0a0aa] leading-tight">
            Yield 2.4x higher ROI/hour due to standard 2-round interview cycles vs startups with 5+ case assignments.
          </p>
        </div>

        {/* Salary Floor Protection */}
        <div className="bg-[#151518] p-3.5 rounded border border-[#232328] space-y-1">
          <span className="text-[10px] text-[#6b6b75] uppercase tracking-wider font-semibold block">
            Effort Waste Prevention
          </span>
          <div className="text-xs font-bold text-green-400 flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
            Zero Hours Wasted Below ₹18 LPA
          </div>
          <p className="text-[11px] text-[#a0a0aa] leading-tight">
            {jobs.length - eligibleJobs.length} low-ball roles automatically discarded before incurring tailoring effort.
          </p>
        </div>

      </div>

      {/* ROI Efficiency Table */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs font-bold text-white uppercase tracking-wider pb-1">
          <span className="flex items-center gap-1.5">
            <BarChart3 className="w-4 h-4 text-blue-400" />
            Per-Role ROI Breakdown & Effort Adjuster
          </span>
          <span className="text-[10px] text-[#6b6b75] font-mono">
            Click +/- to adjust actual hours spent
          </span>
        </div>

        <div className="border border-[#232328] rounded overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#151518] text-[#6b6b75] uppercase text-[9px] tracking-wider border-b border-[#232328]">
              <tr>
                <th className="p-3">Company & Role</th>
                <th className="p-3">Status</th>
                <th className="p-3">Expected CTC</th>
                <th className="p-3">Hours Invested</th>
                <th className="p-3">Hourly Yield (ROI)</th>
                <th className="p-3 text-right">Efficiency</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1f1f23] font-mono">
              {jobRois.map(({ job, hours, avgCtcLpa, totalCtcInr, hourlyRoiInr, tier }) => (
                <tr key={job.id} className="hover:bg-[#151518]/50 transition-colors">
                  
                  {/* Title & Company */}
                  <td className="p-3 font-sans">
                    <div className="font-bold text-white text-xs">{job.company}</div>
                    <div className="text-[11px] text-[#a0a0aa] truncate max-w-xs">{job.title}</div>
                  </td>

                  {/* Status */}
                  <td className="p-3 font-sans">
                    <span className="text-[10px] bg-[#1a1a1c] text-blue-400 px-2 py-0.5 rounded border border-[#2d2d30] font-mono uppercase">
                      {job.status}
                    </span>
                  </td>

                  {/* Expected CTC */}
                  <td className="p-3 text-white font-bold">
                    ₹{job.ctcMinLpa}–{job.ctcMaxLpa} LPA
                  </td>

                  {/* Hours Adjuster */}
                  <td className="p-3">
                    <div className="flex items-center gap-1.5 bg-[#0a0a0b] border border-[#232328] rounded px-2 py-1 w-fit">
                      <button
                        onClick={() => handleAdjustHours(job.id, hours, -0.5)}
                        className="text-[#6b6b75] hover:text-white transition-colors cursor-pointer"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="text-white font-bold text-xs w-8 text-center">{hours}h</span>
                      <button
                        onClick={() => handleAdjustHours(job.id, hours, 0.5)}
                        className="text-[#6b6b75] hover:text-white transition-colors cursor-pointer"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  </td>

                  {/* Hourly Yield */}
                  <td className="p-3 font-bold text-green-400">
                    ₹{(hourlyRoiInr / 100000).toFixed(2)} LPA / hr
                  </td>

                  {/* Tier Badge */}
                  <td className="p-3 text-right font-sans">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase tracking-wider ${
                      tier === 'S-Tier' 
                        ? 'bg-emerald-500/10 text-green-400 border-green-500/30'
                        : tier === 'A-Tier'
                        ? 'bg-blue-600/10 text-blue-400 border-blue-500/30'
                        : 'bg-[#1a1a1c] text-[#a0a0aa] border-[#2d2d30]'
                    }`}>
                      {tier}
                    </span>
                  </td>

                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
