import { useState } from 'react';
import { ANALYTICS_ON, gpcOn, setStatsOptOut, statsOptedOut } from '../lib/analytics';
import { exportCreditOn, setExportCredit } from '../lib/brand';

export default function PrivacyToggles() {
  const [credit, setCredit] = useState(exportCreditOn());
  const [off, setOff] = useState(statsOptedOut());
  return (
    <div className="grid gap-2 text-sm">
      <label className="flex cursor-pointer items-center gap-2"><input type="checkbox" checked={credit} onChange={(e) => { setExportCredit(e.target.checked); setCredit(e.target.checked); }} /> Add a small "Made by Akash Sync Agent" credit to the footer of exported PDF/DOCX files</label>
      {ANALYTICS_ON && gpcOn() && <p data-testid="gpc-note" className="rounded-lg bg-primary/10 px-3 py-2 text-primary">Global Privacy Control honoured: your browser asked not to be tracked, so usage counting is off and cannot be switched on here.</p>}
      {ANALYTICS_ON && !gpcOn()
        ? <label className="flex cursor-pointer items-center gap-2"><input type="checkbox" checked={!off} onChange={(e) => { setStatsOptOut(!e.target.checked); setOff(!e.target.checked); }} /> Count anonymous usage steps (no cookies, no content). Off by default until you tick it; always off with Do Not Track or Global Privacy Control.</label>
        : !ANALYTICS_ON && <p className="text-muted-foreground">Usage counting is not switched on in this deployment, so nothing is counted.</p>}
    </div>
  );
}
