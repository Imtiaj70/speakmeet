/**
 * Web Audio API Speaking Detector
 * Monitors microphone stream volume to detect voice activity and trigger speaking events.
 */

export interface SpeakingDetectorOptions {
  threshold?: number; // RMS threshold between 0.01 and 0.1
  debounceTimeMs?: number;
  onSpeakingChange: (isSpeaking: boolean) => void;
}

export class SpeakingDetector {
  private audioContext: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private source: MediaStreamAudioSourceNode | null = null;
  private animationFrameId: number | null = null;
  private isSpeaking = false;
  private lastStateChangeTime = 0;
  private threshold: number;
  private debounceTimeMs: number;
  private onSpeakingChange: (isSpeaking: boolean) => void;
  private isDestroyed = false;

  constructor(options: SpeakingDetectorOptions) {
    this.threshold = options.threshold ?? 0.012;
    this.debounceTimeMs = options.debounceTimeMs ?? 150;
    this.onSpeakingChange = options.onSpeakingChange;
  }

  start(stream: MediaStream): void {
    if (this.isDestroyed || !stream.getAudioTracks().length) return;

    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;

      this.audioContext = new AudioCtx();
      if (this.audioContext.state === 'suspended') {
        this.audioContext.resume().catch(() => {});
      }
      this.analyser = this.audioContext.createAnalyser();
      this.analyser.fftSize = 512;
      this.analyser.smoothingTimeConstant = 0.3;

      this.source = this.audioContext.createMediaStreamSource(stream);
      this.source.connect(this.analyser);

      const bufferLength = this.analyser.fftSize;
      const dataArray = new Float32Array(bufferLength);

      const checkVolume = () => {
        if (this.isDestroyed || !this.analyser) return;

        this.analyser.getFloatTimeDomainData(dataArray);

        // Compute Root Mean Square (RMS)
        let sumSquares = 0;
        for (let i = 0; i < bufferLength; i++) {
          sumSquares += dataArray[i] * dataArray[i];
        }
        const rms = Math.sqrt(sumSquares / bufferLength);

        const now = Date.now();
        const detectedSpeaking = rms > this.threshold;

        if (detectedSpeaking !== this.isSpeaking) {
          if (now - this.lastStateChangeTime > this.debounceTimeMs) {
            this.isSpeaking = detectedSpeaking;
            this.lastStateChangeTime = now;
            this.onSpeakingChange(detectedSpeaking);
          }
        }

        this.animationFrameId = requestAnimationFrame(checkVolume);
      };

      checkVolume();
    } catch (err) {
      console.warn('[SpeakingDetector] Web Audio API init error:', err);
    }
  }

  stop(): void {
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }

    if (this.source) {
      try {
        this.source.disconnect();
      } catch {}
      this.source = null;
    }

    if (this.analyser) {
      try {
        this.analyser.disconnect();
      } catch {}
      this.analyser = null;
    }

    if (this.audioContext && this.audioContext.state !== 'closed') {
      try {
        this.audioContext.close();
      } catch {}
      this.audioContext = null;
    }

    if (this.isSpeaking) {
      this.isSpeaking = false;
      this.onSpeakingChange(false);
    }
  }

  destroy(): void {
    this.isDestroyed = true;
    this.stop();
  }
}
