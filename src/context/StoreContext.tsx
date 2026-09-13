import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  collection,
  doc,
  onSnapshot,
  setDoc,
  updateDoc,
  addDoc,
  query,
  where,
  orderBy,
  runTransaction,
  getDocs,
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from './AuthContext';
import {
  StoreSettings,
  DepositRecord,
  OrderRecord,
  TransactionRecord,
  PaymentMethod,
  AuditLogRecord,
} from '../types';
import { parseAccountDetails } from '../lib/accountParser';

interface StoreContextType {
  settings: StoreSettings;
  loadingSettings: boolean;
  userDeposits: DepositRecord[];
  allDeposits: DepositRecord[];
  userOrders: OrderRecord[];
  allOrders: OrderRecord[];
  userTransactions: TransactionRecord[];
  auditLogs: AuditLogRecord[];
  submitDeposit: (amount: number, senderName: string, method: PaymentMethod) => Promise<string>;
  confirmDeposit: (deposit: DepositRecord) => Promise<void>;
  rejectDeposit: (deposit: DepositRecord, reason?: string) => Promise<void>;
  placeOrderAm: (quantity: number) => Promise<{ success: boolean; message: string; orderId?: string; data?: any }>;
  updateStoreSettings: (newSettings: Partial<StoreSettings>) => Promise<void>;
  adminAdjustUserBalance: (targetUserId: string, targetUserEmail: string, type: 'ADD' | 'DEDUCT' | 'SET', amount: number, reason: string) => Promise<void>;
  adminToggleUserStatus: (targetUserId: string, currentStatus: 'active' | 'suspended') => Promise<void>;
  adminPromoteUser: (targetUserId: string, newRole: 'user' | 'admin') => Promise<void>;
}

const defaultSettings: StoreSettings = {
  storeName: 'TEDDZ AMPREM',
  pricePerAccount: 500,
  storeOpen: true,
  danaNumber: '',
  whatsapp: '6283150921412',
  qrisUrl: 'https://cdn.phototourl.com/free/2026-09-13-75d33bf7-921e-40be-8652-2fe713cf94ef.jpg',
  minDeposit: 1000,
};

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, userProfile, isAdmin } = useAuth();
  const [settings, setSettings] = useState<StoreSettings>(defaultSettings);
  const [loadingSettings, setLoadingSettings] = useState(true);

  const [userDeposits, setUserDeposits] = useState<DepositRecord[]>([]);
  const [allDeposits, setAllDeposits] = useState<DepositRecord[]>([]);

  const [userOrders, setUserOrders] = useState<OrderRecord[]>([]);
  const [allOrders, setAllOrders] = useState<OrderRecord[]>([]);

  const [userTransactions, setUserTransactions] = useState<TransactionRecord[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLogRecord[]>([]);

  // 1. Listen to Store Settings from Firestore
  useEffect(() => {
    const settingsDocRef = doc(db, 'settings', 'store');
    const unsubscribe = onSnapshot(
      settingsDocRef,
      (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.data() as Partial<StoreSettings>;
          const sanitizedName =
            data.storeName &&
            !data.storeName.includes('TEDDZA') &&
            !data.storeName.includes('TEDZZ')
              ? data.storeName
              : 'TEDDZ AMPREM';
          setSettings({
            ...defaultSettings,
            ...data,
            storeName: sanitizedName,
          });
        } else {
          // Initialize if document does not exist
          setDoc(settingsDocRef, defaultSettings, { merge: true }).catch(() => {});
        }
        setLoadingSettings(false);
      },
      (error) => {
        console.warn("Using fallback settings due to snapshot notice:", error);
        setLoadingSettings(false);
      }
    );

    return () => unsubscribe();
  }, []);

  // 2. Listen to User Orders & Admin All Orders
  useEffect(() => {
    if (!user) {
      setUserOrders([]);
      setAllOrders([]);
      return;
    }

    // User's orders
    const userOrdersQuery = query(
      collection(db, 'orders'),
      where('userId', '==', user.uid)
    );

    const unsubUserOrders = onSnapshot(
      userOrdersQuery,
      (snapshot) => {
        const list = snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as OrderRecord));
        list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        setUserOrders(list);
      },
      (err) => console.error("Error fetching user orders:", err)
    );

    // Admin: all orders
    let unsubAllOrders: (() => void) | null = null;
    if (isAdmin) {
      const allOrdersCol = collection(db, 'orders');
      unsubAllOrders = onSnapshot(
        allOrdersCol,
        (snapshot) => {
          const list = snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as OrderRecord));
          list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
          setAllOrders(list);
        },
        (err) => console.error("Error fetching all orders:", err)
      );
    }

    return () => {
      unsubUserOrders();
      if (unsubAllOrders) unsubAllOrders();
    };
  }, [user, isAdmin]);

  // 3. Listen to User Deposits & Admin All Deposits
  useEffect(() => {
    if (!user) {
      setUserDeposits([]);
      setAllDeposits([]);
      return;
    }

    const userDepositsQuery = query(
      collection(db, 'deposits'),
      where('userId', '==', user.uid)
    );

    const unsubUserDeposits = onSnapshot(
      userDepositsQuery,
      (snapshot) => {
        const list = snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as DepositRecord));
        list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        setUserDeposits(list);
      },
      (err) => console.error("Error fetching user deposits:", err)
    );

    let unsubAllDeposits: (() => void) | null = null;
    if (isAdmin) {
      const allDepositsCol = collection(db, 'deposits');
      unsubAllDeposits = onSnapshot(
        allDepositsCol,
        (snapshot) => {
          const list = snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as DepositRecord));
          list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
          setAllDeposits(list);
        },
        (err) => console.error("Error fetching all deposits:", err)
      );
    }

    return () => {
      unsubUserDeposits();
      if (unsubAllDeposits) unsubAllDeposits();
    };
  }, [user, isAdmin]);

  // 4. Listen to User Transactions
  useEffect(() => {
    if (!user) {
      setUserTransactions([]);
      return;
    }

    const transQuery = query(
      collection(db, 'transactions'),
      where('userId', '==', user.uid)
    );

    const unsubTransactions = onSnapshot(
      transQuery,
      (snapshot) => {
        const list = snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as TransactionRecord));
        list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        setUserTransactions(list);
      },
      (err) => console.error("Error fetching user transactions:", err)
    );

    return () => unsubTransactions();
  }, [user]);

  // 5. Listen to Admin Audit Logs
  useEffect(() => {
    if (!isAdmin) {
      setAuditLogs([]);
      return;
    }

    const auditCol = collection(db, 'auditLogs');
    const unsubAudit = onSnapshot(
      auditCol,
      (snapshot) => {
        const list = snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as AuditLogRecord));
        list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        setAuditLogs(list);
      },
      (err) => console.error("Error fetching audit logs:", err)
    );

    return () => unsubAudit();
  }, [isAdmin]);

  // Submit a new deposit
  const submitDeposit = async (amount: number, senderName: string, method: PaymentMethod): Promise<string> => {
    if (!user) throw new Error('Harap login terlebih dahulu');
    if (amount < (settings.minDeposit || 1000)) {
      throw new Error(`Minimal deposit adalah Rp${settings.minDeposit || 1000}`);
    }
    if (!senderName.trim()) {
      throw new Error('Nama pengirim wajib diisi');
    }

    const newDeposit: Omit<DepositRecord, 'id'> = {
      userId: user.uid,
      userEmail: user.email || '',
      userName: userProfile?.name || user.displayName || 'User',
      amount,
      senderName: senderName.trim(),
      method,
      status: 'PENDING',
      createdAt: new Date().toISOString(),
    };

    const docRef = await addDoc(collection(db, 'deposits'), newDeposit);
    return docRef.id;
  };

  // Confirm / Approve deposit (Admin only)
  const confirmDeposit = async (deposit: DepositRecord) => {
    if (!isAdmin || !user) throw new Error('Hanya admin yang dapat menyetujui deposit');
    if (deposit.status !== 'PENDING') throw new Error('Deposit ini sudah diproses sebelumnya');

    // Atomic transaction to update deposit status, increase user balance, and record transaction
    await runTransaction(db, async (txn) => {
      const depositRef = doc(db, 'deposits', deposit.id);
      const userRef = doc(db, 'users', deposit.userId);

      const userSnap = await txn.get(userRef);
      if (!userSnap.exists()) {
        throw new Error('User penerima deposit tidak ditemukan');
      }

      const currentBalance = Number(userSnap.data().balance) || 0;
      const newBalance = currentBalance + deposit.amount;

      // Update deposit
      txn.update(depositRef, {
        status: 'APPROVED',
        processedAt: new Date().toISOString(),
        processedBy: user.email || user.uid,
      });

      // Update user balance
      txn.update(userRef, {
        balance: newBalance,
      });

      // Add transaction ledger record
      const transDocRef = doc(collection(db, 'transactions'));
      txn.set(transDocRef, {
        userId: deposit.userId,
        type: 'DEPOSIT',
        amount: deposit.amount,
        balanceBefore: currentBalance,
        balanceAfter: newBalance,
        referenceId: deposit.id,
        description: `Deposit ${deposit.method} sebesar ${deposit.amount} berhasil disetujui`,
        createdAt: new Date().toISOString(),
      });
    });
  };

  // Reject deposit (Admin only)
  const rejectDeposit = async (deposit: DepositRecord, reason?: string) => {
    if (!isAdmin || !user) throw new Error('Hanya admin yang dapat menolak deposit');
    if (deposit.status !== 'PENDING') throw new Error('Deposit ini sudah diproses sebelumnya');

    await updateDoc(doc(db, 'deposits', deposit.id), {
      status: 'REJECTED',
      processedAt: new Date().toISOString(),
      processedBy: user.email || user.uid,
      note: reason || 'Ditolak oleh admin',
    });
  };

  // Place Order AM (1 - 5 accounts)
  const placeOrderAm = async (quantity: number): Promise<{ success: boolean; message: string; orderId?: string; data?: any }> => {
    if (!user) throw new Error('Harap login terlebih dahulu untuk melakukan order.');
    if (!settings.storeOpen) {
      throw new Error('MAAF, TOKO SEDANG DITUTUP. Silakan coba kembali nanti.');
    }
    if (quantity < 1 || quantity > 5) {
      throw new Error('Jumlah akun harus antara 1 sampai 5 akun.');
    }

    const pricePerAccount = settings.pricePerAccount || 500;
    const total = quantity * pricePerAccount;

    // Fetch freshest balance from Firestore
    const userRef = doc(db, 'users', user.uid);
    const userSnap = await getDocs(query(collection(db, 'users'), where('uid', '==', user.uid)));
    
    // Incase doc was accessed by id
    let currentBalance = userProfile?.balance || 0;
    try {
      const directSnap = await runTransaction(db, async (t) => {
        const uDoc = await t.get(userRef);
        return uDoc.exists() ? (uDoc.data().balance as number) : currentBalance;
      });
      currentBalance = directSnap;
    } catch {
      // use userProfile balance
    }

    if (currentBalance < total) {
      throw new Error('Saldo tidak mencukupi. Silakan isi saldo terlebih dahulu.');
    }

    // Call server-side API `/api/order-am` first
    let apiResult: any = null;
    try {
      const response = await fetch('/api/order-am', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ total: quantity }),
      });

      const responseJson = await response.json();
      if (!response.ok || !responseJson.success) {
        throw new Error(responseJson.message || 'Server penyedia AM gagal memproses pesanan.');
      }
      apiResult = responseJson;
    } catch (apiErr: any) {
      throw new Error(apiErr.message || 'Gagal menghubungi server AM. Saldo Anda tidak dipotong.');
    }

    // Now safely deduct balance and write records atomically
    let createdOrderId = '';
    await runTransaction(db, async (txn) => {
      const uDoc = await txn.get(userRef);
      const balanceNow = uDoc.exists() ? Number(uDoc.data().balance) || 0 : currentBalance;

      if (balanceNow < total) {
        throw new Error('Saldo tidak mencukupi saat proses finalisasi.');
      }

      const balanceAfter = balanceNow - total;
      txn.update(userRef, { balance: balanceAfter });

      // Create Order doc
      const orderDocRef = doc(collection(db, 'orders'));
      createdOrderId = orderDocRef.id;

      // Extract accounts if present in API response
      const accountsReceived: string[] = [];
      const parsed = parseAccountDetails(apiResult?.data || apiResult);
      if (parsed.length > 0) {
        accountsReceived.push(...parsed.map((p) => `${p.email} | ${p.accessGmail}`));
      }

      txn.set(orderDocRef, {
        userId: user.uid,
        userEmail: user.email || '',
        userName: userProfile?.name || 'User',
        quantity,
        pricePerAccount,
        total,
        status: 'SUCCESS',
        apiResponse: apiResult?.data || apiResult,
        accounts: accountsReceived,
        createdAt: new Date().toISOString(),
      });

      // Create Transaction doc
      const transDocRef = doc(collection(db, 'transactions'));
      txn.set(transDocRef, {
        userId: user.uid,
        type: 'ORDER',
        amount: total,
        balanceBefore: balanceNow,
        balanceAfter,
        referenceId: createdOrderId,
        description: `Order AM Premium (${quantity} Akun)`,
        createdAt: new Date().toISOString(),
      });
    });

    return {
      success: true,
      message: `Order ${quantity} Akun Alight Motion Premium Berhasil!`,
      orderId: createdOrderId,
      data: apiResult?.data,
    };
  };

  // Update Store Settings (Admin only)
  const updateStoreSettings = async (newSettings: Partial<StoreSettings>) => {
    if (!isAdmin) throw new Error('Hanya admin yang dapat mengubah pengaturan toko');
    const settingsDocRef = doc(db, 'settings', 'store');
    await setDoc(settingsDocRef, newSettings, { merge: true });
    setSettings((prev) => ({ ...prev, ...newSettings }));
  };

  // Admin adjust user balance
  const adminAdjustUserBalance = async (
    targetUserId: string,
    targetUserEmail: string,
    type: 'ADD' | 'DEDUCT' | 'SET',
    amount: number,
    reason: string
  ) => {
    if (!isAdmin || !user) throw new Error('Hanya admin yang memiliki wewenang');
    if (amount < 0) throw new Error('Nominal tidak boleh negatif');

    await runTransaction(db, async (txn) => {
      const targetUserRef = doc(db, 'users', targetUserId);
      const targetSnap = await txn.get(targetUserRef);

      if (!targetSnap.exists()) {
        throw new Error('User tidak ditemukan');
      }

      const oldBalance = Number(targetSnap.data().balance) || 0;
      let newBalance = oldBalance;

      if (type === 'ADD') {
        newBalance = oldBalance + amount;
      } else if (type === 'DEDUCT') {
        if (oldBalance < amount) throw new Error('Saldo user tidak mencukupi untuk dikurangi');
        newBalance = oldBalance - amount;
      } else if (type === 'SET') {
        newBalance = amount;
      }

      txn.update(targetUserRef, { balance: newBalance });

      // Record transaction
      const transDocRef = doc(collection(db, 'transactions'));
      txn.set(transDocRef, {
        userId: targetUserId,
        type: 'ADMIN_ADJUST',
        amount,
        balanceBefore: oldBalance,
        balanceAfter: newBalance,
        description: `Penyesuaian saldo oleh admin: ${type} (Alasan: ${reason || '-'})`,
        createdAt: new Date().toISOString(),
      });

      // Record audit log
      const auditDocRef = doc(collection(db, 'auditLogs'));
      txn.set(auditDocRef, {
        adminId: user.uid,
        adminEmail: user.email || 'Admin',
        action: `BALANCE_${type}`,
        targetUserId,
        targetUserEmail,
        amount,
        type,
        reason: reason || 'Penyesuaian manual oleh admin',
        createdAt: new Date().toISOString(),
      });
    });
  };

  // Admin toggle user status
  const adminToggleUserStatus = async (targetUserId: string, currentStatus: 'active' | 'suspended') => {
    if (!isAdmin) throw new Error('Hanya admin yang memiliki wewenang');
    const newStatus = currentStatus === 'active' ? 'suspended' : 'active';
    await updateDoc(doc(db, 'users', targetUserId), { status: newStatus });
  };

  // Admin promote user
  const adminPromoteUser = async (targetUserId: string, newRole: 'user' | 'admin') => {
    if (!isAdmin) throw new Error('Hanya admin yang memiliki wewenang');
    await updateDoc(doc(db, 'users', targetUserId), { role: newRole });
  };

  return (
    <StoreContext.Provider
      value={{
        settings,
        loadingSettings,
        userDeposits,
        allDeposits,
        userOrders,
        allOrders,
        userTransactions,
        auditLogs,
        submitDeposit,
        confirmDeposit,
        rejectDeposit,
        placeOrderAm,
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
