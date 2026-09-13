import React, { useState } from 'react';
import { Mail, Key, Copy, Check, ExternalLink, ShieldCheck, Inbox } from 'lucide-react';
import { ParsedAccount } from '../lib/accountParser';

interface AccountCredentialCardProps {
  account: ParsedAccount;
  index: number;
  onToast: (msg: string, type: 'success' | 'error' | 'info') => void;
}

export const AccountCredentialCard: React.FC<AccountCredentialCardProps> = ({
  account,
  index,
  onToast,
}) => {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(label);
    onToast(`${label} disalin ke clipboard!`, 'info');
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const isUrl =
    account.accessGmail &&
    (account.accessGmail.startsWith('http://') ||
      account.accessGmail.startsWith('https://'));

  return (
    <div className="p-3.5 sm:p-4 rounded-2xl bg-gradient-to-b from-[#0e1a38] to-[#070e22] border border-blue-500/30 space-y-3 shadow-md">
      <div className="flex items-center justify-between pb-2 border-b border-blue-900/40">
        <div className="flex items-center gap-2">
          <span className="w-5 h-5 rounded-full bg-blue-600 text-white font-black text-[11px] flex items-center justify-center">
            {index + 1}
          </span>
          <span className="text-xs font-bold text-white">Akun Alight Motion Premium</span>
        </div>
        <span className="text-[10px] font-semibold text-cyan-300 bg-blue-950/80 px-2 py-0.5 rounded-md border border-blue-500/30 flex items-center gap-1">
          <ShieldCheck className="w-3 h-3 text-cyan-400" /> Siap Digunakan
        </span>
      </div>

      {/* Email Akun */}
      <div className="space-y-1">
        <span className="text-[11px] text-slate-400 flex items-center gap-1 font-medium">
          <Mail className="w-3.5 h-3.5 text-blue-400" /> Email Akun:
        </span>
        <div className="flex items-center justify-between bg-slate-950/80 p-2.5 rounded-xl border border-blue-900/40 gap-2">
          <span className="font-mono text-xs text-white select-all break-all font-semibold">
            {account.email || '-'}
          </span>
          <button
            type="button"
            onClick={() => handleCopy(account.email, 'Email')}
            className="p-1.5 rounded-lg bg-blue-900/50 hover:bg-blue-800/60 text-cyan-300 transition-colors shrink-0 cursor-pointer flex items-center gap-1 text-[11px] font-medium"
            title="Salin Email"
          >
            {copiedKey === 'Email' ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400">Disalin</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Salin</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Akses Gmail */}
      <div className="space-y-1">
        <span className="text-[11px] text-slate-400 flex items-center gap-1 font-medium">
          <Key className="w-3.5 h-3.5 text-cyan-400" /> Akses Gmail (Inbox Verifikasi):
        </span>
        <div className="flex items-center justify-between bg-slate-950/80 p-2.5 rounded-xl border border-blue-900/40 gap-2">
          <span className="font-mono text-xs text-cyan-200 select-all break-all pr-1">
            {account.accessGmail || '-'}
          </span>
          <div className="flex items-center gap-1.5 shrink-0">
            {isUrl && (
              <a
                href={account.accessGmail}
                target="_blank"
                rel="noopener noreferrer"
                className="px-2 py-1.5 rounded-lg bg-cyan-950/80 hover:bg-cyan-900/80 border border-cyan-500/30 text-cyan-300 transition-colors cursor-pointer flex items-center gap-1 text-[11px] font-semibold"
                title="Buka Link Kotak Masuk Gmail"
              >
                <Inbox className="w-3.5 h-3.5 text-cyan-400" />
                <span className="hidden sm:inline">Buka</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            )}
            <button
              type="button"
              onClick={() => handleCopy(account.accessGmail, 'Akses Gmail')}
              className="p-1.5 rounded-lg bg-blue-900/50 hover:bg-blue-800/60 text-cyan-300 transition-colors cursor-pointer flex items-center gap-1 text-[11px] font-medium"
              title="Salin Akses Gmail"
            >
              {copiedKey === 'Akses Gmail' ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Disalin</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Salin</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
