import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  collection,
  doc,
  setDoc,
  updateDoc,
  getDoc,
  getDocs,
  onSnapshot,
  query,
  where,
  orderBy,
  runTransaction,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from './AuthContext';
import { extractAccountsFromOrder } from '../lib/accountParser';
import {
  DepositRecord,
  OrderRecord,
  StoreSettings,
  TransactionRecord,
  AuditLogRecord,
  PaymentMethod,
} from '../types';

interface StoreContextType {
  settings: StoreSettings;
  loadingSettings: boolean;
  userDeposits: DepositRecord[];
  userOrders: OrderRecord[];
  allDeposits: DepositRecord[];
  allOrders: OrderRecord[];
  auditLogs: AuditLogRecord[];
  submitDeposit: (amount: number, senderName: string, method: PaymentMethod) => Promise<string>;
  submitOrderAM: (quantity: number) => Promise<OrderRecord>;
  confirmDeposit: (deposit: DepositRecord) => Promise<void>;
  rejectDeposit: (deposit: DepositRecord, reason?: string) => Promise<void>;
  updateStoreSettings: (newSettings: Partial<StoreSettings>) => Promise<void>;
  adminAdjustUserBalance: (
    targetUserId: string,
    targetUserEmail: string,
    type: 'ADD' | 'DEDUCT' | 'SET',
    amount: number,
    reason: string
  ) => Promise<void>;
  adminToggleUserStatus: (targetUserId: string, currentStatus: string) => Promise<void>;
  adminPromoteUser: (targetUserId: string, newRole: 'user' | 'admin') => Promise<void>;
}

const defaultSettings: StoreSettings = {
  storeName: 'TEDDZ AMPREM',
  pricePerAccount: 500,
  storeOpen: true,
  danaNumber: '0831-5092-1412',
  danaName: 'TEDDY TRI PRATAMA',
  whatsapp: '6283150921412',
  qrisUrl: 'https://cdn.phototourl.com/free/2026-09-13-75d33bf7-921e-40be-8652-2fe713cf94ef.jpg',
  minDeposit: 1000,
};

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, userProfile, isAdmin, updateUserBalanceLocally } = useAuth();

  const [settings, setSettings] = useState<StoreSettings>(defaultSettings);
  const [loadingSettings, setLoadingSettings] = useState(true);

  const [userDeposits, setUserDeposits] = useState<DepositRecord[]>([]);
  const [userOrders, setUserOrders] = useState<OrderRecord[]>([]);

  // Admin state
  const [allDeposits, setAllDeposits] = useState<DepositRecord[]>([]);
  const [allOrders, setAllOrders] = useState<OrderRecord[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLogRecord[]>([]);

  // 1. Listen to Global Settings doc
  useEffect(() => {
    const settingsRef = doc(db, 'settings', 'global');
    const unsubscribe = onSnapshot(
      settingsRef,
      async (snap) => {
        if (snap.exists()) {
          const data = snap.data() as Partial<StoreSettings>;
          setSettings({
            ...defaultSettings,
            ...data,
            // Ensure danaNumber and danaName are populated
            danaNumber: data.danaNumber || defaultSettings.danaNumber,
            danaName: data.danaName || defaultSettings.danaName,
          });
        } else {
          // Initialize default in Firestore
          try {
            await setDoc(settingsRef, defaultSettings);
          } catch {
            // ignore if not admin
          }
          setSettings(defaultSettings);
        }
        setLoadingSettings(false);
      },
      (err) => {
        console.warn('Settings subscription fallback:', err);
        setSettings(defaultSettings);
        setLoadingSettings(false);
      }
    );

    return () => unsubscribe();
  }, []);

  // 2. Listen to User Deposits
  useEffect(() => {
    if (!user) {
      setUserDeposits([]);
      return;
    }

    const q = query(
      collection(db, 'deposits'),
      where('userId', '==', user.uid)
    );

    const unsub = onSnapshot(
      q,
      (snap) => {
        const list: DepositRecord[] = [];
        snap.forEach((d) => list.push({ id: d.id, ...d.data() } as DepositRecord));
        // Client-side sort by date descending
        list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        setUserDeposits(list);
      },
      (err) => {
        console.error('User deposits error:', err);
      }
    );

    return () => unsub();
  }, [user]);

  // 3. Listen to User Orders
  useEffect(() => {
    if (!user) {
      setUserOrders([]);
      return;
    }

    const q = query(
      collection(db, 'orders'),
      where('userId', '==', user.uid)
    );

    const unsub = onSnapshot(
      q,
      (snap) => {
        const list: OrderRecord[] = [];
        snap.forEach((d) => {
          const ord = { id: d.id, ...d.data() } as OrderRecord;
          // Ensure parsedAccounts is available
          if (!ord.parsedAccounts || ord.parsedAccounts.length === 0) {
            ord.parsedAccounts = extractAccountsFromOrder(ord);
          }
          list.push(ord);
        });
        list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        setUserOrders(list);
      },
      (err) => {
        console.error('User orders error:', err);
      }
    );

    return () => unsub();
  }, [user]);

  // 4. Admin Subscriptions
  useEffect(() => {
    if (!isAdmin) {
      setAllDeposits([]);
      setAllOrders([]);
      setAuditLogs([]);
      return;
    }

    // All deposits
    const unsubDep = onSnapshot(
      collection(db, 'deposits'),
      (snap) => {
        const list: DepositRecord[] = [];
        snap.forEach((d) => list.push({ id: d.id, ...d.data() } as DepositRecord));
        list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        setAllDeposits(list);
      },
      (err) => console.error('Admin allDeposits error:', err)
    );

    // All orders
    const unsubOrd = onSnapshot(
      collection(db, 'orders'),
      (snap) => {
        const list: OrderRecord[] = [];
        snap.forEach((d) => {
          const ord = { id: d.id, ...d.data() } as OrderRecord;
          if (!ord.parsedAccounts || ord.parsedAccounts.length === 0) {
            ord.parsedAccounts = extractAccountsFromOrder(ord);
          }
          list.push(ord);
        });
        list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        setAllOrders(list);
      },
      (err) => console.error('Admin allOrders error:', err)
    );

    // Audit logs
    const unsubLog = onSnapshot(
      collection(db, 'auditLogs'),
      (snap) => {
        const list: AuditLogRecord[] = [];
        snap.forEach((d) => list.push({ id: d.id, ...d.data() } as AuditLogRecord));
        list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        setAuditLogs(list);
      },
      (err) => console.error('Admin auditLogs error:', err)
    );

    return () => {
      unsubDep();
      unsubOrd();
      unsubLog();
    };
  }, [isAdmin]);

  // Submit a deposit request
  const submitDeposit = async (amount: number, senderName: string, method: PaymentMethod): Promise<string> => {
    if (!user) throw new Error('Harap login terlebih dahulu');
    const depositId = `dep-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const newDeposit: DepositRecord = {
      id: depositId,
      userId: user.uid,
      userEmail: user.email || '',
      userName: userProfile?.name || user.displayName || 'User',
      amount,
      senderName,
      method,
      status: 'PENDING',
      createdAt: new Date().toISOString(),
    };

    await setDoc(doc(db, 'deposits', depositId), newDeposit);
    return depositId;
  };

  // Submit an AM account order
  const submitOrderAM = async (quantity: number): Promise<OrderRecord> => {
    if (!user || !userProfile) throw new Error('Harap login terlebih dahulu');
    if (!settings.storeOpen) throw new Error('Toko sedang tutup. Harap coba lagi nanti.');

    const price = settings.pricePerAccount || 500;
    const totalCost = quantity * price;

    if (userProfile.balance < totalCost) {
      throw new Error(
        `Saldo Anda tidak mencukupi! Diperlukan Rp${totalCost.toLocaleString(
          'id-ID'
        )}, saldo Anda saat ini Rp${userProfile.balance.toLocaleString('id-ID')}.`
      );
    }

    // Call server proxy for Alight Motion bulk API:
    // curl -X POST "https://am.dapjisync.my.id/api/bulk" -H "Content-Type: application/json" -H "X-API-Key: FREE" -d '{"total": 5}'
    const response = await fetch('/api/order-am', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ total: quantity }),
    });

    const result = await response.json();

    if (!response.ok || !result.success) {
      const errMsg = result.message || 'Gagal memproses pesanan ke server Alight Motion';
      throw new Error(errMsg);
    }

    const orderId = `ord-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const parsedAccounts = extractAccountsFromOrder({ apiResponse: result.data });

    const orderData: OrderRecord = {
      id: orderId,
      userId: user.uid,
      userEmail: user.email || '',
      userName: userProfile.name || user.displayName || 'User',
      quantity,
      pricePerAccount: price,
      total: totalCost,
      status: 'SUCCESS',
      apiResponse: result.data,
      parsedAccounts,
      createdAt: new Date().toISOString(),
    };

    // Atomic transaction: deduct balance and save order + ledger
    const userRef = doc(db, 'users', user.uid);
    const orderRef = doc(db, 'orders', orderId);
    const txRef = doc(db, 'transactions', `tx-${orderId}`);

    await runTransaction(db, async (transaction) => {
      const uDoc = await transaction.get(userRef);
      if (!uDoc.exists()) throw new Error('Profil user tidak ditemukan');
      const curBal = Number(uDoc.data().balance || 0);
      if (curBal < totalCost) {
        throw new Error('Saldo tidak mencukupi');
      }

      const nextBal = curBal - totalCost;
      transaction.update(userRef, { balance: nextBal });
      transaction.set(orderRef, orderData);

      const txRecord: TransactionRecord = {
        id: `tx-${orderId}`,
        userId: user.uid,
        type: 'ORDER',
        amount: totalCost,
        balanceBefore: curBal,
        balanceAfter: nextBal,
        referenceId: orderId,
        description: `Order ${quantity} Akun AM Premium`,
        createdAt: new Date().toISOString(),
      };
      transaction.set(txRef, txRecord);
    });

    // Update locally for quick UI reflection
    updateUserBalanceLocally(userProfile.balance - totalCost);

    return orderData;
  };

  // Admin confirm deposit
  const confirmDeposit = async (deposit: DepositRecord) => {
    if (!isAdmin || !user) throw new Error('Akses khusus admin');

    const depositRef = doc(db, 'deposits', deposit.id);
    const userRef = doc(db, 'users', deposit.userId);
    const txRef = doc(db, 'transactions', `tx-${deposit.id}`);

    await runTransaction(db, async (transaction) => {
      const depDoc = await transaction.get(depositRef);
      if (!depDoc.exists()) throw new Error('Data deposit tidak ditemukan');
      if (depDoc.data().status === 'APPROVED') throw new Error('Deposit ini sudah disetujui sebelumnya');

      const uDoc = await transaction.get(userRef);
      const curBal = uDoc.exists() ? Number(uDoc.data().balance || 0) : 0;
      const nextBal = curBal + deposit.amount;

      transaction.update(depositRef, {
        status: 'APPROVED',
        processedAt: new Date().toISOString(),
        processedBy: user.email || 'admin',
      });

      if (uDoc.exists()) {
        transaction.update(userRef, { balance: nextBal });
      }

      const txRecord: TransactionRecord = {
        id: `tx-${deposit.id}`,
        userId: deposit.userId,
        type: 'DEPOSIT',
        amount: deposit.amount,
        balanceBefore: curBal,
        balanceAfter: nextBal,
        referenceId: deposit.id,
        description: `Deposit via ${deposit.method} (${deposit.senderName})`,
        createdAt: new Date().toISOString(),
      };
      transaction.set(txRef, txRecord);
    });
  };

  // Admin reject deposit
  const rejectDeposit = async (deposit: DepositRecord, reason?: string) => {
    if (!isAdmin || !user) throw new Error('Akses khusus admin');

    const depositRef = doc(db, 'deposits', deposit.id);
    await updateDoc(depositRef, {
      status: 'REJECTED',
      note: reason || 'Ditolak oleh admin',
      processedAt: new Date().toISOString(),
      processedBy: user.email || 'admin',
    });
  };

  // Admin update store settings
  const updateStoreSettings = async (newSettings: Partial<StoreSettings>) => {
    if (!isAdmin) throw new Error('Akses khusus admin');
    const settingsRef = doc(db, 'settings', 'global');
    await setDoc(settingsRef, newSettings, { merge: true });
  };

  // Admin adjust user balance
  const adminAdjustUserBalance = async (
    targetUserId: string,
    targetUserEmail: string,
    type: 'ADD' | 'DEDUCT' | 'SET',
    amount: number,
    reason: string
  ) => {
    if (!isAdmin || !user) throw new Error('Akses khusus admin');

    const userRef = doc(db, 'users', targetUserId);
    const logRef = doc(db, 'auditLogs', `log-${Date.now()}`);

    await runTransaction(db, async (transaction) => {
      const uDoc = await transaction.get(userRef);
      if (!uDoc.exists()) throw new Error('User tidak ditemukan');
      const curBal = Number(uDoc.data().balance || 0);
      let nextBal = curBal;

      if (type === 'ADD') {
        nextBal = curBal + amount;
      } else if (type === 'DEDUCT') {
        nextBal = Math.max(0, curBal - amount);
      } else if (type === 'SET') {
        nextBal = amount;
      }

      transaction.update(userRef, { balance: nextBal });

      const auditLog: AuditLogRecord = {
        id: logRef.id,
        adminId: user.uid,
        adminEmail: user.email || '',
        action: `Ubah Saldo (${type})`,
        targetUserId,
        targetUserEmail,
        amount,
        type,
        reason,
        createdAt: new Date().toISOString(),
      };
      transaction.set(logRef, auditLog);

      const txRef = doc(db, 'transactions', `tx-${logRef.id}`);
      const txRecord: TransactionRecord = {
        id: `tx-${logRef.id}`,
        userId: targetUserId,
        type: 'ADMIN_ADJUST',
        amount: Math.abs(nextBal - curBal),
        balanceBefore: curBal,
        balanceAfter: nextBal,
        referenceId: logRef.id,
        description: `Penyesuaian Admin: ${reason}`,
        createdAt: new Date().toISOString(),
      };
      transaction.set(txRef, txRecord);
    });
  };

  // Admin toggle user suspend status
  const adminToggleUserStatus = async (targetUserId: string, currentStatus: string) => {
    if (!isAdmin) throw new Error('Akses khusus admin');
    const userRef = doc(db, 'users', targetUserId);
    const newStatus = currentStatus === 'suspended' ? 'active' : 'suspended';
    await updateDoc(userRef, { status: newStatus });
  };

  // Admin promote user
  const adminPromoteUser = async (targetUserId: string, newRole: 'user' | 'admin') => {
    if (!isAdmin) throw new Error('Akses khusus admin');
    const userRef = doc(db, 'users', targetUserId);
    await updateDoc(userRef, { role: newRole });
  };

  return (
    <StoreContext.Provider
      value={{
        settings,
        loadingSettings,
        userDeposits,
        userOrders,
        allDeposits,
        allOrders,
        auditLogs,
        submitDeposit,
        submitOrderAM,
        confirmDeposit,
        rejectDeposit,
        updateStoreSettings,
        adminAdjustUserBalance,
        adminToggleUserStatus,
        adminPromoteUser,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) throw new Error('useStore must be used within a StoreProvider');
  return context;
};
