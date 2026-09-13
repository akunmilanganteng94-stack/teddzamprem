import React from 'react';
import { motion } from 'motion/react';
import {
  Wallet,
  Clock,
  ArrowRight,
  ShieldCheck,
  Zap,
  CheckCircle2,
  Headphones,
  Sparkles,
  AlertTriangle,
  Flame,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useStore } from '../context/StoreContext';
import { formatRupiah } from '../lib/utils';

interface HomeTabProps {
  onNavigate: (tab: string) => void;
  onOpenAuth: () => void;
}

export const HomeTab: React.FC<HomeTabProps> = ({ onNavigate, onOpenAuth }) => {
  const { user, userProfile } = useAuth();
  const { settings } = useStore();

  const balance = userProfile?.balance ?? 0;
  const price = settings.pricePerAccount || 500;
  const storeOpen = settings.storeOpen;

  return (
    <div className="space-y-6 pb-24 md:pb-12 max-w-4xl mx-auto px-4 pt-4">
      {/* Closed Store Notice if applicable */}
      {!storeOpen && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 rounded-2xl bg-amber-500/15 border border-amber-500/40 text-amber-200 flex items-center gap-3 shadow-[0_0_20px_rgba(245,158,11,0.2)]"
        >
          <AlertTriangle className="w-6 h-6 text-amber-400 shrink-0" />
          <div>
            <h4 className="font-bold text-sm tracking-wide">MAAF, TOKO SEDANG DITUTUP</h4>
            <p className="text-xs text-amber-300/80">
              Admin sedang melakukan pemeliharaan stok. Pemesanan baru sementara dinonaktifkan.
            </p>
          </div>
        </motion.div>
      )}

      {/* Hero Header Section */}
      <section className="text-center pt-2 pb-1">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-950/70 border border-blue-500/30 text-cyan-300 text-xs font-semibold mb-3 shadow-[0_0_15px_rgba(34,211,238,0.2)]">
          <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
          <span>Jualan AM Premium</span>
        </div>

        <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-white mb-2">
          TEDDZ <span className="bg-gradient-to-r from-blue-400 via-cyan-300 to-white bg-clip-text text-transparent">AMPREM</span>
        </h2>

        <p className="text-xs sm:text-sm font-semibold tracking-widest text-blue-400/90 uppercase">
          CEPAT • AMAN • TERPERCAYA
        </p>
      </section>

      {/* Saldo Card */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0c1836] via-[#091126] to-[#060a17] border border-blue-500/30 p-5 sm:p-6 shadow-[0_0_35px_rgba(37,99,235,0.2)]"
      >
        {/* Glow ambient */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 text-slate-400 text-xs font-medium mb-1">
              <Wallet className="w-4 h-4 text-cyan-400" />
              <span>Saldo Anda</span>
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              {formatRupiah(balance)}
            </div>
            <div className="mt-1.5 inline-block text-[11px] font-semibold text-cyan-300 bg-blue-950/60 px-2.5 py-0.5 rounded-lg border border-blue-500/20">
              Harga Produk: {formatRupiah(price)} / Akun
            </div>
          </div>

          <div className="flex items-center gap-2.5 pt-2 sm:pt-0">
            <button
              onClick={() => {
                if (!user) onOpenAuth();
                else onNavigate('deposit');
              }}
              className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 active:scale-95 text-white text-xs sm:text-sm font-bold shadow-lg shadow-blue-600/30 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Wallet className="w-4 h-4" />
              <span>Isi Saldo</span>
            </button>
            <button
              onClick={() => {
                if (!user) onOpenAuth();
                else onNavigate('history');
              }}
              className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-blue-950/70 hover:bg-blue-900/60 active:scale-95 text-slate-200 border border-blue-500/25 text-xs sm:text-sm font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Clock className="w-4 h-4 text-slate-400" />
              <span>Riwayat</span>
            </button>
          </div>
        </div>
      </motion.div>

      {/* Card Produk AM Premium */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.1 }}
        className="rounded-3xl bg-gradient-to-b from-[#0e1938] to-[#070e22] border border-blue-500/30 p-5 sm:p-6 shadow-[0_0_30px_rgba(59,130,246,0.15)] relative overflow-hidden"
      >
        <div className="flex flex-col md:flex-row items-center gap-6">
          {/* Product Image */}
          <div className="relative w-full md:w-56 h-48 sm:h-52 md:h-52 rounded-2xl overflow-hidden border border-blue-500/30 shrink-0 bg-slate-900 shadow-xl group">
            <img
              src="https://cdn.phototourl.com/free/2026-09-13-52f09622-0419-4825-b08e-709593a67f88.jpg"
              alt="Alight Motion Premium"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute top-2.5 left-2.5 px-2.5 py-1 rounded-lg bg-blue-600/90 backdrop-blur-md text-[11px] font-extrabold text-white flex items-center gap-1 shadow-lg shadow-blue-600/40">
              <Flame className="w-3.5 h-3.5 text-cyan-300 fill-cyan-300" />
              <span>AM Premium</span>
            </div>
          </div>

          {/* Product Details */}
          <div className="flex-1 w-full space-y-3.5">
            <div>
              <div className="inline-block text-[11px] font-bold text-cyan-300 tracking-wider uppercase mb-1">
                Order AM
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-white">
                1 Akun - {formatRupiah(price)}
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Akun Alight Motion Premium siap pakai, support XML, 5.0+, no watermark & semua efek pro aktif.
              </p>
            </div>

            {/* Checklist */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 py-1">
              <div className="flex items-center gap-2 text-xs font-medium text-slate-200 bg-blue-950/50 px-2.5 py-1.5 rounded-xl border border-blue-500/15">
                <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
                <span>Aman</span>
              </div>
              <div className="flex items-center gap-2 text-xs font-medium text-slate-200 bg-blue-950/50 px-2.5 py-1.5 rounded-xl border border-blue-500/15">
                <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
                <span>Proses Cepat</span>
              </div>
              <div className="flex items-center gap-2 text-xs font-medium text-slate-200 bg-blue-950/50 px-2.5 py-1.5 rounded-xl border border-blue-500/15">
                <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
                <span>Bisa Langsung Dipakai</span>
              </div>
            </div>

            {/* Price and CTA */}
            <div className="flex items-center justify-between pt-2 border-t border-blue-900/40">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block leading-none">Harga</span>
                <div className="flex items-baseline gap-1 mt-0.5">
                  <span className="text-2xl font-black text-white tracking-tight">
                    {formatRupiah(price)}
                  </span>
                  <span className="text-xs font-medium text-slate-400">/ Akun</span>
                </div>
              </div>

              <button
                onClick={() => {
                  if (!user) onOpenAuth();
                  else onNavigate('order');
                }}
                disabled={!storeOpen}
                className="px-6 py-3 rounded-2xl bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 active:scale-95 text-white font-bold text-sm shadow-[0_0_20px_rgba(59,130,246,0.5)] transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                <span>{storeOpen ? 'Order Sekarang' : 'Toko Tutup'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Section Informasi: 3 Cards */}
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        <div className="p-4 rounded-2xl bg-gradient-to-b from-[#0a142c] to-[#070b18] border border-blue-500/20 shadow-sm flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-blue-900/50 border border-blue-500/30 flex items-center justify-center shrink-0 text-cyan-300">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-sm text-white">Aman</h4>
            <p className="text-xs text-slate-400 mt-0.5">Proses Cepat</p>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-gradient-to-b from-[#0a142c] to-[#070b18] border border-blue-500/20 shadow-sm flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-blue-900/50 border border-blue-500/30 flex items-center justify-center shrink-0 text-cyan-300">
            <Zap className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-sm text-white">Aktivasi Instan</h4>
            <p className="text-xs text-slate-400 mt-0.5">Tanpa Ribet</p>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-gradient-to-b from-[#0a142c] to-[#070b18] border border-blue-500/20 shadow-sm flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-blue-900/50 border border-blue-500/30 flex items-center justify-center shrink-0 text-cyan-300">
            <Headphones className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-sm text-white">CS Responsif</h4>
            <p className="text-xs text-slate-400 mt-0.5">Bantuan 24 Jam</p>
          </div>
        </div>
      </section>

      {/* Banner Section */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-900/80 via-blue-950/90 to-slate-950 border border-blue-500/30 p-6 sm:p-8 text-center shadow-[0_0_30px_rgba(37,99,235,0.25)]">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-500/20 via-transparent to-transparent pointer-events-none" />
        <h3 className="text-xl sm:text-2xl font-black text-white tracking-wide">
          TEDDZ AMPREM
        </h3>
        <p className="text-xs sm:text-sm text-cyan-300/90 font-medium mt-1">
          Solusi terbaik untuk kebutuhan edit kamu!
        </p>
      </section>

      {/* Watermark Beranda */}
      <footer className="pt-6 pb-4 text-center select-none space-y-1 border-t border-blue-950/50 mt-4">
        <p className="text-xs font-bold tracking-widest text-slate-400 uppercase">
          EDIT BY AZRYL • 2026
        </p>
        <p className="text-[11px] font-semibold tracking-wider text-slate-500">
          © AZRYL EDITING
        </p>
      </footer>
    </div>
  );
};
