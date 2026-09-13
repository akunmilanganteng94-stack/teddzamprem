import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Wallet,
  QrCode,
  Smartphone,
  Copy,
  Check,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Info,
  ArrowRight,
  ArrowLeft,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  User,
  CreditCard,
  ShieldCheck,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useStore } from '../context/StoreContext';
import { formatRupiah, formatDate } from '../lib/utils';
import { PaymentMethod } from '../types';

interface DepositTabProps {
  onOpenAuth: () => void;
  onToast: (msg: string, type: 'success' | 'error' | 'info') => void;
}

export const DepositTab: React.FC<DepositTabProps> = ({ onOpenAuth, onToast }) => {
  const { user, userProfile } = useAuth();
  const { settings, submitDeposit, userDeposits } = useStore();

  // Step 1: Nominal & Nama Pengguna
  // Step 2: Konfirmasi rincian & Pilih DANA / QRIS & Tombol "Saya Sudah Bayar"
  const [step, setStep] = useState<1 | 2>(1);
  const [amount, setAmount] = useState<number>(5000);
  const [senderName, setSenderName] = useState<string>(userProfile?.name || '');
  const [method, setMethod] = useState<PaymentMethod>('QRIS');
  const [loading, setLoading] = useState(false);
  const [copiedType, setCopiedType] = useState<string | null>(null);
  const [justSubmittedId, setJustSubmittedId] = useState<string | null>(null);
  const [showGuide, setShowGuide] = useState<boolean>(true);

  const minDeposit = settings.minDeposit || 1000;
  const qrisUrl =
    settings.qrisUrl ||
    'https://cdn.phototourl.com/free/2026-09-13-75d33bf7-921e-40be-8652-2fe713cf94ef.jpg';
  const danaNumber = settings.danaNumber || '0831-5092-1412';
  const danaName = settings.danaName || 'TEDDY TRI PRATAMA';

  const quickAmounts = [1000, 2000, 5000, 10000, 25000, 50000, 100000];

  const handleCopy = (text: string, type: string) => {
    // Strip dashes for clean number copy if it's phone number
    const toCopy = type === 'Nomor DANA' ? text.replace(/[^0-9]/g, '') : text;
    navigator.clipboard.writeText(toCopy);
    setCopiedType(type);
    onToast(`${type} disalin ke clipboard!`, 'info');
    setTimeout(() => setCopiedType(null), 2000);
  };

  // Validasi Step 1 -> Step 2
  const handleProceedToStep2 = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      onOpenAuth();
      return;
    }
    if (!amount || amount < minDeposit) {
      onToast(`Minimal deposit adalah ${formatRupiah(minDeposit)}`, 'error');
      return;
    }
    if (!senderName.trim()) {
      onToast('Nama pengguna / nama pengirim wajib diisi', 'error');
      return;
    }
    setStep(2);
  };

  // Submit Final (Konfirmasi Sudah Bayar)
  const handleFinalConfirmPayment = async () => {
    if (!user) {
      onOpenAuth();
      return;
    }
    if (amount < minDeposit) {
      onToast(`Minimal deposit adalah ${formatRupiah(minDeposit)}`, 'error');
      return;
    }
    if (!senderName.trim()) {
      onToast('Nama pengguna / nama pengirim wajib diisi', 'error');
      return;
    }

    setLoading(true);
    try {
      const depId = await submitDeposit(amount, senderName.trim(), method);
      setJustSubmittedId(depId);
      setStep(1);
      onToast('Permintaan deposit berhasil dikirim! Menunggu konfirmasi admin.', 'success');
    } catch (err: any) {
      console.error('Deposit error:', err);
      onToast(err.message || 'Gagal mengirim permintaan deposit', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 pb-28 md:pb-12 max-w-2xl mx-auto px-4 pt-4">
      {/* Header */}
      <div className="text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-950/70 border border-blue-500/30 text-cyan-300 text-xs font-semibold mb-2 shadow-[0_0_15px_rgba(34,211,238,0.2)]">
          <Wallet className="w-3.5 h-3.5 text-cyan-400" />
          <span>TEDDZ AMPREM • Deposit Saldo</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
          Isi Saldo
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Top up saldo mudah, aman, dan otomatis terverifikasi admin.
        </p>
      </div>

      {/* Saldo Saat Ini */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-950/80 to-slate-900 border border-blue-500/30 flex items-center justify-between shadow-lg shadow-blue-950/40">
        <div>
          <span className="text-[11px] text-slate-400 block font-medium">Saldo Anda Sekarang</span>
          <span className="text-xl sm:text-2xl font-black text-white">
            {formatRupiah(userProfile?.balance ?? 0)}
          </span>
        </div>
        <div className="text-right">
          <span className="text-[10px] text-cyan-400 font-semibold bg-blue-950 px-2.5 py-1 rounded-lg border border-cyan-500/20 block">
            Min Deposit: {formatRupiah(minDeposit)}
          </span>
        </div>
      </div>

      {/* TULISAN CARA TOP UP SALDO */}
      <div className="rounded-2xl bg-slate-900/90 border border-blue-500/25 overflow-hidden">
        <button
          type="button"
          onClick={() => setShowGuide(!showGuide)}
          className="w-full p-4 flex items-center justify-between text-left hover:bg-blue-950/40 transition-colors cursor-pointer"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-cyan-400">
              <HelpCircle className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-white">Cara Top Up Saldo</h3>
              <p className="text-[11px] text-slate-400">Panduan langkah deposit di TEDDZ AMPREM</p>
            </div>
          </div>
          <div className="text-slate-400">
            {showGuide ? <ChevronUp className="w-5 h-5 text-cyan-400" /> : <ChevronDown className="w-5 h-5" />}
          </div>
        </button>

        {showGuide && (
          <div className="px-4 pb-4 pt-1 border-t border-blue-900/30 space-y-2.5 text-xs text-slate-300">
            <div className="flex items-start gap-3 p-2.5 rounded-xl bg-blue-950/30 border border-blue-500/15">
              <span className="w-5 h-5 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-[10px] shrink-0 mt-0.5">
                1
              </span>
              <div>
                <strong className="text-white">Masukkan Nominal:</strong> Tentukan jumlah saldo yang ingin Anda isi (minimal {formatRupiah(minDeposit)}).
              </div>
            </div>
            <div className="flex items-start gap-3 p-2.5 rounded-xl bg-blue-950/30 border border-blue-500/15">
              <span className="w-5 h-5 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-[10px] shrink-0 mt-0.5">
                2
              </span>
              <div>
                <strong className="text-white">Masukkan Nama Pengguna:</strong> Isi nama akun e-wallet/bank Anda agar admin dapat mencocokkan pembayaran.
              </div>
            </div>
            <div className="flex items-start gap-3 p-2.5 rounded-xl bg-blue-950/30 border border-blue-500/15">
              <span className="w-5 h-5 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-[10px] shrink-0 mt-0.5">
                3
              </span>
              <div>
                <strong className="text-white">Konfirmasi Rincian:</strong> Tekan tombol 'Konfirmasi Rincian' untuk memeriksa detail nominal dan melanjutkan ke metode pembayaran.
              </div>
            </div>
            <div className="flex items-start gap-3 p-2.5 rounded-xl bg-blue-950/30 border border-blue-500/15">
              <span className="w-5 h-5 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-[10px] shrink-0 mt-0.5">
                4
              </span>
              <div>
                <strong className="text-white">Pilih DANA / QRIS & Transfer:</strong> Scan kode QRIS atau transfer ke nomor DANA <strong>{danaNumber} ({danaName})</strong> dengan nominal tepat.
              </div>
            </div>
            <div className="flex items-start gap-3 p-2.5 rounded-xl bg-blue-950/30 border border-blue-500/15">
              <span className="w-5 h-5 rounded-full bg-cyan-500 text-slate-950 font-bold flex items-center justify-center text-[10px] shrink-0 mt-0.5">
                5
              </span>
              <div>
                <strong className="text-white">Konfirmasi Sudah Bayar:</strong> Tekan tombol 'Konfirmasi Sudah Bayar'. Admin akan segera memverifikasi dan saldo langsung masuk ke akun Anda!
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Just submitted alert */}
      {justSubmittedId && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 rounded-2xl bg-blue-950/90 border border-cyan-500/40 text-cyan-200 text-xs space-y-2 shadow-[0_0_25px_rgba(34,211,238,0.2)]"
        >
          <div className="flex items-center gap-2 font-bold text-sm text-white">
            <CheckCircle2 className="w-5 h-5 text-cyan-400" />
            <span>Permintaan Deposit Telah Dicatat!</span>
          </div>
          <p className="text-cyan-300/80">
            Deposit Anda sebesar <strong className="text-white">{formatRupiah(amount)}</strong> dengan metode{' '}
            <strong className="text-white">{method}</strong> sedang menunggu konfirmasi admin. Saldo akan otomatis bertambah setelah disetujui.
          </p>
          <button
            onClick={() => setJustSubmittedId(null)}
            className="text-[11px] text-cyan-400 hover:text-white underline cursor-pointer"
          >
            Tutup notifikasi
          </button>
        </motion.div>
      )}

      {/* Step Indicator Progress Bar */}
      <div className="flex items-center justify-between px-2">
        <div className="flex items-center gap-2">
          <div
            className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
              step === 1
                ? 'bg-blue-600 text-white ring-4 ring-blue-600/30'
                : 'bg-emerald-600 text-white'
            }`}
          >
            {step === 1 ? '1' : <Check className="w-3.5 h-3.5" />}
          </div>
          <span className={`text-xs font-semibold ${step === 1 ? 'text-white' : 'text-slate-400'}`}>
            Nominal & Nama
          </span>
        </div>
        <div className="h-[2px] flex-1 mx-3 bg-blue-900/60 relative">
          <div
            className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 transition-all duration-300"
            style={{ width: step === 1 ? '50%' : '100%' }}
          />
        </div>
        <div className="flex items-center gap-2">
          <div
            className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
              step === 2
                ? 'bg-blue-600 text-white ring-4 ring-blue-600/30'
                : 'bg-slate-800 text-slate-400'
            }`}
          >
            2
          </div>
          <span className={`text-xs font-semibold ${step === 2 ? 'text-white' : 'text-slate-400'}`}>
            Pilih Metode & Bayar
          </span>
        </div>
      </div>

      {/* STEP 1: Masukkan Nominal & Nama Pengguna */}
      {step === 1 && (
        <form
          onSubmit={handleProceedToStep2}
          className="rounded-3xl bg-gradient-to-b from-[#0c1836] via-[#091126] to-[#060a17] border border-blue-500/30 p-5 sm:p-6 shadow-[0_0_35px_rgba(37,99,235,0.15)] space-y-5"
        >
          {/* 1. Masukan Nominal */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
                1. Masukkan Nominal Deposit
              </label>
              <span className="text-[11px] text-cyan-400 font-medium">
                Minimal {formatRupiah(minDeposit)}
              </span>
            </div>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-blue-400 text-sm">
                Rp
              </span>
              <input
                type="number"
                min={minDeposit}
                step={100}
                required
                value={amount || ''}
                onChange={(e) => setAmount(Number(e.target.value))}
                placeholder={`Minimal ${minDeposit}`}
                className="w-full pl-12 pr-4 py-3 rounded-2xl bg-slate-900/90 border border-blue-500/30 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/20 text-base font-bold text-white outline-none transition-all"
              />
            </div>

            {/* Quick chips */}
            <div className="flex flex-wrap gap-2 mt-3">
              {quickAmounts.map((q) => (
                <button
                  key={q}
                  type="button"
                  onClick={() => setAmount(q)}
                  className={`text-xs px-3 py-1.5 rounded-xl font-semibold transition-all border cursor-pointer ${
                    amount === q
                      ? 'bg-blue-600 text-white border-cyan-400 shadow-md shadow-blue-600/30'
                      : 'bg-slate-900/80 text-slate-300 border-blue-500/20 hover:border-blue-400/40 hover:text-white'
                  }`}
                >
                  {formatRupiah(q)}
                </button>
              ))}
            </div>
          </div>

          {/* 2. Masukan Nama Pengguna */}
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
              2. Masukkan Nama Pengguna / Pengirim
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-blue-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={senderName}
                onChange={(e) => setSenderName(e.target.value)}
                placeholder="Contoh: Muhammad Azril / Nama Rekening Anda"
                className="w-full pl-10 pr-4 py-3 rounded-2xl bg-slate-900/90 border border-blue-500/30 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/20 text-sm font-medium text-white outline-none transition-all placeholder-slate-500"
              />
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Nama ini digunakan admin untuk mencocokkan mutasi pembayaran Anda.
            </p>
          </div>

          {/* Tombol Konfirmasi Step 1 */}
          <button
            type="submit"
            disabled={!amount || amount < minDeposit || !senderName.trim()}
            className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 active:scale-[0.98] text-white font-extrabold text-sm shadow-[0_0_25px_rgba(59,130,246,0.4)] transition-all flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
          >
            <span>Konfirmasi Rincian</span>
            <ArrowRight className="w-4 h-4 text-white" />
          </button>
        </form>
      )}

      {/* STEP 2: Rincian Konfirmasi, Pilih DANA/QRIS, dan Konfirmasi Sudah Bayar */}
      {step === 2 && (
        <div className="rounded-3xl bg-gradient-to-b from-[#0c1836] via-[#091126] to-[#060a17] border border-blue-500/30 p-5 sm:p-6 shadow-[0_0_35px_rgba(37,99,235,0.15)] space-y-5">
          {/* Card Rincian yang Sudah Dikonfirmasi */}
          <div className="p-4 rounded-2xl bg-blue-950/50 border border-blue-500/30 space-y-2">
            <div className="flex items-center justify-between text-xs border-b border-blue-900/50 pb-2">
              <span className="text-slate-400">Rincian Deposit Anda:</span>
              <button
                type="button"
                onClick={() => setStep(1)}
                className="text-xs text-cyan-400 hover:underline flex items-center gap-1 font-semibold cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Ubah Nominal / Nama
              </button>
            </div>
            <div className="flex justify-between items-center text-sm pt-1">
              <span className="text-slate-300">Nominal Deposit:</span>
              <span className="font-extrabold text-cyan-300 text-base">{formatRupiah(amount)}</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-slate-300">Nama Pengguna:</span>
              <span className="font-semibold text-white">{senderName}</span>
            </div>
          </div>

          {/* 3. Pilih Metode Pembayaran (DANA / QRIS) */}
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
              Pilih Metode Pembayaran
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setMethod('QRIS')}
                className={`p-3.5 rounded-2xl border flex items-center justify-center gap-2.5 font-bold text-sm transition-all cursor-pointer ${
                  method === 'QRIS'
                    ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white border-cyan-400 shadow-[0_0_20px_rgba(34,211,238,0.3)]'
                    : 'bg-slate-900/80 text-slate-400 border-blue-500/20 hover:border-blue-400/40 hover:text-white'
                }`}
              >
                <QrCode className="w-5 h-5" />
                <span>QRIS</span>
              </button>
              <button
                type="button"
                onClick={() => setMethod('DANA')}
                className={`p-3.5 rounded-2xl border flex items-center justify-center gap-2.5 font-bold text-sm transition-all cursor-pointer ${
                  method === 'DANA'
                    ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white border-cyan-400 shadow-[0_0_20px_rgba(34,211,238,0.3)]'
                    : 'bg-slate-900/80 text-slate-400 border-blue-500/20 hover:border-blue-400/40 hover:text-white'
                }`}
              >
                <Smartphone className="w-5 h-5" />
                <span>DANA</span>
              </button>
            </div>
          </div>

          {/* Display Pembayaran DANA atau QRIS */}
          <div className="p-4 sm:p-5 rounded-2xl bg-[#060c1d] border border-blue-500/25 space-y-4">
            <div className="flex items-center justify-between text-xs pb-2 border-b border-blue-900/40">
              <span className="text-slate-400">Total Pembayaran:</span>
              <span className="font-extrabold text-cyan-300 text-lg">{formatRupiah(amount)}</span>
            </div>

            {method === 'QRIS' ? (
              <div className="space-y-4 text-center">
                <div className="max-w-xs mx-auto p-3 rounded-2xl bg-white shadow-2xl border-2 border-cyan-400/40">
                  <img
                    src={qrisUrl}
                    alt="QRIS Pembayaran TEDDZ AMPREM"
                    referrerPolicy="no-referrer"
                    className="w-full h-auto rounded-xl object-contain"
                  />
                </div>
                <p className="text-[11px] text-slate-300">
                  Scan QRIS resmi di atas menggunakan aplikasi e-wallet (DANA, GoPay, OVO, ShopeePay) atau Mobile Banking (BCA, Mandiri, BRI, BNI, dll).
                </p>
              </div>
            ) : (
              /* DANA Account Details Display */
              <div className="space-y-3">
                <div className="p-4 rounded-xl bg-blue-950/70 border border-blue-500/30 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-cyan-300 font-semibold uppercase tracking-wider">
                      Akun DANA Pembayaran Toko:
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-blue-900/80 text-white text-[10px] font-bold">
                      DANA
                    </span>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <div>
                      <div className="font-mono text-lg sm:text-xl font-black text-white tracking-wider">
                        {danaNumber}
                      </div>
                      <div className="text-xs font-bold text-cyan-300 mt-0.5">
                        a.n. {danaName}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCopy(danaNumber, 'Nomor DANA')}
                      className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all shadow-md shadow-blue-600/30 active:scale-95"
                    >
                      {copiedType === 'Nomor DANA' ? (
                        <>
                          <Check className="w-4 h-4 text-cyan-300" />
                          <span>Tersalin</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4" />
                          <span>Salin No. DANA</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-blue-950/30 border border-blue-500/20 text-[11px] text-slate-300 space-y-1">
                  <div className="flex items-center gap-1.5 font-semibold text-white">
                    <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Petunjuk Transfer DANA:</span>
                  </div>
                  <p>
                    Buka aplikasi DANA Anda &gt; Pilih menu <strong>Kirim</strong> &gt; Masukkan nomor <strong>{danaNumber}</strong> &gt; Masukkan nominal <strong>{formatRupiah(amount)}</strong> &gt; Pastikan penerima tertulis <strong>{danaName}</strong>.
                  </p>
                </div>
              </div>
            )}

            {/* Tombol Salin Nominal */}
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => handleCopy(String(amount), 'Nominal')}
                className="flex-1 py-2.5 px-3 rounded-xl bg-blue-950/80 hover:bg-blue-900/80 border border-blue-500/30 text-xs font-bold text-cyan-300 flex items-center justify-center gap-1.5 transition-all cursor-pointer"
              >
                {copiedType === 'Nominal' ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-cyan-400" /> Nominal Tersalin!
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" /> Salin Nominal ({formatRupiah(amount)})
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Tombol Konfirmasi Sudah Bayar */}
          <div className="space-y-2">
            <button
              type="button"
              onClick={handleFinalConfirmPayment}
              disabled={loading}
              className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 active:scale-[0.98] text-white font-extrabold text-sm shadow-[0_0_25px_rgba(59,130,246,0.4)] transition-all flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Mengirim konfirmasi pembayaran...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4 text-cyan-300" />
                  <span>Konfirmasi Sudah Bayar</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => setStep(1)}
              className="w-full py-2.5 rounded-xl text-xs text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              Kembali & Ubah Rincian
            </button>
          </div>
        </div>
      )}

      {/* User Deposit History List */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Clock className="w-4 h-4 text-cyan-400" />
            <span>Riwayat Deposit Anda</span>
          </h3>
          <span className="text-xs text-slate-400">{userDeposits.length} riwayat</span>
        </div>

        {userDeposits.length === 0 ? (
          <div className="p-6 rounded-2xl bg-slate-900/40 border border-blue-500/15 text-center text-xs text-slate-400">
            Belum ada permintaan deposit.
          </div>
        ) : (
          <div className="space-y-2.5">
            {userDeposits.map((dep) => {
              const isApproved = dep.status === 'APPROVED';
              const isPending = dep.status === 'PENDING';
              return (
                <div
                  key={dep.id}
                  className="p-3.5 rounded-2xl bg-gradient-to-b from-[#0a1329] to-[#070c1a] border border-blue-500/20 flex items-center justify-between gap-3 text-xs"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white">{formatRupiah(dep.amount)}</span>
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-blue-950 text-cyan-300 border border-blue-500/30">
                        {dep.method}
                      </span>
                    </div>
                    <span className="text-[11px] text-slate-400 block mt-0.5">
                      Pengirim: {dep.senderName} • {formatDate(dep.createdAt)}
                    </span>
                  </div>
                  <div>
                    {isApproved && (
                      <span className="px-2.5 py-1 rounded-xl text-[11px] font-bold bg-emerald-950/80 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Approved
                      </span>
                    )}
                    {isPending && (
                      <span className="px-2.5 py-1 rounded-xl text-[11px] font-bold bg-amber-950/80 text-amber-300 border border-amber-500/30 flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 animate-pulse" /> Pending
                      </span>
                    )}
                    {dep.status === 'REJECTED' && (
                      <span className="px-2.5 py-1 rounded-xl text-[11px] font-bold bg-rose-950/80 text-rose-300 border border-rose-500/30 flex items-center gap-1">
                        <XCircle className="w-3.5 h-3.5" /> Ditolak
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
