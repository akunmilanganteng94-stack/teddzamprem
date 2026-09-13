import React, { useState } from 'react';
import {
  Clock,
  ShoppingBag,
  Mail,
  Search,
  ShieldCheck,
  User,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useStore } from '../context/StoreContext';
import { formatRupiah, formatDate } from '../lib/utils';
import { extractAccountsFromOrder } from '../lib/accountParser';
import { AccountCredentialCard } from './AccountCredentialCard';
import { OrderRecord } from '../types';

interface HistoryTabProps {
  onOpenAuth: () => void;
  onToast: (msg: string, type: 'success' | 'error' | 'info') => void;
}

export const HistoryTab: React.FC<HistoryTabProps> = ({ onOpenAuth, onToast }) => {
  const { user } = useAuth();
  const { userOrders } = useStore();

  const [searchQuery, setSearchQuery] = useState('');

  // Filter orders by search query
  const filteredOrders = userOrders.filter((order) => {
    const query = searchQuery.toLowerCase();
    const matchesId = order.id.toLowerCase().includes(query);
    const matchesUserEmail = order.userEmail.toLowerCase().includes(query);
    const accounts = extractAccountsFromOrder(order);
    const matchesAccountEmail = accounts.some((acc) =>
      acc.email.toLowerCase().includes(query)
    );
    return matchesId || matchesUserEmail || matchesAccountEmail;
  });

  return (
    <div className="space-y-6 pb-28 md:pb-12 max-w-3xl mx-auto px-4 pt-4">
      {/* Header */}
      <div className="text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-950/70 border border-blue-500/30 text-cyan-300 text-xs font-semibold mb-2 shadow-[0_0_15px_rgba(34,211,238,0.2)]">
          <Clock className="w-3.5 h-3.5 text-cyan-400" />
          <span>Riwayat Pesanan & Akun Terdaftar</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
          Riwayat Pesanan AM
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Lihat semua email akun Alight Motion yang pernah Anda beli dan buka akses Gmail langsung.
        </p>
      </div>

      {/* User not logged in */}
      {!user ? (
        <div className="p-8 rounded-3xl bg-slate-900/60 border border-blue-500/20 text-center space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center mx-auto text-cyan-400">
            <User className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">Login Diperlukan</h3>
            <p className="text-xs text-slate-400 mt-1">
              Silakan login untuk melihat riwayat pesanan dan akun Alight Motion Anda.
            </p>
          </div>
          <button
            onClick={onOpenAuth}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 text-white text-xs font-bold shadow-lg shadow-blue-600/30 cursor-pointer"
          >
            Masuk Sekarang
          </button>
        </div>
      ) : (
        <>
          {/* Search bar */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari ID pesanan atau email akun..."
              className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-slate-900/90 border border-blue-500/25 text-xs text-white placeholder-slate-500 outline-none focus:border-cyan-400 transition-colors"
            />
          </div>

          {/* Orders list */}
          {userOrders.length === 0 ? (
            <div className="p-10 rounded-3xl bg-[#091126]/60 border border-blue-500/15 text-center space-y-3">
              <ShoppingBag className="w-10 h-10 text-slate-600 mx-auto" />
              <div>
                <h4 className="text-sm font-bold text-white">Belum Ada Riwayat Pesanan</h4>
                <p className="text-xs text-slate-400 mt-1">
                  Anda belum pernah melakukan pemesanan akun Alight Motion.
                </p>
              </div>
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="p-8 rounded-2xl bg-slate-900/40 border border-blue-500/15 text-center text-xs text-slate-400">
              Tidak ada pesanan yang sesuai dengan pencarian "{searchQuery}".
            </div>
          ) : (
            <div className="space-y-4">
              {filteredOrders.map((order) => {
                const accounts = extractAccountsFromOrder(order);

                return (
                  <div
                    key={order.id}
                    className="rounded-3xl bg-gradient-to-b from-[#0c1836] via-[#091126] to-[#060a17] border border-blue-500/30 overflow-hidden shadow-lg shadow-blue-950/20"
                  >
                    {/* Card Header (langsung tampilkan detail, tanpa fitur ke bawah / accordion) */}
                    <div className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-blue-900/40">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-cyan-300">
                            #{order.id.slice(0, 12)}...
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded-md text-[10px] font-extrabold ${
                              order.status === 'SUCCESS'
                                ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/30'
                                : order.status === 'PROCESSING'
                                ? 'bg-amber-950 text-amber-300 border border-amber-500/30'
                                : 'bg-rose-950 text-rose-300 border border-rose-500/30'
                            }`}
                          >
                            {order.status}
                          </span>
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-blue-950 text-blue-200 border border-blue-500/30">
                            {order.quantity} Akun AM
                          </span>
                        </div>

                        {/* User Email & Timestamp */}
                        <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-400">
                          <span className="flex items-center gap-1">
                            <Mail className="w-3.5 h-3.5 text-slate-500" />
                            <span>Email Akun Pembeli: <strong className="text-slate-200">{order.userEmail}</strong></span>
                          </span>
                          <span>•</span>
                          <span>{formatDate(order.createdAt)}</span>
                        </div>
                      </div>

                      {/* Right Total */}
                      <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-blue-900/30">
                        <div className="text-left sm:text-right">
                          <span className="text-[10px] text-slate-400 block leading-tight">Total Biaya</span>
                          <span className="text-base font-extrabold text-cyan-300">
                            {formatRupiah(order.total)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Direct Details Body (Tampil Langsung, Tanpa Fitur Ke Bawah) */}
                    <div className="p-4 sm:p-5 space-y-4 bg-[#070d1e]/50">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-slate-200">
                        <ShieldCheck className="w-4 h-4 text-cyan-400" />
                        <span>Rincian Akun Alight Motion & Akses Gmail:</span>
                      </div>

                      {/* List of accounts showing Gmail & access_link with copy feature */}
                      {accounts.length > 0 ? (
                        <div className="space-y-3">
                          {accounts.map((acc, idx) => (
                            <AccountCredentialCard
                              key={acc.id || idx}
                              account={acc}
                              index={idx}
                              onToast={onToast}
                            />
                          ))}
                        </div>
                      ) : (
                        <div className="p-4 rounded-xl bg-slate-900 border border-blue-500/20 text-xs text-slate-400 space-y-2">
                          <p>Data akun tersimpan dalam respon server:</p>
                          <pre className="font-mono text-[11px] text-cyan-300 overflow-x-auto p-2 bg-black/40 rounded-lg">
                            {typeof order.apiResponse === 'string'
                              ? order.apiResponse
                              : JSON.stringify(order.apiResponse, null, 2)}
                          </pre>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
};
