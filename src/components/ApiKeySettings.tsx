import React, { useState } from 'react';
import { getUserApiKey, setUserApiKey, clearUserApiKey } from '../lib/userApiKey';

/** Secure "Enter your API key" section: masked input, stored only in this browser. */
export default function ApiKeySettings() {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState('');
  const [show, setShow] = useState(false);
  const [saved, setSaved] = useState<boolean>(() => !!getUserApiKey());
  const [msg, setMsg] = useState('');

  const save = () => {
    if (!value.trim()) { setMsg('Paste a key first.'); return; }
    setUserApiKey(value);
    setValue('');
    setSaved(true);
    setMsg('Key saved in this browser only.');
  };
  const remove = () => {
    clearUserApiKey();
    setValue('');
    setSaved(false);
    setMsg('Key removed.');
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        style={{ position: 'fixed', right: 16, bottom: 16, zIndex: 9999 }}
        className="rounded-full bg-black/80 px-4 py-2 text-xs font-medium text-white shadow-lg hover:bg-black"
      >
        {saved ? 'API key: set' : 'Enter your API key'}
      </button>
      {open && (
        <div
          style={{ position: 'fixed', inset: 0, zIndex: 10000, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}
          onClick={() => setOpen(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{ background: '#fff', color: '#111', borderRadius: 12, padding: 20, width: '100%', maxWidth: 420 }}
          >
            <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 4 }}>Your Gemini API key</h2>
            <p style={{ fontSize: 12, color: '#555', marginBottom: 12 }}>
              Get a free key at aistudio.google.com/apikey. Status: <b>{saved ? 'key saved' : 'no key saved'}</b>
            </p>
            <div style={{ display: 'flex', gap: 8 }}>
              <input
                type={show ? 'text' : 'password'}
                autoComplete="off"
                spellCheck={false}
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder={saved ? '•••••••• (saved) – paste to replace' : 'Paste your API key'}
                style={{ flex: 1, border: '1px solid #ccc', borderRadius: 8, padding: '8px 10px', fontSize: 14 }}
              />
              <button type="button" onClick={() => setShow(!show)} style={{ border: '1px solid #ccc', borderRadius: 8, padding: '0 10px', fontSize: 12 }}>
                {show ? 'Hide' : 'Show'}
              </button>
            </div>
            <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
              <button type="button" onClick={save} style={{ background: '#111', color: '#fff', borderRadius: 8, padding: '8px 14px', fontSize: 13 }}>Save key</button>
              <button type="button" onClick={remove} disabled={!saved} style={{ border: '1px solid #c00', color: '#c00', borderRadius: 8, padding: '8px 14px', fontSize: 13, opacity: saved ? 1 : 0.4 }}>Remove key</button>
              <button type="button" onClick={() => setOpen(false)} style={{ marginLeft: 'auto', fontSize: 13 }}>Close</button>
            </div>
            {msg && <p style={{ fontSize: 12, marginTop: 8 }}>{msg}</p>}
            <p style={{ fontSize: 11, color: '#666', marginTop: 12 }}>
              Privacy: your key is stored only in this browser (localStorage). It is never committed or logged. It is sent only to this
              app's own server with each request and forwarded straight to Google's Gemini API. Use "Remove key" to delete it.
            </p>
          </div>
        </div>
      )}
    </>
  );
}
