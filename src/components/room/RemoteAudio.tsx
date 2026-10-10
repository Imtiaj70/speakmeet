import React, { useEffect, useRef } from 'react';

interface RemoteAudioProps {
  stream: MediaStream;
  peerId: string;
}

export const RemoteAudio: React.FC<RemoteAudioProps> = ({ stream, peerId }) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const audioElement = audioRef.current;
    if (!audioElement || !stream) return;

    // Attach stream to audio element
    audioElement.srcObject = stream;
    audioElement.volume = 1.0;
    audioElement.muted = false;

    const playAudio = () => {
      if (audioElement && audioElement.paused) {
        audioElement.play().catch((err) => {
          // Autoplay policy might block unprompted playback before user gesture
          console.warn(`[RemoteAudio] Autoplay blocked for peer ${peerId}, awaiting user gesture:`, err?.message || err);
        });
      }
    };

    playAudio();

    // Re-trigger play when tracks are added or unmuted
    const handleTrackEvent = () => {
      playAudio();
    };

    stream.addEventListener('addtrack', handleTrackEvent);
    stream.addEventListener('removetrack', handleTrackEvent);
    stream.getAudioTracks().forEach((track) => {
      track.addEventListener('unmute', handleTrackEvent);
    });

    // Global unlock handler: on first user interaction in the tab, play immediately
    const unlockHandler = () => {
      playAudio();
    };

    window.addEventListener('click', unlockHandler, { once: true });
    window.addEventListener('touchstart', unlockHandler, { once: true });
    window.addEventListener('keydown', unlockHandler, { once: true });

    return () => {
      stream.removeEventListener('addtrack', handleTrackEvent);
      stream.removeEventListener('removetrack', handleTrackEvent);
      window.removeEventListener('click', unlockHandler);
      window.removeEventListener('touchstart', unlockHandler);
      window.removeEventListener('keydown', unlockHandler);
      if (audioElement) {
        audioElement.srcObject = null;
      }
    };
  }, [stream, peerId]);

  return (
    <audio
      ref={audioRef}
      autoPlay
      playsInline
      className="hidden"
      data-peer-id={peerId}
    />
  );
};
