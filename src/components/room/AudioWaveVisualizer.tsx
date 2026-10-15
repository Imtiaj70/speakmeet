import React, { useEffect, useState } from 'react';
import { Volume2, Radio, Sparkles, Mic } from 'lucide-react';

interface AudioWaveVisualizerProps {
  isAnyoneSpeaking: boolean;
  speakerName?: string;
  isCurrentUserSpeaking?: boolean;
  isVoiceConnected: boolean;
}

export const AudioWaveVisualizer: React.FC<AudioWaveVisualizerProps> = ({
  isAnyoneSpeaking,
  speakerName,
  isCurrentUserSpeaking,
  isVoiceConnected,
}) => {
  // Generate random heights for the spectrum bars to create organic sound movement
  const [barHeights, setBarHeights] = useState<number[]>([
    12, 18, 24, 30, 20, 14, 28, 36, 22, 16, 26, 32, 20, 14, 30, 24, 18, 12, 22, 16
  ]);

  useEffect(() => {
    if (!isAnyoneSpeaking) return;

    const interval = setInterval(() => {
      setBarHeights((prev) =>
        prev.map(() => Math.floor(Math.random() * 28) + 8)
      );
    }, 120);

    return () => clearInterval(interval);
  }, [isAnyoneSpeaking]);

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-slate-800 p-3.5 sm:p-4 text-white shadow-lg shadow-indigo-950/20">
      {/* Background ambient studio glow */}
      <div className="absolute -top-12 -left-12 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-12 -right-12 w-48 h-48 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />

      <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Left: Broadcast Status & Active Speaker */}
        <div className="flex items-center gap-3">
          {/* ON AIR Badge */}
          <div
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-black uppercase tracking-wider transition-all duration-300 ${
              isAnyoneSpeaking
                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 shadow-sm shadow-rose-500/20'
                : isVoiceConnected
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                : 'bg-slate-800 text-slate-400 border border-slate-700'
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                isAnyoneSpeaking
                  ? 'bg-rose-500 animate-ping'
                  : isVoiceConnected
                  ? 'bg-emerald-400 animate-pulse'
                  : 'bg-slate-500'
              }`}
            />
            {isAnyoneSpeaking ? 'ON AIR' : isVoiceConnected ? 'VOICE READY' : 'ROOM STAGE'}
          </div>

          {/* Active Speaker Info */}
          <div className="text-xs">
            {isAnyoneSpeaking ? (
              <div className="flex items-center gap-1.5 font-bold text-emerald-300">
                <Volume2 className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                <span>
                  {isCurrentUserSpeaking ? 'You are speaking' : `${speakerName || 'Speaker'} is speaking`}
                </span>
              </div>
            ) : isVoiceConnected ? (
              <div className="flex items-center gap-1.5 text-slate-300 text-[11px]">
                <Mic className="w-3.5 h-3.5 text-emerald-400" />
                <span>Microphone open · Speak to broadcast</span>
              </div>
            ) : (
              <span className="text-slate-400 text-[11px]">
                Live Stage Audio · Join voice to talk
              </span>
            )}
          </div>
        </div>

        {/* Right: Real-time Sound Spectrum Bars */}
        <div className="flex items-center gap-1 h-8 sm:h-9 px-3 py-1 bg-black/40 rounded-xl border border-white/5 backdrop-blur-xs">
          {barHeights.map((h, i) => (
            <div
              key={i}
              className={`w-1 sm:w-1.5 rounded-full transition-all duration-100 ${
                isAnyoneSpeaking
                  ? i % 3 === 0
                    ? 'bg-emerald-400 shadow-xs shadow-emerald-400/50'
                    : i % 2 === 0
                    ? 'bg-cyan-400 shadow-xs shadow-cyan-400/50'
                    : 'bg-indigo-400 shadow-xs shadow-indigo-400/50'
                  : isVoiceConnected
                  ? 'bg-slate-600'
                  : 'bg-slate-700/60'
              }`}
              style={{
                height: isAnyoneSpeaking ? `${h}px` : `${Math.sin(i) * 3 + 6}px`,
                opacity: isAnyoneSpeaking ? 1 : 0.4,
              }}
            />
          ))}
          <span className="text-[10px] font-mono text-slate-400 ml-1.5 shrink-0 hidden md:inline">
            {isAnyoneSpeaking ? '48kHz HD' : 'STEREO'}
          </span>
        </div>
      </div>
    </div>
  );
};
