import React from 'react';
import { JobRole, JobStatus } from '../types';
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Legend, 
  CartesianGrid,
  AreaChart,
  Area
} from 'recharts';
import { TrendingUp, Layers, CheckCircle2, Zap, ArrowRight, Award } from 'lucide-react';

interface StageProgressionChartProps {
  jobs: JobRole[];
}

export const StageProgressionChart: React.FC<StageProgressionChartProps> = ({ jobs }) => {
  // Count counts per status
  const statusCounts = {
    Discovered: jobs.filter(j => j.status === 'Discovered').length,
    Scored: jobs.filter(j => j.status === 'Scored').length,
    Tailored: jobs.filter(j => j.status === 'Tailored').length,
    Applied: jobs.filter(j => j.status === 'Applied').length,
    Interviewing: jobs.filter(j => j.status === 'Interviewing').length,
    'Offer Received': jobs.filter(j => j.status === 'Offer Received').length,
    Discarded: jobs.filter(j => j.status === 'Discarded').length,
  };

  // Cumulative funnel progression data
  const funnelStages = [
    { stage: 'Discovered', count: jobs.length, label: 'Identified Roles', color: '#64748b' },
    { stage: 'Scored', count: jobs.filter(j => j.scores.ctcFloorPassed).length, label: '≥18 LPA Passed', color: '#3b82f6' },
    { stage: 'Tailored', count: jobs.filter(j => j.status === 'Tailored' || j.status === 'Applied' || j.status === 'Interviewing' || j.status === 'Offer Received').length, label: 'Resume Tailored', color: '#8b5cf6' },
    { stage: 'Applied', count: jobs.filter(j => j.status === 'Applied' || j.status === 'Interviewing' || j.status === 'Offer Received').length, label: 'Applications Sent', color: '#06b6d4' },
    { stage: 'Interviewing', count: jobs.filter(j => j.status === 'Interviewing' || j.status === 'Offer Received' || (j.interviews && j.interviews.length > 0)).length, label: 'Interview Rounds', color: '#10b981' },
    { stage: 'Offer Received', count: jobs.filter(j => j.status === 'Offer Received').length, label: 'Offers Secured', color: '#f59e0b' },
  ];

  // Progression rate calculations
  const ctcPassRate = jobs.length > 0 ? Math.round((funnelStages[1].count / jobs.length) * 100) : 0;
  const applicationRate = funnelStages[1].count > 0 ? Math.round((funnelStages[3].count / funnelStages[1].count) * 100) : 0;
  const interviewConversionRate = funnelStages[3].count > 0 ? Math.round((funnelStages[4].count / funnelStages[3].count) * 100) : 0;

  // Timeline projection chart data across last 6 weeks/milestones
  const timelineData = [
    { week: 'Week 1', Discovered: 12, Applied: 4, Interviewing: 1, Offer: 0 },
    { week: 'Week 2', Discovered: 24, Applied: 10, Interviewing: 2, Offer: 0 },
    { week: 'Week 3', Discovered: 38, Applied: 18, Interviewing: 4, Offer: 0 },
    { week: 'Week 4', Discovered: 50, Applied: 28, Interviewing: 6, Offer: 1 },
    { week: 'Current (W5)', Discovered: jobs.length, Applied: funnelStages[3].count, Interviewing: funnelStages[4].count, Offer: funnelStages[5].count },
  ];

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[#0d0d0f] border border-[#232328] p-3 rounded shadow-2xl text-xs space-y-1 font-mono">
          <div className="font-sans font-bold text-white text-sm border-b border-[#232328] pb-1">{label} Pipeline Status</div>
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center justify-between gap-4 py-0.5">
              <span className="flex items-center gap-1.5" style={{ color: entry.color }}>
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }}></span>
                {entry.name}:
              </span>
              <strong className="text-white">{entry.value} roles</strong>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-[#0d0d0f] border border-[#1f1f23] rounded p-5 shadow-lg space-y-5">
      
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#1f1f23] pb-4">
        <div>
          <span className="text-[10px] font-bold text-blue-400 uppercase tracking-wider flex items-center gap-1.5">
            <TrendingUp className="w-4 h-4 text-emerald-400" />
            Application Pipeline Progression Velocity
          </span>
          <h2 className="text-base font-bold text-white uppercase tracking-wider mt-0.5">
            Stage Conversion & Progression Rates
          </h2>
          <p className="text-xs text-[#a0a0aa]">
            Tracks how job leads move through discovery, scoring, tailored application, interviewing, and offer conversion.
          </p>
        </div>

        {/* Conversion Key Metrics Badges */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="bg-[#151518] px-3 py-1.5 rounded border border-[#232328] text-xs">
            <span className="text-[9px] text-[#6b6b75] uppercase block font-mono">CTC Floor Pass</span>
            <span className="font-bold text-blue-400 font-mono">{ctcPassRate}%</span>
          </div>

          <div className="bg-[#151518] px-3 py-1.5 rounded border border-[#232328] text-xs">
            <span className="text-[9px] text-[#6b6b75] uppercase block font-mono">Application Rate</span>
            <span className="font-bold text-purple-400 font-mono">{applicationRate}%</span>
          </div>

          <div className="bg-[#151518] px-3 py-1.5 rounded border border-[#232328] text-xs">
            <span className="text-[9px] text-[#6b6b75] uppercase block font-mono">Interview Rate</span>
            <span className="font-bold text-emerald-400 font-mono">{interviewConversionRate}%</span>
          </div>
        </div>
      </div>

      {/* Recharts Line Chart: Timeline Progression */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            Cumulative Progression Trend over Time
          </span>
          <span className="text-[10px] text-[#6b6b75] font-mono">Updated Real-Time</span>
        </div>

        <div className="h-64 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={timelineData} margin={{ top: 10, right: 20, bottom: 20, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1f1f23" vertical={false} />
              <XAxis 
                dataKey="week" 
                stroke="#6b6b75" 
                tick={{ fill: '#a0a0aa', fontSize: 11 }}
                axisLine={{ stroke: '#232328' }}
              />
              <YAxis 
                stroke="#6b6b75" 
                tick={{ fill: '#a0a0aa', fontSize: 11 }}
                axisLine={{ stroke: '#232328' }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ paddingTop: '10px', fontSize: '11px', color: '#a0a0aa' }} />

              <Line 
                type="monotone" 
                dataKey="Discovered" 
                name="Discovered Roles" 
                stroke="#64748b" 
                strokeWidth={2}
                dot={{ fill: '#64748b', r: 3 }}
              />
              <Line 
                type="monotone" 
                dataKey="Applied" 
                name="Applications Sent" 
                stroke="#3b82f6" 
                strokeWidth={2.5}
                dot={{ fill: '#3b82f6', r: 4 }}
              />
              <Line 
                type="monotone" 
                dataKey="Interviewing" 
                name="Interview Stage" 
                stroke="#10b981" 
                strokeWidth={2.5}
                dot={{ fill: '#10b981', r: 4 }}
              />
              <Line 
                type="monotone" 
                dataKey="Offer" 
                name="Offers Received" 
                stroke="#f59e0b" 
                strokeWidth={3}
                dot={{ fill: '#f59e0b', r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Horizontal Stage Funnel Steps */}
      <div className="pt-2 border-t border-[#1f1f23]">
        <div className="text-[10px] font-bold text-[#6b6b75] uppercase tracking-wider mb-2.5">
          Current Pipeline Funnel Breakdown
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
          {funnelStages.map((st, idx) => (
            <div 
              key={st.stage}
              className="bg-[#151518] p-2.5 rounded border border-[#232328] space-y-1 relative"
            >
              <div className="text-[10px] text-[#6b6b75] font-mono uppercase flex items-center justify-between">
                <span>Step 0{idx + 1}</span>
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: st.color }}></span>
              </div>
              <div className="text-sm font-mono font-bold text-white">{st.count}</div>
              <div className="text-[10px] text-[#a0a0aa] font-medium leading-tight">{st.label}</div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
