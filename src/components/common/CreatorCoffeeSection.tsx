import React, { useState, useEffect } from 'react';
import { Coffee, Settings, Crown } from 'lucide-react';
import { getDonationConfig, saveDonationConfig, DonationConfig } from '../../config/donationConfig';
import { CheckoutSupporterModal } from './CheckoutSupporterModal';

interface CreatorCoffeeSectionProps {
  className?: string;
}

export const CreatorCoffeeSection: React.FC<CreatorCoffeeSectionProps> = ({ className = '' }) => {
  const [config, setConfig] = useState<DonationConfig>(getDonationConfig());
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<DonationConfig>(getDonationConfig());

  // Form states - Global Standard (USD)
  const [amount, setAmount] = useState<number>(5);
  const [customInput, setCustomInput] = useState<string>('5');
  const [donorName, setDonorName] = useState<string>('');
  const [donorMessage, setDonorMessage] = useState<string>('');
  const [isCheckoutOpen, setIsCheckoutOpen] = useState<boolean>(false);

  useEffect(() => {
    const current = getDonationConfig();
    setConfig(current);
    setEditForm(current);
  }, []);

  const handlePresetSelect = (val: number) => {
    setAmount(val);
    setCustomInput(val.toString());
  };

  const handleCustomChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setCustomInput(val);
    const parsed = parseFloat(val);
    if (!isNaN(parsed) && parsed > 0) {
      setAmount(parsed);
    }
  };

  const handleSaveConfig = (e: React.FormEvent) => {
    e.preventDefault();
    const updated = saveDonationConfig(editForm);
    setConfig(updated);
    setIsEditing(false);
  };

  // Calculate supporter days
  const getSupporterText = () => {
    if (amount >= 25) return `Support $${amount} = Lifetime VIP Supporter`;
    if (amount >= 10) return `Support $${amount} = 60 days VIP Supporter`;
    if (amount >= 5) return `Support $${amount} = 30 days Supporter`;
    return `Support $${amount} = ${Math.round(amount * 6)} days Supporter`;
  };

  const handleSupportSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsCheckoutOpen(true);
  };

  return (
    <div className={`w-full my-6 ${className}`}>
      {/* Container with dual dark cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Left Card: About Me */}
        <div className="relative rounded-xl border border-slate-700/80 bg-[#0d1527] dark:bg-[#0b1324] p-6 text-slate-200 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-800">
              <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                <span>About Me</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsEditing(!isEditing)}
                className="text-xs text-slate-400 hover:text-amber-400 flex items-center gap-1 transition-colors cursor-pointer"
                title="Edit Creator Info / PayPal / BuyMeACoffee Link"
              >
                <Settings className="w-3.5 h-3.5" />
                <span>{isEditing ? 'Cancel Edit' : 'Edit Story'}</span>
              </button>
            </div>

            {isEditing ? (
              <form onSubmit={handleSaveConfig} className="space-y-3 text-xs">
                <div className="p-2.5 rounded-lg bg-indigo-950/40 border border-indigo-800 text-indigo-300">
                  <span>Update your creator profile and donation links:</span>
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Your Name (Creator Name)</label>
                  <input
                    type="text"
                    value={editForm.creatorName}
                    onChange={(e) => setEditForm({ ...editForm, creatorName: e.target.value })}
                    className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white focus:outline-none focus:ring-1 focus:ring-amber-400"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Platform Name</label>
                  <input
                    type="text"
                    value={editForm.appName}
                    onChange={(e) => setEditForm({ ...editForm, appName: e.target.value })}
                    className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white focus:outline-none focus:ring-1 focus:ring-amber-400"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Created Since (Year)</label>
                  <input
                    type="text"
                    value={editForm.creatorSinceYear}
                    onChange={(e) => setEditForm({ ...editForm, creatorSinceYear: e.target.value })}
                    className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white focus:outline-none focus:ring-1 focus:ring-amber-400"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">BuyMeACoffee URL</label>
                  <input
                    type="url"
                    value={editForm.buyMeACoffeeUrl}
                    onChange={(e) => setEditForm({ ...editForm, buyMeACoffeeUrl: e.target.value })}
                    className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white focus:outline-none focus:ring-1 focus:ring-amber-400"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">PayPal Me URL</label>
                  <input
                    type="text"
                    value={editForm.paypalUrl}
                    onChange={(e) => setEditForm({ ...editForm, paypalUrl: e.target.value })}
                    className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white focus:outline-none focus:ring-1 focus:ring-amber-400"
                  />
                </div>
                <div className="pt-2 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="px-3 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-3 py-1 rounded bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold cursor-pointer"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-3.5 text-[14px] leading-relaxed">
                <p className="text-yellow-400 font-medium">Hello guys!</p>

                <p>
                  My name is{' '}
                  <span className="text-yellow-400 font-semibold">{config.creatorName || 'Sohag'}</span>.
                </p>

                <p>
                  I created <span className="text-yellow-400 font-semibold">{config.appName || 'SpeakMate'}</span> in{' '}
                  {config.creatorSinceYear || '2024'} and I have been maintaining it by myself since then.
                </p>

                <p>
                  I still have a lot of plans for{' '}
                  <span className="text-yellow-400 font-semibold">{config.appName || 'SpeakMate'}</span> in the future.
                </p>

                <p>
                  <span className="text-yellow-400 font-semibold">{config.appName || 'SpeakMate'}</span> is growing a lot and
                  I am running out of resources for maintenance.
                </p>

                <p>
                  If you would like to support{' '}
                  <span className="text-yellow-400 font-semibold">{config.appName || 'SpeakMate'}</span>, just{' '}
                  <button
                    type="button"
                    onClick={() => setIsCheckoutOpen(true)}
                    className="text-yellow-400 font-semibold underline underline-offset-2 hover:text-yellow-300 cursor-pointer"
                  >
                    buy me a coffee
                  </button>
                  .
                </p>
              </div>
            )}
          </div>

          <div className="pt-6 text-right">
            <span className="text-yellow-400 font-semibold text-sm">Thank you so much!</span>
          </div>
        </div>

        {/* Right Card: Buy Me A Coffee */}
        <div className="relative rounded-xl border border-slate-700/80 bg-[#0d1527] dark:bg-[#0b1324] p-6 text-slate-200 shadow-xl flex flex-col justify-between">
          <div>
            {/* Header */}
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-800">
              <h3 className="text-base font-bold text-amber-400 flex items-center gap-2">
                <span>Buy Me A Coffee</span>
              </h3>
              <span className="text-xs text-slate-400 font-medium">Worldwide Support (USD)</span>
            </div>

            <form onSubmit={handleSupportSubmit} className="space-y-4">
              {/* Coffee Amount Selector Row */}
              <div className="flex items-center gap-2 flex-wrap">
                {/* Coffee Icon Cup */}
                <div className="w-10 h-10 rounded-full bg-slate-800/90 border border-slate-700 flex items-center justify-center text-lg shadow-inner shrink-0">
                  <span className="relative">☕</span>
                </div>

                <span className="text-slate-400 font-bold text-sm">+</span>

                {/* Preset Amount Pills */}
                {[5, 10, 25].map((val) => {
                  const isSelected = amount === val && customInput === val.toString();
                  return (
                    <button
                      type="button"
                      key={val}
                      onClick={() => handlePresetSelect(val)}
                      className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-sky-500 text-white shadow-md shadow-sky-500/30 ring-2 ring-sky-400/50'
                          : 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700'
                      }`}
                    >
                      ${val}
                    </button>
                  );
                })}

                {/* Custom Input */}
                <div className="relative flex items-center ml-auto">
                  <span className="absolute left-3 text-slate-400 text-xs font-bold">$</span>
                  <input
                    type="number"
                    min="1"
                    step="1"
                    value={customInput}
                    onChange={handleCustomChange}
                    className="w-20 pl-6 pr-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white font-bold text-xs focus:outline-none focus:ring-1 focus:ring-sky-500"
                  />
                </div>
              </div>

              {/* Name Input */}
              <div>
                <input
                  type="text"
                  placeholder="Your name (optional)"
                  value={donorName}
                  onChange={(e) => setDonorName(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-lg bg-slate-900 border border-slate-700/80 text-white placeholder-slate-500 text-xs focus:outline-none focus:ring-1 focus:ring-sky-500"
                />
              </div>

              {/* Message Textarea */}
              <div>
                <textarea
                  rows={3}
                  placeholder="Say something nice... (optional)&#10;Note: This message will be sent to all rooms so you will get banned if using an inappropriate message."
                  value={donorMessage}
                  onChange={(e) => setDonorMessage(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-lg bg-slate-900 border border-slate-700/80 text-white placeholder-slate-500 text-xs focus:outline-none focus:ring-1 focus:ring-sky-500 resize-none leading-relaxed"
                />
              </div>

              {/* Dynamic Action Button */}
              <button
                type="submit"
                className="w-full py-2.5 px-4 rounded-lg font-bold text-sm text-white bg-[#0284c7] hover:bg-[#0369a1] shadow-lg shadow-sky-600/20 transition-all hover:scale-[1.01] active:scale-[0.99] cursor-pointer flex items-center justify-center gap-2"
              >
                <Crown className="w-4 h-4 fill-white" />
                <span>{getSupporterText()}</span>
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Checkout Modal */}
      <CheckoutSupporterModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        amount={amount}
        currency="USD"
        donorName={donorName}
        donorMessage={donorMessage}
      />
    </div>
  );
};
