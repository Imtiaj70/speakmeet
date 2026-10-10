import React, { useState, useEffect } from 'react';
import { ExternalLink, Sparkles, Megaphone, Settings } from 'lucide-react';
import { getAdConfig, AdConfig } from '../../config/adConfig';
import { AdSettingsModal } from './AdSettingsModal';

interface AdBannerProps {
  placement?: 'leaderboard' | 'in-feed' | 'sidebar' | 'room-inline';
  className?: string;
}

export const AdBanner: React.FC<AdBannerProps> = ({ placement = 'leaderboard', className = '' }) => {
  const [config, setConfig] = useState<AdConfig>(getAdConfig());
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  useEffect(() => {
    setConfig(getAdConfig());
  }, []);

  if (!config.adsEnabled) return null;

  // Real Google AdSense mode
  const hasAdSense = !!config.adsenseClientId;

  // Render Google AdSense Script Tag
  if (hasAdSense) {
    return (
      <div className={`my-4 overflow-hidden rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 p-2 text-center ${className}`}>
        <div className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider mb-1 flex items-center justify-between px-2">
          <span>Advertisement</span>
          <button
            onClick={() => setIsSettingsOpen(true)}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            title="Configure AdSense"
          >
            ⚙️
          </button>
        </div>
        <ins
          className="adsbygoogle"
          style={{ display: 'block', minHeight: placement === 'leaderboard' ? '90px' : '150px' }}
          data-ad-client={config.adsenseClientId}
          data-ad-slot={config.adsenseSlotId || '1234567890'}
          data-ad-format="auto"
          data-full-width-responsive="true"
        />
        <AdSettingsModal
          isOpen={isSettingsOpen}
          onClose={() => setIsSettingsOpen(false)}
          onUpdated={() => setConfig(getAdConfig())}
        />
      </div>
    );
  }

  // Sponsor & Advertising Banner
  if (placement === 'in-feed') {
    return (
      <div className={`col-span-full my-2 relative overflow-hidden rounded-xl border border-amber-300/80 dark:border-amber-900/50 bg-gradient-to-r from-amber-50 via-white to-amber-50/50 dark:from-amber-950/20 dark:via-slate-900 dark:to-amber-950/20 p-4 sm:p-5 shadow-xs transition-all hover:border-amber-400 ${className}`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 dark:bg-amber-400/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 border border-amber-200 dark:border-amber-900/40">
              <Megaphone className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-200 dark:bg-amber-900/60 text-amber-900 dark:text-amber-300">
                  {config.customSponsorBadge || 'Sponsored Partner'}
                </span>
                <span className="text-[11px] text-slate-400">· Ad Space</span>
              </div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white leading-tight">
                {config.customSponsorTitle}
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 line-clamp-2 max-w-xl">
                {config.customSponsorSubtitle}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 shrink-0 self-start sm:self-center">
            <a
              href={config.customSponsorUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs shadow-xs transition-transform hover:scale-105 active:scale-95"
            >
              <span>Learn More</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>

            <a
              href={config.contactForAdsUrl}
              className="text-[11px] font-semibold text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors px-2 py-1"
              title="Advertise your English coaching or product here"
            >
              Advertise here?
            </a>

            <button
              onClick={() => setIsSettingsOpen(true)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="বিজ্ঞাপন সেটিংস (Admin)"
            >
              <Settings className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        <AdSettingsModal
          isOpen={isSettingsOpen}
          onClose={() => setIsSettingsOpen(false)}
          onUpdated={() => setConfig(getAdConfig())}
        />
      </div>
    );
  }

  // Leaderboard / Default Banner
  return (
    <div className={`relative overflow-hidden rounded-xl border border-indigo-200/80 dark:border-indigo-900/50 bg-gradient-to-r from-indigo-50/70 via-white to-indigo-50/40 dark:from-indigo-950/30 dark:via-slate-900 dark:to-indigo-950/20 px-4 py-3 sm:px-6 sm:py-3.5 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xs ${className}`}>
      <div className="flex items-center gap-3 w-full sm:w-auto">
        <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-xs">
          <Sparkles className="w-4 h-4" />
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300">
              Sponsored
            </span>
            <span className="text-xs font-bold text-slate-900 dark:text-white truncate">
              {config.customSponsorTitle}
            </span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate max-w-md hidden sm:block mt-0.5">
            {config.customSponsorSubtitle}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 w-full sm:w-auto justify-end shrink-0">
        <a
          href={config.customSponsorUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-xs transition-colors"
        >
          <span>Claim Offer</span>
          <ExternalLink className="w-3 h-3" />
        </a>

        <a
          href={config.contactForAdsUrl}
          className="text-[11px] text-slate-500 hover:text-slate-800 dark:hover:text-slate-300 font-medium px-2 py-1"
        >
          Ad Space
        </a>

        <button
          onClick={() => setIsSettingsOpen(true)}
          className="p-1 rounded text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          title="বিজ্ঞাপন সেটিংস"
        >
          <Settings className="w-3.5 h-3.5" />
        </button>
      </div>

      <AdSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onUpdated={() => setConfig(getAdConfig())}
      />
    </div>
  );
};
