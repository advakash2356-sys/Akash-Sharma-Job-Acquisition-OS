import React from 'react';
import { JobRole } from '../types';
import { 
  ResponsiveContainer, 
  ComposedChart, 
  Bar, 
  Line, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ReferenceLine, 
  Legend, 
  CartesianGrid 
} from 'recharts';
import { TrendingUp, ShieldCheck, DollarSign, Award, CheckCircle2, AlertCircle } from 'lucide-react';

interface SalaryTrendChartProps {
  jobs: JobRole[];
  targetMinCtc?: number; // default 18
  targetMaxCtc?: number; // default 28
}

export const SalaryTrendChart: React.FC<SalaryTrendChartProps> = ({
  jobs,
  targetMinCtc = 18,
  targetMaxCtc = 28
}) => {
  // Focus on active pipeline roles: Interviewing, Offer Received, Applied, Tailored
  const activeJobs = jobs.filter(j => 
    j.status === 'Interviewing' || 
    j.status === 'Offer Received' || 
    j.status === 'Applied' || 
    j.status === 'Tailored'
  );

  // If active jobs is small, fall back to top scored jobs
  const chartJobs = activeJobs.length > 0 
    ? activeJobs 
    : jobs.filter(j => j.scores.ctcFloorPassed);

  const chartData = chartJobs.map(j => ({
    company: j.company.length > 12 ? `${j.company.substring(0, 10)}...` : j.company,
    fullCompany: j.company,
    title: j.title,
    status: j.status,
    minCtc: j.ctcMinLpa,
    maxCtc: j.ctcMaxLpa,
    avgCtc: Number(((j.ctcMinLpa + j.ctcMaxLpa) / 2).toFixed(1)),
    isInterviewingOrOffer: j.status === 'Interviewing' || j.status === 'Offer Received'
  }));

  const interviewingAndOfferJobs = chartJobs.filter(j => j.status === 'Interviewing' || j.status === 'Offer Received');
  const avgActiveCtc = interviewingAndOfferJobs.length > 0
    ? (interviewingAndOfferJobs.reduce((acc, j) => acc + (j.ctcMinLpa + j.ctcMaxLpa) / 2, 0) / interviewingAndOfferJobs.length).toFixed(1)
    : (chartJobs.reduce((acc, j) => acc + (j.ctcMinLpa + j.ctcMaxLpa) / 2, 0) / (chartJobs.length || 1)).toFixed(1);

  const meetsTargetFloor = Number(avgActiveCtc) >= targetMinCtc;

  // Custom Recharts Tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-[#0d0d0f] border border-[#232328] p-3 rounded shadow-2xl text-xs space-y-1 font-mono">
          <div className="font-sans font-bold text-white text-sm">{data.fullCompany}</div>
          <div className="text-[#a0a0aa] text-[11px] font-sans">{data.title}</div>
          <div className="text-blue-400 text-[10px] uppercase font-bold mt-1">Status: {data.status}</div>
          <div className="border-t border-[#232328] pt-1.5 mt-1 space-y-0.5">
            <div className="text-[#e0e0e0]">CTC Range: <strong className="text-white">₹{data.minCtc} – ₹{data.maxCtc} LPA</strong></div>
            <div className="text-green-400 font-bold">Midpoint: ₹{data.avgCtc} LPA</div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-[#0d0d0f] border border-[#1f1f23] rounded p-5 shadow-lg space-y-4">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-[#1f1f23] pb-3">
        <div>
          <span className="text-[10px] font-bold text-blue-400 uppercase tracking-wider flex items-center gap-1.5">
            <TrendingUp className="w-3.5 h-3.5" />
            Salary Pipeline Intelligence & Target Floor Monitor
          </span>
          <h2 className="text-base font-bold text-white uppercase tracking-wider mt-0.5">
            Offered & Expected CTC Trend (Target: ₹{targetMinCtc}–{targetMaxCtc} LPA)
          </h2>
          <p className="text-xs text-[#a0a0aa]">
            Visualizes CTC bandwidth across active interview rounds and offer stages against your strategic floor.
          </p>
        </div>

        {/* Target Monitor Badge */}
        <div className="flex items-center gap-3 shrink-0">
          <div className={`p-3 rounded border text-xs font-mono font-bold flex items-center gap-2 ${
            meetsTargetFloor 
              ? 'bg-emerald-500/10 border-emerald-500/30 text-green-400' 
              : 'bg-amber-500/10 border-amber-500/30 text-amber-400'
          }`}>
            {meetsTargetFloor ? (
              <CheckCircle2 className="w-4 h-4 text-green-400" />
            ) : (
              <AlertCircle className="w-4 h-4 text-amber-400" />
            )}
            <div>
              <span className="text-[9px] text-[#6b6b75] block uppercase">Pipeline Avg CTC</span>
              <span className="text-sm text-white">₹{avgActiveCtc} LPA</span>
            </div>
          </div>
        </div>
      </div>

      {/* Target Status Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
        <div className="bg-[#151518] p-3 rounded border border-[#232328] flex items-center justify-between">
          <span className="text-[#a0a0aa]">Target CTC Floor:</span>
          <span className="font-mono font-bold text-green-400 bg-green-500/10 px-2 py-0.5 rounded border border-green-500/20">
            ≥ ₹{targetMinCtc} LPA
          </span>
        </div>

        <div className="bg-[#151518] p-3 rounded border border-[#232328] flex items-center justify-between">
          <span className="text-[#a0a0aa]">Target CTC Ceiling:</span>
          <span className="font-mono font-bold text-blue-400 bg-blue-600/10 px-2 py-0.5 rounded border border-blue-500/20">
            ₹{targetMaxCtc} LPA
          </span>
        </div>

        <div className="bg-[#151518] p-3 rounded border border-[#232328] flex items-center justify-between">
          <span className="text-[#a0a0aa]">Floor Alignment Rate:</span>
          <span className="font-mono font-bold text-emerald-400">
            {chartJobs.length > 0 ? Math.round((chartJobs.filter(j => j.ctcMinLpa >= targetMinCtc).length / chartJobs.length) * 100) : 100}%
          </span>
        </div>
      </div>

      {/* Recharts Bar/Line Chart */}
      <div className="h-64 w-full pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={chartData} margin={{ top: 10, right: 20, bottom: 20, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1f1f23" vertical={false} />
            <XAxis 
              dataKey="company" 
              stroke="#6b6b75" 
              tick={{ fill: '#a0a0aa', fontSize: 11 }} 
              axisLine={{ stroke: '#232328' }}
            />
            <YAxis 
              stroke="#6b6b75" 
              tick={{ fill: '#a0a0aa', fontSize: 11 }} 
              unit=" LPA"
              domain={[10, 32]}
              axisLine={{ stroke: '#232328' }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend 
              wrapperStyle={{ paddingTop: '10px', fontSize: '11px', color: '#a0a0aa' }} 
            />

            {/* Target Min Floor Reference Line */}
            <ReferenceLine 
              y={targetMinCtc} 
              stroke="#22c55e" 
              strokeDasharray="4 4" 
              label={{ value: `Target Floor (₹${targetMinCtc} LPA)`, fill: '#22c55e', fontSize: 10, position: 'insideTopRight' }} 
            />

            {/* Target Max Ceiling Reference Line */}
            <ReferenceLine 
              y={targetMaxCtc} 
              stroke="#3b82f6" 
              strokeDasharray="4 4" 
              label={{ value: `Target Ceiling (₹${targetMaxCtc} LPA)`, fill: '#3b82f6', fontSize: 10, position: 'insideTopRight' }} 
            />

            <Bar 
              dataKey="minCtc" 
              name="CTC Min (LPA)" 
              fill="#2563eb" 
              opacity={0.6} 
              radius={[2, 2, 0, 0]} 
            />
            <Bar 
              dataKey="maxCtc" 
              name="CTC Max (LPA)" 
              fill="#10b981" 
              opacity={0.7} 
              radius={[2, 2, 0, 0]} 
            />
            <Line 
              type="monotone" 
              dataKey="avgCtc" 
              name="Midpoint Trend (LPA)" 
              stroke="#f59e0b" 
              strokeWidth={2.5} 
              dot={{ fill: '#f59e0b', r: 4 }} 
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

    </div>
  );
};
