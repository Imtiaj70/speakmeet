/**
 * Audio Test Utility for SpeakMate
 * Generates an in-browser synth chime to test speakers/headphones without external audio files.
 */
export function playTestChime(): Promise<boolean> {
  return new Promise((resolve) => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) {
        resolve(false);
        return;
      }
      const ctx = new AudioCtx();
      if (ctx.state === 'suspended') {
        ctx.resume().catch(() => {});
      }

      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      // Harmonic chime: C5 (523Hz) -> E5 (659Hz) -> G5 (784Hz)
      osc.frequency.setValueAtTime(523.25, now);
      osc.frequency.setValueAtTime(659.25, now + 0.12);
      osc.frequency.setValueAtTime(783.99, now + 0.24);

      gain.gain.setValueAtTime(0.25, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.55);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.55);

      osc.onended = () => {
        try {
          ctx.close();
        } catch {}
        resolve(true);
      };
    } catch (err) {
      console.warn('[AudioTest] Could not play chime:', err);
      resolve(false);
    }
  });
}
