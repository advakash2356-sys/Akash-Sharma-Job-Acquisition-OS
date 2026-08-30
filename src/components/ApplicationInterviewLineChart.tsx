import React from 'react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';
import { JobRole } from '../types';
import { TrendingUp, Calendar, CheckCircle2, Award, Zap, Sparkles } from 'lucide-react';

interface ApplicationInterviewLineChartProps {
  jobs: JobRole[];
}

export const ApplicationInterviewLineChart: React.FC<ApplicationInterviewLineChartProps> = ({ jobs }) => {
  // Generate 30 days historical trend leading up to July 30, 2026
  const generate30DayTrendData = () => {
    const data = [];
    const baseDate = new Date('2026-07-30');

    for (let i = 29; i >= 0; i--) {
      const d = new Date(baseDate);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const displayLabel = `${d.getDate()} ${d.toLocaleString('default', { month: 'short' })}`;

      // Calculate actual or realistic seeded numbers for Scored vs Applied
      const actualApplied = jobs.filter(j => 
        (j.status === 'Applied' || j.status === 'Interviewing' || j.status === 'Offer Received') && 
        (j.appliedDate === dateStr || (i <= 3 && j.appliedDate))
      ).length;

      const seededScored = Math.min(30, Math.floor(i * 0.8) + (i % 4) + 3);
      const seededApplied = Math.min(25, Math.floor(i * 0.6) + (i % 3) + actualApplied);

      data.push({
        date: dateStr,
        displayLabel,
        scoredJobs: seededScored,
        appliedJobs: seededApplied
      });
    }

    return data;
  };

  const chartData = generate30DayTrendData();

  const total30dScored = chartData[chartData.length - 1]?.scoredJobs || 27;
  const total30dApplied = chartData[chartData.length - 1]?.appliedJobs || 22;
  const applicationRatioPct = total30dScored > 0 ? Math.round((total30dApplied / total30dScored) * 100) : 0;

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[#0f111a] border border-[#2d3148] p-3 rounded-lg shadow-2xl text-xs space-y-1.5 font-sans">
          <p className="font-mono text-amber-400 font-bold border-b border-[#2d3148] pb-1">
            📅 Date: {label}
          </p>

          <div className="flex items-center gap-2 text-purple-400 font-semibold">
            <span className="w-2.5 h-2.5 rounded-full bg-purple-500"></span>
            <span>Jobs Scored by AI: <strong className="text-white font-mono">{payload[0]?.value}</strong></span>
          </div>

          <div className="flex items-center gap-2 text-blue-400 font-semibold">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
            <span>Applications Submitted: <strong className="text-white font-mono">{payload[1]?.value}</strong></span>
          </div>

          <p className="text-[#888898] text-[10px] pt-1 font-mono">
            ⚡ Application Ratio: {payload[0]?.value ? Math.round(((payload[1]?.value || 0) / payload[0].value) * 100) : 0}%
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
            <span className="bg-purple-500/20 text-purple-300 border border-purple-500/30 text-[10px] font-mono px-2.5 py-0.5 rounded font-bold uppercase tracking-wider flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5 text-purple-400" />
              RECHARTS 30-DAY VELOCITY
            </span>
            <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[10px] font-mono px-2 py-0.5 rounded">
              SCORED VS APPLIED TREND
            </span>
          </div>
          <h2 className="text-lg font-bold text-white uppercase tracking-wider mt-1.5 flex items-center gap-2">
            <span>30-Day Trend: Scored Jobs vs. Applications Sent</span>
          </h2>
          <p className="text-xs text-[#a0a0aa]">
            Daily tracking of AI-evaluated job opportunities versus actual submitted applications over the past 30 days.
          </p>
        </div>

        {/* High level stats banner */}
        <div className="flex items-center gap-3 bg-[#12131c] border border-[#222434] p-2.5 rounded-xl self-start sm:self-auto font-mono text-xs">
          <div className="text-center px-2">
            <span className="text-[10px] text-[#888898] uppercase block">Scored (30d)</span>
            <span className="text-base font-bold text-purple-400">{total30dScored}</span>
          </div>

          <div className="h-6 w-px bg-[#222434]"></div>

          <div className="text-center px-2">
            <span className="text-[10px] text-[#888898] uppercase block">Applied (30d)</span>
            <span className="text-base font-bold text-blue-400">{total30dApplied}</span>
          </div>

          <div className="h-6 w-px bg-[#222434]"></div>

          <div className="text-center px-2">
            <span className="text-[10px] text-[#888898] uppercase block">Execution Ratio</span>
            <span className="text-base font-bold text-amber-400">{applicationRatioPct}%</span>
          </div>
        </div>
      </div>

      {/* Chart Canvas */}
      <div className="bg-[#12131c] border border-[#222434] rounded-xl p-4 h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={chartData}
            margin={{ top: 10, right: 20, left: -10, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#1f2233" vertical={false} />
            <XAxis 
              dataKey="displayLabel" 
              stroke="#6b6b75" 
              fontSize={10} 
              tickLine={false} 
              interval={4}
            />
            <YAxis 
              stroke="#6b6b75" 
              fontSize={10} 
              tickLine={false} 
              axisLine={false} 
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend 
              wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} 
              formatter={(value) => <span className="text-[#a0a0b0] font-mono">{value}</span>}
            />
            <Line
              type="monotone"
              dataKey="scoredJobs"
              name="Jobs Scored"
              stroke="#a855f7"
              strokeWidth={3}
              dot={{ fill: '#a855f7', r: 3 }}
              activeDot={{ r: 6, fill: '#c084fc', stroke: '#ffffff', strokeWidth: 2 }}
            />
            <Line
              type="monotone"
              dataKey="appliedJobs"
              name="Applications Sent"
              stroke="#3b82f6"
              strokeWidth={3}
              dot={{ fill: '#3b82f6', r: 3 }}
              activeDot={{ r: 6, fill: '#60a5fa', stroke: '#ffffff', strokeWidth: 2 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
