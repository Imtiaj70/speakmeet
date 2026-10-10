import React, { useState } from 'react';
import { X, CreditCard } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getDonationConfig } from '../../config/donationConfig';
import { activateVip } from '../../config/vipStore';
import { recordTransaction } from '../../config/transactionStore';

interface CheckoutSupporterModalProps {
  isOpen: boolean;
  onClose: () => void;
  amount: number;
  currency?: 'USD' | 'BDT';
  donorName?: string;
  donorMessage?: string;
}

export const CheckoutSupporterModal: React.FC<CheckoutSupporterModalProps> = ({
  isOpen,
  onClose,
  amount,
  donorName,
}) => {
  const { user } = useAuth();
  const config = getDonationConfig();

  const [upgradeTarget, setUpgradeTarget] = useState<'my' | 'friend' | 'following'>('my');
  const [friendUsername, setFriendUsername] = useState('');
  const [agreed, setAgreed] = useState(true);
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen) return null;

  const userAvatar =
    user?.avatar ||
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80';

  const targetName =
    upgradeTarget === 'friend' && friendUsername.trim()
      ? friendUsername.trim()
      : donorName?.trim() || user?.name || user?.username || 'You';

  const durationText =
    amount >= 25
      ? 'Lifetime VIP Supporter, no recurring charge'
      : amount >= 10
      ? 'Maximum 60 days VIP Supporter'
      : 'Maximum 30 days, no additional';

  const handleGrantSupporter = (method: string) => {
    if (!agreed) {
      alert('Please check "I have read and agree" before proceeding.');
      return;
    }

    const txId = `${method}-${Date.now().toString().slice(-6)}`;
    activateVip({
      userId: user?.id,
      username: targetName,
      tier: amount >= 15 ? 'diamond' : 'gold',
      activatedAt: new Date().toISOString(),
      txId,
    });

    recordTransaction({
      donorName: targetName,
      donorEmail: user?.email,
      amount,
      currency: 'USD',
      paymentMethod: (method as any) || 'Card',
      purpose: 'VIP Supporter',
      status: 'completed',
      txId,
      notes: `${amount >= 15 ? 'Diamond' : 'Gold'} VIP upgrade for ${targetName}`,
    });

    setIsSuccess(true);
  };

  const handlePaypalClick = () => {
    if (!agreed) return;
    const url =
      config.paypalUrl && config.paypalUrl !== 'https://paypal.me/'
        ? config.paypalUrl
        : 'https://www.paypal.com';
    window.open(url, '_blank', 'noopener,noreferrer');
    handleGrantSupporter('PayPal');
  };

  const handleBuyMeCoffeeClick = () => {
    if (!agreed) return;
    const url = config.buyMeACoffeeUrl || 'https://www.buymeacoffee.com';
    window.open(url, '_blank', 'noopener,noreferrer');
    handleGrantSupporter('BuyMeACoffee');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className="relative w-full max-w-4xl bg-[#111827] border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150 flex flex-col max-h-[95vh] text-slate-200"
        role="dialog"
        aria-modal="true"
      >
        {/* Red X Close Button */}
        <button
          onClick={onClose}
          className="absolute top-0 right-0 z-10 w-9 h-9 bg-red-600 hover:bg-red-700 text-white flex items-center justify-center transition-colors cursor-pointer rounded-bl-xl shadow-md"
          title="Close"
        >
          <X className="w-5 h-5 stroke-[2.5]" />
        </button>

        {/* Modal Header */}
        <div className="pt-6 pb-4 px-6 text-center border-b border-slate-800">
          <h2 className="text-xl sm:text-2xl font-bold text-white">
            You'll be charged <span className="text-amber-400 font-extrabold">${amount}</span>. Thanks for your support!
          </h2>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {isSuccess ? (
            <div className="py-8 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-950/80 border-2 border-emerald-500 text-emerald-400 flex items-center justify-center mx-auto text-3xl shadow-lg">
                👑
              </div>
              <h3 className="text-2xl font-extrabold text-white">
                Payment Processed & Supporter Activated!
              </h3>
              <p className="text-sm text-slate-300 max-w-md mx-auto leading-relaxed">
                Thank you so much! <strong className="text-amber-400">{targetName}</strong> now has the glowing Supporter halo ring and VIP badge.
              </p>
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2.5 rounded-lg bg-sky-500 hover:bg-sky-600 text-white font-bold text-sm shadow-md cursor-pointer"
              >
                Return to Live Lounges
              </button>
            </div>
          ) : (
            <>
              {/* Top Section: Upgrade Target & Visual Avatar Upgrade */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                {/* Left: Radio Options */}
                <div className="md:col-span-6 space-y-2.5">
                  <h4 className="text-amber-400 font-semibold text-sm">
                    What account do u want to upgrade?
                  </h4>

                  <div className="space-y-2 text-sm text-slate-300">
                    <label className="flex items-center gap-2.5 cursor-pointer">
                      <input
                        type="radio"
                        name="upgradeTarget"
                        checked={upgradeTarget === 'my'}
                        onChange={() => setUpgradeTarget('my')}
                        className="w-4 h-4 text-sky-500 bg-slate-900 border-slate-700 focus:ring-0"
                      />
                      <span>My Account</span>
                    </label>

                    <label className="flex items-center gap-2.5 cursor-pointer">
                      <input
                        type="radio"
                        name="upgradeTarget"
                        checked={upgradeTarget === 'friend'}
                        onChange={() => setUpgradeTarget('friend')}
                        className="w-4 h-4 text-sky-500 bg-slate-900 border-slate-700 focus:ring-0"
                      />
                      <span>My Friend's Account</span>
                    </label>

                    {upgradeTarget === 'friend' && (
                      <div className="pl-6 pt-1">
                        <input
                          type="text"
                          placeholder="Enter friend's username..."
                          value={friendUsername}
                          onChange={(e) => setFriendUsername(e.target.value)}
                          className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs focus:outline-none focus:ring-1 focus:ring-sky-500"
                        />
                      </div>
                    )}

                    <label className="flex items-center gap-2.5 cursor-pointer">
                      <input
                        type="radio"
                        name="upgradeTarget"
                        checked={upgradeTarget === 'following'}
                        onChange={() => setUpgradeTarget('following')}
                        className="w-4 h-4 text-sky-500 bg-slate-900 border-slate-700 focus:ring-0"
                      />
                      <span>My Following's Account</span>
                    </label>
                  </div>
                </div>

                {/* Right: Visual Avatar Upgrade */}
                <div className="md:col-span-6 flex items-center justify-center gap-3 sm:gap-4 py-2">
                  {/* Normal Avatar with blue heart */}
                  <div className="flex flex-col items-center gap-1">
                    <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full overflow-hidden border-2 border-slate-600 shadow-md">
                      <img
                        src={userAvatar}
                        alt="Regular User"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex items-center gap-1 text-[11px] text-sky-400 font-bold">
                      <span>💙 0</span>
                    </div>
                  </div>

                  <span className="text-slate-400 font-bold text-lg">+</span>

                  {/* Your Support Circle */}
                  <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-slate-900 border-2 border-rose-500/80 shadow-[0_0_12px_rgba(244,63,94,0.4)] flex flex-col items-center justify-center text-center p-1">
                    <span className="text-[10px] sm:text-xs font-bold text-amber-300 leading-tight">
                      Your<br />Support
                    </span>
                  </div>

                  <span className="text-slate-400 font-bold text-lg">=</span>

                  {/* Glowing VIP Supporter Avatar */}
                  <div className="flex flex-col items-center gap-1">
                    <div className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-full p-0.5 bg-gradient-to-tr from-amber-400 via-rose-500 to-yellow-300 shadow-[0_0_18px_rgba(251,191,36,0.5)]">
                      <div className="w-full h-full rounded-full overflow-hidden border border-slate-900">
                        <img
                          src={userAvatar}
                          alt="VIP Supporter"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <span className="absolute -top-1 -right-1 text-xs">👑</span>
                    </div>
                    <div className="flex items-center gap-1 text-[11px] text-rose-400 font-bold">
                      <span>❤️ 0</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Middle Section: Membership Info & Terms Checkbox */}
              <div className="pt-4 border-t border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs leading-relaxed">
                <div className="space-y-1 text-slate-300">
                  <p>
                    Membership:{' '}
                    <span className="text-amber-400 font-semibold">Supporter</span>
                  </p>
                  <p>
                    Duration:{' '}
                    <span className="text-amber-400 font-semibold">{durationText}</span>
                  </p>
                  <p>
                    Refund Policy:{' '}
                    <span className="text-amber-400 font-semibold">
                      Non-refundable after activation
                    </span>
                  </p>
                  <p>
                    By paying, you agree to our{' '}
                    <a href="/terms" target="_blank" className="text-sky-400 underline font-medium">
                      Terms of Service
                    </a>
                  </p>
                </div>

                <div className="shrink-0">
                  <label className="inline-flex items-center gap-2 cursor-pointer font-bold text-slate-200 select-none">
                    <input
                      type="checkbox"
                      checked={agreed}
                      onChange={(e) => setAgreed(e.target.checked)}
                      className="w-4 h-4 rounded text-sky-500 bg-slate-900 border-slate-700 focus:ring-0"
                    />
                    <span>I have read and agree</span>
                  </label>
                </div>
              </div>

              {/* Payment Methods Section */}
              <div className="pt-4 border-t border-slate-800 grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Left Column: PayPal */}
                <div className="space-y-2">
                  <div className="text-center">
                    <h4 className="font-bold text-slate-100 text-xs sm:text-sm">
                      Pay With Paypal (Recommended)
                    </h4>
                    <p className="text-[11px] text-amber-400 font-medium">
                      Support Paypal Account, Debit or Credit cards.<br />
                      Transaction fee is covered.
                    </p>
                  </div>

                  {/* White Card with PayPal buttons */}
                  <div className="bg-white rounded-xl p-4 space-y-2.5 shadow-md flex flex-col justify-between">
                    {/* PayPal Yellow Button */}
                    <button
                      type="button"
                      onClick={handlePaypalClick}
                      disabled={!agreed}
                      className="w-full py-2.5 px-4 rounded-full bg-[#ffc439] hover:bg-[#f2b82f] text-[#003087] font-extrabold text-sm flex items-center justify-center gap-1.5 shadow-sm transition-all hover:scale-[1.01] active:scale-99 disabled:opacity-50 cursor-pointer"
                    >
                      <span className="italic font-black text-blue-900">Pay</span>
                      <span className="italic font-black text-sky-500">Pal</span>
                    </button>

                    {/* Debit or Credit Card Dark Button */}
                    <button
                      type="button"
                      onClick={handlePaypalClick}
                      disabled={!agreed}
                      className="w-full py-2.5 px-4 rounded-full bg-[#2c2e2f] hover:bg-[#1a1b1c] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all hover:scale-[1.01] active:scale-99 disabled:opacity-50 cursor-pointer"
                    >
                      <CreditCard className="w-4 h-4" />
                      <span>Debit or Credit Card</span>
                    </button>

                    <div className="pt-1 text-center">
                      <span className="text-[10px] text-slate-500 italic">
                        Powered by <strong className="text-[#003087]">PayPal</strong>
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right Column: Buy-Me-A-Coffee Website */}
                <div className="space-y-2">
                  <div className="text-center">
                    <h4 className="font-bold text-slate-100 text-xs sm:text-sm">
                      Pay With Buy-Me-A-Coffee Website
                    </h4>
                    <p className="text-[11px] text-amber-400 font-medium">
                      Support Cash App, Google Pay, Crypto, Debit or Credit cards.<br />
                      However, you will have to pay an additional 10% transaction fee.
                    </p>
                  </div>

                  {/* White Card with BuyMeACoffee button */}
                  <div className="bg-white rounded-xl p-4 flex flex-col justify-between min-h-[120px] shadow-md">
                    <button
                      type="button"
                      onClick={handleBuyMeCoffeeClick}
                      disabled={!agreed}
                      className="w-full my-auto py-3 px-4 rounded-xl bg-[#ffd400] hover:bg-[#ffc800] text-slate-950 font-black text-sm flex items-center justify-center gap-2 shadow-sm transition-all hover:scale-[1.01] active:scale-99 disabled:opacity-50 cursor-pointer"
                    >
                      <span className="text-lg">☕</span>
                      <span className="font-serif italic font-bold">Buy me a coffee</span>
                    </button>

                    <div className="text-center pt-1">
                      <span className="text-[10px] text-slate-500">
                        Direct Bank & International Cards
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
