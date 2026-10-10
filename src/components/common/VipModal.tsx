import React, { useState } from 'react';
import { Crown, Sparkles, Check, X, ExternalLink, ShieldCheck } from 'lucide-react';
import { Button } from './Button';
import { useAuth } from '../../context/AuthContext';
import { activateVip } from '../../config/vipStore';
import { getDonationConfig } from '../../config/donationConfig';

interface VipModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const VipModal: React.FC<VipModalProps> = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const donationConfig = getDonationConfig();
  const [selectedTier, setSelectedTier] = useState<'silver' | 'gold' | 'diamond'>('gold');
  const [txId, setTxId] = useState('');
  const [activatedSuccess, setActivatedSuccess] = useState(false);

  if (!isOpen) return null;

  const handleActivate = (e: React.FormEvent) => {
    e.preventDefault();
    const username = user?.username || user?.name || 'VIP Member';
    activateVip({
      userId: user?.id,
      username: username,
      tier: selectedTier,
      activatedAt: new Date().toISOString(),
      txId: txId.trim() || undefined,
    });
    setActivatedSuccess(true);
    setTimeout(() => {
      setActivatedSuccess(false);
      onClose();
    }, 2000);
  };

  const tiers = [
    {
      id: 'silver',
      name: 'Silver Supporter',
      price: '$3',
      badge: '🥈 Silver VIP',
      perks: ['👑 Silver VIP Badge', '💬 Highlighted in Room Chat', '☕ Server Supporter'],
    },
    {
      id: 'gold',
      name: 'Gold Supporter (Popular)',
      price: '$5',
      badge: '🥇 Gold VIP',
      popular: true,
      perks: [
        '👑 Gold VIP Crown Badge',
        '📌 Featured Room (Pinned to Top)',
        '🚀 Priority Audio Channel',
        '⭐ 30-Day Supporter Halo Ring',
      ],
    },
    {
      id: 'diamond',
      name: 'Lifetime VIP',
      price: '$15',
      badge: '💎 Diamond VIP',
      perks: [
        '💎 Diamond Crown Everywhere',
        '📌 Top Pinned Rooms Forever',
        '🎉 Custom Room Themes',
        '❤️ Platform Co-Supporter Recognition',
      ],
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="relative w-full max-w-xl bg-[#111827] border border-amber-400/40 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] text-slate-200">
        {/* Top Header */}
        <div className="bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-500 px-6 py-5 text-slate-950 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-full bg-white/95 flex items-center justify-center shadow-md text-2xl">
              👑
            </div>
            <div>
              <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-950/15 text-amber-950 text-[10px] font-extrabold uppercase tracking-wider mb-0.5">
                <Sparkles className="w-3 h-3" />
                <span>SpeakMate VIP Club</span>
              </div>
              <h3 className="font-extrabold text-lg leading-tight">Become a VIP Supporter</h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-black/10 transition-colors text-slate-950 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {activatedSuccess ? (
            <div className="py-8 text-center space-y-3">
              <div className="w-16 h-16 rounded-full bg-emerald-950/80 border-2 border-emerald-500 text-emerald-400 flex items-center justify-center mx-auto text-3xl">
                👑
              </div>
              <h4 className="text-xl font-extrabold text-white">
                VIP Supporter Status Activated!
              </h4>
              <p className="text-xs text-slate-300 max-w-sm mx-auto leading-relaxed">
                Your golden crown 👑 badge is now visible across all speaking lounges and your rooms will be featured at the top.
              </p>
            </div>
          ) : (
            <>
              {/* Global Value Proposition */}
              <div className="text-xs text-slate-300 leading-relaxed bg-slate-900/90 p-3.5 rounded-xl border border-slate-800">
                <p>
                  <strong>SpeakMate</strong> is free for language learners worldwide. Becoming a <strong>VIP Supporter</strong> helps fund global WebRTC servers and grants you exclusive perks!
                </p>
              </div>

              {/* Tier Selection */}
              <div>
                <label className="block text-xs font-bold text-slate-200 mb-2">
                  Choose your VIP Membership Tier:
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {tiers.map((t) => {
                    const isSelected = selectedTier === t.id;
                    return (
                      <div
                        key={t.id}
                        onClick={() => setSelectedTier(t.id as any)}
                        className={`relative rounded-xl border p-3.5 flex flex-col justify-between cursor-pointer transition-all ${
                          isSelected
                            ? 'border-amber-400 bg-amber-950/30 shadow-sm scale-102 ring-2 ring-amber-400/40'
                            : 'border-slate-800 bg-slate-900/60 hover:bg-slate-800'
                        }`}
                      >
                        {t.popular && (
                          <span className="absolute -top-2.5 right-2 px-2 py-0.5 rounded-full bg-amber-500 text-slate-950 text-[9px] font-black uppercase tracking-wider shadow-xs">
                            Popular
                          </span>
                        )}
                        <div>
                          <div className="font-bold text-xs text-slate-100 mb-1">
                            {t.badge}
                          </div>
                          <div className="text-base font-extrabold text-amber-400">
                            {t.price}
                          </div>
                          <ul className="mt-2.5 space-y-1 text-[11px] text-slate-400">
                            {t.perks.map((p, i) => (
                              <li key={i} className="flex items-center gap-1">
                                <Check className="w-3 h-3 text-emerald-400 shrink-0" />
                                <span>{p}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Global Payment Options */}
              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
                <span className="text-xs font-bold text-slate-200 block">
                  International Payment Methods:
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <a
                    href={donationConfig.buyMeACoffeeUrl || 'https://www.buymeacoffee.com'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-3 rounded-xl bg-[#ffd400] hover:bg-[#ffc800] text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-transform hover:scale-102"
                  >
                    <span>☕ Buy Me a Coffee (Cards/Apple Pay)</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>

                  <a
                    href={
                      donationConfig.paypalUrl && donationConfig.paypalUrl !== 'https://paypal.me/'
                        ? donationConfig.paypalUrl
                        : 'https://www.paypal.com'
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-3 rounded-xl bg-[#ffc439] hover:bg-[#f2b82f] text-[#003087] font-extrabold text-xs flex items-center justify-center gap-2 shadow-sm transition-transform hover:scale-102"
                  >
                    <span className="italic font-black text-blue-900">Pay</span>
                    <span className="italic font-black text-sky-600">Pal</span>
                    <ExternalLink className="w-3.5 h-3.5 text-[#003087]" />
                  </a>
                </div>
              </div>

              {/* Instant Activation Form */}
              <form onSubmit={handleActivate} className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Supporter Name or Payment Reference
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Your name or receipt code"
                    value={txId}
                    onChange={(e) => setTxId(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs bg-slate-900 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div className="pt-2 flex items-center justify-end gap-2">
                  <Button type="button" variant="outline" size="sm" onClick={onClose}>
                    Maybe Later
                  </Button>
                  <Button
                    type="submit"
                    size="sm"
                    className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold border-none shadow-md shadow-amber-500/20"
                    leftIcon={<Crown className="w-4 h-4 fill-slate-950" />}
                  >
                    Activate VIP Status
                  </Button>
                </div>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
