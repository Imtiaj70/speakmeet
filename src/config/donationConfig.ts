export interface DonationConfig {
  buyMeACoffeeUrl: string;
  bkashNumber: string;
  nagadNumber: string;
  rocketNumber: string;
  paypalUrl: string;
  creatorName: string;
  creatorSinceYear: string;
  appName: string;
  customStory?: string;
}

export const DEFAULT_DONATION_CONFIG: DonationConfig = {
  buyMeACoffeeUrl: 'https://www.buymeacoffee.com/speakmate',
  bkashNumber: '01700000000',
  nagadNumber: '01700000000',
  rocketNumber: '',
  paypalUrl: 'https://paypal.me/',
  creatorName: 'Sohag',
  creatorSinceYear: '2024',
  appName: 'SpeakMate',
  customStory: '',
};

export function getDonationConfig(): DonationConfig {
  try {
    const saved = localStorage.getItem('speakmate_donation_config');
    if (saved) {
      return { ...DEFAULT_DONATION_CONFIG, ...JSON.parse(saved) };
    }
  } catch (e) {
    // ignore
  }
  return DEFAULT_DONATION_CONFIG;
}

export function saveDonationConfig(config: Partial<DonationConfig>): DonationConfig {
  try {
    const current = getDonationConfig();
    const updated = { ...current, ...config };
    localStorage.setItem('speakmate_donation_config', JSON.stringify(updated));
    return updated;
  } catch (e) {
    return DEFAULT_DONATION_CONFIG;
  }
}
