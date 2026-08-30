import React from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer, 
  ReferenceArea, 
  ReferenceLine 
} from 'recharts';
import { JobRole } from '../types';
import { DollarSign, TrendingUp, Sparkles, Award } from 'lucide-react';

interface SalaryBenchmarkingProps {
  jobs: JobRole[];
}

export const SalaryBenchmarking: React.FC<SalaryBenchmarkingProps> = ({ jobs }) => {
  // Aggregate CTC data from pipeline jobs + market benchmarks
  const pipelineAverageCtc = jobs.length > 0 
    ? Math.round(jobs.reduce((acc, j) => acc + (j.ctcMinLpa + j.ctcMaxLpa)/2, 0) / jobs.length)
    : 22;

  const benchmarkData = [
    {
      category: 'Pipeline Avg',
      minLpa: Math.max(14, pipelineAverageCtc - 2),
      maxLpa: pipelineAverageCtc + 3,
      avgLpa: pipelineAverageCtc,
      targetBandMin: 18,
      targetBandMax: 28
    },
    {
      category: 'Bangalore Domestic',
      minLpa: 16,
      maxLpa: 22,
      avgLpa: 19,
      targetBandMin: 18,
      targetBandMax: 28
    },
    {
      category: 'US Night Shift Track',
      minLpa: 22,
      maxLpa: 30,
      avgLpa: 25,
      targetBandMin: 18,
      targetBandMax: 28
    },
    {
      category: 'Global Remote (USD)',
      minLpa: 24,
      maxLpa: 35,
      avgLpa: 28,
      targetBandMin: 18,
      targetBandMax: 28
    }
  ];

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[#0f111a] border border-[#2d3148] p-3 rounded-lg shadow-2xl text-xs space-y-1.5 font-sans">
          <p className="font-mono text-amber-400 font-bold border-b border-[#2d3148] pb-1">
            💼 {label} Market Segment
          </p>
          <p className="text-emerald-400 font-semibold font-mono">
            Avg Salary: <strong>₹{payload[0]?.value} LPA</strong>
          </p>
          <p className="text-[#888898] text-[10px] font-mono">
            Target Band Range: ₹18L – ₹28L LPA
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-[#0d0d0f] border border-[#1f1f23] rounded-xl p-5 sm:p-6 shadow-2xl space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#1f1f23] pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-mono px-2.5 py-0.5 rounded font-bold uppercase tracking-wider flex items-center gap-1.5">
              <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
              RECHARTS SALARY BENCHMARKING
            </span>
            <span className="bg-amber-500/10 text-amber-300 border border-amber-500/30 text-[10px] font-mono px-2 py-0.5 rounded">
              TARGET BAND: ₹18L – ₹28L LPA
            </span>
          </div>
          <h2 className="text-lg font-bold text-white uppercase tracking-wider mt-1.5 flex items-center gap-2">
            <span>Target Salary Band vs. Pipeline & Market Comparison</span>
          </h2>
          <p className="text-xs text-[#a0a0aa]">
            Benchmarking pipeline job offers against target ₹18–28 LPA band and high-margin US Night Shift premiums.
          </p>
        </div>

        <div className="bg-[#12131c] border border-[#222434] p-2.5 rounded-xl self-start sm:self-auto font-mono text-xs text-center">
          <span className="text-[10px] text-[#888898] uppercase block">Pipeline Avg CTC</span>
          <span className="text-base font-bold text-emerald-400">₹{pipelineAverageCtc} LPA</span>
        </div>
      </div>

      {/* Chart Canvas */}
      <div className="bg-[#12131c] border border-[#222434] rounded-xl p-4 h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={benchmarkData} margin={{ top: 15, right: 20, left: -10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1f2233" vertical={false} />
            <XAxis dataKey="category" stroke="#6b6b75" fontSize={10} tickLine={false} />
            <YAxis stroke="#6b6b75" fontSize={10} tickLine={false} axisLine={false} unit="L" />
            <Tooltip content={<CustomTooltip />} />
            
            {/* Target Salary Band Highlight */}
            <ReferenceLine y={18} stroke="#10b981" strokeDasharray="3 3" label={{ value: 'Target Min ₹18L', fill: '#10b981', fontSize: 10, position: 'insideBottomRight' }} />
            <ReferenceLine y={28} stroke="#10b981" strokeDasharray="3 3" label={{ value: 'Target Max ₹28L', fill: '#10b981', fontSize: 10, position: 'insideTopRight' }} />
            <ReferenceLine y={22} stroke="#f59e0b" strokeDasharray="4 4" label={{ value: 'Target Floor ₹22L', fill: '#f59e0b', fontSize: 10, position: 'insideTopLeft' }} />

            <Bar dataKey="avgLpa" name="Average Salary (LPA)" fill="#3b82f6" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
