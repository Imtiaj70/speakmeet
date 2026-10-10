import React, { useState, useEffect } from 'react';
import {
  DollarSign,
  CreditCard,
  Coffee,
  Crown,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Plus,
  ArrowUpRight,
  ShieldCheck,
  Building,
  Smartphone,
  Save,
  Globe,
  Radio,
} from 'lucide-react';
import { Button } from '../common/Button';
import {
  getDonationConfig,
  saveDonationConfig,
  DonationConfig,
} from '../../config/donationConfig';
import {
  getTransactions,
  recordTransaction,
  TransactionRecord,
} from '../../config/transactionStore';
import { activateVip, getVipUsers } from '../../config/vipStore';

export const AdminFinancesTab: React.FC = () => {
  const [config, setConfig] = useState<DonationConfig>(getDonationConfig());
  const [transactions, setTransactions] = useState<TransactionRecord[]>(getTransactions());
  const [isSaved, setIsSaved] = useState(false);
  const [showManualModal, setShowManualModal] = useState(false);

  // Manual payment form
  const [manualName, setManualName] = useState('');
  const [manualEmail, setManualEmail] = useState('');
  const [manualAmount, setManualAmount] = useState('500');
  const [manualCurrency, setManualCurrency] = useState<'BDT' | 'USD'>('BDT');
  const [manualMethod, setManualMethod] = useState<'bKash' | 'Nagad' | 'PayPal' | 'Card' | 'Bank'>('bKash');
  const [manualPurpose, setManualPurpose] = useState<'VIP Supporter' | 'Buy Coffee'>('VIP Supporter');
  const [manualTxId, setManualTxId] = useState('');

  // AdSense Publisher ID
  const [adsenseId, setAdsenseId] = useState(() => {
    return localStorage.getItem('speakmate_adsense_id') || 'ca-pub-3053263196060000';
  });
  const [adsEnabled, setAdsEnabled] = useState(() => {
    return localStorage.getItem('speakmate_ads_enabled') !== 'false';
  });

  useEffect(() => {
    const handleUpdate = () => {
      setTransactions(getTransactions());
    };
    window.addEventListener('transactions_updated', handleUpdate);
    return () => window.removeEventListener('transactions_updated', handleUpdate);
  }, []);

  const handleSavePayouts = (e: React.FormEvent) => {
    e.preventDefault();
    saveDonationConfig(config);
    localStorage.setItem('speakmate_adsense_id', adsenseId);
    localStorage.setItem('speakmate_ads_enabled', adsEnabled ? 'true' : 'false');
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  const handleRecordManual = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualName.trim()) return;

    const amountNum = parseFloat(manualAmount) || 0;
    const txId = manualTxId.trim() || `${manualMethod}-${Date.now().toString().slice(-6)}`;

    // Record transaction
    recordTransaction({
      donorName: manualName.trim(),
      donorEmail: manualEmail.trim(),
      amount: amountNum,
      currency: manualCurrency,
      paymentMethod: manualMethod,
      purpose: manualPurpose,
      status: 'verified',
      txId,
      notes: `Recorded by admin on ${new Date().toLocaleDateString()}`,
    });

    // If VIP Supporter, automatically grant VIP badge
    if (manualPurpose === 'VIP Supporter') {
      activateVip({
        username: manualName.trim(),
        tier: amountNum >= 10 || (manualCurrency === 'BDT' && amountNum >= 1000) ? 'diamond' : 'gold',
        activatedAt: new Date().toISOString(),
        txId,
      });
    }

    setShowManualModal(false);
    setManualName('');
    setManualEmail('');
    setManualTxId('');
    setTransactions(getTransactions());
  };

  // Calculations
  const totalUsd = transactions
    .filter((t) => t.currency === 'USD')
    .reduce((acc, t) => acc + t.amount, 0);

  const totalBdt = transactions
    .filter((t) => t.currency === 'BDT')
    .reduce((acc, t) => acc + t.amount, 0);

  const vipCount = Object.keys(getVipUsers()).length;

  return (
    <div className="space-y-6">
      {/* ======================================================== */}
      {/* 1. FINANCIAL SUMMARY METRIC CARDS */}
      {/* ======================================================== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Earnings */}
        <div className="p-5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-800 space-y-1 shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>Total Collected Funds</span>
            <DollarSign className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="text-2xl font-extrabold text-slate-900 dark:text-white">
            ${totalUsd.toFixed(2)}{' '}
            <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
              + ৳{totalBdt} BDT
            </span>
          </p>
          <span className="text-[11px] text-emerald-600 dark:text-emerald-400 flex items-center gap-1 font-medium">
            <CheckCircle2 className="w-3 h-3" /> Direct Supporter Donations
          </span>
        </div>

        {/* VIP Supporters */}
        <div className="p-5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-800 space-y-1 shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>Active VIP Supporters</span>
            <Crown className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-2xl font-extrabold text-slate-900 dark:text-white">
            {vipCount}
          </p>
          <span className="text-[11px] text-amber-600 dark:text-amber-400">
            Featured room & badge holders
          </span>
        </div>

        {/* Coffee Donations */}
        <div className="p-5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-800 space-y-1 shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>Total Transactions</span>
            <Coffee className="w-4 h-4 text-yellow-500" />
          </div>
          <p className="text-2xl font-extrabold text-slate-900 dark:text-white">
            {transactions.length}
          </p>
          <span className="text-[11px] text-slate-500 dark:text-slate-400">
            Logged in Ledger
          </span>
        </div>

        {/* Ad Earnings Est. */}
        <div className="p-5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-800 space-y-1 shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>AdSense Monetization</span>
            <Globe className="w-4 h-4 text-sky-500" />
          </div>
          <p className="text-2xl font-extrabold text-slate-900 dark:text-white">
            {adsEnabled ? 'Active' : 'Paused'}
          </p>
          <span className="text-[11px] text-sky-600 dark:text-sky-400">
            In-Feed & Leaderboard Slots
          </span>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 2. HOW MONEY REACHES YOUR ACCOUNT (EXPLANATION IN BANGLA) */}
      {/* ======================================================== */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-indigo-900/40 via-purple-900/30 to-slate-900 border border-indigo-500/40 space-y-3">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-indigo-400" />
          <h3 className="font-bold text-sm sm:text-base text-white">
            টাকা কীভাবে সরাসরি আপনার ব্যাংক বা বিকাশ অ্যাকাউন্টে ঢুকবে? (Payment Payout Guide)
          </h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs text-slate-300">
          <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
            <div className="font-bold text-emerald-400 flex items-center gap-1.5">
              <Smartphone className="w-4 h-4" />
              <span>১. বিকাশ ও নগদ (বাংলাদেশী ইউজার):</span>
            </div>
            <p className="text-slate-400 leading-relaxed">
              নিচে আপনার ব্যক্তিগত <strong>bKash / Nagad</strong> নম্বর লিখে সেভ করুন। দেশের ব্যবহারকারীরা সরাসরি আপনার নম্বরে টাকা পাঠাবে এবং ট্রানজেকশন আইডি দিলে আপনি তা দেখতে পাবেন।
            </p>
          </div>

          <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
            <div className="font-bold text-sky-400 flex items-center gap-1.5">
              <CreditCard className="w-4 h-4" />
              <span>২. PayPal ও Buy Me A Coffee (আন্তর্জাতিক):</span>
            </div>
            <p className="text-slate-400 leading-relaxed">
              ভবিষ্যতে যখন পেপ্যাল বা কার্ড করবেন, নিচে শুধু আপনার লিংকটি বসিয়ে দেবেন। বিদেশি ব্যবহারকারীরা কার্ড বা পেপ্যাল দিয়ে পেমেন্ট করলে টাকা সরাসরি আপনার অ্যাকাউন্টে জমা হবে।
            </p>
          </div>

          <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
            <div className="font-bold text-amber-400 flex items-center gap-1.5">
              <Building className="w-4 h-4" />
              <span>৩. গুগল অ্যাডসেন্স (বিজ্ঞাপনের আয়):</span>
            </div>
            <p className="text-slate-400 leading-relaxed">
              সাইটে ভিজিটর বাড়লে <strong>adsense.google.com</strong> থেকে পাবলিশার আইডি বসাবেন। প্রতি মাসে ১০০ ডলার হলেই গুগল সরাসরি আপনার বাংলাদেশী ব্যাংক অ্যাকাউন্টে পাঠিয়ে দেয়।
            </p>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 3. PAYOUT & ACCOUNT CONFIGURATION FORM */}
      {/* ======================================================== */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-6 space-y-5 shadow-xs">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Building className="w-4 h-4 text-indigo-500" />
              <span>Payout & Payment Gateway Setup (আপনার পেমেন্ট রিসিভ করার সেটিংস)</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              এখানে দেওয়া তথ্যগুলো ব্যবহারকারীরা অনুদান বা ভিআইপি নেওয়ার সময় দেখতে পাবে।
            </p>
          </div>
          {isSaved && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-bold text-xs">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Saved Successfully!</span>
            </span>
          )}
        </div>

        <form onSubmit={handleSavePayouts} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            {/* bKash Number */}
            <div className="space-y-1">
              <label className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-pink-500" />
                <span>bKash Personal / Merchant Number</span>
              </label>
              <input
                type="text"
                value={config.bkashNumber || ''}
                onChange={(e) => setConfig({ ...config, bkashNumber: e.target.value })}
                placeholder="e.g. 017XXXXXXXX"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
              <span className="text-[10px] text-slate-400">টাকা সরাসরি আপনার এই বিকাশ নম্বরে আসবে।</span>
            </div>

            {/* Nagad Number */}
            <div className="space-y-1">
              <label className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-orange-500" />
                <span>Nagad Personal Number</span>
              </label>
              <input
                type="text"
                value={config.nagadNumber || ''}
                onChange={(e) => setConfig({ ...config, nagadNumber: e.target.value })}
                placeholder="e.g. 018XXXXXXXX"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
              <span className="text-[10px] text-slate-400">টাকা সরাসরি আপনার এই নগদ নম্বরে আসবে।</span>
            </div>

            {/* PayPal URL */}
            <div className="space-y-1">
              <label className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-sky-500" />
                <span>PayPal.me URL (যখন পেপ্যাল করবেন)</span>
              </label>
              <input
                type="text"
                value={config.paypalUrl || ''}
                onChange={(e) => setConfig({ ...config, paypalUrl: e.target.value })}
                placeholder="https://paypal.me/yourusername"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
              <span className="text-[10px] text-slate-400">ভবিষ্যতে পেপ্যাল অ্যাকাউন্ট খুলে এখানে লিংকটি বসিয়ে দেবেন।</span>
            </div>

            {/* Buy Me A Coffee URL */}
            <div className="space-y-1">
              <label className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-yellow-500" />
                <span>Buy Me a Coffee URL</span>
              </label>
              <input
                type="text"
                value={config.buyMeACoffeeUrl || ''}
                onChange={(e) => setConfig({ ...config, buyMeACoffeeUrl: e.target.value })}
                placeholder="https://www.buymeacoffee.com/speakmate"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
              <span className="text-[10px] text-slate-400">আন্তর্জাতিক কার্ড/অ্যাপল পে দিয়ে পেমেন্ট নেওয়ার লিংক।</span>
            </div>

            {/* Google AdSense Publisher ID */}
            <div className="space-y-1">
              <label className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-blue-500" />
                <span>Google AdSense Publisher ID</span>
              </label>
              <input
                type="text"
                value={adsenseId}
                onChange={(e) => setAdsenseId(e.target.value)}
                placeholder="ca-pub-XXXXXXXXXXXXXXXX"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
              <span className="text-[10px] text-slate-400">গুগল অ্যাডসেন্স অ্যাকাউন্ট অ্যাপ্রুভ হলে এই আইডি বসাবেন।</span>
            </div>

            {/* Ad Banner Toggle */}
            <div className="space-y-1 flex flex-col justify-center">
              <label className="font-bold text-slate-700 dark:text-slate-300 mb-1">
                Website Ad Placements
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={adsEnabled}
                  onChange={(e) => setAdsEnabled(e.target.checked)}
                  className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 w-4 h-4"
                />
                <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
                  Enable Google AdSense Banners on Live Rooms
                </span>
              </label>
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <Button
              type="submit"
              variant="primary"
              size="sm"
              leftIcon={<Save className="w-4 h-4" />}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-6 py-2 rounded-xl"
            >
              Save Payout Settings
            </Button>
          </div>
        </form>
      </div>

      {/* ======================================================== */}
      {/* 4. TRANSACTION & DONATION LEDGER (কে টাকা দিলো, কত দিলো) */}
      {/* ======================================================== */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-6 space-y-4 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-emerald-500" />
              <span>Live Transaction & Supporter Ledger (কে টাকা দিলো বা অনুদান হিসেব)</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              সাইটে পেমেন্ট বা অনুদান দেওয়া সকল ব্যবহারকারীর নাম, পরিমাণ এবং মেথডের তালিকা।
            </p>
          </div>

          <Button
            size="sm"
            variant="outline"
            leftIcon={<Plus className="w-3.5 h-3.5" />}
            onClick={() => setShowManualModal(true)}
            className="text-xs font-semibold"
          >
            Record Manual / bKash Payment
          </Button>
        </div>

        {/* Transactions Table */}
        <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-xl">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 font-semibold border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="p-3">Donor / User</th>
                <th className="p-3">Amount</th>
                <th className="p-3">Method</th>
                <th className="p-3">Purpose</th>
                <th className="p-3">TxID</th>
                <th className="p-3">Status</th>
                <th className="p-3">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300 font-medium">
              {transactions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-6 text-center text-slate-400">
                    No transactions recorded yet.
                  </td>
                </tr>
              ) : (
                transactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                    <td className="p-3">
                      <div className="font-bold text-slate-900 dark:text-white">
                        {tx.donorName}
                      </div>
                      {tx.donorEmail && (
                        <div className="text-[10px] text-slate-400">{tx.donorEmail}</div>
                      )}
                    </td>
                    <td className="p-3 font-mono font-bold text-emerald-600 dark:text-emerald-400">
                      {tx.currency === 'USD' ? `$${tx.amount.toFixed(2)}` : `৳${tx.amount} BDT`}
                    </td>
                    <td className="p-3">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[11px] font-semibold">
                        {tx.paymentMethod}
                      </span>
                    </td>
                    <td className="p-3">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          tx.purpose === 'VIP Supporter'
                            ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300'
                            : 'bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300'
                        }`}
                      >
                        {tx.purpose}
                      </span>
                    </td>
                    <td className="p-3 font-mono text-[10px] text-slate-400">
                      {tx.txId || 'N/A'}
                    </td>
                    <td className="p-3">
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Verified</span>
                      </span>
                    </td>
                    <td className="p-3 text-[11px] text-slate-400">
                      {new Date(tx.date).toLocaleDateString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 5. MANUAL PAYMENT MODAL */}
      {/* ======================================================== */}
      {showManualModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs">
          <div className="relative w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-6 space-y-4">
            <h3 className="font-bold text-base text-slate-900 dark:text-white">
              Record Offline / bKash Payment
            </h3>
            <p className="text-xs text-slate-500">
              কেউ বিকাশ বা নগদে টাকা পাঠালে এখানে এন্ট্রি করুন। ভিআইপি সিলেক্ট করলে স্বয়ংক্রিয়ভাবে তার ভিআইপি সুবিধা চালু হয়ে যাবে।
            </p>

            <form onSubmit={handleRecordManual} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
                  Donor / User Name *
                </label>
                <input
                  type="text"
                  required
                  value={manualName}
                  onChange={(e) => setManualName(e.target.value)}
                  placeholder="e.g. Tanvir Ahmed"
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
                  Email (Optional)
                </label>
                <input
                  type="email"
                  value={manualEmail}
                  onChange={(e) => setManualEmail(e.target.value)}
                  placeholder="tanvir@gmail.com"
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
                    Amount *
                  </label>
                  <input
                    type="number"
                    required
                    value={manualAmount}
                    onChange={(e) => setManualAmount(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
                    Currency
                  </label>
                  <select
                    value={manualCurrency}
                    onChange={(e) => setManualCurrency(e.target.value as any)}
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                  >
                    <option value="BDT">BDT (৳)</option>
                    <option value="USD">USD ($)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
                    Method
                  </label>
                  <select
                    value={manualMethod}
                    onChange={(e) => setManualMethod(e.target.value as any)}
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                  >
                    <option value="bKash">bKash</option>
                    <option value="Nagad">Nagad</option>
                    <option value="PayPal">PayPal</option>
                    <option value="Card">Bank / Card</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
                    Purpose
                  </label>
                  <select
                    value={manualPurpose}
                    onChange={(e) => setManualPurpose(e.target.value as any)}
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                  >
                    <option value="VIP Supporter">VIP Supporter (Activate Crown)</option>
                    <option value="Buy Coffee">Buy Coffee</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1 text-slate-700 dark:text-slate-300">
                  bKash / Transaction ID
                </label>
                <input
                  type="text"
                  value={manualTxId}
                  onChange={(e) => setManualTxId(e.target.value)}
                  placeholder="e.g. 9KL88219A"
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowManualModal(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" variant="primary" size="sm">
                  Record & Activate VIP
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
