/**
 * This service handles all data interactions.
 * Currently it uses localStorage for persistence.
 * To migrate to Firebase:
 * 1. Import Firestore references from src/lib/firebase.ts
 * 2. Replace localStorage calls with getDocs, addDoc, updateDoc, and deleteDoc.
 */

export const STORAGE_KEYS = {
  DAILY_TRANSACTIONS: 'fin_daily_transactions',
  LIABILITIES: 'fin_liabilities',
  LENT_RECORDS: 'fin_lent_records',
  CREDIT_BILLS: 'fin_credit_bills',
  PERSONAL_NOTES: 'fin_personal_notes',
  STOCK_TRANSACTIONS: 'fin_stock_transactions',
  GLOBAL_ACTIVITY: 'fin_global_activity',
};

export const getFromStorage = (key: string) => {
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : [];
};

export const saveToStorage = (key: string, data: any) => {
  localStorage.setItem(key, JSON.stringify(data));
};

export const addToGlobalActivity = (activity: any) => {
  const activities = getFromStorage(STORAGE_KEYS.GLOBAL_ACTIVITY);
  const newActivity = {
    ...activity,
    id: activity.id || Math.random().toString(36).substr(2, 9),
    timestamp: activity.timestamp || new Date().toISOString(),
  };
  saveToStorage(STORAGE_KEYS.GLOBAL_ACTIVITY, [newActivity, ...activities]);
};
