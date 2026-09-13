import React from 'react';
import { ShieldCheck, Wallet, UserCircle, LogIn, LayoutDashboard, ShoppingBag } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useStore } from '../context/StoreContext';
import { formatRupiah } from '../lib/utils';

interface NavbarProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  onOpenAuth: () => void;
  isAdminView: boolean;
  onToggleAdminView: (value: boolean) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onSelectTab,
  onOpenAuth,
  isAdminView,
  onToggleAdminView,
}) => {
  const { user, userProfile, isAdmin } = useAuth();
  const { settings } = useStore();

  const balance = userProfile?.balance ?? 0;

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-xl bg-[#060a17]/85 border-b border-blue-500/20">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Brand Logo & Title */}
        <div
          onClick={() => {
            if (isAdminView) onToggleAdminView(false);
            onSelectTab('home');
          }}
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div className="relative w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 via-blue-500 to-cyan-400 p-[1.5px] shadow-[0_0_15px_rgba(59,130,246,0.4)] group-hover:shadow-[0_0_25px_rgba(59,130,246,0.6)] transition-all">
            <div className="w-full h-full bg-[#070d1e] rounded-2xl flex items-center justify-center">
              <span className="font-extrabold text-sm tracking-tighter bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">
                TA
              </span>
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-extrabold text-base md:text-lg tracking-wider text-white">
                {settings.storeName && !settings.storeName.includes('TEDDZA') && !settings.storeName.includes('TEDZZ')
                  ? settings.storeName
                  : 'TEDDZ AMPREM'}
              </h1>
              <span className="inline-block w-2 h-2 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_8px_#22d3ee]" />
            </div>
            <p className="text-[11px] font-medium text-blue-300/80 tracking-wide uppercase">
              Alight Motion Premium
            </p>
          </div>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1 bg-slate-900/60 p-1.5 rounded-2xl border border-blue-500/15">
          {!isAdminView ? (
            <>
              {[
                { id: 'home', label: 'Beranda' },
                { id: 'order', label: 'Order AM' },
                { id: 'history', label: 'Riwayat' },
                { id: 'deposit', label: 'Saldo' },
                { id: 'profile', label: 'Profil' },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => onSelectTab(item.id)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                    currentTab === item.id
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                      : 'text-slate-400 hover:text-slate-100 hover:bg-white/5'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </>
          ) : (
            <div className="flex items-center gap-2 px-3 py-1 text-xs font-semibold text-cyan-300">
              <LayoutDashboard className="w-4 h-4" /> Admin Panel Active
            </div>
          )}
        </nav>

        {/* Actions (Balance, Auth, Admin Switch) */}
        <div className="flex items-center gap-2.5">
          {/* Admin Toggle */}
          {isAdmin && (
            <button
              onClick={() => onToggleAdminView(!isAdminView)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border ${
                isAdminView
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-[0_0_15px_rgba(245,158,11,0.2)]'
                  : 'bg-blue-950/60 text-cyan-300 border-cyan-500/30 hover:bg-blue-900/50'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">
                {isAdminView ? 'Mode Toko' : 'Admin Panel'}
              </span>
              <span className="sm:hidden">{isAdminView ? 'Toko' : 'Admin'}</span>
            </button>
          )}

          {/* User Balance pill */}
          {user ? (
            <div
              onClick={() => onSelectTab('deposit')}
              className="flex items-center gap-2 bg-gradient-to-r from-blue-950/80 to-slate-900/80 px-3 py-1.5 rounded-xl border border-blue-500/30 cursor-pointer hover:border-blue-400 transition-all shadow-[0_0_12px_rgba(37,99,235,0.15)]"
            >
              <Wallet className="w-3.5 h-3.5 text-cyan-400" />
              <div className="text-right">
                <span className="text-[10px] text-slate-400 block leading-none">Saldo</span>
                <span className="text-xs font-bold text-white tracking-tight">
                  {formatRupiah(balance)}
                </span>
              </div>
            </div>
          ) : (
            <button
              onClick={onOpenAuth}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white text-xs font-semibold shadow-md shadow-blue-600/30 active:scale-95 transition-all cursor-pointer"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Masuk</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
