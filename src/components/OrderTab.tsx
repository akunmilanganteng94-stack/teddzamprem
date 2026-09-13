import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Zap,
  Wallet,
  AlertTriangle,
  CheckCircle2,
  Copy,
  Check,
  ArrowRight,
  ShieldCheck,
  RefreshCw,
  Sparkles,
  Plus,
  Minus,
  Clock,
  Mail,
  Key,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  LogIn,
  Package,
  CheckCircle,
  XCircle,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useStore } from '../context/StoreContext';
import { formatRupiah, formatDate } from '../lib/utils';
import { parseAccountDetails } from '../lib/accountParser';
import { AccountCredentialCard } from './AccountCredentialCard';

interface OrderTabProps {
  onNavigate: (tab: string) => void;
  onOpenAuth: () => void;
  onToast: (msg: string, type: 'success' | 'error' | 'info') => void;
}

export const OrderTab: React.FC<OrderTabProps> = ({ onNavigate, onOpenAuth, onToast }) => {
  const { user, userProfile } = useAuth();
  const { settings, placeOrderAm, userOrders } = useStore();

  const [quantity, setQuantity] = useState<number>(1);
  const [loading, setLoading] = useState(false);
  const [successOrder, setSuccessOrder] = useState<any | null>(null);
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);

  const pricePerAccount = settings.pricePerAccount || 500;
  const balance = userProfile?.balance ?? 0;
  const total = quantity * pricePerAccount;
  const remainingBalance = balance - total;
  const isInsufficientBalance = balance < total;
  const isStoreOpen = settings.storeOpen;

  const handleOrder = async () => {
    if (!user) {
      onOpenAuth();
      return;
    }
    if (!isStoreOpen) {
      onToast('MAAF, TOKO SEDANG DITUTUP', 'error');
      return;
    }
    if (isInsufficientBalance) {
      onToast('Saldo tidak mencukupi. Silakan isi saldo terlebih dahulu.', 'error');
      return;
    }

    setLoading(true);
    try {
      const res = await placeOrderAm(quantity);
      setSuccessOrder(res);
      onToast(res.message || 'Order berhasil diproses!', 'success');
    } catch (err: any) {
      console.error('Order AM error:', err);
      onToast(err.message || 'Gagal memproses order. Saldo Anda aman.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleQuantityChange = (delta: number) => {
    setQuantity((prev) => {
      const next = prev + delta;
      if (next < 1) return 1;
      if (next > 5) return 5;
      return next;
    });
  };

  const successAccounts = successOrder ? parseAccountDetails(successOrder.data) : [];

  return (
    <div className="space-y-6 pb-28 md:pb-12 max-w-2xl mx-auto px-4 pt-4">
      {/* Header */}
      <div className="text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-950/70 border border-blue-500/30 text-cyan-300 text-xs font-semibold mb-2 shadow-[0_0_15px_rgba(34,211,238,0.2)]">
          <Zap className="w-3.5 h-3.5 text-cyan-400" />
          <span>Layanan Bulk AM</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
          Order AM Premium
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Beli akun Alight Motion Premium resmi, proses kilat dan bergaransi.
        </p>
      </div>

      {/* Closed Store Banner */}
      {!isStoreOpen && (
        <div className="p-4 rounded-2xl bg-amber-500/15 border border-amber-500/40 text-amber-200 flex items-center gap-3 shadow-[0_0_20px_rgba(245,158,11,0.2)]">
          <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />
          <div className="text-xs">
            <span className="font-bold">MAAF, TOKO SEDANG DITUTUP.</span> User tidak dapat melakukan order AM ketika toko CLOSED.
          </div>
        </div>
      )}

      {/* Success Order View */}
      {successOrder && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="p-5 sm:p-6 rounded-3xl bg-gradient-to-b from-[#0e1d44] via-[#09142f] to-[#060d21] border border-cyan-500/40 shadow-[0_0_30px_rgba(34,211,238,0.25)] space-y-4"
        >
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-300 shrink-0">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Order Berhasil Diproses!</h3>
              <p className="text-xs text-cyan-300/90">{successOrder.message}</p>
            </div>
          </div>

          {/* Account Details Display - ONLY Email and Akses Gmail, NO RAW API */}
          <div className="space-y-3 pt-1">
            <div className="flex items-center justify-between text-xs text-slate-300 font-bold border-b border-blue-900/40 pb-2">
              <span className="flex items-center gap-1.5 text-cyan-300">
                <Mail className="w-4 h-4 text-cyan-400" /> Detail Akun & Akses Gmail
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-950 text-cyan-300 border border-blue-500/30">
                {successAccounts.length > 0 ? `${successAccounts.length} Akun` : '1 Akun'}
              </span>
            </div>

            {successAccounts.length > 0 ? (
              <div className="space-y-2.5">
                {successAccounts.map((acc, idx) => (
                  <AccountCredentialCard
                    key={idx}
                    account={acc}
                    index={idx}
                    onToast={onToast}
                  />
                ))}
              </div>
            ) : (
              <div className="p-4 rounded-2xl bg-slate-950/60 border border-blue-900/40 text-center text-xs text-slate-300 space-y-1">
                <p className="font-semibold text-white">Akun Anda sedang diproses sistem.</p>
                <p className="text-[11px] text-slate-400">
                  Silakan periksa riwayat pesanan di bawah untuk melihat rincian akun.
                </p>
              </div>
            )}
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button
              onClick={() => {
                setSuccessOrder(null);
                onNavigate('history');
              }}
              className="flex-1 py-2.5 px-4 rounded-xl bg-blue-950/60 hover:bg-blue-900/60 border border-blue-500/30 text-xs font-semibold text-slate-200 transition-all cursor-pointer text-center"
            >
              Lihat Riwayat Lengkap
            </button>
            <button
              onClick={() => setSuccessOrder(null)}
              className="flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-xs font-bold text-white shadow-md shadow-blue-600/30 transition-all cursor-pointer text-center"
            >
              Order Lagi
            </button>
          </div>
        </motion.div>
      )}

      {/* Main Order Card */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-3xl bg-gradient-to-b from-[#0c1836] via-[#091126] to-[#060a17] border border-blue-500/30 p-5 sm:p-6 shadow-[0_0_35px_rgba(37,99,235,0.15)] space-y-6"
      >
        {/* LOGO AM & Product Banner */}
        <div className="flex items-center gap-3.5 p-3.5 sm:p-4 rounded-2xl bg-gradient-to-r from-blue-950/70 via-[#0a1532] to-[#060c1e] border border-blue-500/30 shadow-inner">
          {/* Official Alight Motion Logo Container */}
          <div className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-2xl p-[2px] bg-gradient-to-tr from-cyan-400 via-blue-500 to-indigo-500 shadow-[0_0_20px_rgba(34,211,238,0.35)] shrink-0 overflow-hidden flex items-center justify-center">
            <img
              src="https://images.seeklogo.com/logo-png/38/1/alight-motion-logo-png_seeklogo-384110.png"
              alt="Logo Alight Motion"
              referrerPolicy="no-referrer"
              className="w-full h-full object-contain bg-[#060c1d] rounded-2xl p-1"
              onError={(e) => {
                // Fallback graceful AM stylized swirl
                e.currentTarget.style.display = 'none';
              }}
            />
            {/* Ambient inner fallback if image offline */}
            <div className="absolute inset-0 flex items-center justify-center font-black text-xs text-cyan-300 pointer-events-none opacity-40">
              AM
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-base sm:text-lg font-black text-white truncate">
                Alight Motion Pro
              </h3>
              <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-cyan-950/90 text-cyan-300 border border-cyan-500/40">
                PRO RESMI
              </span>
            </div>
            <p className="text-[11px] sm:text-xs text-slate-300 mt-0.5 line-clamp-1">
              Bebas watermark, full preset XML & 4K 60fps export.
            </p>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs sm:text-sm font-extrabold text-cyan-300">
                {formatRupiah(pricePerAccount)}
              </span>
              <span className="text-[10px] text-slate-400">/ akun</span>
            </div>
          </div>
        </div>

        {/* Step 1: Pilih Jumlah Akun Pakai Tombol + */}
        <div className="space-y-2.5">
          <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
            Pilih Jumlah Akun (Maks 5 per order)
          </label>

          {/* Stepper with - and + */}
          <div className="flex items-center justify-between gap-3 bg-[#060c1d] p-3 sm:p-4 rounded-2xl border border-blue-500/30 shadow-inner">
            {/* Button Minus (-) */}
            <button
              type="button"
              onClick={() => handleQuantityChange(-1)}
              disabled={quantity <= 1}
              className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-blue-950/80 hover:bg-blue-900 border border-blue-500/30 text-white flex items-center justify-center active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer shadow-md"
              title="Kurangi Akun"
            >
              <Minus className="w-5 h-5 text-slate-300" />
            </button>

            {/* Display Quantity Count */}
            <div className="text-center px-4">
              <div className="flex items-baseline justify-center gap-1.5">
                <span className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                  {quantity}
                </span>
                <span className="text-xs sm:text-sm font-bold text-cyan-400 uppercase tracking-wider">
                  Akun
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Total: <span className="font-bold text-cyan-300">{formatRupiah(total)}</span>
              </p>
            </div>

            {/* Button Plus (+) */}
            <button
              type="button"
              onClick={() => handleQuantityChange(1)}
              disabled={quantity >= 5}
              className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 border border-cyan-400/40 text-white flex items-center justify-center active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer shadow-[0_0_20px_rgba(59,130,246,0.5)]"
              title="Tambah Jumlah Akun (+)"
            >
              <Plus className="w-6 h-6 text-white stroke-[2.5]" />
            </button>
          </div>

          {/* Quick Select Buttons (1 - 5) */}
          <div className="grid grid-cols-5 gap-1.5 pt-1">
            {[1, 2, 3, 4, 5].map((num) => {
              const isSelected = quantity === num;
              return (
                <button
                  key={num}
                  type="button"
                  onClick={() => setQuantity(num)}
                  className={`py-2 rounded-xl text-xs font-bold transition-all cursor-pointer border flex flex-col items-center justify-center ${
                    isSelected
                      ? 'bg-blue-600 text-white border-cyan-400 shadow-[0_0_12px_rgba(34,211,238,0.4)]'
                      : 'bg-slate-900/70 text-slate-400 border-blue-500/20 hover:text-white hover:border-blue-400/40'
                  }`}
                >
                  <span>{num}</span>
                  <span className="text-[9px] opacity-70 font-normal">Akun</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Step 2: Order Summary Breakdown */}
        <div className="rounded-2xl bg-[#060c1d] border border-blue-500/20 p-4 space-y-2.5 text-xs">
          <div className="flex items-center justify-between text-slate-400">
            <span>Jumlah Pesanan:</span>
            <span className="font-bold text-white">{quantity} Akun Alight Motion</span>
          </div>
          <div className="flex items-center justify-between text-slate-400">
            <span>Harga Satuan:</span>
            <span className="font-semibold text-cyan-300">{formatRupiah(pricePerAccount)}</span>
          </div>
          <div className="h-[1px] bg-blue-950 my-1" />
          <div className="flex items-center justify-between text-sm">
            <span className="font-bold text-white">Total Pembayaran:</span>
            <span className="font-black text-cyan-400 text-base">{formatRupiah(total)}</span>
          </div>
          <div className="h-[1px] bg-blue-950 my-1" />
          <div className="flex items-center justify-between text-slate-400">
            <div className="flex items-center gap-1.5">
              <Wallet className="w-3.5 h-3.5 text-cyan-400" />
              <span>Saldo Anda:</span>
            </div>
            <span className="font-bold text-white">{formatRupiah(balance)}</span>
          </div>
          <div className="flex items-center justify-between text-slate-400">
            <span>Saldo setelah order:</span>
            <span
              className={`font-bold ${
                isInsufficientBalance ? 'text-rose-400' : 'text-emerald-400'
              }`}
            >
              {formatRupiah(remainingBalance >= 0 ? remainingBalance : 0)}
            </span>
          </div>
        </div>

        {/* Insufficient Balance Alert */}
        {isInsufficientBalance && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-3.5 rounded-2xl bg-rose-950/40 border border-rose-500/30 text-rose-300 text-xs space-y-2"
          >
            <div className="flex items-center gap-2 font-semibold">
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>Saldo tidak mencukupi. Silakan isi saldo terlebih dahulu.</span>
            </div>
            <button
              type="button"
              onClick={() => onNavigate('deposit')}
              className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Wallet className="w-3.5 h-3.5" />
              <span>Isi Saldo Sekarang</span>
            </button>
          </motion.div>
        )}

        {/* Features reminder */}
        <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-300">
          <div className="flex items-center gap-1.5 bg-blue-950/40 px-2.5 py-1.5 rounded-xl border border-blue-500/10">
            <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
            <span>Anti double-charge</span>
          </div>
          <div className="flex items-center gap-1.5 bg-blue-950/40 px-2.5 py-1.5 rounded-xl border border-blue-500/10">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
            <span>Proses otomatis & instan</span>
          </div>
        </div>

        {/* Order Submit Button */}
        <button
          type="button"
          onClick={handleOrder}
          disabled={loading || isInsufficientBalance || !isStoreOpen}
          className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 active:scale-[0.98] text-white font-extrabold text-sm shadow-[0_0_25px_rgba(59,130,246,0.4)] transition-all flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
        >
          {loading ? (
            <>
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>Memproses order...</span>
            </>
          ) : !isStoreOpen ? (
            <span>Toko Sedang Ditutup</span>
          ) : isInsufficientBalance ? (
            <span>Saldo Kurang ({formatRupiah(total)})</span>
          ) : (
            <>
              <Zap className="w-4 h-4 text-cyan-300" />
              <span>Proses Order Sekarang ({formatRupiah(total)})</span>
            </>
          )}
        </button>
      </motion.div>

      {/* DI BAWAH NYA ADA RIWAYAT PESANAN NYA */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-blue-900/50 border border-blue-500/30 flex items-center justify-center text-cyan-400">
              <Clock className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-white">Riwayat Pesanan Anda</h3>
          </div>
          {user && userOrders.length > 0 && (
            <button
              onClick={() => onNavigate('history')}
              className="text-xs text-cyan-400 hover:text-white flex items-center gap-1 font-semibold transition-colors cursor-pointer"
            >
              <span>Semua Riwayat</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {!user ? (
          <div className="p-6 rounded-2xl bg-gradient-to-b from-[#0c1836] to-[#070e22] border border-blue-500/20 text-center space-y-3">
            <p className="text-xs text-slate-400">
              Silakan masuk ke akun untuk melihat riwayat pesanan Alight Motion Anda.
            </p>
            <button
              onClick={onOpenAuth}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-xs font-bold text-white shadow-md shadow-blue-600/30 transition-all cursor-pointer"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Masuk Akun</span>
            </button>
          </div>
        ) : userOrders.length === 0 ? (
          <div className="p-6 rounded-2xl bg-[#081024] border border-blue-500/15 text-center text-xs text-slate-400 space-y-1">
            <Package className="w-8 h-8 text-slate-600 mx-auto mb-2" />
            <p className="font-semibold text-slate-300">Belum Ada Riwayat Pesanan</p>
            <p className="text-[11px] text-slate-500">
              Akun Alight Motion yang Anda order akan otomatis muncul di sini.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {userOrders.slice(0, 5).map((order) => {
              const accounts = parseAccountDetails(order.apiResponse);
              const isExpanded = expandedOrderId === order.id;
              const isSuccess = order.status === 'SUCCESS';

              return (
                <div
                  key={order.id}
                  className="rounded-2xl bg-gradient-to-b from-[#0c1836] to-[#070e22] border border-blue-500/25 overflow-hidden transition-all shadow-md"
                >
                  {/* Order Summary Bar */}
                  <div
                    onClick={() =>
                      setExpandedOrderId(isExpanded ? null : order.id)
                    }
                    className="p-4 flex items-center justify-between gap-3 cursor-pointer hover:bg-blue-950/40 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-blue-900/60 border border-blue-500/30 flex items-center justify-center text-cyan-300 shrink-0">
                        <Zap className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-white text-xs sm:text-sm">
                            {order.quantity} Akun AM Premium
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono">
                            ID: {order.id.slice(0, 6)}...
                          </span>
                        </div>
                        <div className="flex items-center gap-2 mt-0.5 text-slate-400 text-[11px]">
                          <span>{formatDate(order.createdAt)}</span>
                        </div>
                        {accounts.length > 0 && (
                          <div className="mt-2 space-y-1 text-[11px] bg-slate-950/60 p-2 rounded-xl border border-blue-900/40">
                            <div className="flex items-center gap-1.5 text-slate-300">
                              <Mail className="w-3 h-3 text-cyan-400 shrink-0" />
                              <span className="text-slate-400 text-[10px]">Email:</span>
                              <span className="font-mono text-cyan-200 font-semibold truncate max-w-[160px] sm:max-w-xs select-all">
                                {accounts[0].email}
                              </span>
                              {accounts.length > 1 && (
                                <span className="text-[9px] text-cyan-400 font-bold">
                                  (+{accounts.length - 1} akun)
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-1.5 text-slate-300">
                              <Key className="w-3 h-3 text-cyan-400 shrink-0" />
                              <span className="text-slate-400 text-[10px]">Akses:</span>
                              <span className="font-mono text-cyan-200 truncate max-w-[160px] sm:max-w-xs select-all">
                                {accounts[0].accessGmail}
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2.5">
                      <div className="text-right">
                        <div className="font-bold text-white text-xs">
                          {formatRupiah(order.total)}
                        </div>
                        <div className="mt-0.5">
                          {isSuccess && (
                            <span className="inline-flex items-center gap-1 text-[9px] font-bold px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-500/30">
                              <CheckCircle className="w-2.5 h-2.5" /> SUKSES
                            </span>
                          )}
                          {order.status === 'PROCESSING' && (
                            <span className="inline-flex items-center gap-1 text-[9px] font-bold px-1.5 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-500/30">
                              <Clock className="w-2.5 h-2.5 animate-pulse" /> PROSES
                            </span>
                          )}
                          {order.status === 'FAILED' && (
                            <span className="inline-flex items-center gap-1 text-[9px] font-bold px-1.5 py-0.5 rounded bg-rose-950 text-rose-300 border border-rose-500/30">
                              <XCircle className="w-2.5 h-2.5" /> GAGAL
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="text-slate-400 p-1">
                        {isExpanded ? (
                          <ChevronUp className="w-4 h-4 text-cyan-400" />
                        ) : (
                          <ChevronDown className="w-4 h-4" />
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Expanded Detail - ONLY Email and Akses Gmail, NO RAW API */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="px-4 pb-4 pt-2 border-t border-blue-900/30 bg-[#060c1d]/90 space-y-3"
                      >
                        <div className="flex items-center justify-between text-xs text-slate-400">
                          <span className="font-semibold text-slate-300 flex items-center gap-1.5">
                            <Mail className="w-3.5 h-3.5 text-cyan-400" />
                            Detail Akun & Akses Gmail:
                          </span>
                          <span className="text-[10px] text-cyan-400 font-mono">
                            {accounts.length} Akun
                          </span>
                        </div>

                        {accounts.length > 0 ? (
                          <div className="space-y-2.5">
                            {accounts.map((acc, idx) => (
                              <AccountCredentialCard
                                key={idx}
                                account={acc}
                                index={idx}
                                onToast={onToast}
                              />
                            ))}
                          </div>
                        ) : (
                          <div className="p-3 rounded-xl bg-slate-950/60 border border-blue-900/40 text-center text-xs text-slate-400">
                            {order.status === 'SUCCESS'
                              ? 'Akun telah terverifikasi. Hubungi CS jika membutuhkan bantuan.'
                              : 'Akun sedang diproses oleh server penyedia.'}
                          </div>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
