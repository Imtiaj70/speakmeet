export interface TransactionRecord {
  id: string;
  donorName: string;
  donorEmail?: string;
  amount: number;
  currency: 'USD' | 'BDT';
  paymentMethod: 'bKash' | 'Nagad' | 'PayPal' | 'Card' | 'BuyMeACoffee' | 'Bank';
  purpose: 'VIP Supporter' | 'Buy Coffee' | 'Room Boost' | 'General Donation';
  status: 'completed' | 'pending' | 'verified';
  date: string;
  txId?: string;
  notes?: string;
}

const TRANSACTIONS_KEY = 'speakmate_transactions_log';

export const INITIAL_TRANSACTIONS: TransactionRecord[] = [
  {
    id: 'tx-101',
    donorName: 'Michael Vance',
    donorEmail: 'michael.v@gmail.com',
    amount: 15,
    currency: 'USD',
    paymentMethod: 'PayPal',
    purpose: 'VIP Supporter',
    status: 'completed',
    date: '2026-10-04T14:32:00.000Z',
    txId: 'PAYPAL-984210',
    notes: 'Diamond VIP 60 days',
  },
  {
    id: 'tx-102',
    donorName: 'Amina Al-Mansoor',
    donorEmail: 'amina_ielts@outlook.com',
    amount: 5,
    currency: 'USD',
    paymentMethod: 'BuyMeACoffee',
    purpose: 'Buy Coffee',
    status: 'completed',
    date: '2026-10-03T09:15:00.000Z',
    txId: 'BMC-771239',
    notes: 'Thank you for this IELTS practice platform!',
  },
  {
    id: 'tx-103',
    donorName: 'Tanvir Ahmed',
    donorEmail: 'tanvir.ielts@gmail.com',
    amount: 550,
    currency: 'BDT',
    paymentMethod: 'bKash',
    purpose: 'VIP Supporter',
    status: 'verified',
    date: '2026-10-02T18:45:00.000Z',
    txId: 'BKASH-8BL92K',
    notes: 'Gold VIP 30 days',
  },
  {
    id: 'tx-104',
    donorName: 'Elena Rostova',
    donorEmail: 'elena@example.com',
    amount: 10,
    currency: 'USD',
    paymentMethod: 'Card',
    purpose: 'VIP Supporter',
    status: 'completed',
    date: '2026-10-01T11:20:00.000Z',
    txId: 'STRIPE-492811',
    notes: 'Room feature boost',
  },
];

export function getTransactions(): TransactionRecord[] {
  try {
    const raw = localStorage.getItem(TRANSACTIONS_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    // ignore
  }
  return INITIAL_TRANSACTIONS;
}

export function saveTransactions(list: TransactionRecord[]): void {
  try {
    localStorage.setItem(TRANSACTIONS_KEY, JSON.stringify(list));
    window.dispatchEvent(new Event('transactions_updated'));
  } catch (e) {
    // ignore
  }
}

export function recordTransaction(tx: Omit<TransactionRecord, 'id' | 'date'>): TransactionRecord {
  const all = getTransactions();
  const newTx: TransactionRecord = {
    ...tx,
    id: `tx-${Date.now().toString().slice(-6)}`,
    date: new Date().toISOString(),
  };
  const updated = [newTx, ...all];
  saveTransactions(updated);
  return newTx;
}
