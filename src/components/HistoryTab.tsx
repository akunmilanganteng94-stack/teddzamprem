import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Clock,
  Zap,
  Wallet,
  CheckCircle2,
  AlertCircle,
  XCircle,
  FileText,
  Copy,
  Check,
  ChevronRight,
  Filter,
  Mail,
  Key,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useStore } from '../context/StoreContext';
import { formatRupiah, formatDate } from '../lib/utils';
import { OrderRecord, DepositRecord } from '../types';
import { parseAccountDetails } from '../lib/accountParser';
import { AccountCredentialCard } from './AccountCredentialCard';

interface HistoryTabProps {
  onOpenAuth: () => void;
  onToast: (msg: string, type: 'success' | 'error' | 'info') => void;
}

export const HistoryTab: React.FC<HistoryTabProps> = ({ onOpenAuth, onToast }) => {
  const { user } = useAuth();
  const { userOrders, userDeposits, userTransactions } = useStore();

  const [activeTab, setActiveTab] = useState<'all' | 'orders' | 'deposits'>('all');
  const [selectedOrder, setSelectedOrder] = useState<OrderRecord | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  if (!user) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-14 h-14 rounded-2xl bg-blue-950/60 border border-blue-500/30 flex items-center justify-center mx-auto text-cyan-400">
          <Clock className="w-7 h-7" />
        </div>
        <h3 className="text-xl font-bold text-white">Login untuk Melihat Riwayat</h3>
        <p className="text-xs text-slate-400">
          Silakan masuk ke akun Anda untuk melihat catatan transaksi, riwayat order AM, dan status deposit.
        </p>
        <button
          onClick={onOpenAuth}
          className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-bold text-xs shadow-md shadow-blue-600/30 hover:from-blue-500 hover:to-cyan-400 cursor-pointer"
        >
          Masuk ke Akun
        </button>
      </div>
    );
  }

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    onToast('Disalin ke clipboard!', 'info');
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <div className="space-y-6 pb-28 md:pb-12 max-w-3xl mx-auto px-4 pt-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white flex items-center gap-2">
            <Clock className="w-6 h-6 text-cyan-400" />
            <span>Riwayat Transaksi</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Daftar order Alight Motion Premium dan riwayat deposit Anda.
          </p>
        </div>

        {/* Tab switch */}
        <div className="flex bg-slate-900/80 p-1 rounded-2xl border border-blue-500/20 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-3 py-1.5 rounded-xl transition-all ${
              activeTab === 'all'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Semua
          </button>
          <button
            onClick={() => setActiveTab('orders')}
            className={`px-3 py-1.5 rounded-xl transition-all ${
              activeTab === 'orders'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Order AM ({userOrders.length})
          </button>
          <button
            onClick={() => setActiveTab('deposits')}
            className={`px-3 py-1.5 rounded-xl transition-all ${
              activeTab === 'deposits'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Deposit ({userDeposits.length})
          </button>
        </div>
      </div>

      {/* Orders List */}
      {(activeTab === 'all' || activeTab === 'orders') && (
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs font-bold text-cyan-300 uppercase tracking-wider">
            <span className="flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-cyan-400" /> Order AM Premium
            </span>
            <span className="text-slate-400 lowercase font-normal">{userOrders.length} transaksi</span>
          </div>

          {userOrders.length === 0 ? (
            <div className="p-6 rounded-2xl bg-slate-900/40 border border-blue-500/15 text-center text-xs text-slate-400">
              Belum ada riwayat order AM.
            </div>
          ) : (
            <div className="space-y-2.5">
              {userOrders.map((ord) => {
                const isSuccess = ord.status === 'SUCCESS';
                const isProcessing = ord.status === 'PROCESSING';

                return (
                  <motion.div
                    key={ord.id}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    onClick={() => setSelectedOrder(ord)}
                    className="p-4 rounded-2xl bg-gradient-to-b from-[#0c1836] to-[#070e22] border border-blue-500/25 hover:border-cyan-500/40 hover:shadow-[0_0_20px_rgba(34,211,238,0.15)] transition-all cursor-pointer flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-blue-900/50 border border-blue-500/30 flex items-center justify-center text-cyan-300 shrink-0">
                        <Zap className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-white text-sm">
                            {ord.quantity} Akun AM Premium
                          </span>
                          <span className="text-[10px] text-slate-400">
                            (@ {formatRupiah(ord.pricePerAccount)})
                          </span>
                        </div>
                        <div className="flex items-center gap-2 mt-0.5 text-slate-400 text-[11px]">
                          <span className="font-mono text-cyan-300/80">ID: {ord.id.slice(0, 8)}...</span>
                          <span>•</span>
                          <span>{formatDate(ord.createdAt)}</span>
                        </div>
                        {(() => {
                          const accounts = parseAccountDetails(ord.apiResponse);
                          if (accounts.length === 0) return null;
                          return (
                            <div className="mt-2 pt-1.5 border-t border-blue-900/30 space-y-1">
                              <div className="flex items-center gap-1.5 text-[11px] text-slate-300">
                                <Mail className="w-3 h-3 text-cyan-400 shrink-0" />
                                <span className="text-slate-400 text-[10px]">Email:</span>
                                <span className="font-mono text-cyan-200 font-semibold truncate max-w-[170px] sm:max-w-xs select-all">
                                  {accounts[0].email}
                                </span>
                                {accounts.length > 1 && (
                                  <span className="text-[9px] text-cyan-400 font-bold">
                                    (+{accounts.length - 1} akun)
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center gap-1.5 text-[11px] text-slate-300">
                                <Key className="w-3 h-3 text-cyan-400 shrink-0" />
                                <span className="text-slate-400 text-[10px]">Akses:</span>
                                <span className="font-mono text-cyan-200 truncate max-w-[170px] sm:max-w-xs select-all">
                                  {accounts[0].accessGmail}
                                </span>
                              </div>
                            </div>
                          );
                        })()}
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <div className="font-black text-white text-sm">
                          {formatRupiah(ord.total)}
                        </div>
                        <div className="mt-0.5">
                          {isSuccess && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md bg-cyan-950/80 text-cyan-300 border border-cyan-500/30">
                              <CheckCircle2 className="w-3 h-3" /> SUCCESS
                            </span>
                          )}
                          {isProcessing && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-950/80 text-amber-300 border border-amber-500/30">
                              <Clock className="w-3 h-3 animate-pulse" /> PROCESSING
                            </span>
                          )}
                          {ord.status === 'FAILED' && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md bg-rose-950/80 text-rose-300 border border-rose-500/30">
                              <XCircle className="w-3 h-3" /> FAILED
                            </span>
                          )}
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-500" />
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Deposits List */}
      {(activeTab === 'all' || activeTab === 'deposits') && (
        <div className="space-y-3 pt-4">
          <div className="flex items-center justify-between text-xs font-bold text-cyan-300 uppercase tracking-wider">
            <span className="flex items-center gap-1.5">
              <Wallet className="w-4 h-4 text-cyan-400" /> Deposit Saldo
            </span>
            <span className="text-slate-400 lowercase font-normal">{userDeposits.length} riwayat</span>
          </div>

          {userDeposits.length === 0 ? (
            <div className="p-6 rounded-2xl bg-slate-900/40 border border-blue-500/15 text-center text-xs text-slate-400">
              Belum ada riwayat deposit.
            </div>
          ) : (
            <div className="space-y-2.5">
              {userDeposits.map((dep) => {
                const isApproved = dep.status === 'APPROVED';
                const isPending = dep.status === 'PENDING';

                return (
                  <div
                    key={dep.id}
                    className="p-4 rounded-2xl bg-gradient-to-b from-[#0c1836] to-[#070e22] border border-blue-500/25 flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-blue-900/50 border border-blue-500/30 flex items-center justify-center text-cyan-300 shrink-0">
                        <Wallet className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-white text-sm">
                            Deposit {dep.method}
                          </span>
                          <span className="text-[10px] text-slate-400">
                            (Pengirim: {dep.senderName})
                          </span>
                        </div>
                        <div className="flex items-center gap-2 mt-0.5 text-slate-400 text-[11px]">
                          <span className="font-mono text-cyan-300/80">ID: {dep.id.slice(0, 8)}...</span>
                          <span>•</span>
                          <span>{formatDate(dep.createdAt)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="font-black text-white text-sm">
                        {formatRupiah(dep.amount)}
                      </div>
                      <div className="mt-0.5">
                        {isApproved && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-950/80 text-emerald-300 border border-emerald-500/30">
                            <CheckCircle2 className="w-3 h-3" /> APPROVED
                          </span>
                        )}
                        {isPending && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-950/80 text-amber-300 border border-amber-500/30">
                            <Clock className="w-3 h-3 animate-pulse" /> PENDING
                          </span>
                        )}
                        {dep.status === 'REJECTED' && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md bg-rose-950/80 text-rose-300 border border-rose-500/30">
                            <XCircle className="w-3 h-3" /> REJECTED
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Order Detail Modal */}
      <AnimatePresence>
        {selectedOrder && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg bg-[#0a1226] border border-blue-500/40 rounded-3xl p-6 shadow-2xl text-slate-200 space-y-4 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between pb-3 border-b border-blue-900/50">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-blue-900/50 border border-blue-500/30 flex items-center justify-center text-cyan-400">
                    <Zap className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-base">Detail Transaksi Order</h3>
                    <p className="text-[11px] font-mono text-cyan-300">ID: {selectedOrder.id}</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="px-3 py-1 rounded-xl text-xs bg-slate-900 border border-blue-500/20 text-slate-400 hover:text-white"
                >
                  Tutup
                </button>
              </div>

              <div className="space-y-2 text-xs bg-slate-950/60 p-4 rounded-2xl border border-blue-500/15">
                <div className="flex justify-between">
                  <span className="text-slate-400">Produk:</span>
                  <span className="font-bold text-white">Alight Motion Premium</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Jumlah Akun:</span>
                  <span className="font-bold text-cyan-300">{selectedOrder.quantity} Akun</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Harga per Akun:</span>
                  <span className="font-medium text-white">{formatRupiah(selectedOrder.pricePerAccount)}</span>
                </div>
                <div className="flex justify-between text-sm pt-2 border-t border-blue-900/30">
                  <span className="font-bold text-white">Total:</span>
                  <span className="font-black text-cyan-400">{formatRupiah(selectedOrder.total)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Status:</span>
                  <span className="font-bold text-cyan-400">{selectedOrder.status}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Tanggal:</span>
                  <span className="text-slate-200">{formatDate(selectedOrder.createdAt)}</span>
                </div>
              </div>

              {/* Account Credentials - Hanya Email & Akses Gmail, tanpa raw API */}
              <div className="space-y-2.5 pt-2">
                <div className="flex items-center justify-between text-xs text-slate-300 font-bold border-b border-blue-900/40 pb-2">
                  <span className="flex items-center gap-1.5 text-cyan-300">
                    <Mail className="w-4 h-4 text-cyan-400" /> Detail Akun & Akses Gmail
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-950 text-cyan-300 border border-blue-500/30">
                    {parseAccountDetails(selectedOrder.apiResponse).length > 0
                      ? `${parseAccountDetails(selectedOrder.apiResponse).length} Akun Siap Pakai`
                      : 'Data Akun'}
                  </span>
                </div>

                {parseAccountDetails(selectedOrder.apiResponse).length > 0 ? (
                  <div className="space-y-3">
                    {parseAccountDetails(selectedOrder.apiResponse).map((acc, idx) => (
                      <AccountCredentialCard
                        key={idx}
                        account={acc}
                        index={idx}
                        onToast={onToast}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="p-4 rounded-2xl bg-slate-950/60 border border-blue-900/40 text-center text-xs text-slate-400 space-y-1">
                    <p className="font-semibold text-slate-300">
                      {selectedOrder.status === 'SUCCESS'
                        ? 'Akun Alight Motion Premium Anda telah aktif.'
                        : 'Menunggu konfirmasi penyedia.'}
                    </p>
                    <p className="text-[11px] text-slate-500">
                      Jika membutuhkan bantuan akses login, hubungi CS WhatsApp kami.
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
