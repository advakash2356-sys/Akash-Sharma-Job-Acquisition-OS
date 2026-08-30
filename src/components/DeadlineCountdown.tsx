import React, { useState, useEffect } from 'react';
import { Clock, AlertTriangle, ShieldAlert, Flame, Zap } from 'lucide-react';

interface DeadlineCountdownProps {
  isPanicMode: boolean;
  onTogglePanicMode?: () => void;
}

export const DeadlineCountdown: React.FC<DeadlineCountdownProps> = ({
  isPanicMode,
  onTogglePanicMode
}) => {
  const targetDate = new Date('2026-08-31T23:59:59');

  const calculateTimeLeft = () => {
    const now = new Date();
    const difference = targetDate.getTime() - now.getTime();

    if (difference <= 0) {
      return { days: 0, hours: 0, minutes: 0, seconds: 0, totalDays: 0 };
    }

    const days = Math.floor(difference / (1000 * 60 * 60 * 24));
    const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((difference / 1000 / 60) % 60);
    const seconds = Math.floor((difference / 1000) % 60);

    return { days, hours, minutes, seconds, totalDays: days };
  };

  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Determine urgency status (Green -> Yellow -> Red / Panic)
  // Target deadline is 31 August 2026 (~31-32 days remaining from end of July 2026)
  let statusColor = 'border-emerald-500/50 bg-emerald-950/40 text-emerald-300';
  let badgeText = '31-DAY SPRINT ACTIVE';
  let pulseClass = '';

  if (isPanicMode || timeLeft.totalDays <= 15) {
    statusColor = 'border-red-500 bg-red-950/80 text-red-200 ring-2 ring-red-500/50';
    badgeText = 'CRITICAL PANIC MODE: GUN TO HEAD';
    pulseClass = '';
  } else if (timeLeft.totalDays <= 30) {
    statusColor = 'border-amber-500/80 bg-amber-950/60 text-amber-200';
    badgeText = 'HIGH URGENCY DEADLINE';
  }

  return (
    <div className={`border rounded-xl px-3.5 py-2 flex items-center gap-3 transition-all duration-300 shadow-xl ${statusColor} ${pulseClass}`}>
      <div className="flex items-center gap-2">
        {isPanicMode ? (
          <Flame className="w-5 h-5 text-red-400 fill-current" />
        ) : (
          <Clock className="w-4 h-4 text-amber-400 animate-spin-slow" />
        )}
        <div className="flex flex-col">
          <span className="text-[9px] font-mono font-bold uppercase tracking-widest text-white/80 flex items-center gap-1">
            <span>HARD DEADLINE: 31 AUG 2026</span>
          </span>
          <div className="flex items-baseline gap-1.5 font-mono font-extrabold text-sm sm:text-base leading-none text-white">
            <span>{timeLeft.days}<span className="text-[10px] text-amber-400 font-normal">d</span></span>
            <span>{String(timeLeft.hours).padStart(2, '0')}<span className="text-[10px] text-amber-400 font-normal">h</span></span>
            <span>{String(timeLeft.minutes).padStart(2, '0')}<span className="text-[10px] text-amber-400 font-normal">m</span></span>
            <span>{String(timeLeft.seconds).padStart(2, '0')}<span className="text-[10px] text-amber-400 font-normal">s</span></span>
          </div>
        </div>
      </div>

      {onTogglePanicMode && (
        <button
          onClick={onTogglePanicMode}
          className={`px-2.5 py-1 rounded text-[10px] font-mono font-bold uppercase tracking-wider flex items-center gap-1 border transition-all cursor-pointer ${
            isPanicMode
              ? 'bg-red-600 text-white border-red-400 hover:bg-red-500 shadow-lg shadow-red-600/30'
              : 'bg-amber-500/20 text-amber-300 border-amber-500/40 hover:bg-amber-500/30'
          }`}
          title="Toggle High-Intensity Panic Mode Sprint Targets"
        >
          <Zap className={`w-3 h-3 ${isPanicMode ? 'text-white fill-current' : 'text-amber-400'}`} />
          <span>{isPanicMode ? 'PANIC: ON (30 APPS/DAY)' : 'PANIC MODE'}</span>
        </button>
      )}
    </div>
  );
};
