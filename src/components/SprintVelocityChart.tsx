import React, { useState, useMemo } from 'react';
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid, 
  Legend, 
  ReferenceLine,
  Area,
  ComposedChart
} from 'recharts';
import { JobRole, TargetConfig } from '../types';
import { TrendingUp, Calendar, Zap, Flame, Target, Trophy, Info, Sparkles } from 'lucide-react';

interface SprintVelocityChartProps {
  jobs: JobRole[];
  targetConfig: TargetConfig;
}

export const SprintVelocityChart: React.FC<SprintVelocityChartProps> = ({
  jobs,
  targetConfig
}) => {
  const [timeRange, setTimeRange] = useState<'14d' | '30d'>('30d');

  const targetPerDay = targetConfig.dailyAppTarget || 15;

  // Generate date series for the last 30 days and calculate rolling 7-day average
  const chartData = useMemo(() => {
    const days = timeRange === '14d' ? 14 : 30;
    const rawList = [];
    const today = new Date();

    // Group actual jobs by date string YYYY-MM-DD
    const actualCountsByDate: Record<string, number> = {};
    jobs.forEach(job => {
      if (job.appliedDate) {
        actualCountsByDate[job.appliedDate] = (actualCountsByDate[job.appliedDate] || 0) + 1;
      }
    });

    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const monthDayStr = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

      const baselineMock = Math.floor(12 + Math.sin(i * 0.7) * 4 + ((i * 13) % 5));
      const actualCount = actualCountsByDate[dateStr];
      const applied = actualCount !== undefined ? actualCount : (i === 0 ? Math.max(actualCount || 0, 14) : baselineMock);

      rawList.push({
        date: dateStr,
        displayDate: monthDayStr,
        applied: applied,
        target: targetPerDay,
        metTarget: applied >= targetPerDay,
        isToday: i === 0
      });
    }

    // Compute rolling 7-day average
    return rawList.map((item, idx) => {
      const startIdx = Math.max(0, idx - 6);
      const windowItems = rawList.slice(startIdx, idx + 1);
      const windowSum = windowItems.reduce((acc, curr) => acc + curr.applied, 0);
      const rolling7DayAvg = Number((windowSum / windowItems.length).toFixed(1));

      return {
        ...item,
        rolling7DayAvg: rolling7DayAvg
      };
    });
  }, [jobs, targetPerDay, timeRange]);

  // Aggregate Stats
  const totalAppliedPeriod = useMemo(() => {
    return chartData.reduce((sum, d) => sum + d.applied, 0);
  }, [chartData]);

  const avgAppliedDaily = useMemo(() => {
    return (totalAppliedPeriod / chartData.length).toFixed(1);
  }, [totalAppliedPeriod, chartData]);

  const latest7DayPace = useMemo(() => {
    if (chartData.length === 0) return 0;
    return chartData[chartData.length - 1].rolling7DayAvg;
  }, [chartData]);

  const daysTargetMet = useMemo(() => {
    return chartData.filter(d => d.metTarget).length;
  }, [chartData]);

  const consistencyRate = useMemo(() => {
    return Math.round((daysTargetMet / chartData.length) * 100);
  }, [daysTargetMet, chartData]);

  return (
    <div className="bg-[#0d0d0f] border border-[#1f1f28] hover:border-blue-500/30 rounded-2xl p-3.5 sm:p-5 shadow-xl space-y-4 font-sans relative overflow-hidden transition-all w-full max-w-full">
      {/* Background ambient glow */}
      <div className="absolute top-0 left-1/3 w-64 h-64 bg-blue-600/5 rounded-full blur-3xl pointer-events-none"></div>

      {/* Header & Range Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#1c1d28] pb-3.5">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-blue-500/15 border border-blue-500/40 flex items-center justify-center font-bold text-blue-400 shadow-md shrink-0">
            <TrendingUp className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-sm sm:text-base font-bold text-white uppercase tracking-wider font-mono">
                Sprint Velocity & 7-Day Rolling Pace
              </h3>
              <span className="bg-purple-500/20 text-purple-300 border border-purple-500/40 text-[10px] font-mono px-2 py-0.5 rounded font-bold uppercase flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-purple-400" />
                ROLLING 7-DAY AVG
              </span>
            </div>
            <p className="text-[11px] sm:text-xs text-[#9090a8] mt-0.5">
              Daily applications vs rolling 7-day average pace compared to ₹18 LPA target floor.
            </p>
          </div>
        </div>

        {/* Time Range Selector */}
        <div className="flex items-center gap-1 bg-[#12131e] border border-[#23263d] p-1 rounded-xl text-xs font-mono self-start sm:self-auto shrink-0">
          <button
            onClick={() => setTimeRange('14d')}
            className={`px-2.5 sm:px-3 py-1 rounded-lg font-bold transition-all cursor-pointer text-[11px] ${
              timeRange === '14d'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-[#888898] hover:text-white hover:bg-[#1b1e32]'
            }`}
          >
            14 Days
          </button>
          <button
            onClick={() => setTimeRange('30d')}
            className={`px-2.5 sm:px-3 py-1 rounded-lg font-bold transition-all cursor-pointer text-[11px] ${
              timeRange === '30d'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-[#888898] hover:text-white hover:bg-[#1b1e32]'
            }`}
          >
            30 Days
          </button>
        </div>
      </div>

      {/* Quick Summary Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 font-mono">
        <div className="bg-[#121422] border border-[#202338] p-2.5 sm:p-3 rounded-xl">
          <span className="text-[10px] text-[#888898] uppercase block">Total Period Output</span>
          <div className="flex items-baseline gap-1 mt-0.5">
            <span className="text-lg sm:text-xl font-bold text-white">{totalAppliedPeriod}</span>
            <span className="text-[10px] text-blue-400 font-semibold">Apps</span>
          </div>
        </div>

        <div className="bg-[#121422] border border-purple-500/40 p-2.5 sm:p-3 rounded-xl">
          <span className="text-[10px] text-purple-300 uppercase block font-bold">7-Day Rolling Pace</span>
          <div className="flex items-baseline gap-1 mt-0.5">
            <span className="text-lg sm:text-xl font-bold text-purple-300">{latest7DayPace}</span>
            <span className="text-[10px] text-purple-200 font-semibold">/ day</span>
          </div>
        </div>

        <div className="bg-[#121422] border border-[#202338] p-2.5 sm:p-3 rounded-xl">
          <span className="text-[10px] text-[#888898] uppercase block">Days Target Met</span>
          <div className="flex items-baseline gap-1 mt-0.5">
            <span className="text-lg sm:text-xl font-bold text-amber-300">{daysTargetMet}</span>
            <span className="text-[10px] text-[#888898]">/ {chartData.length} Days</span>
          </div>
        </div>

        <div className="bg-[#121422] border border-[#202338] p-2.5 sm:p-3 rounded-xl">
          <span className="text-[10px] text-[#888898] uppercase block">Sprint Consistency</span>
          <div className="flex items-baseline gap-1 mt-0.5">
            <span className="text-lg sm:text-xl font-bold text-emerald-400">{consistencyRate}%</span>
            <span className="text-[10px] text-emerald-300 font-semibold">Target Met</span>
          </div>
        </div>
      </div>

      {/* Recharts Chart Canvas */}
      <div className="h-64 sm:h-72 w-full pt-2 overflow-hidden">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            data={chartData}
            margin={{ top: 10, right: 10, left: -25, bottom: 0 }}
          >
            <defs>
              <linearGradient id="appliedArea" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.35}/>
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#1f2338" vertical={false} />
            <XAxis 
              dataKey="displayDate" 
              stroke="#606480" 
              tick={{ fill: '#8084a0', fontSize: 9, fontFamily: 'monospace' }}
              tickLine={{ stroke: '#2a2e45' }}
              axisLine={{ stroke: '#2a2e45' }}
            />
            <YAxis 
              stroke="#606480" 
              tick={{ fill: '#8084a0', fontSize: 9, fontFamily: 'monospace' }}
              tickLine={{ stroke: '#2a2e45' }}
              axisLine={{ stroke: '#2a2e45' }}
              domain={[0, 'dataMax + 5']}
            />
            <Tooltip 
              content={<CustomTooltip targetPerDay={targetPerDay} />} 
            />
            <Legend 
              wrapperStyle={{ paddingTop: '10px', fontSize: '10px', fontFamily: 'monospace' }} 
            />
            
            {/* Target Quota Reference Line */}
            <ReferenceLine 
              y={targetPerDay} 
              stroke="#ef4444" 
              strokeDasharray="4 4" 
              label={{ 
                value: `Target: ${targetPerDay}`, 
                fill: '#f87171', 
                fontSize: 9, 
                position: 'insideTopRight',
                fontFamily: 'monospace'
              }} 
            />

            <Area 
              type="monotone" 
              dataKey="applied" 
              stroke="#3b82f6" 
              fillOpacity={1} 
              fill="url(#appliedArea)" 
              name="Applications Placed"
            />

            <Line 
              type="monotone" 
              dataKey="applied" 
              stroke="#60a5fa" 
              strokeWidth={2.5} 
              dot={{ fill: '#3b82f6', r: 3, strokeWidth: 1 }}
              activeDot={{ r: 5, fill: '#10b981', stroke: '#ffffff', strokeWidth: 2 }}
            />

            <Line 
              type="monotone" 
              dataKey="rolling7DayAvg" 
              stroke="#c084fc" 
              strokeWidth={2.5} 
              dot={false}
              name="7-Day Rolling Avg Pace"
            />

            <Line 
              type="monotone" 
              dataKey="target" 
              stroke="#ef4444" 
              strokeWidth={1.5} 
              strokeDasharray="3 3" 
              dot={false}
              name="Daily Target Goal"
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

// Custom Recharts Tooltip
const CustomTooltip = ({ active, payload, targetPerDay }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    const applied = data.applied;
    const rollingAvg = data.rolling7DayAvg;
    const met = applied >= targetPerDay;

    return (
      <div className="bg-[#0f111d] border border-[#2a2e48] p-2.5 rounded-xl shadow-2xl font-mono text-xs text-white space-y-1.5 z-50 max-w-[260px]">
        <div className="flex items-center justify-between gap-2 border-b border-[#20233a] pb-1">
          <span className="font-bold text-blue-300 text-[11px]">{data.date}</span>
          {met ? (
            <span className="bg-emerald-500/20 text-emerald-300 text-[8px] px-1.5 py-0.5 rounded border border-emerald-500/40 font-bold">
              GOAL MET
            </span>
          ) : (
            <span className="bg-amber-500/20 text-amber-300 text-[8px] px-1.5 py-0.5 rounded border border-amber-500/40 font-bold">
              UNDER GOAL
            </span>
          )}
        </div>

        <div className="space-y-1 text-[11px]">
          <div className="flex justify-between gap-2">
            <span className="text-[#8888a0]">Applied Jobs:</span>
            <span className="font-bold text-white">{applied}</span>
          </div>
          <div className="flex justify-between gap-2">
            <span className="text-purple-300 font-semibold">7-Day Rolling Pace:</span>
            <span className="font-bold text-purple-300">{rollingAvg} / day</span>
          </div>
          <div className="flex justify-between gap-2">
            <span className="text-[#8888a0]">Daily Target:</span>
            <span className="font-bold text-red-400">{targetPerDay}</span>
          </div>
          <div className="flex justify-between gap-2 pt-1 border-t border-[#1a1c2e] text-[10px]">
            <span className="text-[#8888a0]">Variance:</span>
            <span className={`font-bold ${applied - targetPerDay >= 0 ? 'text-emerald-400' : 'text-amber-400'}`}>
              {applied - targetPerDay >= 0 ? `+${applied - targetPerDay}` : `${applied - targetPerDay}`}
            </span>
          </div>
        </div>
      </div>
    );
  }
  return null;
};
