import React, { useState } from 'react';
import { LogIn, LogOut, UserRound } from 'lucide-react';
import { Button, Card } from './ui';
import { firebaseEnabled, signInWithGoogle, signOutUser, type AuthUser } from '../lib/firebase';
import { importGuestData } from '../lib/storage';

export default function AccountCard({ user }: { user: AuthUser | null }) {
  const [err, setErr] = useState<string | null>(null);
  const [note, setNote] = useState('');
  return (
    <Card>
      <div className="mb-1 flex items-center gap-3"><UserRound size={20} className="text-primary" /><h2 className="text-3xl">Account</h2></div>
      {user ? (
        <>
          <div className="mb-4 flex items-center gap-3 text-sm">
            {user.photo && <img src={user.photo} alt="" referrerPolicy="no-referrer" className="h-10 w-10 rounded-full" />}
            <div><div className="font-medium">{user.name || 'Signed in'}</div><div className="text-muted-foreground">{user.email}</div></div>
          </div>
          <p className="mb-4 text-sm text-muted-foreground">Signed in with Google. Your resume, jobs and API key are stored on this device under your account, separate from guest data and from other accounts on this browser.</p>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={() => { setNote(importGuestData(user.uid) ? 'Guest data copied into your account. Reloading…' : 'No guest data to copy, or your account already has data.'); setTimeout(() => location.reload(), 900); }}>Copy guest data into my account</Button>
            <Button variant="outline" onClick={signOutUser}><LogOut size={16} /> Sign out</Button>
          </div>
          {note && <p role="status" className="mt-3 text-sm text-primary">{note}</p>}
        </>
      ) : (
        <>
          <p className="mb-4 text-sm text-muted-foreground">You are using guest mode: everything works and stays on this device. Sign in with Google to keep a separate, named workspace per person on a shared browser.</p>
          <Button disabled={!firebaseEnabled} onClick={async () => setErr(await signInWithGoogle())}><LogIn size={16} /> Sign in with Google</Button>
          {!firebaseEnabled && <p className="mt-3 text-sm text-muted-foreground">Google sign-in is not set up on this deployment yet. The site owner needs to add the Firebase settings (see FIREBASE_SETUP.md). Guest mode is unaffected.</p>}
          {err && <p role="alert" className="mt-3 text-sm text-danger">{err}</p>}
        </>
      )}
    </Card>
  );
}
