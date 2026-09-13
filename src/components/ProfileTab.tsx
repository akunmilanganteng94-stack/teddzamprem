import React from 'react';
import {
  User as UserIcon,
  Mail,
  Wallet,
  Calendar,
  LogOut,
  ShieldCheck,
  MessageCircle,
  HelpCircle,
  ExternalLink,
  ChevronRight,
  Shield,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useStore } from '../context/StoreContext';
import { formatRupiah, formatDate } from '../lib/utils';

interface ProfileTabProps {
  onOpenAuth: () => void;
  onToggleAdminView: (value: boolean) => void;
  onNavigate: (tab: string) => void;
  onToast: (msg: string, type: 'success' | 'error' | 'info') => void;
}

export const ProfileTab: React.FC<ProfileTabProps> = ({
  onOpenAuth,
  onToggleAdminView,
  onNavigate,
  onToast,
}) => {
  const { user, userProfile, isAdmin, logout } = useAuth();
  const { settings } = useStore();

  const handleLogout = async () => {
    try {
      await logout();
      onToast('Anda telah logout', 'info');
    } catch (err: any) {
      onToast(err.message || 'Gagal logout', 'error');
    }
  };

  const whatsappUrl = `https://wa.me/${settings.whatsapp || '6283150921412'}`;

  return (
    <div className="space-y-6 pb-28 md:pb-12 max-w-2xl mx-auto px-4 pt-4">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
          Profil Akun
        </h2>
        <p className="text-xs text-slate-400 mt-0.5">
          Informasi akun, saldo, dan layanan bantuan pengguna.
        </p>
      </div>

      {user ? (
        <div className="rounded-3xl bg-gradient-to-b from-[#0c1836] via-[#091126] to-[#060a17] border border-blue-500/30 p-5 sm:p-6 shadow-[0_0_35px_rgba(37,99,235,0.15)] space-y-6">
          {/* Avatar & Name */}
          <div className="flex items-center gap-4 pb-5 border-b border-blue-900/40">
            <div className="relative">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 via-blue-500 to-cyan-400 p-[2px] shadow-[0_0_20px_rgba(59,130,246,0.5)]">
                <div className="w-full h-full bg-[#080e22] rounded-2xl flex items-center justify-center text-xl font-black text-white">
                  {(userProfile?.name || user.displayName || user.email || 'U')[0].toUpperCase()}
                </div>
              </div>
              {isAdmin && (
                <div className="absolute -bottom-1 -right-1 bg-amber-500 text-slate-950 p-1 rounded-full shadow-md">
                  <ShieldCheck className="w-3.5 h-3.5" />
                </div>
              )}
            </div>

            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-white">
                  {userProfile?.name || user.displayName || 'Pengguna'}
                </h3>
                <span
                  className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full border ${
                    isAdmin
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                      : 'bg-blue-500/20 text-cyan-300 border-blue-500/30'
                  }`}
                >
                  {isAdmin ? 'ADMIN' : 'USER'}
                </span>
              </div>
              <p className="text-xs text-slate-400">{user.email}</p>
            </div>
          </div>

          {/* Profile Details List */}
          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-[#060c1d] border border-blue-500/20">
              <div className="flex items-center gap-3 text-slate-300">
                <Wallet className="w-4 h-4 text-cyan-400" />
                <span>Saldo Anda</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-white text-sm">
                  {formatRupiah(userProfile?.balance ?? 0)}
                </span>
                <button
                  onClick={() => onNavigate('deposit')}
                  className="px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold text-[11px] cursor-pointer"
                >
                  Isi Saldo
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-[#060c1d] border border-blue-500/20">
              <div className="flex items-center gap-3 text-slate-300">
                <Mail className="w-4 h-4 text-cyan-400" />
                <span>Email Terdaftar</span>
              </div>
              <span className="font-medium text-slate-200">{user.email}</span>
            </div>

            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-[#060c1d] border border-blue-500/20">
              <div className="flex items-center gap-3 text-slate-300">
                <Calendar className="w-4 h-4 text-cyan-400" />
                <span>Tanggal Daftar</span>
              </div>
              <span className="font-medium text-slate-200">
                {formatDate(userProfile?.createdAt || user.metadata.creationTime || new Date().toISOString())}
              </span>
            </div>
          </div>

          {/* Admin Switch Link if Admin */}
          {isAdmin && (
            <button
              onClick={() => onToggleAdminView(true)}
              className="w-full p-4 rounded-2xl bg-gradient-to-r from-amber-500/20 via-blue-900/40 to-blue-950/60 border border-amber-500/40 hover:border-amber-400 text-left flex items-center justify-between transition-all cursor-pointer group shadow-[0_0_20px_rgba(245,158,11,0.15)]"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-white">Buka Admin Panel</h4>
                  <p className="text-xs text-amber-200/80">
                    Kelola saldo, konfirmasi deposit, harga AM, dan toko
                  </p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-amber-400 group-hover:translate-x-1 transition-transform" />
            </button>
          )}

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className="w-full py-3 px-4 rounded-2xl bg-rose-950/40 hover:bg-rose-900/40 border border-rose-500/30 text-rose-300 text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Keluar dari Akun (Logout)</span>
          </button>
        </div>
      ) : (
        /* Not logged in card */
        <div className="rounded-3xl bg-gradient-to-b from-[#0c1836] to-[#060a17] border border-blue-500/30 p-6 text-center space-y-4 shadow-[0_0_35px_rgba(37,99,235,0.15)]">
          <div className="w-16 h-16 rounded-2xl bg-blue-900/40 border border-blue-500/30 flex items-center justify-center mx-auto text-cyan-400">
            <UserIcon className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Anda Belum Masuk</h3>
            <p className="text-xs text-slate-400 mt-1">
              Silakan login atau daftar untuk menikmati kemudahan bertransaksi di TEDDZ AMPREM.
            </p>
          </div>
          <button
            onClick={onOpenAuth}
            className="w-full py-3 rounded-2xl bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-bold text-sm shadow-lg shadow-blue-600/30 cursor-pointer"
          >
            Masuk / Buat Akun
          </button>
        </div>
      )}

      {/* Bantuan WhatsApp Section */}
      <div className="rounded-3xl bg-gradient-to-b from-[#0c1836] via-[#091126] to-[#060a17] border border-blue-500/30 p-5 sm:p-6 shadow-[0_0_35px_rgba(37,99,235,0.15)] space-y-3.5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
            <MessageCircle className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-sm text-white">Need bantuan?</h4>
            <p className="text-xs text-slate-400">
              Hubungi admin jika mengalami kendala order atau deposit.
            </p>
          </div>
        </div>

        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full py-3 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 active:scale-[0.98] text-white font-bold text-xs shadow-lg shadow-emerald-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          <MessageCircle className="w-4 h-4" />
          <span>Hubungi Admin (WhatsApp)</span>
          <ExternalLink className="w-3.5 h-3.5 opacity-80" />
        </a>
      </div>
    </div>
  );
};
