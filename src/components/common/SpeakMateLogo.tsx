import React from 'react';

interface SpeakMateLogoProps {
  size?: 'sm' | 'md' | 'lg';
  showTagline?: boolean;
  className?: string;
}

export const SpeakMateLogo: React.FC<SpeakMateLogoProps> = ({
  size = 'md',
  showTagline = true,
  className = '',
}) => {
  // Dimensions based on size
  const iconSize = size === 'sm' ? 'w-8 h-8' : size === 'lg' ? 'w-11 h-11' : 'w-9.5 h-9.5';
  const titleSize = size === 'sm' ? 'text-base' : size === 'lg' ? 'text-2xl' : 'text-xl';
  const taglineSize = size === 'sm' ? 'text-[8.5px]' : size === 'lg' ? 'text-[11px]' : 'text-[9.5px]';

  return (
    <div className={`flex items-center gap-2.5 select-none group cursor-pointer ${className}`}>
      {/* ======================================================== */}
      {/* BESPOKE SVG EMBLEM: INTERLOCKING VOICE & AUDIO HARMONY */}
      {/* ======================================================== */}
      <div className={`relative ${iconSize} shrink-0 transition-transform duration-300 group-hover:scale-105`}>
        {/* Ambient Glow */}
        <div className="absolute -inset-1 bg-gradient-to-tr from-indigo-600 via-sky-500 to-teal-400 rounded-2xl blur-[6px] opacity-40 group-hover:opacity-75 transition-opacity duration-300" />

        {/* Icon Frame */}
        <svg
          viewBox="0 0 44 44"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="relative w-full h-full drop-shadow-md"
        >
          {/* Outer Squircle Container with Gradient & Subtle Border */}
          <rect
            width="44"
            height="44"
            rx="13"
            fill="url(#sm-bg-gradient)"
          />
          <rect
            x="0.75"
            y="0.75"
            width="42.5"
            height="42.5"
            rx="12.25"
            stroke="url(#sm-border-gradient)"
            strokeWidth="1.5"
            strokeOpacity="0.4"
          />

          {/* Left Conversational Voice Arc */}
          <path
            d="M13 22C13 16.4772 17.0294 12 22 12C26.9706 12 31 16.4772 31 22C31 25.1328 29.6865 27.8993 27.6436 29.6734L28.2 32.5L24.6468 31.2829C23.792 31.7454 22.9157 32 22 32C17.0294 32 13 27.5228 13 22Z"
            fill="url(#sm-inner-bubble)"
            fillOpacity="0.25"
          />

          {/* Dynamic Audio Waves (Central Sound Waves) */}
          {/* Wave Bar 1 */}
          <rect x="15.5" y="19" width="2.5" height="6" rx="1.25" fill="#FFFFFF" fillOpacity="0.75" />
          {/* Wave Bar 2 (Higher) */}
          <rect x="19.5" y="15" width="2.5" height="14" rx="1.25" fill="#FFFFFF" />
          {/* Wave Bar 3 (Tallest Center) */}
          <rect x="23.5" y="13" width="2.5" height="18" rx="1.25" fill="url(#sm-core-accent)" />
          {/* Wave Bar 4 (Higher) */}
          <rect x="27.5" y="16.5" width="2.5" height="11" rx="1.25" fill="#FFFFFF" />
          {/* Wave Bar 5 */}
          <rect x="31.5" y="19.5" width="2" height="5" rx="1" fill="#FFFFFF" fillOpacity="0.75" />

          {/* Radiant Energy Particle */}
          <circle cx="34" cy="11" r="2" fill="#38BDF8" className="animate-pulse" />

          {/* Gradient Definitions */}
          <defs>
            <linearGradient id="sm-bg-gradient" x1="0" y1="0" x2="44" y2="44" gradientUnits="userSpaceOnUse">
              <stop stopColor="#4F46E5" />
              <stop offset="0.5" stopColor="#4338CA" />
              <stop offset="1" stopColor="#0F172A" />
            </linearGradient>

            <linearGradient id="sm-border-gradient" x1="0" y1="0" x2="44" y2="44" gradientUnits="userSpaceOnUse">
              <stop stopColor="#38BDF8" />
              <stop offset="0.6" stopColor="#818CF8" />
              <stop offset="1" stopColor="#C084FC" />
            </linearGradient>

            <linearGradient id="sm-inner-bubble" x1="13" y1="12" x2="31" y2="32" gradientUnits="userSpaceOnUse">
              <stop stopColor="#38BDF8" />
              <stop offset="1" stopColor="#818CF8" />
            </linearGradient>

            <linearGradient id="sm-core-accent" x1="23.5" y1="13" x2="26" y2="31" gradientUnits="userSpaceOnUse">
              <stop stopColor="#38BDF8" />
              <stop offset="1" stopColor="#34D399" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* ======================================================== */}
      {/* TYPOGRAPHY & BRAND WORDMARK */}
      {/* ======================================================== */}
      <div className="flex flex-col">
        <div className="flex items-center gap-1.5 leading-none">
          <span className={`font-black ${titleSize} tracking-tight text-slate-900 dark:text-white`}>
            Speak
            <span className="bg-gradient-to-r from-indigo-500 via-sky-400 to-teal-400 bg-clip-text text-transparent">
              Mate
            </span>
          </span>
          {/* Live Audio Radar Beacon */}
          <span className="relative flex h-2 w-2" title="Live audio active">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
        </div>

        {showTagline && (
          <span
            className={`${taglineSize} font-bold tracking-[0.14em] uppercase text-slate-400 dark:text-slate-500 mt-0.5 leading-none`}
          >
            Live Audio Community
          </span>
        )}
      </div>
    </div>
  );
};
