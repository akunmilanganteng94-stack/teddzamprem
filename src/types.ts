export type UserRole = 'user' | 'admin';
export type UserStatus = 'active' | 'suspended';

export interface UserProfile {
  uid: string;
  name: string;
  email: string;
  balance: number;
  role: UserRole;
  status: UserStatus;
  createdAt: string;
}

export type DepositStatus = 'PENDING' | 'APPROVED' | 'REJECTED';
export type PaymentMethod = 'QRIS' | 'DANA';

export interface DepositRecord {
  id: string;
  userId: string;
  userEmail: string;
  userName: string;
  amount: number;
  senderName: string;
  method: PaymentMethod;
  status: DepositStatus;
  createdAt: string;
  processedAt?: string;
  processedBy?: string;
  note?: string;
}

export type OrderStatus = 'PROCESSING' | 'SUCCESS' | 'FAILED';

export interface OrderRecord {
  id: string;
  userId: string;
  userEmail: string;
  userName?: string;
  quantity: number;
  pricePerAccount: number;
  total: number;
  status: OrderStatus;
  apiResponse?: any;
  accounts?: string[];
  createdAt: string;
}

export type TransactionType = 'DEPOSIT' | 'ORDER' | 'ADMIN_ADJUST';

export interface TransactionRecord {
  id: string;
  userId: string;
  type: TransactionType;
  amount: number;
  balanceBefore: number;
  balanceAfter: number;
  referenceId?: string;
  description: string;
  createdAt: string;
}

export interface StoreSettings {
  storeName: string;
  pricePerAccount: number;
  storeOpen: boolean;
  danaNumber: string;
  whatsapp: string;
  qrisUrl: string;
  minDeposit: number;
}

export interface AuditLogRecord {
  id: string;
  adminId: string;
  adminEmail: string;
  action: string;
  targetUserId: string;
  targetUserEmail?: string;
  amount?: number;
  type: 'ADD' | 'DEDUCT' | 'SET';
  reason: string;
  createdAt: string;
}
