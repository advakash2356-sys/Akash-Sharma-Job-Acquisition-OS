import React, { useEffect, useRef, useState } from 'react';
import { Pause, Play, RotateCcw } from 'lucide-react';
import { Button } from './ui';

/** Simple focus timer: 25 minute sprints for applications or prep. Resets on reload by design. */
export default function FocusTimer() {
  const [left, setLeft] = useState(25 * 60);
  const [run, setRun] = useState(false);
  const t = useRef<number | undefined>(undefined);
  useEffect(() => {
    if (!run) return;
    t.current = window.setInterval(() => setLeft((l) => (l <= 1 ? (setRun(false), 0) : l - 1)), 1000);
    return () => clearInterval(t.current);
  }, [run]);
  const mm = String(Math.floor(left / 60)).padStart(2, '0'), ss = String(left % 60).padStart(2, '0');
  return (
    <div>
      <div className="label mb-2 text-muted-foreground">Focus sprint</div>
      <div className="display text-6xl tabular-nums" role="timer" aria-live="off">{mm}:{ss}</div>
      <div className="mt-3 flex gap-2">
        <Button size="sm" onClick={() => setRun(!run)}>{run ? <Pause size={14} /> : <Play size={14} />} {run ? 'Pause' : left === 0 ? 'Done' : 'Start'}</Button>
        <Button size="sm" variant="outline" aria-label="Reset timer" onClick={() => { setRun(false); setLeft(25 * 60); }}><RotateCcw size={14} /></Button>
      </div>
    </div>
  );
}
