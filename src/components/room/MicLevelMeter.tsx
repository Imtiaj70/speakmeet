import React, { useEffect, useState, useRef } from 'react';

interface MicLevelMeterProps {
  stream: MediaStream | null;
  isMuted: boolean;
}

export const MicLevelMeter: React.FC<MicLevelMeterProps> = ({ stream, isMuted }) => {
  const [level, setLevel] = useState(0);
  const animRef = useRef<number | null>(null);

  useEffect(() => {
    if (!stream || isMuted || !stream.getAudioTracks().length) {
      setLevel(0);
      return;
    }

    let audioContext: AudioContext | null = null;
    let analyser: AnalyserNode | null = null;
    let source: MediaStreamAudioSourceNode | null = null;

    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;

      audioContext = new AudioCtx();
      if (audioContext.state === 'suspended') {
        audioContext.resume().catch(() => {});
      }

      analyser = audioContext.createAnalyser();
      analyser.fftSize = 256;
      analyser.smoothingTimeConstant = 0.5;

      source = audioContext.createMediaStreamSource(stream);
      source.connect(analyser);

      const dataArray = new Uint8Array(analyser.frequencyBinCount);

      const updateLevel = () => {
        if (!analyser) return;
        analyser.getByteFrequencyData(dataArray);

        // Calculate average volume
        let sum = 0;
        for (let i = 0; i < dataArray.length; i++) {
          sum += dataArray[i];
        }
        const avg = sum / dataArray.length;
        const normalized = Math.min(100, Math.round((avg / 128) * 100));
        setLevel(normalized);

        animRef.current = requestAnimationFrame(updateLevel);
      };

      updateLevel();
    } catch (err) {
      console.warn('[MicLevelMeter] Error:', err);
    }

    return () => {
      if (animRef.current) {
        cancelAnimationFrame(animRef.current);
      }
      if (source) {
        try { source.disconnect(); } catch {}
      }
      if (analyser) {
        try { analyser.disconnect(); } catch {}
      }
      if (audioContext && audioContext.state !== 'closed') {
        try { audioContext.close(); } catch {}
      }
    };
  }, [stream, isMuted]);

  return (
    <div className="flex items-center gap-1.5" title={`Mic Input Level: ${level}%`}>
      <span className="text-[10px] font-medium text-slate-500">Mic Level:</span>
      <div className="w-16 sm:w-24 h-2 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden p-0.5">
        <div
          className={`h-full rounded-full transition-all duration-75 ${
            isMuted
              ? 'bg-rose-500 w-0'
              : level > 15
              ? 'bg-emerald-500 shadow-xs shadow-emerald-400'
              : 'bg-indigo-400'
          }`}
          style={{ width: `${isMuted ? 0 : Math.max(4, level)}%` }}
        />
      </div>
    </div>
  );
};
