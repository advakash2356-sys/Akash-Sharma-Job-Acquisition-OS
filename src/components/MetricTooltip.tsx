import React, { useState } from 'react';
import { HelpCircle, Info, Sparkles, X, ShieldCheck } from 'lucide-react';

export interface MetricTooltipProps {
  title: string;
  formula: string;
  impact18Lpa: string;
  benchmark?: string;
  children?: React.ReactNode;
}

export const MetricTooltip: React.FC<MetricTooltipProps> = ({
  title,
  formula,
  impact18Lpa,
  benchmark,
  children
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative inline-flex items-center group font-sans">
      <div 
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        className="cursor-pointer text-[#a0a0b5] hover:text-blue-400 p-0.5 rounded transition-colors"
        title={`Click for ${title} calculation details`}
      >
        {children || <HelpCircle className="w-3.5 h-3.5" />}
      </div>

      {isOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs"
          onClick={(e) => {
            e.stopPropagation();
            setIsOpen(false);
          }}
        >
          <div 
            className="bg-[#0e0f18] border border-blue-500/40 rounded-2xl p-5 max-w-md w-full shadow-2xl space-y-3 text-white text-left animate-fade-in font-sans"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-[#1f2238] pb-2.5">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-blue-500/20 text-blue-400 rounded-lg border border-blue-500/30">
                  <Info className="w-4 h-4" />
                </div>
                <h4 className="font-bold text-sm text-white font-mono uppercase tracking-wider">{title}</h4>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-[#888898] hover:text-white p-1 rounded-lg cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <div className="bg-[#141626] p-3 rounded-xl border border-[#232742] space-y-1">
                <span className="text-[10px] font-mono text-blue-300 uppercase font-bold block">📐 Calculation Formula / Metric Logic:</span>
                <p className="text-slate-200 leading-relaxed font-mono text-[11px]">{formula}</p>
              </div>

              <div className="bg-emerald-950/30 p-3 rounded-xl border border-emerald-500/30 space-y-1">
                <span className="text-[10px] font-mono text-emerald-400 uppercase font-bold flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Target Impact on ₹18+ LPA Offer Goal:
                </span>
                <p className="text-emerald-200/90 leading-relaxed text-[11px]">{impact18Lpa}</p>
              </div>

              {benchmark && (
                <div className="bg-amber-950/20 p-2.5 rounded-xl border border-amber-500/20 text-[11px] text-amber-200 font-mono">
                  <span className="font-bold text-amber-400">⚡ Benchmark: </span>
                  <span>{benchmark}</span>
                </div>
              )}
            </div>

            <div className="pt-2 text-right">
              <button
                onClick={() => setIsOpen(false)}
                className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-mono text-xs font-bold rounded-lg cursor-pointer"
              >
                Got It
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
