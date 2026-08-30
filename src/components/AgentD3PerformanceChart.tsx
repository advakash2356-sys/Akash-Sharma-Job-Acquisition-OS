import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { BarChart2, TrendingUp, Sparkles, Award, Zap, RefreshCw, Layers } from 'lucide-react';

export interface AgentPerformanceData {
  id: string;
  name: string;
  role: string;
  appVolume: number; // Applications submitted in last 14 days
  leadConversionRate: number; // High priority lead conversion rate %
  highPriorityLeads: number; // Count of interview/offer leads generated
  avgResponseTimeHours: number;
  color: string;
}

export const AGENT_PERFORMANCE_DATA: AgentPerformanceData[] = [
  {
    id: 'agent-ats',
    name: 'ATS Resume Architect',
    role: 'Tailoring & Keyword Matching',
    appVolume: 210,
    leadConversionRate: 34,
    highPriorityLeads: 28,
    avgResponseTimeHours: 1.2,
    color: '#10b981' // emerald
  },
  {
    id: 'agent-outreach',
    name: 'Outreach Specialist',
    role: 'Recruiter Direct Cold Emailing',
    appVolume: 165,
    leadConversionRate: 26,
    highPriorityLeads: 21,
    avgResponseTimeHours: 0.8,
    color: '#3b82f6' // blue
  },
  {
    id: 'agent-market',
    name: 'CTC Floor Auditor',
    role: 'Compensation Threshold Filtering',
    appVolume: 140,
    leadConversionRate: 30,
    highPriorityLeads: 18,
    avgResponseTimeHours: 0.5,
    color: '#f59e0b' // amber
  },
  {
    id: 'agent-workday',
    name: 'Workday 1-Click Bot',
    role: 'Portal Auto-Fill Submissions',
    appVolume: 125,
    leadConversionRate: 22,
    highPriorityLeads: 14,
    avgResponseTimeHours: 2.1,
    color: '#8b5cf6' // purple
  },
  {
    id: 'agent-headhunter',
    name: 'Headhunter Lead Scraper',
    role: 'Talent Acquisition Contact Mining',
    appVolume: 98,
    leadConversionRate: 19,
    highPriorityLeads: 11,
    avgResponseTimeHours: 1.5,
    color: '#ec4899' // pink
  }
];

interface AgentD3PerformanceChartProps {
  data?: AgentPerformanceData[];
}

export const AgentD3PerformanceChart: React.FC<AgentD3PerformanceChartProps> = ({
  data = AGENT_PERFORMANCE_DATA
}) => {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [selectedMetric, setSelectedMetric] = useState<'both' | 'volume' | 'conversion'>('both');
  const [activeTooltip, setActiveTooltip] = useState<{
    x: number;
    y: number;
    agent: AgentPerformanceData;
  } | null>(null);

  useEffect(() => {
    if (!svgRef.current || !containerRef.current) return;

    // Clear previous SVG contents
    const svgEl = d3.select(svgRef.current);
    svgEl.selectAll('*').remove();

    // Dimensions
    const containerWidth = containerRef.current.clientWidth || 600;
    const height = 300;
    const margin = { top: 30, right: 50, bottom: 65, left: 55 };
    const width = containerWidth - margin.left - margin.right;

    svgEl
      .attr('width', containerWidth)
      .attr('height', height)
      .attr('viewBox', `0 0 ${containerWidth} ${height}`);

    const g = svgEl
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // X Scale (Agents)
    const x0 = d3.scaleBand()
      .domain(data.map(d => d.name))
      .rangeRound([0, width])
      .paddingInner(0.3);

    // X1 Scale for grouped bars if both metrics are selected
    const x1 = d3.scaleBand()
      .domain(['appVolume', 'leadConversionRate'])
      .rangeRound([0, x0.bandwidth()])
      .padding(0.1);

    // Y Scale (Left: Application Volume)
    const maxVolume = d3.max(data, d => d.appVolume) || 250;
    const yVolume = d3.scaleLinear()
      .domain([0, Math.ceil(maxVolume * 1.15)])
      .nice()
      .rangeRound([height - margin.top - margin.bottom, 0]);

    // Y Scale (Right: Lead Conversion Rate %)
    const yConversion = d3.scaleLinear()
      .domain([0, 50])
      .rangeRound([height - margin.top - margin.bottom, 0]);

    // Grid lines (horizontal)
    g.append('g')
      .attr('class', 'grid')
      .call(
        d3.axisLeft(yVolume)
          .ticks(5)
          .tickSize(-width)
          .tickFormat(() => '')
      )
      .selectAll('line')
      .attr('stroke', '#1e2238')
      .attr('stroke-dasharray', '3,3');

    // Bottom Axis (Agent names)
    const xAxis = g.append('g')
      .attr('transform', `translate(0,${height - margin.top - margin.bottom})`)
      .call(d3.axisBottom(x0));

    xAxis.selectAll('text')
      .style('fill', '#9090aa')
      .style('font-size', '11px')
      .style('font-family', 'monospace')
      .style('font-weight', 'bold')
      .attr('dy', '1.2em')
      .attr('transform', 'rotate(-10)')
      .style('text-anchor', 'end');

    xAxis.selectAll('line').attr('stroke', '#2a2e45');
    xAxis.select('.domain').attr('stroke', '#2a2e45');

    // Left Y Axis (Application Volume)
    if (selectedMetric === 'both' || selectedMetric === 'volume') {
      const yAxisLeft = g.append('g')
        .call(d3.axisLeft(yVolume).ticks(5));

      yAxisLeft.selectAll('text')
        .style('fill', '#60a5fa')
        .style('font-size', '10px')
        .style('font-family', 'monospace');

      yAxisLeft.selectAll('line').attr('stroke', '#2a2e45');
      yAxisLeft.select('.domain').attr('stroke', '#2a2e45');

      // Left Axis Label
      g.append('text')
        .attr('transform', 'rotate(-90)')
        .attr('y', -42)
        .attr('x', -(height - margin.top - margin.bottom) / 2)
        .attr('fill', '#60a5fa')
        .attr('font-size', '10px')
        .attr('font-family', 'monospace')
        .attr('font-weight', 'bold')
        .attr('text-anchor', 'middle')
        .text('Applications Submitted (14d)');
    }

    // Right Y Axis (Conversion Rate %)
    if (selectedMetric === 'both' || selectedMetric === 'conversion') {
      const yAxisRight = g.append('g')
        .attr('transform', `translate(${width}, 0)`)
        .call(d3.axisRight(yConversion).ticks(5).tickFormat(d => `${d}%`));

      yAxisRight.selectAll('text')
        .style('fill', '#10b981')
        .style('font-size', '10px')
        .style('font-family', 'monospace');

      yAxisRight.selectAll('line').attr('stroke', '#2a2e45');
      yAxisRight.select('.domain').attr('stroke', '#2a2e45');

      // Right Axis Label
      g.append('text')
        .attr('transform', 'rotate(90)')
        .attr('y', -width - 40)
        .attr('x', (height - margin.top - margin.bottom) / 2)
        .attr('fill', '#10b981')
        .attr('font-size', '10px')
        .attr('font-family', 'monospace')
        .attr('font-weight', 'bold')
        .attr('text-anchor', 'middle')
        .text('High-Priority Lead Conversion %');
    }

    // Draw Bars / Charts
    const agentGroups = g.selectAll('.agent-group')
      .data(data)
      .enter()
      .append('g')
      .attr('class', 'agent-group')
      .attr('transform', d => `translate(${x0(d.name)}, 0)`);

    // 1. Application Volume Bars (Blue Gradient)
    if (selectedMetric === 'both' || selectedMetric === 'volume') {
      agentGroups.append('rect')
        .attr('x', d => selectedMetric === 'both' ? (x1('appVolume') || 0) : 0)
        .attr('width', d => selectedMetric === 'both' ? x1.bandwidth() : x0.bandwidth())
        .attr('y', height - margin.top - margin.bottom)
        .attr('height', 0)
        .attr('rx', 4)
        .attr('fill', d => d.color)
        .attr('opacity', 0.85)
        .on('mouseenter', (event, d) => {
          const bounds = containerRef.current?.getBoundingClientRect();
          if (bounds) {
            setActiveTooltip({
              x: event.clientX - bounds.left,
              y: event.clientY - bounds.top,
              agent: d
            });
          }
        })
        .on('mouseleave', () => setActiveTooltip(null))
        .transition()
        .duration(800)
        .attr('y', d => yVolume(d.appVolume))
        .attr('height', d => (height - margin.top - margin.bottom) - yVolume(d.appVolume));

      // Bar Top Labels for Volume
      agentGroups.append('text')
        .attr('x', d => selectedMetric === 'both' ? (x1('appVolume') || 0) + x1.bandwidth() / 2 : x0.bandwidth() / 2)
        .attr('y', d => yVolume(d.appVolume) - 6)
        .attr('fill', '#60a5fa')
        .attr('font-size', '10px')
        .attr('font-family', 'monospace')
        .attr('font-weight', 'bold')
        .attr('text-anchor', 'middle')
        .text(d => d.appVolume);
    }

    // 2. Conversion Rate Line / Bar Overlay
    if (selectedMetric === 'both') {
      // Draw conversion line across agents
      const lineGenerator = d3.line<AgentPerformanceData>()
        .x(d => (x0(d.name) || 0) + x0.bandwidth() / 2)
        .y(d => yConversion(d.leadConversionRate))
        .curve(d3.curveMonotoneX);

      g.append('path')
        .datum(data)
        .attr('fill', 'none')
        .attr('stroke', '#10b981')
        .attr('stroke-width', 2.5)
        .attr('stroke-dasharray', '4,4')
        .attr('d', lineGenerator);

      // Circles for conversion rate points
      g.selectAll('.conversion-dot')
        .data(data)
        .enter()
        .append('circle')
        .attr('class', 'conversion-dot')
        .attr('cx', d => (x0(d.name) || 0) + x0.bandwidth() / 2)
        .attr('cy', d => yConversion(d.leadConversionRate))
        .attr('r', 5)
        .attr('fill', '#10b981')
        .attr('stroke', '#ffffff')
        .attr('stroke-width', 1.5)
        .style('cursor', 'pointer')
        .on('mouseenter', (event, d) => {
          const bounds = containerRef.current?.getBoundingClientRect();
          if (bounds) {
            setActiveTooltip({
              x: event.clientX - bounds.left,
              y: event.clientY - bounds.top,
              agent: d
            });
          }
        })
        .on('mouseleave', () => setActiveTooltip(null));

      // Conversion rate label text
      g.selectAll('.conversion-label')
        .data(data)
        .enter()
        .append('text')
        .attr('class', 'conversion-label')
        .attr('x', d => (x0(d.name) || 0) + x0.bandwidth() / 2)
        .attr('y', d => yConversion(d.leadConversionRate) - 10)
        .attr('fill', '#34d399')
        .attr('font-size', '10px')
        .attr('font-family', 'monospace')
        .attr('font-weight', 'bold')
        .attr('text-anchor', 'middle')
        .text(d => `${d.leadConversionRate}%`);
    } else if (selectedMetric === 'conversion') {
      agentGroups.append('rect')
        .attr('x', 0)
        .attr('width', x0.bandwidth())
        .attr('y', height - margin.top - margin.bottom)
        .attr('height', 0)
        .attr('rx', 4)
        .attr('fill', '#10b981')
        .attr('opacity', 0.85)
        .on('mouseenter', (event, d) => {
          const bounds = containerRef.current?.getBoundingClientRect();
          if (bounds) {
            setActiveTooltip({
              x: event.clientX - bounds.left,
              y: event.clientY - bounds.top,
              agent: d
            });
          }
        })
        .on('mouseleave', () => setActiveTooltip(null))
        .transition()
        .duration(800)
        .attr('y', d => yConversion(d.leadConversionRate))
        .attr('height', d => (height - margin.top - margin.bottom) - yConversion(d.leadConversionRate));

      agentGroups.append('text')
        .attr('x', x0.bandwidth() / 2)
        .attr('y', d => yConversion(d.leadConversionRate) - 6)
        .attr('fill', '#34d399')
        .attr('font-size', '10px')
        .attr('font-family', 'monospace')
        .attr('font-weight', 'bold')
        .attr('text-anchor', 'middle')
        .text(d => `${d.leadConversionRate}%`);
    }

  }, [data, selectedMetric]);

  return (
    <div className="bg-[#0d0d0f] border border-[#1f1f28] hover:border-blue-500/30 rounded-2xl p-5 shadow-2xl space-y-4 font-sans relative overflow-hidden transition-all">
      {/* Background Glow */}
      <div className="absolute top-0 right-1/4 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none"></div>

      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#1c1d28] pb-3.5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/40 flex items-center justify-center font-bold text-emerald-400 shadow-md">
            <BarChart2 className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-white uppercase tracking-wider font-mono">
                14-Day Active Agent D3 Performance Matrix
              </h3>
              <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-mono px-2 py-0.5 rounded font-bold uppercase flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-emerald-300" />
                D3.JS VECTOR GRAPH
              </span>
            </div>
            <p className="text-xs text-[#9090a8] mt-0.5">
              Comparative visualization of application submission output volume vs. high-priority recruiter lead conversion rates.
            </p>
          </div>
        </div>

        {/* View Metric Toggles */}
        <div className="flex items-center gap-1 bg-[#12131e] border border-[#23263d] p-1 rounded-xl text-xs font-mono">
          <button
            onClick={() => setSelectedMetric('both')}
            className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
              selectedMetric === 'both'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-[#888898] hover:text-white hover:bg-[#1b1e32]'
            }`}
          >
            Dual Overlay
          </button>
          <button
            onClick={() => setSelectedMetric('volume')}
            className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
              selectedMetric === 'volume'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-[#888898] hover:text-white hover:bg-[#1b1e32]'
            }`}
          >
            App Volume
          </button>
          <button
            onClick={() => setSelectedMetric('conversion')}
            className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
              selectedMetric === 'conversion'
                ? 'bg-purple-600 text-white shadow-md'
                : 'text-[#888898] hover:text-white hover:bg-[#1b1e32]'
            }`}
          >
            Conversion %
          </button>
        </div>
      </div>

      {/* D3 SVG Container */}
      <div ref={containerRef} className="relative w-full overflow-hidden pt-2">
        <svg ref={svgRef} className="w-full h-auto overflow-visible"></svg>

        {/* Interactive Floating Tooltip */}
        {activeTooltip && (
          <div
            className="absolute z-50 pointer-events-none bg-[#090a12] border border-[#2a2e4d] p-3 rounded-xl shadow-2xl font-mono text-xs text-white space-y-1.5 transition-all transform -translate-x-1/2 -translate-y-full"
            style={{
              left: `${activeTooltip.x}px`,
              top: `${Math.max(10, activeTooltip.y - 12)}px`
            }}
          >
            <div className="flex items-center justify-between gap-3 border-b border-[#1f2238] pb-1">
              <span className="font-bold text-white">{activeTooltip.agent.name}</span>
              <span className="text-[9px] bg-blue-500/20 text-blue-300 border border-blue-500/30 px-1.5 py-0.2 rounded font-bold">
                14d SLA
              </span>
            </div>
            <div className="space-y-1 text-[11px]">
              <div className="flex justify-between gap-4">
                <span className="text-[#8888a0]">Role:</span>
                <span className="text-white font-bold">{activeTooltip.agent.role}</span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-[#8888a0]">App Volume:</span>
                <span className="text-blue-400 font-bold">{activeTooltip.agent.appVolume} Jobs</span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-[#8888a0]">Conversion Rate:</span>
                <span className="text-emerald-400 font-bold">{activeTooltip.agent.leadConversionRate}%</span>
              </div>
              <div className="flex justify-between gap-4 border-t border-[#1a1c2e] pt-1 text-[10px]">
                <span className="text-[#8888a0]">High Priority Leads:</span>
                <span className="text-amber-300 font-bold">{activeTooltip.agent.highPriorityLeads} Verified</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Agent Performance Summary Badges */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 font-mono text-xs pt-1">
        {data.map(ag => (
          <div key={ag.id} className="bg-[#10111a] p-2.5 rounded-xl border border-[#202336] space-y-1">
            <span className="text-white font-bold text-[11px] block truncate">{ag.name}</span>
            <div className="flex justify-between text-[10px] text-[#888898]">
              <span>Apps: <strong className="text-blue-400">{ag.appVolume}</strong></span>
              <span>Conv: <strong className="text-emerald-400">{ag.leadConversionRate}%</strong></span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
