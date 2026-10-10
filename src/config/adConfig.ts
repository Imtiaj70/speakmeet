export interface AdConfig {
  adsEnabled: boolean;
  adsenseClientId: string;
  adsenseSlotId: string;
  showCustomSponsor: boolean;
  customSponsorTitle: string;
  customSponsorSubtitle: string;
  customSponsorBadge: string;
  customSponsorUrl: string;
  contactForAdsUrl: string;
}

export const DEFAULT_AD_CONFIG: AdConfig = {
  adsEnabled: true,
  adsenseClientId: '', // e.g. 'ca-pub-XXXXXXXXXXXXXXXX'
  adsenseSlotId: '',   // e.g. '1234567890'
  showCustomSponsor: true,
  customSponsorTitle: 'Boost Your IELTS Speaking Band with 1-on-1 Mentorship',
  customSponsorSubtitle: 'Practice with certified native speakers & mock exam feedback. Get 20% off today!',
  customSponsorBadge: 'Featured Sponsor',
  customSponsorUrl: 'https://www.buymeacoffee.com/speakmate',
  contactForAdsUrl: 'mailto:imtiajuddinsohag99@gmail.com?subject=Advertise%20on%20SpeakMate',
};

export function getAdConfig(): AdConfig {
  try {
    const saved = localStorage.getItem('speakmate_ad_config');
    if (saved) {
      return { ...DEFAULT_AD_CONFIG, ...JSON.parse(saved) };
    }
  } catch (e) {
    // fallback
  }
  return DEFAULT_AD_CONFIG;
}

export function saveAdConfig(config: Partial<AdConfig>): AdConfig {
  try {
    const current = getAdConfig();
    const updated = { ...current, ...config };
    localStorage.setItem('speakmate_ad_config', JSON.stringify(updated));
    return updated;
  } catch (e) {
    return DEFAULT_AD_CONFIG;
  }
}
