import React, { useState } from 'react';
import { Copy, Check, ExternalLink, Mail, Link as LinkIcon, ShieldCheck } from 'lucide-react';
import { ParsedAccount } from '../types';

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
    onToast(`${label} berhasil disalin!`, 'info');
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const accessLink =
    account.accessLink ||
    account.gmailUrl ||
    `https://accounts.google.com/AccountChooser?Email=${encodeURIComponent(account.email)}&continue=${encodeURIComponent('https://mail.google.com/mail/')}`;

  return (
    <div className="p-4 rounded-2xl bg-[#091126] border border-blue-500/25 hover:border-blue-400/40 transition-all shadow-md space-y-3">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="w-6 h-6 rounded-lg bg-blue-600/30 border border-blue-500/40 text-cyan-300 font-bold text-xs flex items-center justify-center">
            {index + 1}
          </span>
          <span className="text-xs font-bold text-white tracking-wide">
            Akun Alight Motion Premium
          </span>
        </div>
        <button
          type="button"
          onClick={() => handleCopy(`${account.email} | ${accessLink}`, 'Gmail & access_link')}
          className="text-[11px] font-semibold text-cyan-300 hover:text-white flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-950/70 border border-blue-500/30 hover:bg-blue-900/60 cursor-pointer transition-colors"
        >
          {copiedKey === 'Gmail & access_link' ? (
            <>
              <Check className="w-3 h-3 text-cyan-400" />
              <span>Tersalin!</span>
            </>
          ) : (
            <>
              <Copy className="w-3 h-3" />
              <span>Salin Semua</span>
            </>
          )}
        </button>
      </div>

      {/* Gmail Row */}
      <div className="p-2.5 sm:p-3 rounded-xl bg-slate-950/70 border border-blue-500/20 flex items-center justify-between gap-2.5">
        <div className="flex items-center gap-2.5 overflow-hidden min-w-0">
          <div className="w-8 h-8 rounded-lg bg-rose-500/15 border border-rose-500/30 flex items-center justify-center shrink-0 text-rose-400">
            <Mail className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <span className="text-[10px] text-slate-400 block leading-tight font-medium">Gmail:</span>
            <span className="text-xs sm:text-sm font-mono font-bold text-cyan-200 truncate block select-all">
              {account.email}
            </span>
          </div>
        </div>
        <button
          type="button"
          onClick={() => handleCopy(account.email, 'Gmail')}
          title="Salin Gmail"
          className="px-2.5 py-1.5 rounded-lg bg-blue-950 hover:bg-blue-900 text-slate-300 hover:text-white border border-blue-500/30 shrink-0 cursor-pointer transition-colors flex items-center gap-1.5 text-xs font-medium"
        >
          {copiedKey === 'Gmail' ? (
            <>
              <Check className="w-3.5 h-3.5 text-cyan-400" />
              <span className="text-[11px] text-cyan-300 font-semibold">Tersalin</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              <span className="text-[11px] font-semibold">Salin</span>
            </>
          )}
        </button>
      </div>

      {/* Access Link Row */}
      <div className="p-2.5 sm:p-3 rounded-xl bg-slate-950/70 border border-blue-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        <div className="flex items-center gap-2.5 overflow-hidden min-w-0 flex-1">
          <div className="w-8 h-8 rounded-lg bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center shrink-0 text-cyan-400">
            <LinkIcon className="w-4 h-4" />
          </div>
          <div className="min-w-0 flex-1">
            <span className="text-[10px] text-slate-400 block leading-tight font-medium">access_link:</span>
            <a
              href={accessLink}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-mono text-cyan-300 hover:text-cyan-200 underline truncate block"
              title={accessLink}
            >
              {accessLink}
            </a>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
          <button
            type="button"
            onClick={() => handleCopy(accessLink, 'access_link')}
            title="Salin access_link"
            className="px-2.5 py-1.5 rounded-lg bg-blue-950 hover:bg-blue-900 text-slate-300 hover:text-white border border-blue-500/30 cursor-pointer transition-colors flex items-center gap-1.5 text-xs font-medium"
          >
            {copiedKey === 'access_link' ? (
              <>
                <Check className="w-3.5 h-3.5 text-cyan-400" />
                <span className="text-[11px] text-cyan-300 font-semibold">Tersalin</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span className="text-[11px] font-semibold">Salin Link</span>
              </>
            )}
          </button>
          <a
            href={accessLink}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md transition-all cursor-pointer"
          >
            <span>Buka</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    </div>
  );
};
