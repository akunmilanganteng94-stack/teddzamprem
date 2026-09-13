import React from 'react';
import { motion } from 'motion/react';
import {
  Zap,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  Wallet,
  Clock,
  CheckCircle2,
  Lock,
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

  const price = settings.pricePerAccount || 500;
  const balance = userProfile?.balance ?? 0;
  const isStoreOpen = settings.storeOpen;
  const productLogo =
    'https://cdn.phototourl.com/free/2026-09-13-e807be04-bd8e-4d99-9a77-881fd6854084.jpg';

  return (
    <div className="space-y-8 pb-32 md:pb-16 max-w-4xl mx-auto px-4 pt-4">
      {/* Top Notice Banner */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between p-3.5 rounded-2xl bg-gradient-to-r from-blue-950/80 via-[#0a1533] to-slate-900 border border-blue-500/30 shadow-lg"
      >
        <div className="flex items-center gap-2.5">
          <span className="relative flex h-2.5 w-2.5">
            <span
              className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                isStoreOpen ? 'bg-cyan-400' : 'bg-rose-400'
              }`}
            />
            <span
              className={`relative inline-flex rounded-full h-2.5 w-2.5 ${
                isStoreOpen ? 'bg-cyan-500' : 'bg-rose-500'
              }`}
            />
          </span>
          <span className="text-xs font-semibold text-slate-200">
            Status Server: {isStoreOpen ? 'Online & Siap Order' : 'Toko Sedang Tutup'}
          </span>
        </div>
        <div className="text-right">
          <span className="text-[11px] font-bold text-cyan-300 bg-blue-950/90 px-2.5 py-1 rounded-xl border border-cyan-500/30">
            Hanya {formatRupiah(price)} / Akun
          </span>
        </div>
      </motion.div>

      {/* Kolom Beli Akun Alight Motion Pro Instan & Bergaransi + Saldo Saat Ini */}
      <div className="rounded-3xl bg-gradient-to-b from-[#0e1f44] via-[#091530] to-[#060a17] border border-blue-500/30 p-6 sm:p-8 shadow-[0_0_35px_rgba(37,99,235,0.2)] space-y-6 relative overflow-hidden">
        <div className="flex flex-col sm:flex-row items-center gap-5 sm:gap-6">
          <img
            src={productLogo}
            alt="Alight Motion Premium Logo"
            referrerPolicy="no-referrer"
            className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl object-cover border-2 border-cyan-400/40 shadow-[0_0_25px_rgba(34,211,238,0.25)] shrink-0"
          />
          <div className="space-y-2 text-center sm:text-left flex-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-600/15 border border-cyan-400/30 text-cyan-300 text-xs font-bold shadow-[0_0_15px_rgba(34,211,238,0.15)]">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>Official Store Alight Motion Premium</span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white leading-tight">
              Beli Akun{' '}
              <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-indigo-400 bg-clip-text text-transparent">
                Alight Motion Pro
              </span>
              <br className="hidden sm:inline" /> Instant & Bergaransi
            </h1>

            <p className="text-slate-300 text-xs sm:text-sm font-normal max-w-xl">
              Dapatkan akun Alight Motion Premium resmi tanpa watermark, full effect, export 4K 60FPS, dan akses preset XML tanpa batasan.
            </p>
          </div>
        </div>

        {/* Kolom Saldo Saat Ini */}
        <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-blue-950/80 via-[#071126] to-slate-900 border border-blue-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-lg">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-cyan-400 shrink-0">
              <Wallet className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] text-slate-400 block font-medium">Saldo Saat Ini</span>
              <span className="text-xl sm:text-2xl font-black text-white">
                {user ? formatRupiah(balance) : 'Rp 0 (Belum Login)'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => {
                if (!user) onOpenAuth();
                else onNavigate('deposit');
              }}
              className="px-4 py-2.5 rounded-xl bg-slate-900/90 hover:bg-blue-950/80 border border-blue-500/30 text-cyan-300 hover:text-white font-bold text-xs shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Wallet className="w-3.5 h-3.5 text-cyan-400" />
              <span>Isi Saldo</span>
            </button>

            <button
              onClick={() => {
                if (!user) onOpenAuth();
                else onNavigate('order');
              }}
              className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-extrabold text-xs shadow-[0_0_20px_rgba(59,130,246,0.4)] transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Zap className="w-3.5 h-3.5 fill-white" />
              <span>Beli Sekarang</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Promo / Pricing Card */}
      <div className="rounded-3xl bg-gradient-to-b from-[#0c1836] via-[#091126] to-[#060a17] border border-blue-500/30 p-6 sm:p-8 shadow-[0_0_40px_rgba(37,99,235,0.2)] relative overflow-hidden">
        <div className="absolute -right-12 -top-12 w-44 h-44 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-blue-900/40">
          <div className="flex items-center gap-4">
            <img
              src={productLogo}
              alt="Logo AM"
              referrerPolicy="no-referrer"
              className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl object-cover border border-cyan-400/40 shrink-0 shadow-md"
            />
            <div>
              <span className="text-[11px] font-extrabold tracking-widest text-cyan-400 uppercase">
                Paket Best Seller
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-white mt-1">
                Alight Motion Premium
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Akun fresh, aktif, dan dapat langsung digunakan untuk editing video berkualitas tinggi.
              </p>
            </div>
          </div>

          <div className="text-left md:text-right shrink-0">
            <span className="text-xs text-slate-400 block font-medium">Harga Promo</span>
            <div className="flex items-baseline md:justify-end gap-1.5 mt-0.5">
              <span className="text-3xl sm:text-4xl font-black text-transparent bg-gradient-to-r from-cyan-300 to-blue-400 bg-clip-text">
                {formatRupiah(price)}
              </span>
              <span className="text-xs font-semibold text-slate-400">/ Akun</span>
            </div>
            <span className="inline-block text-[10px] text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded-md border border-emerald-500/30 mt-1">
              Hemat & Terjangkau
            </span>
          </div>
        </div>

        {/* Feature List */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-6 text-xs text-slate-200">
          {[
            'Bebas Watermark di setiap export video',
            'Buka Semua Efek Pro & Transisi Eksklusif',
            'Mendukung Export 4K 60FPS Resolusi Tertinggi',
            'Bisa Impor Preset XML & Font Kustom',
            'Email & Password langsung dikirim setelah order',
            'Tersedia tombol akses cepat ke Gmail verifikasi',
          ].map((feat, i) => (
            <div key={i} className="flex items-center gap-2.5">
              <div className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-3.5 h-3.5" />
              </div>
              <span className="font-medium">{feat}</span>
            </div>
          ))}
        </div>

        {/* Action button */}
        <div className="pt-6">
          <button
            onClick={() => onNavigate('order')}
            className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-extrabold text-sm shadow-[0_0_25px_rgba(59,130,246,0.4)] transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <Zap className="w-4 h-4 fill-white" />
            <span>Pesan Sekarang ({formatRupiah(price)})</span>
          </button>
        </div>
      </div>

      {/* 3 Pillars of Confidence */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        <div className="p-4 rounded-2xl bg-[#091126] border border-blue-500/20 space-y-1.5">
          <div className="w-8 h-8 rounded-xl bg-blue-600/20 text-cyan-400 flex items-center justify-center">
            <Clock className="w-4 h-4" />
          </div>
          <h4 className="text-xs font-bold text-white">Proses Otomatis</h4>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            Akun langsung diproses oleh server dan muncul di riwayat detik itu juga.
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-[#091126] border border-blue-500/20 space-y-1.5">
          <div className="w-8 h-8 rounded-xl bg-blue-600/20 text-cyan-400 flex items-center justify-center">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <h4 className="text-xs font-bold text-white">Aman & Terpercaya</h4>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            Transaksi aman didukung database Firebase dan verifikasi admin tepercaya.
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-[#091126] border border-blue-500/20 space-y-1.5">
          <div className="w-8 h-8 rounded-xl bg-blue-600/20 text-cyan-400 flex items-center justify-center">
            <Lock className="w-4 h-4" />
          </div>
          <h4 className="text-xs font-bold text-white">Akses Gmail Langsung</h4>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            Cek kode OTP atau konfirmasi akun Alight Motion langsung dengan 1 klik.
          </p>
        </div>
      </div>

      {/* WATERMARK DI BERANDA PALING BAWAH (SESUAI REQUEST USER) */}
      <div className="pt-8 pb-4 border-t border-blue-900/40 text-center space-y-1.5">
        <div className="inline-block p-4 rounded-2xl bg-gradient-to-r from-blue-950/40 via-slate-900/60 to-blue-950/40 border border-blue-500/20 shadow-lg">
          <p className="text-xs font-extrabold tracking-widest text-cyan-300 uppercase">
            EDIT BY AZRYL • 2026
          </p>
          <p className="text-[11px] font-semibold tracking-wider text-slate-400 mt-0.5">
            © AZRYL EDITING
          </p>
        </div>
      </div>
    </div>
  );
};
