import React from 'react';
import { Target, Briefcase, BarChart3, FileText, Bot, Sparkles } from 'lucide-react';

interface BottomMobileNavProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const BottomMobileNav: React.FC<BottomMobileNavProps> = ({
  activeTab,
  setActiveTab,
}) => {
  const tabs = [
    { id: 'simple-overview', label: 'Simple', icon: Sparkles },
    { id: 'overview', label: 'Control', icon: Target },
    { id: 'pipeline', label: 'Pipeline', icon: Briefcase },
    { id: 'status-tracker', label: 'Status', icon: BarChart3 },
    { id: 'agent-ceo', label: 'AI CEO', icon: Bot },
  ];

  return (
    <nav 
      aria-label="Mobile Navigation"
      className="fixed bottom-0 left-0 right-0 z-40 bg-[#0a0a0e]/95 backdrop-blur-md border-t border-[#1f2238] sm:hidden flex items-center justify-around py-2 px-1 text-[10px] font-mono shadow-2xl"
    >
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;

        return (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex flex-col items-center justify-center py-1 px-2 rounded-lg transition-all cursor-pointer ${
              isActive
                ? 'text-blue-400 font-bold bg-blue-500/15 border border-blue-500/30'
                : 'text-[#808095] hover:text-white'
            }`}
          >
            <Icon className={`w-4 h-4 mb-0.5 ${isActive ? 'text-blue-400' : 'text-[#808095]'}`} />
            <span className="truncate max-w-[64px]">{tab.label}</span>
          </button>
        );
      })}
    </nav>
  );
};
