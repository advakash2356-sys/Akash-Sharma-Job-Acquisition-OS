import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, 
  Lock, 
  Unlock, 
  Key, 
  UserCheck, 
  UserPlus, 
  Trash2, 
  CheckCircle2, 
  X, 
  Mail, 
  Sparkles, 
  AlertCircle, 
  ShieldCheck, 
  LogOut, 
  Users 
} from 'lucide-react';

import { CONTACT_EMAIL } from '../config';

export const PRIMARY_ADMIN_EMAIL = CONTACT_EMAIL;
const STORAGE_KEY_WHITELIST = 'whitelisted_users_v2';
const STORAGE_KEY_ACTIVE_USER = 'active_user_email_v2';

export function getStoredWhitelist(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_WHITELIST);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        // Ensure primary admin is always present
        const lowerAdmin = PRIMARY_ADMIN_EMAIL.toLowerCase();
        if (!parsed.some(e => e.toLowerCase() === lowerAdmin)) {
          parsed.unshift(PRIMARY_ADMIN_EMAIL);
        }
        return parsed;
      }
    }
  } catch (e) {
    console.error('Failed to parse whitelist from localStorage', e);
  }
  return [PRIMARY_ADMIN_EMAIL];
}

export function saveWhitelist(emails: string[]) {
  try {
    localStorage.setItem(STORAGE_KEY_WHITELIST, JSON.stringify(emails));
  } catch (e) {
    console.error('Failed to save whitelist', e);
  }
}

export function getActiveUserEmail(): string | null {
  return localStorage.getItem(STORAGE_KEY_ACTIVE_USER);
}

export function setActiveUserEmail(email: string | null) {
  if (email) {
    localStorage.setItem(STORAGE_KEY_ACTIVE_USER, email);
  } else {
    localStorage.removeItem(STORAGE_KEY_ACTIVE_USER);
  }
}

interface AdminAccessGateProps {
  children: React.ReactNode;
  activeUserEmail: string | null;
  whitelist: string[];
  onLogin: (email: string) => void;
  onLogout: () => void;
}

export const AdminAccessGate: React.FC<AdminAccessGateProps> = ({
  children,
  activeUserEmail,
  whitelist,
  onLogin,
  onLogout
}) => {
  const [inputEmail, setInputEmail] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const isWhitelisted = (email: string) => {
    if (!email) return false;
    const clean = email.trim().toLowerCase();
    return whitelist.some(w => w.trim().toLowerCase() === clean);
  };

  const handleVerifyLogin = (emailToVerify?: string) => {
    const email = (emailToVerify || inputEmail).trim();
    if (!email) {
      setErrorMsg('Please enter a valid Gmail address.');
      return;
    }

    if (!email.includes('@')) {
      setErrorMsg('Invalid email format. Please enter a full Gmail address.');
      return;
    }

    if (isWhitelisted(email)) {
      setErrorMsg(null);
      onLogin(email);
    } else {
      setErrorMsg(`Access Restricted: '${email}' is not on the authorized whitelist. Only Super Admin ${PRIMARY_ADMIN_EMAIL} can grant access.`);
    }
  };

  // If user is logged in & whitelisted, show full site children
  if (activeUserEmail && isWhitelisted(activeUserEmail)) {
    return <>{children}</>;
  }

  // Otherwise, render full screen Security Gate
  return (
    <div className="min-h-screen bg-[#090a0f] text-white flex flex-col items-center justify-center p-4 selection:bg-amber-500 selection:text-black">
      {/* Background Decorative Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="w-full max-w-md bg-[#0f1118] border border-amber-500/40 rounded-2xl shadow-2xl overflow-hidden relative z-10">
        {/* Top Header */}
        <div className="bg-gradient-to-r from-amber-950/80 via-[#181a26] to-indigo-950/80 border-b border-amber-500/30 p-6 text-center">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500 to-yellow-600 flex items-center justify-center text-black shadow-xl shadow-amber-500/20 mx-auto mb-3">
            <Lock className="w-7 h-7 stroke-[2.5]" />
          </div>

          <span className="bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-mono px-2.5 py-0.5 rounded font-bold uppercase tracking-wider inline-flex items-center gap-1 mb-2">
            <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
            RESTRICTED ADMIN SECURITY GATE
          </span>

          <h1 className="text-xl font-extrabold text-white uppercase tracking-tight">
            Executive Portal Lock
          </h1>
          <p className="text-xs text-[#a0a0b8] mt-1">
            Access strictly locked to authorized accounts. Primary Admin: <strong className="text-amber-300 font-mono">{PRIMARY_ADMIN_EMAIL}</strong>
          </p>
        </div>

        {/* Verification Form */}
        <div className="p-6 space-y-5">
          {errorMsg && (
            <div className="bg-red-500/10 border border-red-500/30 p-3.5 rounded-xl text-xs text-red-300 flex items-start gap-2.5 animate-shake">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-white uppercase tracking-wider flex items-center justify-between">
              <span>Enter Approved Gmail Address:</span>
              <span className="text-[10px] text-[#888898] font-mono">Whitelist Enforced</span>
            </label>
            
            <div className="relative">
              <Mail className="w-4 h-4 text-[#777] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                value={inputEmail}
                onChange={(e) => setInputEmail(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleVerifyLogin()}
                placeholder={PRIMARY_ADMIN_EMAIL}
                className="w-full bg-[#161824] border border-[#26283a] focus:border-amber-400 focus:ring-1 focus:ring-amber-400 text-white placeholder-[#555] rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none transition-all font-mono"
              />
            </div>
          </div>

          <button
            onClick={() => handleVerifyLogin()}
            className="w-full bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-black font-extrabold text-xs uppercase tracking-wider py-3.5 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 cursor-pointer transition-all"
          >
            <Unlock className="w-4 h-4 text-black" />
            <span>Verify & Unlock Portal</span>
          </button>

          {/* Quick Demo Login Button for Admin */}
          <div className="pt-2 border-t border-[#1e2030]">
            <p className="text-[11px] text-[#8888a0] text-center mb-2 font-mono">
              Primary Super Admin Quick Sign-In:
            </p>

            <button
              onClick={() => {
                setInputEmail(PRIMARY_ADMIN_EMAIL);
                handleVerifyLogin(PRIMARY_ADMIN_EMAIL);
              }}
              className="w-full bg-[#181a28] hover:bg-[#202336] text-amber-300 border border-amber-500/40 text-xs font-bold font-mono py-2.5 rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-all"
            >
              <ShieldCheck className="w-4 h-4 text-amber-400" />
              <span>Sign-In as {PRIMARY_ADMIN_EMAIL}</span>
            </button>
          </div>
        </div>

        {/* Footer info */}
        <div className="bg-[#0b0c12] border-t border-[#1a1c2a] p-4 text-center text-[10px] text-[#777788]">
          <span>Protected system. To request access, contact </span>
          <a href={`mailto:${PRIMARY_ADMIN_EMAIL}`} className="text-amber-400 hover:underline font-mono">{PRIMARY_ADMIN_EMAIL}</a>
        </div>
      </div>
    </div>
  );
};

interface WhitelistManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  whitelist: string[];
  activeUserEmail: string | null;
  onAddEmail: (email: string) => void;
  onRemoveEmail: (email: string) => void;
  onLogout: () => void;
}

export const WhitelistManagerModal: React.FC<WhitelistManagerModalProps> = ({
  isOpen,
  onClose,
  whitelist,
  activeUserEmail,
  onAddEmail,
  onRemoveEmail,
  onLogout
}) => {
  const [newEmail, setNewEmail] = useState('');
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);

  if (!isOpen) return null;

  const isPrimaryAdmin = activeUserEmail?.toLowerCase() === PRIMARY_ADMIN_EMAIL.toLowerCase();

  const handleAdd = () => {
    const clean = newEmail.trim();
    if (!clean || !clean.includes('@')) {
      setFeedback({ type: 'error', msg: 'Please enter a valid Gmail address.' });
      return;
    }

    if (whitelist.some(w => w.toLowerCase() === clean.toLowerCase())) {
      setFeedback({ type: 'error', msg: `'${clean}' is already in the access whitelist.` });
      return;
    }

    onAddEmail(clean);
    setNewEmail('');
    setFeedback({ type: 'success', msg: `Successfully added '${clean}' to approved access list.` });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-fade-in">
      <div className="bg-[#0f1118] border border-amber-500/40 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-950/80 via-[#181a28] to-indigo-950/80 border-b border-amber-500/30 p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0">
              <Users className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-white uppercase tracking-tight flex items-center gap-2">
                <span>Access Control & Whitelist Manager</span>
              </h2>
              <p className="text-xs text-[#a0a0b8]">
                Managed by Super Admin <strong className="text-amber-300 font-mono">{PRIMARY_ADMIN_EMAIL}</strong>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-[#888898] hover:text-white p-2 rounded-lg hover:bg-[#1a1c2a] transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          {/* Active Logged In Badge */}
          <div className="bg-[#151724] border border-[#25283c] p-3.5 rounded-xl flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <UserCheck className="w-4 h-4 text-green-400" />
              <div className="text-xs">
                <span className="text-[#888898]">Logged in as: </span>
                <strong className="text-white font-mono">{activeUserEmail}</strong>
                {isPrimaryAdmin && (
                  <span className="ml-2 bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[9px] font-mono px-1.5 py-0.5 rounded uppercase font-bold">
                    Super Admin
                  </span>
                )}
              </div>
            </div>

            <button
              onClick={() => {
                onLogout();
                onClose();
              }}
              className="bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/30 text-xs px-2.5 py-1 rounded-lg flex items-center gap-1 font-bold cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5 text-red-400" />
              <span>Lock Portal</span>
            </button>
          </div>

          {/* Add New Email Section (Admin only) */}
          {isPrimaryAdmin ? (
            <div className="space-y-2 border-t border-[#1e2030] pt-4">
              <label className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <UserPlus className="w-4 h-4 text-amber-400" />
                <span>Grant Access to New Gmail Account:</span>
              </label>

              {feedback && (
                <div className={`p-2.5 rounded-lg text-xs font-mono flex items-center gap-2 ${
                  feedback.type === 'success' ? 'bg-green-500/10 border border-green-500/30 text-green-300' : 'bg-red-500/10 border border-red-500/30 text-red-300'
                }`}>
                  <span>{feedback.msg}</span>
                </div>
              )}

              <div className="flex items-center gap-2">
                <input
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
                  placeholder="colleague@gmail.com"
                  className="flex-1 bg-[#161824] border border-[#26283a] focus:border-amber-400 text-white placeholder-[#555] rounded-xl px-3.5 py-2.5 text-xs font-mono focus:outline-none"
                />
                <button
                  onClick={handleAdd}
                  className="bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs px-4 py-2.5 rounded-xl cursor-pointer shadow-lg shadow-amber-500/20 shrink-0"
                >
                  Add Account
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-amber-500/10 border border-amber-500/30 p-3 rounded-xl text-xs text-amber-300">
              Notice: Only primary admin <strong>{PRIMARY_ADMIN_EMAIL}</strong> can add or remove whitelisted user emails.
            </div>
          )}

          {/* Whitelisted Users List */}
          <div className="space-y-2 border-t border-[#1e2030] pt-4">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-white uppercase tracking-wider">
                Whitelisted Accounts ({whitelist.length})
              </span>
              <span className="text-[#888898] font-mono text-[10px]">
                Authorized Users
              </span>
            </div>

            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {whitelist.map((email) => {
                const isPrimary = email.toLowerCase() === PRIMARY_ADMIN_EMAIL.toLowerCase();

                return (
                  <div
                    key={email}
                    className="bg-[#161824] border border-[#242638] p-3 rounded-xl flex items-center justify-between text-xs font-mono"
                  >
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-400 shrink-0" />
                      <span className="text-white font-bold">{email}</span>
                      {isPrimary && (
                        <span className="bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[9px] px-1.5 py-0.5 rounded font-sans uppercase font-bold">
                          Primary Admin
                        </span>
                      )}
                    </div>

                    {isPrimaryAdmin && !isPrimary && (
                      <button
                        onClick={() => onRemoveEmail(email)}
                        className="text-[#888898] hover:text-red-400 p-1 rounded hover:bg-red-500/10 transition-all cursor-pointer"
                        title="Remove Access"
                      >
                        <Trash2 className="w-4 h-4 text-red-400" />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-[#0b0c12] border-t border-[#1a1c2a] p-4 flex justify-end">
          <button
            onClick={onClose}
            className="bg-[#1b1d2c] hover:bg-[#25283c] text-white px-4 py-2 rounded-xl text-xs font-bold cursor-pointer transition-all"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
