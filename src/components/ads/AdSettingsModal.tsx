import React, { useState } from 'react';
import { X, Settings, Sparkles, Check, DollarSign, ExternalLink } from 'lucide-react';
import { Button } from '../common/Button';
import { getAdConfig, saveAdConfig, AdConfig } from '../../config/adConfig';

interface AdSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpdated?: () => void;
}

export const AdSettingsModal: React.FC<AdSettingsModalProps> = ({ isOpen, onClose, onUpdated }) => {
  const [form, setForm] = useState<AdConfig>(getAdConfig());
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    saveAdConfig(form);
    setSavedSuccess(true);
    onUpdated?.();
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 px-6 py-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-white/10">
              <DollarSign className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h3 className="font-bold text-base">Ad & Sponsorship Manager (বিজ্ঞাপন সেটিংস)</h3>
              <p className="text-xs text-indigo-200">Google AdSense ও নিজস্ব স্পনসর ব্যানার কনফিগার করুন</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-white/10 text-white/80 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 text-xs">
          {savedSuccess && (
            <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 flex items-center gap-2 font-semibold">
              <Check className="w-4 h-4 text-emerald-500" />
              <span>বিজ্ঞাপন সেটিংস সফলভাবে সেভ করা হয়েছে!</span>
            </div>
          )}

          {/* AdSense Switch */}
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-3">
            <label className="flex items-center justify-between cursor-pointer font-bold text-slate-900 dark:text-white">
              <span>বিজ্ঞাপন সক্রিয় রাখুন (Enable Ads / Sponsor Banners)</span>
              <input
                type="checkbox"
                checked={form.adsEnabled}
                onChange={(e) => setForm({ ...form, adsEnabled: e.target.checked })}
                className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
              />
            </label>
            <p className="text-slate-500 dark:text-slate-400 leading-relaxed text-[11px]">
              সক্রিয় থাকলে হোমপেজ, লাইভ রুমের তালিকা এবং রুমের মধ্যে বিজ্ঞাপনের জায়গাগুলো প্রদর্শিত হবে।
            </p>
          </div>

          {/* Google AdSense Settings */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center gap-1.5 text-slate-900 dark:text-white font-bold text-sm">
              <span>Google AdSense কোড</span>
              <span className="text-[10px] font-normal px-2 py-0.5 rounded bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300">
                ঐচ্ছিক / AdSense এপ্রুভ হলে
              </span>
            </div>

            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                AdSense Publisher Client ID (যেমন: ca-pub-1234567890123456)
              </label>
              <input
                type="text"
                placeholder="ca-pub-XXXXXXXXXXXXXXXX"
                value={form.adsenseClientId}
                onChange={(e) => setForm({ ...form, adsenseClientId: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                AdSense Slot ID
              </label>
              <input
                type="text"
                placeholder="1234567890"
                value={form.adsenseSlotId}
                onChange={(e) => setForm({ ...form, adsenseSlotId: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Custom Sponsor Banner */}
          <div className="space-y-3 pt-3 border-t border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between">
              <span className="text-slate-900 dark:text-white font-bold text-sm">
                নিজস্ব স্পনসর বা পেইড ব্যানার (Custom Sponsor)
              </span>
              <input
                type="checkbox"
                checked={form.showCustomSponsor}
                onChange={(e) => setForm({ ...form, showCustomSponsor: e.target.checked })}
                className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
              />
            </div>
            <p className="text-slate-500 dark:text-slate-400 text-[11px]">
              যেকোনো ইংলিশ কোচিং, আইইএলটিএস মেন্টর বা কোনো কোর্সের ব্যানার বসিয়ে তাদের থেকে সরাসরি টাকা নিতে পারেন।
            </p>

            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                স্পনসর হেডলাইন (Headline)
              </label>
              <input
                type="text"
                value={form.customSponsorTitle}
                onChange={(e) => setForm({ ...form, customSponsorTitle: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                স্পনসর বিবরণ / অফার (Subtitle)
              </label>
              <input
                type="text"
                value={form.customSponsorSubtitle}
                onChange={(e) => setForm({ ...form, customSponsorSubtitle: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                ক্লিক করলে যে লিংকে যাবে (Target URL)
              </label>
              <input
                type="url"
                value={form.customSponsorUrl}
                onChange={(e) => setForm({ ...form, customSponsorUrl: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-slate-700 dark:text-slate-300 font-semibold mb-1">
                বিজ্ঞাপন দেওয়ার জন্য যোগাযোগের লিংক / ইমেইল / হোয়াটসঅ্যাপ
              </label>
              <input
                type="text"
                value={form.contactForAdsUrl}
                onChange={(e) => setForm({ ...form, contactForAdsUrl: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-2">
            <Button type="button" variant="outline" size="sm" onClick={onClose}>
              বাতিল
            </Button>
            <Button type="submit" size="sm" className="bg-indigo-600 hover:bg-indigo-700 text-white">
              সেভ করুন (Save Ad Settings)
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
