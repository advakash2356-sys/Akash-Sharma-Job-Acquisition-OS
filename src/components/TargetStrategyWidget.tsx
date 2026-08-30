import React from 'react';
import { TargetConfig } from '../types';
import { Settings, ShieldCheck, DollarSign, MapPin, Building, CheckCircle2, AlertTriangle } from 'lucide-react';

interface TargetStrategyWidgetProps {
  targetConfig: TargetConfig;
  setTargetConfig: React.Dispatch<React.SetStateAction<TargetConfig>>;
}

export const TargetStrategyWidget: React.FC<TargetStrategyWidgetProps> = ({
  targetConfig,
  setTargetConfig
}) => {
  const handleRangeModeChange = (mode: '18-22 LPA' | '22-28 LPA Push') => {
    if (mode === '18-22 LPA') {
      setTargetConfig(prev => ({
        ...prev,
        targetRangeMode: mode,
        targetMinCtc: 18,
        targetMaxCtc: 22
      }));
    } else {
      setTargetConfig(prev => ({
        ...prev,
        targetRangeMode: mode,
        targetMinCtc: 22,
        targetMaxCtc: 28
      }));
    }
  };

  const handleShiftChange = (shift: 'Pure Remote US-Shift' | 'Delhi-NCR Hybrid Acceptable' | 'Any Remote') => {
    setTargetConfig(prev => ({
      ...prev,
      shiftPreference: shift
    }));
  };

  return (
    <div className="bg-[#0d0d0f] border border-[#1f1f23] rounded p-5 shadow-lg">
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#1f1f23]">
        <div className="flex items-center gap-2">
          <Settings className="w-4 h-4 text-blue-400" />
          <h2 className="font-bold text-white text-xs uppercase tracking-wider">Strategy & Hard Parameter Alignment</h2>
        </div>
        <span className="text-[10px] font-mono bg-green-500/10 text-green-400 font-semibold px-2.5 py-1 rounded border border-green-500/20 flex items-center gap-1.5 uppercase tracking-wider">
          <ShieldCheck className="w-3.5 h-3.5" />
          ₹18 LPA CTC HARD FLOOR ACTIVE
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
        {/* Question 1: Target Range */}
        <div className="bg-[#151518] p-4 rounded border border-[#232328] flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1.5 text-white font-bold uppercase tracking-wider text-[11px]">
              <DollarSign className="w-4 h-4 text-blue-400" />
              <span>Target CTC Band Strategy</span>
            </div>
            <p className="text-[#a0a0aa] text-[11px] mb-3 leading-relaxed">
              Floor is hard-coded at ₹18 LPA. Select target strategy push:
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => handleRangeModeChange('18-22 LPA')}
              className={`px-3 py-2 rounded font-semibold text-center transition-all ${
                targetConfig.targetRangeMode === '18-22 LPA'
                  ? 'bg-blue-600 text-white font-bold border border-blue-500 shadow-md shadow-blue-900/30'
                  : 'bg-[#1a1a1c] text-[#a0a0aa] hover:bg-[#232328] hover:text-white border border-[#2d2d30]'
              }`}
            >
              18–22 LPA
              <span className="block text-[9px] font-normal uppercase tracking-wider opacity-80 mt-0.5">Baseline Target</span>
            </button>

            <button
              onClick={() => handleRangeModeChange('22-28 LPA Push')}
              className={`px-3 py-2 rounded font-semibold text-center transition-all ${
                targetConfig.targetRangeMode === '22-28 LPA Push'
                  ? 'bg-green-600 text-white font-bold border border-green-500 shadow-md shadow-green-900/30'
                  : 'bg-[#1a1a1c] text-[#a0a0aa] hover:bg-[#232328] hover:text-white border border-[#2d2d30]'
              }`}
            >
              22–28 LPA Push
              <span className="block text-[9px] font-normal uppercase tracking-wider opacity-80 mt-0.5">High Upside Focus</span>
            </button>
          </div>
        </div>

        {/* Question 2: Location & Shift */}
        <div className="bg-[#151518] p-4 rounded border border-[#232328] flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1.5 text-white font-bold uppercase tracking-wider text-[11px]">
              <MapPin className="w-4 h-4 text-blue-400" />
              <span>Location & Shift Preference</span>
            </div>
            <p className="text-[#a0a0aa] text-[11px] mb-3 leading-relaxed">
              Configure preferred operational shift and physical location:
            </p>
          </div>

          <div className="flex flex-col gap-1.5">
            <button
              onClick={() => handleShiftChange('Pure Remote US-Shift')}
              className={`flex items-center justify-between px-3 py-1.5 rounded transition-all text-left text-[11px] ${
                targetConfig.shiftPreference === 'Pure Remote US-Shift'
                  ? 'bg-blue-600 text-white font-semibold'
                  : 'bg-[#1a1a1c] text-[#a0a0aa] hover:bg-[#232328] hover:text-white border border-[#2d2d30]'
              }`}
            >
              <span>Pure Remote US-Shift</span>
              {targetConfig.shiftPreference === 'Pure Remote US-Shift' && <CheckCircle2 className="w-3.5 h-3.5" />}
            </button>

            <button
              onClick={() => handleShiftChange('Delhi-NCR Hybrid Acceptable')}
              className={`flex items-center justify-between px-3 py-1.5 rounded transition-all text-left text-[11px] ${
                targetConfig.shiftPreference === 'Delhi-NCR Hybrid Acceptable'
                  ? 'bg-blue-600 text-white font-semibold'
                  : 'bg-[#1a1a1c] text-[#a0a0aa] hover:bg-[#232328] hover:text-white border border-[#2d2d30]'
              }`}
            >
              <span>Delhi-NCR Hybrid (Gurgaon/Noida/Bijwasan)</span>
              {targetConfig.shiftPreference === 'Delhi-NCR Hybrid Acceptable' && <CheckCircle2 className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {/* Question 3: Enterprise Target Whitelist / Blacklist */}
        <div className="bg-[#151518] p-4 rounded border border-[#232328] flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1.5 text-white font-bold uppercase tracking-wider text-[11px]">
              <Building className="w-4 h-4 text-green-400" />
              <span>Enterprise Whitelist Filters</span>
            </div>
            <div className="space-y-1 text-[11px] text-[#a0a0aa]">
              <div className="flex items-center gap-1.5 text-green-400">
                <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                <span><strong className="text-white">Priority Targets:</strong> Big-4, Gartner Alumni, US SaaS, GCCs</span>
              </div>
              <div className="flex items-center gap-1.5 text-red-400">
                <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                <span><strong className="text-white">Blacklisted:</strong> Low-ball agencies, Non-NCR, Junior IC</span>
              </div>
            </div>
          </div>

          <div className="pt-2 text-[10px] text-blue-300 font-mono bg-blue-600/10 px-2.5 py-1.5 rounded border border-blue-500/20 uppercase tracking-wider">
            Scoring Engine auto-penalizes roles outside target bounds.
          </div>
        </div>
      </div>
    </div>
  );
};
