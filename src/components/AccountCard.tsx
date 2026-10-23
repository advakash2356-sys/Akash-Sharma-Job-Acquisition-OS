import React, { useEffect, useRef, useState } from 'react';
import { LogOut, UserRound } from 'lucide-react';
import { Button, Card } from './ui';
import { isClientId, loadClientId, renderGoogleButton, signOutUser, type AuthUser } from '../lib/googleAuth';
import { importGuestData } from '../lib/storage';

export default function AccountCard({ user }: { user: AuthUser | null }) {
  const [err, setErr] = useState<string | null>(null);
  const [note, setNote] = useState('');
  const btn = useRef<HTMLDivElement>(null);
  const [googleEnabled, setOn] = useState(false);
  useEffect(() => { loadClientId().then((id) => setOn(isClientId(id))); }, []);
  useEffect(() => { if (!user && googleEnabled && btn.current) renderGoogleButton(btn.current, setErr); }, [user, googleEnabled]);
  return (
    <Card>
      <div className="mb-1 flex items-center gap-3"><UserRound size={20} className="text-primary" /><h2 className="text-3xl">Account</h2></div>
      {user ? (
        <>
          <div className="mb-4 flex items-center gap-3 text-sm">
            {user.photo && <img src={user.photo} alt="" referrerPolicy="no-referrer" className="h-10 w-10 rounded-full" />}
            <div><div className="font-medium">{user.name || 'Signed in'}</div><div className="text-muted-foreground">{user.email}</div></div>
          </div>
          <p className="mb-4 text-sm text-muted-foreground">Signed in with Google (identity verified by this app's server). Your resume, jobs and API key are stored on this device under your account id, separate from other accounts on this browser. Your name, email, visit dates and device id are kept in the owner's private Google Sheet, as described on the Privacy page. This is not cloud storage: other devices will not see this data. Signing out ends the session only; your data stays here.</p>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={() => { setNote(importGuestData(user.uid) ? 'Data saved on this browser before sign-in was required has been copied into your account. Reloading…' : 'No earlier data to copy, or your account already has data.'); setTimeout(() => location.reload(), 900); }}>Copy earlier data from this browser</Button>
            <Button variant="outline" onClick={signOutUser}><LogOut size={16} /> Sign out</Button>
          </div>
          {note && <p role="status" className="mt-3 text-sm text-primary">{note}</p>}
        </>
      ) : (
        <>
          <p className="mb-4 text-sm text-muted-foreground">You are not signed in. Sign in with Google to use the app.</p>
          {googleEnabled ? <div ref={btn} className="min-h-[44px]" /> : <Button disabled>Sign in with Google</Button>}
          {!googleEnabled && <p className="mt-3 text-sm text-muted-foreground">Google sign-in is not set up on this deployment yet. The site owner needs to add a Google client ID (see GOOGLE_SIGNIN_SETUP.md). Until then the app is unavailable.</p>}
          {err && <p role="alert" className="mt-3 text-sm text-danger">{err}</p>}
        </>
      )}
    </Card>
  );
}
