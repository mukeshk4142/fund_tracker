
import { Transaction, Bill, User } from './types';

export const currentUser: User = {
  id: 'u1',
  name: 'Alex Johnson',
  email: 'alex.j@example.com',
  balance: 12450.75,
  creditLimit: 25000,
  creditUsed: 5420.30,
  avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
  role: 'admin'
};

export const transactions: Transaction[] = [
  { id: 't1', type: 'payment', amount: 120.50, date: '2023-10-24', status: 'completed', description: 'Starbucks Coffee', category: 'Food' },
  { id: 't2', type: 'transfer', amount: 1500.00, date: '2023-10-22', status: 'completed', description: 'Monthly Rent', category: 'Housing' },
  { id: 't3', type: 'credit', amount: 350.00, date: '2023-10-20', status: 'pending', description: 'Amazon Refund', category: 'Shopping' },
  { id: 't4', type: 'payment', amount: 45.20, date: '2023-10-18', status: 'completed', description: 'Shell Gas Station', category: 'Transport' },
  { id: 't5', type: 'payment', amount: 89.99, date: '2023-10-15', status: 'completed', description: 'Netflix Subscription', category: 'Entertainment' },
  { id: 't6', type: 'transfer', amount: 200.00, date: '2023-10-10', status: 'completed', description: 'Transfer to Savings', category: 'Finance' },
];

export const bills: Bill[] = [
  { id: 'b1', name: 'Electric Bill', amount: 145.20, paid: 0, dueDate: '2023-11-05', status: 'pending', type: 'card' },
  { id: 'b2', name: 'Internet Fiber', amount: 79.99, paid: 0, dueDate: '2023-11-10', status: 'pending', type: 'card' },
  { id: 'b3', name: 'Gym Membership', amount: 50.00, paid: 50.00, dueDate: '2023-10-30', status: 'paid', type: 'card' },
  { id: 'b4', name: 'SBI Credit Card', amount: 12000.00, paid: 5000.00, dueDate: '2023-10-28', status: 'partial', type: 'card' },
];

export const adminStats = {
  totalUsers: 1250,
  activeUsers: 840,
  totalVolume: 1250000,
  systemHealth: '99.9%'
};
