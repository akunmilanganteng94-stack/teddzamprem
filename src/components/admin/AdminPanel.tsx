import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  LayoutDashboard,
  Wallet,
  Users,
  ShoppingBag,
  DollarSign,
  Settings as SettingsIcon,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Search,
  ArrowLeft,
  Clock,
  ShieldCheck,
  ToggleLeft,
  ToggleRight,
  TrendingUp,
  FileSpreadsheet,
  AlertTriangle,
  UserCheck,
  UserX,
  History,
  Info,
} from 'lucide-react';
import { collection, onSnapshot, getDocs } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useAuth } from '../../context/AuthContext';
import { useStore } from '../../context/StoreContext';
import { formatRupiah, formatDate } from '../../lib/utils';
import { UserProfile, DepositRecord, OrderRecord, StoreSettings } from '../../types';

interface AdminPanelProps {
  onBackToStore: () => void;
  onToast: (msg: string, type: 'success' | 'error' | 'info') => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ onBackToStore, onToast }) => {
  const { user, isAdmin } = useAuth();
  const {
    settings,
    allDeposits,
    allOrders,
    auditLogs,
    confirmDeposit,
    rejectDeposit,
    updateStoreSettings,
    adminAdjustUserBalance,
    adminToggleUserStatus,
    adminPromoteUser,
  } = useStore();

  const [activeTab, setActiveTab] = useState<'dashboard' | 'deposits' | 'pricing' | 'users' | 'orders' | 'settings' | 'audit'>('dashboard');

  // All Users loaded for admin
  const [userList, setUserList] = useState<UserProfile[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [userSearch, setUserSearch] = useState('');

  // Modals state
  const [confirmingDeposit, setConfirmingDeposit] = useState<DepositRecord | null>(null);
  const [rejectingDeposit, setRejectingDeposit] = useState<DepositRecord | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  // Balance edit modal state
  const [targetUser, setTargetUser] = useState<UserProfile | null>(null);
  const [balanceAdjustType, setBalanceAdjustType] = useState<'ADD' | 'DEDUCT' | 'SET'>('ADD');
  const [balanceAmount, setBalanceAmount] = useState<number>(0);
  const [balanceReason, setBalanceReason] = useState<string>('');
  const [submittingBalance, setSubmittingBalance] = useState(false);

  // Pricing edit state
  const [tempPrice, setTempPrice] = useState<number>(settings.pricePerAccount || 500);
  const [savingPrice, setSavingPrice] = useState(false);

  // Store Settings edit state
  const [tempSettings, setTempSettings] = useState<StoreSettings>({ ...settings });
  const [savingSettings, setSavingSettings] = useState(false);

  // Load all users in real-time
  useEffect(() => {
    const unsub = onSnapshot(
      collection(db, 'users'),
      (snapshot) => {
        const list = snapshot.docs.map((d) => ({ uid: d.id, ...d.data() } as UserProfile));
        setUserList(list);
        setLoadingUsers(false);
      },
      (err) => {
        console.error("Error loading users for admin:", err);
        setLoadingUsers(false);
      }
    );

    return () => unsub();
  }, []);

  useEffect(() => {
    setTempPrice(settings.pricePerAccount || 500);
    setTempSettings({ ...settings });
  }, [settings]);

  // Statistics calculation
  const totalUsersCount = userList.length;
  const activeUsersCount = userList.filter((u) => u.status !== 'suspended').length;
  const pendingDeposits = allDeposits.filter((d) => d.status === 'PENDING');
  const approvedDeposits = allDeposits.filter((d) => d.status === 'APPROVED');
  const totalDepositAmount = approvedDeposits.reduce((acc, d) => acc + (d.amount || 0), 0);
  const totalOrdersCount = allOrders.length;
  const successfulOrders = allOrders.filter((o) => o.status === 'SUCCESS');
  const totalRevenue = successfulOrders.reduce((acc, o) => acc + (o.total || 0), 0);

  if (!isAdmin) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center space-y-4">
        <AlertTriangle className="w-12 h-12 text-rose-500 mx-auto" />
        <h3 className="text-xl font-bold text-white">Akses Ditolak</h3>
        <p className="text-xs text-slate-400">
          Anda tidak memiliki izin untuk mengakses Admin Panel.
        </p>
        <button
          onClick={onBackToStore}
          className="px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-semibold cursor-pointer"
        >
          Kembali ke Toko
        </button>
      </div>
    );
  }

  const handleConfirmDepositAction = async () => {
    if (!confirmingDeposit) return;
    try {
      await confirmDeposit(confirmingDeposit);
      onToast(`Deposit Rp${confirmingDeposit.amount.toLocaleString('id-ID')} berhasil disetujui! Saldo user bertambah.`, 'success');
      setConfirmingDeposit(null);
    } catch (err: any) {
      onToast(err.message || 'Gagal mengonfirmasi deposit', 'error');
    }
  };

  const handleRejectDepositAction = async () => {
    if (!rejectingDeposit) return;
    try {
      await rejectDeposit(rejectingDeposit, rejectReason);
      onToast('Deposit ditolak', 'info');
      setRejectingDeposit(null);
      setRejectReason('');
    } catch (err: any) {
      onToast(err.message || 'Gagal menolak deposit', 'error');
    }
  };

  const handleSavePrice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (tempPrice < 100) {
      onToast('Harga minimal Rp100', 'error');
      return;
    }
    setSavingPrice(true);
    try {
      await updateStoreSettings({ pricePerAccount: tempPrice });
      onToast(`Harga AM berhasil diubah menjadi ${formatRupiah(tempPrice)} / akun!`, 'success');
    } catch (err: any) {
      onToast(err.message || 'Gagal menyimpan harga', 'error');
    } finally {
      setSavingPrice(false);
    }
  };

  const handleSaveStoreSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingSettings(true);
    try {
      await updateStoreSettings({
        storeName: tempSettings.storeName,
        storeOpen: tempSettings.storeOpen,
        danaNumber: tempSettings.danaNumber.trim(),
        danaName: tempSettings.danaName?.trim() || 'TEDDY TRI PRATAMA',
        whatsapp: tempSettings.whatsapp.trim(),
        qrisUrl: tempSettings.qrisUrl.trim(),
        minDeposit: Number(tempSettings.minDeposit) || 1000,
      });
      onToast('Pengaturan toko berhasil diperbarui!', 'success');
    } catch (err: any) {
      onToast(err.message || 'Gagal menyimpan pengaturan toko', 'error');
    } finally {
      setSavingSettings(false);
    }
  };

  const handleToggleStoreStatus = async () => {
    try {
      const nextStatus = !settings.storeOpen;
      await updateStoreSettings({ storeOpen: nextStatus });
      onToast(nextStatus ? 'Toko berhasil DIBUKA!' : 'Toko berhasil DITUTUP!', 'info');
    } catch (err: any) {
      onToast(err.message || 'Gagal mengubah status toko', 'error');
    }
  };

  const handleSaveUserBalance = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetUser) return;
    if (balanceAmount < 0) {
      onToast('Nominal tidak boleh negatif', 'error');
      return;
    }
    setSubmittingBalance(true);
    try {
      await adminAdjustUserBalance(
        targetUser.uid,
        targetUser.email,
        balanceAdjustType,
        balanceAmount,
        balanceReason.trim()
      );
      onToast('Saldo user berhasil diperbarui!', 'success');
      setTargetUser(null);
      setBalanceAmount(0);
      setBalanceReason('');
    } catch (err: any) {
      onToast(err.message || 'Gagal menyesuaikan saldo', 'error');
    } finally {
      setSubmittingBalance(false);
    }
  };

  const filteredUsers = userList.filter(
    (u) =>
      u.name?.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.email?.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.uid.toLowerCase().includes(userSearch.toLowerCase())
  );

  return (
    <div className="space-y-6 pb-28 md:pb-12 max-w-6xl mx-auto px-4 pt-4">
      {/* Top Admin Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-3xl bg-gradient-to-r from-[#0c1a3b] via-[#09132a] to-[#060a17] border border-blue-500/30 shadow-xl">
        <div className="flex items-center gap-3">
          <button
            onClick={onBackToStore}
            className="p-2.5 rounded-xl bg-blue-950/60 hover:bg-blue-900/60 border border-blue-500/30 text-cyan-300 transition-all cursor-pointer flex items-center gap-1.5 text-xs font-semibold"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Ke Toko</span>
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl sm:text-2xl font-black text-white">
                Admin Panel TEDDZ AMPREM
              </h2>
              <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                PRO
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Pengaturan real-time database Firebase & manajemen toko
            </p>
          </div>
        </div>

        {/* Store Status Quick Toggle */}
        <div className="flex items-center gap-3 bg-slate-900/80 px-4 py-2 rounded-2xl border border-blue-500/20 self-start sm:self-auto">
          <div className="text-right">
            <span className="text-[10px] text-slate-400 block">Status Toko</span>
            <span
              className={`text-xs font-bold ${
                settings.storeOpen ? 'text-emerald-400' : 'text-rose-400'
              }`}
            >
              {settings.storeOpen ? 'OPEN (BUKA)' : 'CLOSED (TUTUP)'}
            </span>
          </div>
          <button
            onClick={handleToggleStoreStatus}
            className={`p-1.5 rounded-xl transition-all cursor-pointer ${
              settings.storeOpen
                ? 'bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30'
                : 'bg-rose-500/20 text-rose-400 hover:bg-rose-500/30'
            }`}
          >
            {settings.storeOpen ? (
              <ToggleRight className="w-6 h-6" />
            ) : (
              <ToggleLeft className="w-6 h-6" />
            )}
          </button>
        </div>
      </div>

      {/* Admin Navigation Tabs */}
      <div className="flex flex-wrap gap-1.5 p-1.5 bg-slate-900/80 rounded-2xl border border-blue-500/20 text-xs font-semibold overflow-x-auto">
        {[
          { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
          { id: 'deposits', label: `Deposit (${pendingDeposits.length} Pending)`, icon: Wallet },
          { id: 'pricing', label: `Harga AM (${formatRupiah(settings.pricePerAccount)})`, icon: DollarSign },
          { id: 'users', label: `User (${userList.length})`, icon: Users },
          { id: 'orders', label: `Order AM (${allOrders.length})`, icon: ShoppingBag },
          { id: 'settings', label: 'Pengaturan Toko', icon: SettingsIcon },
          { id: 'audit', label: 'Audit Log', icon: History },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl transition-all whitespace-nowrap cursor-pointer ${
                isActive
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: DASHBOARD STATS */}
      {activeTab === 'dashboard' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-4">
            <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-br from-[#0c1836] to-[#070e22] border border-blue-500/25 shadow-lg">
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-xs font-semibold">Total User</span>
                <Users className="w-4 h-4 text-cyan-400" />
              </div>
              <div className="text-2xl sm:text-3xl font-black text-white">
                {totalUsersCount}
              </div>
              <span className="text-[11px] text-cyan-400/90 font-medium block mt-1">
                Terdaftar di sistem
              </span>
            </div>

            <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-br from-[#0c1836] to-[#070e22] border border-blue-500/25 shadow-lg">
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-xs font-semibold">User Aktif</span>
                <UserCheck className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="text-2xl sm:text-3xl font-black text-white">
                {activeUsersCount}
              </div>
              <span className="text-[11px] text-emerald-400/90 font-medium block mt-1">
                Status tidak disuspend
              </span>
            </div>

            <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-br from-[#0c1836] to-[#070e22] border border-blue-500/25 shadow-lg">
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-xs font-semibold">Deposit Pending</span>
                <Clock className="w-4 h-4 text-amber-400 animate-pulse" />
              </div>
              <div className="text-2xl sm:text-3xl font-black text-amber-300">
                {pendingDeposits.length}
              </div>
              <span className="text-[11px] text-amber-400/90 font-medium block mt-1">
                Perlu konfirmasi admin
              </span>
            </div>

            <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-br from-[#0c1836] to-[#070e22] border border-blue-500/25 shadow-lg">
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-xs font-semibold">Total Deposit Masuk</span>
                <Wallet className="w-4 h-4 text-cyan-400" />
              </div>
              <div className="text-xl sm:text-2xl font-black text-white">
                {formatRupiah(totalDepositAmount)}
              </div>
              <span className="text-[11px] text-cyan-400/90 font-medium block mt-1">
                {approvedDeposits.length} deposit disetujui
              </span>
            </div>

            <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-br from-[#0c1836] to-[#070e22] border border-blue-500/25 shadow-lg">
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-xs font-semibold">Total Order AM</span>
                <ShoppingBag className="w-4 h-4 text-cyan-400" />
              </div>
              <div className="text-2xl sm:text-3xl font-black text-white">
                {totalOrdersCount}
              </div>
              <span className="text-[11px] text-cyan-400/90 font-medium block mt-1">
                {successfulOrders.length} order berhasil
              </span>
            </div>

            <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-br from-[#0c1836] to-[#070e22] border border-blue-500/25 shadow-lg">
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-xs font-semibold">Total Nilai Order</span>
                <TrendingUp className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="text-xl sm:text-2xl font-black text-emerald-300">
                {formatRupiah(totalRevenue)}
              </div>
              <span className="text-[11px] text-emerald-400/90 font-medium block mt-1">
                Omzet transaksi AM
              </span>
            </div>
          </div>

          {/* Quick pending deposits table snippet */}
          {pendingDeposits.length > 0 && (
            <div className="p-5 rounded-3xl bg-amber-500/10 border border-amber-500/30 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-amber-400" />
                  <h3 className="font-bold text-white text-sm">
                    Ada {pendingDeposits.length} Deposit Menunggu Tindakan Anda
                  </h3>
                </div>
                <button
                  onClick={() => setActiveTab('deposits')}
                  className="px-3 py-1 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs cursor-pointer hover:bg-amber-400"
                >
                  Periksa Sekarang
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: DEPOSIT MANAGEMENT */}
      {activeTab === 'deposits' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Wallet className="w-5 h-5 text-cyan-400" />
              <span>Semua Permintaan Deposit</span>
            </h3>
            <span className="text-xs text-slate-400">
              {allDeposits.length} total permintaan
            </span>
          </div>

          {allDeposits.length === 0 ? (
            <div className="p-8 rounded-3xl bg-slate-900/40 border border-blue-500/15 text-center text-xs text-slate-400">
              Belum ada data deposit dari user.
            </div>
          ) : (
            <div className="space-y-3">
              {allDeposits.map((dep) => {
                const isPending = dep.status === 'PENDING';
                return (
                  <div
                    key={dep.id}
                    className={`p-4 sm:p-5 rounded-2xl border transition-all ${
                      isPending
                        ? 'bg-[#0e1b3d] border-amber-500/40 shadow-[0_0_25px_rgba(245,158,11,0.15)]'
                        : 'bg-[#080f24] border-blue-500/20'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2.5">
                          <span className="text-lg font-black text-white">
                            {formatRupiah(dep.amount)}
                          </span>
                          <span className="px-2.5 py-0.5 rounded-lg text-xs font-bold bg-blue-950 text-cyan-300 border border-blue-500/30">
                            {dep.method}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded-md text-[10px] font-extrabold ${
                              dep.status === 'APPROVED'
                                ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/30'
                                : dep.status === 'REJECTED'
                                ? 'bg-rose-950 text-rose-300 border border-rose-500/30'
                                : 'bg-amber-950 text-amber-300 border border-amber-500/30 animate-pulse'
                            }`}
                          >
                            {dep.status}
                          </span>
                        </div>
                        <div className="mt-1.5 space-y-0.5 text-xs text-slate-300">
                          <div>
                            <strong className="text-slate-400">Pengirim:</strong> {dep.senderName} •{' '}
                            <strong className="text-slate-400">User:</strong> {dep.userName} ({dep.userEmail})
                          </div>
                          <div className="text-[11px] text-slate-400">
                            ID: <span className="font-mono text-cyan-300">{dep.id}</span> •{' '}
                            {formatDate(dep.createdAt)}
                          </div>
                          {dep.processedAt && (
                            <div className="text-[10px] text-slate-400">
                              Diproses: {formatDate(dep.processedAt)} oleh {dep.processedBy}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Actions */}
                      {isPending && (
                        <div className="flex items-center gap-2 pt-2 sm:pt-0">
                          <button
                            onClick={() => setConfirmingDeposit(dep)}
                            className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-emerald-600/30 cursor-pointer"
                          >
                            <CheckCircle2 className="w-4 h-4" />
                            <span>Konfirmasi</span>
                          </button>
                          <button
                            onClick={() => setRejectingDeposit(dep)}
                            className="px-3 py-2 rounded-xl bg-rose-950/60 hover:bg-rose-900/60 border border-rose-500/40 text-rose-300 font-bold text-xs flex items-center gap-1.5 cursor-pointer"
                          >
                            <XCircle className="w-4 h-4" />
                            <span>Tolak</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: PRICING SETTINGS */}
      {activeTab === 'pricing' && (
        <div className="max-w-xl mx-auto space-y-6">
          <div className="p-6 rounded-3xl bg-gradient-to-b from-[#0c1836] via-[#091126] to-[#060a17] border border-blue-500/30 shadow-xl space-y-5">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-blue-900/50 border border-blue-500/40 flex items-center justify-center text-cyan-300">
                <DollarSign className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Pengaturan Harga AM</h3>
                <p className="text-xs text-slate-400">
                  Ubah harga per akun Alight Motion Premium. Otomatis berlaku ke seluruh website.
                </p>
              </div>
            </div>

            <form onSubmit={handleSavePrice} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                  Harga per Akun (Rupiah)
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-blue-400 text-sm">
                    Rp
                  </span>
                  <input
                    type="number"
                    min={100}
                    step={50}
                    required
                    value={tempPrice}
                    onChange={(e) => setTempPrice(Number(e.target.value))}
                    className="w-full pl-12 pr-4 py-3 rounded-2xl bg-slate-900/90 border border-blue-500/30 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/20 text-lg font-extrabold text-white outline-none"
                  />
                </div>
              </div>

              {/* Simulation Table */}
              <div className="p-4 rounded-2xl bg-[#060c1d] border border-blue-500/20 text-xs space-y-2">
                <span className="text-[11px] font-bold text-cyan-300 uppercase tracking-wider block mb-1">
                  Simulasi Harga Pada User:
                </span>
                <div className="grid grid-cols-2 gap-2 text-slate-300">
                  <div>1 Akun = <strong className="text-white">{formatRupiah(tempPrice * 1)}</strong></div>
                  <div>2 Akun = <strong className="text-white">{formatRupiah(tempPrice * 2)}</strong></div>
                  <div>3 Akun = <strong className="text-white">{formatRupiah(tempPrice * 3)}</strong></div>
                  <div>4 Akun = <strong className="text-white">{formatRupiah(tempPrice * 4)}</strong></div>
                  <div className="col-span-2">5 Akun = <strong className="text-cyan-300">{formatRupiah(tempPrice * 5)}</strong></div>
                </div>
              </div>

              <button
                type="submit"
                disabled={savingPrice}
                className="w-full py-3 rounded-2xl bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-extrabold text-sm shadow-lg shadow-blue-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {savingPrice ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Simpan Harga ({formatRupiah(tempPrice)} / Akun)</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* TAB 4: USERS MANAGEMENT & BALANCE ADJUSTMENT */}
      {activeTab === 'users' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Users className="w-5 h-5 text-cyan-400" />
              <span>Daftar User & Manajemen Saldo</span>
            </h3>
            {/* Search */}
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                placeholder="Cari nama, email, UID..."
                className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-900 border border-blue-500/20 text-xs text-white placeholder-slate-500 outline-none focus:border-cyan-400"
              />
            </div>
          </div>

          <div className="space-y-3">
            {filteredUsers.map((u) => {
              const isUserAdmin = u.role === 'admin';
              const isSuspended = u.status === 'suspended';

              return (
                <div
                  key={u.uid}
                  className="p-4 sm:p-5 rounded-2xl bg-[#0a1228] border border-blue-500/20 flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white text-sm">{u.name || 'User'}</span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          isUserAdmin
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                            : 'bg-blue-500/20 text-cyan-300 border border-blue-500/30'
                        }`}
                      >
                        {u.role?.toUpperCase() || 'USER'}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          isSuspended
                            ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                            : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        }`}
                      >
                        {isSuspended ? 'SUSPENDED' : 'AKTIF'}
                      </span>
                    </div>
                    <div className="mt-1 space-y-0.5 text-slate-400">
                      <div>Email: <span className="text-slate-200">{u.email}</span></div>
                      <div className="font-mono text-[11px]">UID: {u.uid}</div>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    <div className="text-left md:text-right bg-slate-900/70 p-2.5 rounded-xl border border-blue-500/20">
                      <span className="text-[10px] text-slate-400 block">Saldo User</span>
                      <span className="text-base font-extrabold text-cyan-300">
                        {formatRupiah(u.balance || 0)}
                      </span>
                    </div>

                    {/* Balance button */}
                    <button
                      onClick={() => {
                        setTargetUser(u);
                        setBalanceAmount(0);
                        setBalanceReason('');
                      }}
                      className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-md shadow-blue-600/30"
                    >
                      <Wallet className="w-3.5 h-3.5" />
                      <span>Edit Saldo</span>
                    </button>

                    {/* Status toggle button */}
                    <button
                      onClick={async () => {
                        try {
                          await adminToggleUserStatus(u.uid, u.status || 'active');
                          onToast(`Status user ${u.name} berhasil diubah!`, 'info');
                        } catch (err: any) {
                          onToast(err.message, 'error');
                        }
                      }}
                      className={`px-3 py-2 rounded-xl border text-xs font-semibold cursor-pointer ${
                        isSuspended
                          ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300'
                          : 'bg-rose-950/60 border-rose-500/40 text-rose-300'
                      }`}
                    >
                      {isSuspended ? 'Aktifkan' : 'Suspend'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 5: ALL ORDERS */}
      {activeTab === 'orders' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-cyan-400" />
              <span>Semua Order AM Premium</span>
            </h3>
            <span className="text-xs text-slate-400">{allOrders.length} order</span>
          </div>

          {allOrders.length === 0 ? (
            <div className="p-8 rounded-3xl bg-slate-900/40 border border-blue-500/15 text-center text-xs text-slate-400">
              Belum ada order AM yang tercatat.
            </div>
          ) : (
            <div className="space-y-3">
              {allOrders.map((ord) => (
                <div
                  key={ord.id}
                  className="p-4 sm:p-5 rounded-2xl bg-[#080f24] border border-blue-500/20 text-xs space-y-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-white">
                          Order #{ord.id.slice(0, 8)}...
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                            ord.status === 'SUCCESS'
                              ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/30'
                              : ord.status === 'PROCESSING'
                              ? 'bg-amber-950 text-amber-300 border border-amber-500/30'
                              : 'bg-rose-950 text-rose-300 border border-rose-500/30'
                          }`}
                        >
                          {ord.status}
                        </span>
                      </div>
                      <span className="text-slate-400 text-[11px] block mt-0.5">
                        User: {ord.userName || ord.userEmail} ({ord.userEmail}) • {formatDate(ord.createdAt)}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-extrabold text-cyan-300">
                        {formatRupiah(ord.total)}
                      </span>
                      <span className="text-[11px] text-slate-400 block">
                        {ord.quantity} Akun (@ {formatRupiah(ord.pricePerAccount)})
                      </span>
                    </div>
                  </div>

                  {/* API Response display */}
                  {ord.apiResponse && (
                    <div className="bg-black/50 p-3 rounded-xl border border-blue-900/40">
                      <span className="text-[10px] text-slate-400 block mb-1">API Response:</span>
                      <pre className="font-mono text-[11px] text-cyan-200 overflow-x-auto max-h-32">
                        {typeof ord.apiResponse === 'string'
                          ? ord.apiResponse
                          : JSON.stringify(ord.apiResponse, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 6: SETTINGS */}
      {activeTab === 'settings' && (
        <div className="max-w-2xl mx-auto">
          <form
            onSubmit={handleSaveStoreSettings}
            className="p-6 rounded-3xl bg-gradient-to-b from-[#0c1836] via-[#091126] to-[#060a17] border border-blue-500/30 shadow-xl space-y-4 text-xs"
          >
            <div className="flex items-center gap-3 pb-4 border-b border-blue-900/40">
              <div className="w-10 h-10 rounded-xl bg-blue-900/50 border border-blue-500/30 flex items-center justify-center text-cyan-300">
                <SettingsIcon className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Konfigurasi Toko & Sistem</h3>
                <p className="text-slate-400">Pengaturan nomor pembayaran, kontak bantuan, dan status toko</p>
              </div>
            </div>

            <div>
              <label className="block text-slate-300 font-bold mb-1">Nama Toko</label>
              <input
                type="text"
                required
                value={tempSettings.storeName}
                onChange={(e) => setTempSettings({ ...tempSettings, storeName: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-blue-500/30 text-white outline-none focus:border-cyan-400"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-bold mb-1">Status Toko</label>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setTempSettings({ ...tempSettings, storeOpen: true })}
                  className={`flex-1 py-2 rounded-xl font-bold border transition-all cursor-pointer ${
                    tempSettings.storeOpen
                      ? 'bg-emerald-600 text-white border-emerald-400 shadow-md'
                      : 'bg-slate-900 text-slate-400 border-blue-500/20'
                  }`}
                >
                  OPEN (Toko Buka)
                </button>
                <button
                  type="button"
                  onClick={() => setTempSettings({ ...tempSettings, storeOpen: false })}
                  className={`flex-1 py-2 rounded-xl font-bold border transition-all cursor-pointer ${
                    !tempSettings.storeOpen
                      ? 'bg-rose-600 text-white border-rose-400 shadow-md'
                      : 'bg-slate-900 text-slate-400 border-blue-500/20'
                  }`}
                >
                  CLOSED (Toko Tutup)
                </button>
              </div>
            </div>

            <div>
              <label className="block text-slate-300 font-bold mb-1">
                Nomor Akun DANA Toko (0831-5092-1412)
              </label>
              <input
                type="text"
                value={tempSettings.danaNumber}
                onChange={(e) => setTempSettings({ ...tempSettings, danaNumber: e.target.value })}
                placeholder="Contoh: 0831-5092-1412"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-blue-500/30 text-white outline-none focus:border-cyan-400"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-bold mb-1">
                Nama Pemilik Akun DANA
              </label>
              <input
                type="text"
                value={tempSettings.danaName || 'TEDDY TRI PRATAMA'}
                onChange={(e) => setTempSettings({ ...tempSettings, danaName: e.target.value })}
                placeholder="TEDDY TRI PRATAMA"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-blue-500/30 text-white outline-none focus:border-cyan-400"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-bold mb-1">Nomor WhatsApp Bantuan (Format: 628...)</label>
              <input
                type="text"
                required
                value={tempSettings.whatsapp}
                onChange={(e) => setTempSettings({ ...tempSettings, whatsapp: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-blue-500/30 text-white outline-none focus:border-cyan-400"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-bold mb-1">URL Gambar QRIS</label>
              <input
                type="url"
                required
                value={tempSettings.qrisUrl}
                onChange={(e) => setTempSettings({ ...tempSettings, qrisUrl: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-blue-500/30 text-white outline-none focus:border-cyan-400"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-bold mb-1">Minimal Deposit (Rupiah)</label>
              <input
                type="number"
                min={500}
                step={500}
                required
                value={tempSettings.minDeposit}
                onChange={(e) => setTempSettings({ ...tempSettings, minDeposit: Number(e.target.value) })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-blue-500/30 text-white outline-none focus:border-cyan-400"
              />
            </div>

            <button
              type="submit"
              disabled={savingSettings}
              className="w-full py-3 rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-extrabold text-sm shadow-lg shadow-blue-600/30 cursor-pointer disabled:opacity-50"
            >
              {savingSettings ? 'Menyimpan...' : 'Simpan Konfigurasi Toko'}
            </button>
          </form>
        </div>
      )}

      {/* TAB 7: AUDIT LOG */}
      {activeTab === 'audit' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <History className="w-5 h-5 text-cyan-400" />
              <span>Audit Log Perubahan Saldo</span>
            </h3>
            <span className="text-xs text-slate-400">{auditLogs.length} catatan</span>
          </div>

          {auditLogs.length === 0 ? (
            <div className="p-8 rounded-3xl bg-slate-900/40 border border-blue-500/15 text-center text-xs text-slate-400">
              Belum ada log perubahan saldo oleh admin.
            </div>
          ) : (
            <div className="space-y-2.5">
              {auditLogs.map((log) => (
                <div
                  key={log.id}
                  className="p-3.5 rounded-2xl bg-[#080f24] border border-blue-500/20 text-xs flex items-center justify-between gap-3"
                >
                  <div>
                    <div className="flex items-center gap-2 font-bold text-white">
                      <span>{log.action}</span>
                      <span className="text-cyan-300">
                        {log.amount ? formatRupiah(log.amount) : ''}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Target User: {log.targetUserEmail || log.targetUserId} • Alasan: {log.reason}
                    </p>
                  </div>
                  <div className="text-right text-[11px] text-slate-400">
                    <div>Oleh: {log.adminEmail}</div>
                    <div>{formatDate(log.createdAt)}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* MODAL: CONFIRM DEPOSIT */}
      <AnimatePresence>
        {confirmingDeposit && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md bg-[#0a1226] border border-cyan-500/40 rounded-3xl p-6 shadow-2xl text-slate-200 space-y-4"
            >
              <div className="flex items-center gap-3 text-cyan-400">
                <CheckCircle2 className="w-6 h-6" />
                <h3 className="font-bold text-white text-lg">Konfirmasi Deposit User</h3>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950/70 border border-blue-500/20 text-xs space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-400">User:</span>
                  <span className="font-bold text-white">{confirmingDeposit.userName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Email:</span>
                  <span className="font-mono text-slate-300">{confirmingDeposit.userEmail}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Nominal:</span>
                  <span className="font-black text-cyan-300 text-sm">
                    {formatRupiah(confirmingDeposit.amount)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Metode:</span>
                  <span className="font-bold text-white">{confirmingDeposit.method}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Nama Pengirim:</span>
                  <span className="font-bold text-white">{confirmingDeposit.senderName}</span>
                </div>
              </div>

              <p className="text-[11px] text-cyan-300/80">
                Setelah dikonfirmasi, saldo user otomatis bertambah sebesar{' '}
                <strong>{formatRupiah(confirmingDeposit.amount)}</strong> dan status deposit menjadi APPROVED.
              </p>

              <div className="flex items-center gap-3 pt-2">
                <button
                  onClick={() => setConfirmingDeposit(null)}
                  className="flex-1 py-2.5 px-3 rounded-xl bg-slate-900 border border-blue-500/20 text-xs font-semibold text-slate-300 hover:text-white cursor-pointer"
                >
                  Batal
                </button>
                <button
                  onClick={handleConfirmDepositAction}
                  className="flex-1 py-2.5 px-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-xs font-bold text-white shadow-lg shadow-emerald-600/30 cursor-pointer"
                >
                  Konfirmasi Deposit
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL: REJECT DEPOSIT */}
      <AnimatePresence>
        {rejectingDeposit && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md bg-[#0a1226] border border-rose-500/40 rounded-3xl p-6 shadow-2xl text-slate-200 space-y-4"
            >
              <div className="flex items-center gap-3 text-rose-400">
                <XCircle className="w-6 h-6" />
                <h3 className="font-bold text-white text-lg">Tolak Deposit</h3>
              </div>

              <p className="text-xs text-slate-300">
                Apakah Anda yakin ingin menolak deposit sebesar{' '}
                <strong>{formatRupiah(rejectingDeposit.amount)}</strong> dari user{' '}
                <strong>{rejectingDeposit.userName}</strong>?
              </p>

              <div>
                <label className="block text-[11px] font-bold text-slate-400 mb-1">
                  Alasan Penolakan (Opsional)
                </label>
                <input
                  type="text"
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="Contoh: Bukti transfer tidak valid / belum masuk mutasi"
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-blue-500/20 text-xs text-white outline-none focus:border-rose-400"
                />
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  onClick={() => setRejectingDeposit(null)}
                  className="flex-1 py-2.5 px-3 rounded-xl bg-slate-900 border border-blue-500/20 text-xs font-semibold text-slate-300 hover:text-white cursor-pointer"
                >
                  Batal
                </button>
                <button
                  onClick={handleRejectDepositAction}
                  className="flex-1 py-2.5 px-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-xs font-bold text-white shadow-lg shadow-rose-600/30 cursor-pointer"
                >
                  Tolak Deposit
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL: EDIT USER BALANCE */}
      <AnimatePresence>
        {targetUser && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md bg-[#0a1226] border border-blue-500/40 rounded-3xl p-6 shadow-2xl text-slate-200 space-y-4"
            >
              <div className="flex items-center justify-between pb-3 border-b border-blue-900/40">
                <div className="flex items-center gap-2">
                  <Wallet className="w-5 h-5 text-cyan-400" />
                  <h3 className="font-bold text-white text-base">Edit Saldo User</h3>
                </div>
                <button
                  onClick={() => setTargetUser(null)}
                  className="text-xs text-slate-400 hover:text-white cursor-pointer"
                >
                  Tutup
                </button>
              </div>

              <div className="p-3 rounded-xl bg-slate-950/60 border border-blue-500/20 text-xs space-y-1">
                <div>User: <strong className="text-white">{targetUser.name}</strong></div>
                <div>Email: <strong className="text-slate-300">{targetUser.email}</strong></div>
                <div>Saldo Saat Ini: <strong className="text-cyan-300">{formatRupiah(targetUser.balance || 0)}</strong></div>
              </div>

              <form onSubmit={handleSaveUserBalance} className="space-y-3.5 text-xs">
                <div>
                  <label className="block text-slate-300 font-bold mb-1.5">Tipe Penyesuaian</label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: 'ADD', label: 'Tambah Saldo' },
                      { id: 'DEDUCT', label: 'Kurangi Saldo' },
                      { id: 'SET', label: 'Set Saldo' },
                    ].map((btn) => (
                      <button
                        key={btn.id}
                        type="button"
                        onClick={() => setBalanceAdjustType(btn.id as any)}
                        className={`py-2 px-2 rounded-xl font-bold text-center border transition-all cursor-pointer ${
                          balanceAdjustType === btn.id
                            ? 'bg-blue-600 text-white border-cyan-400 shadow-md'
                            : 'bg-slate-900 text-slate-400 border-blue-500/20'
                        }`}
                      >
                        {btn.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">Nominal (Rupiah)</label>
                  <input
                    type="number"
                    min={0}
                    step={100}
                    required
                    value={balanceAmount || ''}
                    onChange={(e) => setBalanceAmount(Number(e.target.value))}
                    placeholder="Contoh: 5000"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-blue-500/30 text-white font-bold text-sm outline-none focus:border-cyan-400"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">Alasan Penyesuaian (Audit Log)</label>
                  <input
                    type="text"
                    required
                    value={balanceReason}
                    onChange={(e) => setBalanceReason(e.target.value)}
                    placeholder="Contoh: Bonus promo / koreksi manual deposit"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-blue-500/30 text-white text-xs outline-none focus:border-cyan-400"
                  />
                </div>

                <div className="p-3 rounded-xl bg-blue-950/40 border border-blue-500/20 text-[11px] text-cyan-300">
                  Estimasi saldo baru:{' '}
                  <strong className="text-white">
                    {formatRupiah(
                      balanceAdjustType === 'ADD'
                        ? (targetUser.balance || 0) + balanceAmount
                        : balanceAdjustType === 'DEDUCT'
                        ? Math.max(0, (targetUser.balance || 0) - balanceAmount)
                        : balanceAmount
                    )}
                  </strong>
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setTargetUser(null)}
                    className="flex-1 py-2.5 rounded-xl bg-slate-900 border border-blue-500/20 font-semibold text-slate-300 hover:text-white cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={submittingBalance || balanceAmount < 0}
                    className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 font-bold text-white shadow-lg shadow-blue-600/30 disabled:opacity-50 cursor-pointer"
                  >
                    {submittingBalance ? 'Menyimpan...' : 'Terapkan Perubahan'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
