import React, { useRef, useEffect, useState } from 'react';
import { Monitor, Maximize2, Minimize2, StopCircle, User } from 'lucide-react';
import { Button } from '../common/Button';

interface ScreenShareStageProps {
  stream: MediaStream | null;
  presenterName: string;
  isLocalUser: boolean;
  onStopSharing?: () => void;
}

export const ScreenShareStage: React.FC<ScreenShareStageProps> = ({
  stream,
  presenterName,
  isLocalUser,
  onStopSharing,
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
      videoRef.current.play().catch((e) => {
        console.warn('[ScreenShareStage] Video play failed:', e);
      });
    }
  }, [stream]);

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative w-full rounded-2xl overflow-hidden bg-slate-950 border border-indigo-900/50 shadow-2xl flex flex-col items-center justify-center min-h-[280px] sm:min-h-[420px] max-h-[680px] group transition-all"
    >
      {/* Top Overlay Bar */}
      <div className="absolute top-0 inset-x-0 z-20 px-4 py-3 bg-gradient-to-b from-slate-950/80 via-slate-950/40 to-transparent flex items-center justify-between text-xs text-white">
        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900/80 backdrop-blur-md border border-slate-700/60 shadow-xs">
          <Monitor className="w-3.5 h-3.5 text-indigo-400 animate-pulse" />
          <span className="font-semibold text-slate-200">
            {isLocalUser ? 'You are sharing your screen' : `${presenterName}'s Screen`}
          </span>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
        </div>

        <div className="flex items-center gap-2">
          {isLocalUser && onStopSharing && (
            <Button
              variant="danger"
              size="sm"
              onClick={onStopSharing}
              leftIcon={<StopCircle className="w-3.5 h-3.5" />}
              className="py-1 px-3 text-xs"
            >
              Stop Sharing
            </Button>
          )}

          <button
            onClick={toggleFullscreen}
            type="button"
            className="p-1.5 rounded-lg bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/60 transition-colors"
            title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Video Element */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted={isLocalUser}
        className="w-full h-full object-contain max-h-[640px] bg-black"
      />

      {!stream && (
        <div className="flex flex-col items-center justify-center p-8 text-center text-slate-400 space-y-2">
          <Monitor className="w-10 h-10 text-slate-600 animate-pulse" />
          <p className="text-sm">Connecting to screen broadcast...</p>
        </div>
      )}
    </div>
  );
};
