
export interface Transaction {
  id: string;
  type: 'payment' | 'transfer' | 'credit';
  amount: number;
  date: string;
  status: 'completed' | 'pending' | 'failed';
  description: string;
  category: string;
}

export interface Bill {
  id: string;
  name: string;
  amount: number;
  paid: number;
  dueDate: string;
  status: 'pending' | 'partial' | 'paid';
  type: 'card' | 'loan';
  remarks?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  balance: number;
  creditLimit: number;
  creditUsed: number;
  avatar: string;
  role: 'user' | 'admin';
}

export interface DashboardStats {
  totalBalance: number;
  totalSpent: number;
  upcomingBills: number;
  creditScore: number;
}

export interface Liability {
  id: string;
  name: string;
  amount: number;
  paid: number;
  date: string;
  remarks: string;
  status: 'active' | 'warning' | 'cleared';
}

export interface LiabilityTransaction {
  id: string;
  liabilityId: string;
  name: string;
  amount: number;
  date: string;
  type: 'borrow' | 'payment';
  remarks: string;
}

export interface DailyTransition {
  id: string;
  type: 'income' | 'expense';
  amount: number;
  description: string;
  date: string;
  category: string;
}

export type ActivityType = 'income' | 'expense' | 'borrow' | 'payment' | 'bill_payment' | 'bill_add';

export interface UnifiedActivity {
  id: string;
  type: ActivityType;
  amount: number;
  name: string;
  date: string;
  remarks: string;
  category?: string;
}
