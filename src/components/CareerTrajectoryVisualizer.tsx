import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { ResumeData } from './ResumeUpload';
import { JobRole } from '../types';
import { TrendingUp, Sparkles, Award, Compass, ArrowRight, Layers } from 'lucide-react';

interface CareerTrajectoryVisualizerProps {
  resumeData: ResumeData;
  jobs: JobRole[];
}

export const CareerTrajectoryVisualizer: React.FC<CareerTrajectoryVisualizerProps> = ({
  resumeData,
  jobs
}) => {
  const svgRef = useRef<SVGSVGElement | null>(null);

  useEffect(() => {
    if (!svgRef.current) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove(); // Clear previous drawings

    const width = 700;
    const height = 260;

    // Define tree data node hierarchy
    const nodesData = [
      {
        id: 'current',
        title: 'Senior Fullstack Engineer',
        salary: '₹18L - ₹22L LPA',
        timeline: 'Current Level',
        x: 80,
        y: 130,
        color: '#10b981',
        badges: ['React 18', 'TypeScript', 'Node.js']
      },
      {
        id: 'target',
        title: 'Staff Architect / Lead (US Night)',
        salary: '₹24L - ₹28L LPA',
        timeline: 'Target: Aug 2026',
        x: 350,
        y: 80,
        color: '#3b82f6',
        badges: ['System Design', 'AWS Cloud', 'Microservices']
      },
      {
        id: 'future',
        title: 'Principal Engineer / Director',
        salary: '₹35L - ₹48L LPA',
        timeline: '1-2 Years Goal',
        x: 620,
        y: 130,
        color: '#f59e0b',
        badges: ['Distributed Systems', 'Team Leadership']
      }
    ];

    const linksData = [
      { source: nodesData[0], target: nodesData[1], label: '31 Aug 2026 Goal' },
      { source: nodesData[1], target: nodesData[2], label: 'Career Scale' }
    ];

    // Render smooth d3 Bezier curve links
    linksData.forEach(link => {
      const linkGenerator = d3.linkHorizontal<any, any>()
        .x(d => d.x)
        .y(d => d.y);

      svg.append('path')
        .datum({ source: link.source, target: link.target })
        .attr('d', linkGenerator as any)
        .attr('fill', 'none')
        .attr('stroke', '#333750')
        .attr('stroke-width', 3)
        .attr('stroke-dasharray', '6 4');
    });

    // Draw Node Groups
    const nodeGroups = svg.selectAll('.node')
      .data(nodesData)
      .enter()
      .append('g')
      .attr('transform', d => `translate(${d.x}, ${d.y})`);

    // Outer Glowing Circles
    nodeGroups.append('circle')
      .attr('r', 28)
      .attr('fill', d => `${d.color}20`)
      .attr('stroke', d => d.color)
      .attr('stroke-width', 2);

    // Inner Solid Nodes
    nodeGroups.append('circle')
      .attr('r', 12)
      .attr('fill', d => d.color);

    // Labels Title
    nodeGroups.append('text')
      .text(d => d.title)
      .attr('y', -38)
      .attr('text-anchor', 'middle')
      .attr('fill', '#ffffff')
      .attr('font-size', '12px')
      .attr('font-weight', 'bold')
      .attr('font-family', 'sans-serif');

    // Labels Salary
    nodeGroups.append('text')
      .text(d => d.salary)
      .attr('y', 45)
      .attr('text-anchor', 'middle')
      .attr('fill', d => d.color)
      .attr('font-size', '11px')
      .attr('font-weight', 'bold')
      .attr('font-family', 'monospace');

    // Timeline Subtitle
    nodeGroups.append('text')
      .text(d => d.timeline)
      .attr('y', 60)
      .attr('text-anchor', 'middle')
      .attr('fill', '#888898')
      .attr('font-size', '10px')
      .attr('font-family', 'monospace');

  }, [resumeData, jobs]);

  return (
    <div className="bg-[#0d0d0f] border border-[#1f1f23] rounded-xl p-5 sm:p-6 shadow-2xl space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#1f1f23] pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-blue-500/20 text-blue-400 border border-blue-500/30 text-[10px] font-mono px-2.5 py-0.5 rounded font-bold uppercase tracking-wider flex items-center gap-1.5">
              <Compass className="w-3.5 h-3.5 text-blue-400" />
              D3 VISUALIZATION
            </span>
            <span className="bg-amber-500/10 text-amber-300 border border-amber-500/30 text-[10px] font-mono px-2 py-0.5 rounded">
              CAREER ROADMAP ENGINE
            </span>
          </div>
          <h2 className="text-lg font-bold text-white uppercase tracking-wider mt-1.5 flex items-center gap-2">
            <span>Career Trajectory & Milestone Visualizer</span>
          </h2>
          <p className="text-xs text-[#a0a0aa]">
            D3-powered roadmap plotting candidate progression from Senior Engineer to Staff Architect (₹24L–₹28L LPA target).
          </p>
        </div>

        <div className="bg-[#12131c] border border-[#222434] px-3 py-1.5 rounded-xl self-start sm:self-auto font-mono text-xs">
          <span className="text-[#888] block text-[10px] uppercase">Target CTC Jump</span>
          <span className="text-emerald-400 font-bold text-sm">+33% Increment Floor</span>
        </div>
      </div>

      {/* D3 Canvas Container */}
      <div className="bg-[#12131c] border border-[#222434] rounded-xl p-4 overflow-x-auto flex justify-center">
        <svg ref={svgRef} width={700} height={230} className="w-full max-w-[700px]"></svg>
      </div>
    </div>
  );
};
