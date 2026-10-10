export interface VipSupporter {
  userId?: string;
  username: string;
  tier: 'silver' | 'gold' | 'diamond';
  activatedAt: string;
  expiresAt?: string;
  txId?: string;
}

const VIP_STORAGE_KEY = 'speakmate_vip_users';

export function getVipUsers(): Record<string, VipSupporter> {
  try {
    const raw = localStorage.getItem(VIP_STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    // fallback
  }
  // Default sample VIPs
  return {
    'imtiajuddinsohag99@gmail.com': {
      username: 'Sohag (Host)',
      tier: 'diamond',
      activatedAt: new Date().toISOString(),
    },
    'sohag': {
      username: 'Sohag (Host)',
      tier: 'diamond',
      activatedAt: new Date().toISOString(),
    },
    'seed-host-bn': {
      username: 'Sohag (Host)',
      tier: 'diamond',
      activatedAt: new Date().toISOString(),
    },
  };
}

export function isUserVip(usernameOrEmailOrId?: string | null): boolean {
  if (!usernameOrEmailOrId) return false;
  const list = getVipUsers();
  const key = usernameOrEmailOrId.toLowerCase().trim();
  return (
    !!list[key] ||
    Object.values(list).some(
      (v) => v.username.toLowerCase() === key || v.userId === key
    )
  );
}

export function activateVip(supporter: VipSupporter): void {
  try {
    const list = getVipUsers();
    const key = (supporter.username || supporter.userId || 'guest_user').toLowerCase().trim();
    list[key] = supporter;
    localStorage.setItem(VIP_STORAGE_KEY, JSON.stringify(list));
    window.dispatchEvent(new Event('vip_updated'));
  } catch (e) {
    // fallback
  }
}
