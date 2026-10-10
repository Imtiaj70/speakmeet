import React from 'react';
import { Crown, Sparkles } from 'lucide-react';

interface VipBadgeProps {
  tier?: 'silver' | 'gold' | 'diamond';
  size?: 'sm' | 'md';
  showLabel?: boolean;
}

export const VipBadge: React.FC<VipBadgeProps> = ({
  tier = 'gold',
  size = 'sm',
  showLabel = true,
}) => {
  const isSm = size === 'sm';

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full font-extrabold uppercase tracking-wider shadow-xs select-none ${
        tier === 'diamond'
          ? 'bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-600 text-white'
          : 'bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 text-amber-950 dark:text-slate-950'
      } ${isSm ? 'px-1.5 py-0.5 text-[9px]' : 'px-2.5 py-1 text-xs'}`}
      title="Verified VIP Supporter 👑"
    >
      <Crown className={isSm ? 'w-2.5 h-2.5 fill-current' : 'w-3.5 h-3.5 fill-current'} />
      {showLabel && <span>VIP</span>}
    </span>
  );
};
