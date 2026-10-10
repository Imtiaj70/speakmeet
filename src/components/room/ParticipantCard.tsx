import React from 'react';
import { motion } from 'motion/react';
import { Mic, MicOff, Crown, Globe, Volume2, Headphones, Shield } from 'lucide-react';
import { RoomParticipant } from '../../types';

interface ParticipantCardProps {
  participant: RoomParticipant;
  isCurrentUser: boolean;
  isHost: boolean;
  isInVoice?: boolean;
  isSpeaking?: boolean;
  isMuted?: boolean;
}

export const ParticipantCard: React.FC<ParticipantCardProps> = ({
  participant,
  isCurrentUser,
  isHost,
  isInVoice = false,
  isSpeaking = false,
  isMuted = false,
}) => {
  const isOnline = participant.isOnline !== false;
  const displayName = participant.displayName || participant.username || 'Speaker';
  const avatarUrl =
    participant.photoURL ||
    participant.avatar ||
    `https://api.dicebear.com/7.x/bottts/svg?seed=${participant.username}`;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95, y: 8 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, y: -8 }}
      transition={{ duration: 0.2 }}
      className={`relative bg-white dark:bg-slate-900 rounded-2xl border p-4 sm:p-5 flex flex-col items-center justify-between min-h-[210px] transition-all shadow-sm ${
        isSpeaking
          ? 'border-emerald-500 ring-2 ring-emerald-500/30 shadow-lg shadow-emerald-500/10'
          : isCurrentUser
          ? 'border-indigo-500 ring-2 ring-indigo-500/20 shadow-md shadow-indigo-500/5'
          : 'border-slate-200/80 dark:border-slate-800'
      }`}
    >
      {/* Top badges & voice status indicator */}
      <div className="w-full flex items-center justify-between text-xs gap-1">
        <div className="flex items-center gap-1.5 flex-wrap">
          {(participant.role === 'admin' || participant.username?.includes('admin')) && (
            <span className="inline-flex items-center gap-1 text-[10px] font-extrabold text-purple-700 dark:text-purple-300 bg-purple-100 dark:bg-purple-950/60 px-2 py-0.5 rounded border border-purple-300 dark:border-purple-800">
              <Shield className="w-3 h-3 text-purple-600 dark:text-purple-400" />
              ADMIN
            </span>
          )}

          {isHost ? (
            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/50 px-2 py-0.5 rounded border border-amber-200/60 dark:border-amber-900/60">
              <Crown className="w-3 h-3 text-amber-500" />
              HOST
            </span>
          ) : (
            <span className="text-[10px] font-medium text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
              SPEAKER
            </span>
          )}

          {isCurrentUser && (
            <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 px-2 py-0.5 rounded border border-indigo-200/60 dark:border-indigo-900/60">
              YOU
            </span>
          )}
        </div>

        {/* Live Voice Status Indicator */}
        <div className="flex items-center gap-1.5">
          {isInVoice ? (
            isSpeaking ? (
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 animate-pulse">
                <Volume2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                Speaking
              </span>
            ) : isMuted ? (
              <span className="w-6 h-6 rounded-full bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900/50 flex items-center justify-center text-rose-500" title="Microphone Muted">
                <MicOff className="w-3.5 h-3.5" />
              </span>
            ) : (
              <span className="w-6 h-6 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-900/50 flex items-center justify-center text-emerald-600 dark:text-emerald-400" title="Voice Connected">
                <Mic className="w-3.5 h-3.5" />
              </span>
            )
          ) : (
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-800" title="Room attendee (not in voice)">
              <Headphones className="w-3 h-3 text-slate-400" />
              Listener
            </span>
          )}

          {/* Online badge */}
          <span
            className={`w-2 h-2 rounded-full ${
              isOnline ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-600'
            }`}
            title={isOnline ? 'Online' : 'Offline'}
          />
        </div>
      </div>

      {/* Avatar with speaking wave ring */}
      <div className="relative my-2.5">
        {isSpeaking && (
          <span className="absolute -inset-1.5 rounded-full bg-emerald-400/40 dark:bg-emerald-500/30 animate-ping opacity-75 motion-reduce:hidden" />
        )}
        <img
          src={avatarUrl}
          alt={displayName}
          className={`w-16 h-16 rounded-full object-cover border-2 transition-all duration-200 shadow-md ${
            isSpeaking
              ? 'border-emerald-500 ring-4 ring-emerald-400/40 dark:ring-emerald-500/30 scale-105'
              : isInVoice
              ? 'border-emerald-400 dark:border-emerald-600'
              : 'border-slate-200 dark:border-slate-700 opacity-80'
          }`}
        />
      </div>

      {/* Speaker Information */}
      <div className="text-center w-full">
        <h2 className="text-sm font-bold text-slate-900 dark:text-white truncate">
          {displayName}
        </h2>
        {participant.username && participant.username !== displayName && (
          <p className="text-[10px] text-slate-400 dark:text-slate-500 truncate">
            @{participant.username}
          </p>
        )}
        <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center justify-center gap-1.5 mt-1">
          <span className="inline-flex items-center gap-0.5">
            <Globe className="w-3 h-3 text-slate-400" />
            {participant.country || 'Global'}
          </span>
          <span aria-hidden="true" className="text-slate-300 dark:text-slate-700">·</span>
          <span className="font-medium text-slate-600 dark:text-slate-300">
            {participant.englishLevel || 'Intermediate'}
          </span>
        </div>
      </div>
    </motion.div>
  );
};
