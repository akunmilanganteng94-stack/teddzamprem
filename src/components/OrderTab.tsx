import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Zap,
  CheckCircle2,
  AlertCircle,
  Wallet,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  HelpCircle,
  Info,
  Clock,
  RotateCcw,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useStore } from '../context/StoreContext';
import { formatRupiah } from '../lib/utils';
import { AccountCredentialCard } from './AccountCredentialCard';
import { OrderRecord } from '../types';

interface OrderTabProps {
  onNavigate: (tab: string) => void;
  onOpenAuth: () => void;
  onToast: (msg: string, type: 'success' | 'error' | 'info') => void;
}

export const OrderTab: React.FC<OrderTabProps> = ({ onNavigate, onOpenAuth, onToast }) => {
  const { user, userProfile } = useAuth();
  const { settings, submitOrderAM } = useStore();

  const [quantity, setQuantity] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(false);
  const [latestOrder, setLatestOrder] = useState<OrderRecord | null>(null);

  const pricePerAccount = settings.pricePerAccount || 500;
  const balance = userProfile?.balance ?? 0;
  const totalCost = quantity * pricePerAccount;
  const canAfford = balance >= totalCost;
  const isStoreOpen = settings.storeOpen;

  const handleOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      onOpenAuth();
      return;
    }
    if (!isStoreOpen) {
      onToast('Maaf, toko sedang tutup sementara.', 'error');
      return;
    }
    if (!canAfford) {
      onToast(
        `Saldo tidak mencukupi. Diperlukan ${formatRupiah(totalCost)}, saldo Anda ${formatRupiah(balance)}`,
        'error'
      );
      return;
    }

    setLoading(true);
    try {
      const order = await submitOrderAM(quantity);
      setLatestOrder(order);
      onToast(`Berhasil order ${quantity} akun AM Premium!`, 'success');
    } catch (err: any) {
      console.error('Order error:', err);
      onToast(err.message || 'Gagal memproses pesanan AM', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 pb-28 md:pb-12 max-w-2xl mx-auto px-4 pt-4">
      {/* Header */}
      <div className="text-center flex flex-col items-center">
        <img
          src="https://cdn.phototourl.com/free/2026-09-13-e807be04-bd8e-4d99-9a77-881fd6854084.jpg"
          alt="Alight Motion Premium Logo"
          referrerPolicy="no-referrer"
          className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover border-2 border-cyan-400/40 shadow-[0_0_20px_rgba(34,211,238,0.2)] mb-3"
        />
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-950/70 border border-blue-500/30 text-cyan-300 text-xs font-semibold mb-2 shadow-[0_0_15px_rgba(34,211,238,0.2)]">
          <Zap className="w-3.5 h-3.5 text-cyan-400 fill-cyan-400" />
          <span>TEDDZ AMPREM • Instant Delivery</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
          Pesan Alight Motion Premium
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Pilih jumlah akun yang diinginkan (1 - 5 akun). Akun langsung aktif seketika!
        </p>
      </div>

      {/* Saldo Pill */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-950/80 to-slate-900 border border-blue-500/30 flex items-center justify-between shadow-lg">
        <div>
          <span className="text-[11px] text-slate-400 block font-medium">Saldo Anda Saat Ini</span>
          <span className="text-xl sm:text-2xl font-black text-white">
            {formatRupiah(balance)}
          </span>
        </div>
        <div>
          <button
            onClick={() => onNavigate('deposit')}
            className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md shadow-blue-600/30 transition-all cursor-pointer flex items-center gap-1.5"
          >
            <Wallet className="w-3.5 h-3.5" />
            <span>Isi Saldo</span>
          </button>
        </div>
      </div>

      {/* Success Order View if Just Ordered */}
      {latestOrder && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="rounded-3xl bg-gradient-to-b from-[#0e1f44] via-[#091530] to-[#060a17] border border-cyan-500/40 p-5 sm:p-6 shadow-[0_0_35px_rgba(34,211,238,0.25)] space-y-4"
        >
          <div className="flex items-center justify-between pb-3 border-b border-blue-900/50">
            <div className="flex items-center gap-2 text-cyan-300">
              <CheckCircle2 className="w-6 h-6 text-cyan-400" />
              <div>
                <h3 className="font-extrabold text-white text-base">Pesanan Berhasil!</h3>
                <span className="text-xs text-cyan-300/80">
                  {latestOrder.quantity} Akun Alight Motion Premium siap digunakan
                </span>
              </div>
            </div>
            <button
              onClick={() => setLatestOrder(null)}
              className="text-xs font-semibold text-slate-400 hover:text-white px-2.5 py-1 rounded-lg bg-blue-950/80 border border-blue-500/20 cursor-pointer"
            >
              Tutup / Order Lagi
            </button>
          </div>

          <p className="text-xs text-slate-300">
            Berikut adalah data email & password akun yang Anda beli. Klik tombol{' '}
            <strong className="text-white">Buka & Akses Gmail</strong> untuk login ke akun Google atau melihat kode verifikasi:
          </p>

          {/* Render Account Cards */}
          <div className="space-y-3">
            {latestOrder.parsedAccounts && latestOrder.parsedAccounts.length > 0 ? (
              latestOrder.parsedAccounts.map((acc, i) => (
                <AccountCredentialCard
                  key={acc.id || i}
                  account={acc}
                  index={i}
                  onToast={onToast}
                />
              ))
            ) : (
              <div className="p-4 rounded-xl bg-slate-900 border border-blue-500/20 text-xs text-slate-300 font-mono">
                {JSON.stringify(latestOrder.apiResponse, null, 2)}
              </div>
            )}
          </div>

          <div className="pt-2 flex flex-wrap items-center gap-2.5">
            <button
              onClick={() => onNavigate('history')}
              className="flex-1 py-2.5 px-4 rounded-xl bg-blue-900/80 hover:bg-blue-800/80 text-white font-bold text-xs border border-blue-500/30 text-center cursor-pointer transition-all"
            >
              Lihat di Riwayat Pesanan
            </button>
            <button
              onClick={() => setLatestOrder(null)}
              className="py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white font-semibold text-xs border border-blue-500/20 cursor-pointer transition-all"
            >
              Order Baru
            </button>
          </div>
        </motion.div>
      )}

      {/* Main Order Form */}
      <form
        onSubmit={handleOrder}
        className="rounded-3xl bg-gradient-to-b from-[#0c1836] via-[#091126] to-[#060a17] border border-blue-500/30 p-5 sm:p-6 shadow-[0_0_35px_rgba(37,99,235,0.15)] space-y-5"
      >
        {/* Quantity selector */}
        <div>
          <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
            Pilih Jumlah Akun:
          </label>
          <div className="grid grid-cols-5 gap-2">
            {[1, 2, 3, 4, 5].map((num) => (
              <button
                key={num}
                type="button"
                onClick={() => setQuantity(num)}
                className={`py-3 rounded-2xl font-black text-sm transition-all border cursor-pointer ${
                  quantity === num
                    ? 'bg-gradient-to-r from-blue-600 to-cyan-500 text-white border-cyan-400 shadow-[0_0_20px_rgba(34,211,238,0.35)] scale-105'
                    : 'bg-slate-900/80 text-slate-400 border-blue-500/20 hover:border-blue-400/40 hover:text-white'
                }`}
              >
                {num}
              </button>
            ))}
          </div>
          <span className="text-[11px] text-slate-400 mt-2 block">
            Maksimal 5 akun per transaksi bulk order.
          </span>
        </div>

        {/* Price calculation overview */}
        <div className="p-4 rounded-2xl bg-[#060c1d] border border-blue-500/20 space-y-2 text-xs">
          <div className="flex justify-between items-center text-slate-300">
            <span>Harga per Akun:</span>
            <span className="font-semibold text-white">{formatRupiah(pricePerAccount)}</span>
          </div>
          <div className="flex justify-between items-center text-slate-300">
            <span>Jumlah Akun:</span>
            <span className="font-semibold text-white">{quantity} Akun</span>
          </div>
          <div className="h-[1px] bg-blue-900/40 my-1" />
          <div className="flex justify-between items-center text-sm pt-1">
            <span className="font-bold text-slate-200">Total Biaya:</span>
            <span className="font-black text-cyan-300 text-lg">{formatRupiah(totalCost)}</span>
          </div>
        </div>

        {/* Store Closed or Insufficient Balance warning */}
        {!isStoreOpen && (
          <div className="p-3.5 rounded-2xl bg-rose-950/60 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>Toko saat ini sedang tutup. Pemesanan akun dinonaktifkan sementara.</span>
          </div>
        )}

        {isStoreOpen && user && !canAfford && (
          <div className="p-3.5 rounded-2xl bg-amber-950/50 border border-amber-500/30 text-amber-300 text-xs flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-amber-400" />
              <span>Saldo tidak cukup. Kurang {formatRupiah(totalCost - balance)}.</span>
            </div>
            <button
              type="button"
              onClick={() => onNavigate('deposit')}
              className="text-xs font-bold text-cyan-300 underline hover:text-white cursor-pointer"
            >
              Top Up
            </button>
          </div>
        )}

        {/* Submit button */}
        <button
          type="submit"
          disabled={loading || !isStoreOpen || (Boolean(user) && !canAfford)}
          className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 active:scale-[0.98] text-white font-extrabold text-sm shadow-[0_0_25px_rgba(59,130,246,0.4)] transition-all flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
        >
          {loading ? (
            <>
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>Menghubungi server Alight Motion...</span>
            </>
          ) : !user ? (
            <>
              <Zap className="w-4 h-4 fill-white" />
              <span>Login Untuk Memesan</span>
            </>
          ) : (
            <>
              <Zap className="w-4 h-4 fill-white" />
              <span>Bayar & Dapatkan Akun ({formatRupiah(totalCost)})</span>
            </>
          )}
        </button>
      </form>

      {/* Cara Pakai / Petunjuk Login Alight Motion */}
      <div className="p-5 rounded-3xl bg-slate-900/80 border border-blue-500/20 space-y-3 text-xs text-slate-300">
        <h4 className="font-bold text-white text-sm flex items-center gap-2">
          <HelpCircle className="w-4 h-4 text-cyan-400" />
          <span>Cara Login Alight Motion:</span>
        </h4>
        <ol className="list-decimal list-inside space-y-1.5 text-slate-300/90 leading-relaxed">
          <li>Buka aplikasi <strong>Alight Motion</strong> di smartphone Anda.</li>
          <li>Klik menu profil atau tombol <strong>Masuk / Sign In</strong>.</li>
          <li>Pilih masuk menggunakan <strong>Email / Akun Google</strong>.</li>
          <li>Masukkan <strong>Email</strong> dan <strong>Password</strong> yang didapatkan dari toko ini.</li>
          <li>Jika diminta verifikasi atau OTP, gunakan tombol <strong>Buka & Akses Gmail</strong> di toko untuk melihat pesan masuk.</li>
          <li>Selesai! Akun Alight Motion Anda telah aktif dengan status Premium.</li>
        </ol>
      </div>
    </div>
  );
};
