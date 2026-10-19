import { useEffect, useState } from 'react';
import { TEST_EVENT, TEST_NOTICE, isTestMode, setTestMode } from '../lib/exporters';

export default function TestModeToggle() {
  const [on, setOn] = useState(isTestMode());
  useEffect(() => { const f = () => setOn(isTestMode()); window.addEventListener(TEST_EVENT, f); return () => window.removeEventListener(TEST_EVENT, f); }, []);
  return (
    <div className={`mb-4 rounded-xl border p-3 text-sm ${on ? 'border-gold/60 bg-gold/10' : 'border-border'}`}>
      <label className="flex cursor-pointer items-center gap-2">
        <input type="checkbox" checked={on} onChange={(e) => setTestMode(e.target.checked)} />
        <b>Test mode</b>
        <span className="text-muted-foreground">Gmail drafts and .eml files start with "{TEST_NOTICE}" in the subject and body. The app never sends email either way.</span>
      </label>
      {on && <p role="status" className="mt-1 font-medium">Test mode is ON. Drafts are marked as tests.</p>}
    </div>
  );
}
