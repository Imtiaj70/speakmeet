import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { AnimatePresence } from 'motion/react';
import { Button } from '../components/common/Button';
import { LevelTag } from '../components/common/LevelTag';
import { ParticipantCard } from '../components/room/ParticipantCard';
import { ConnectionStatusBadge } from '../components/room/ConnectionStatusBadge';
import { RemoteAudio } from '../components/room/RemoteAudio';
import { MicLevelMeter } from '../components/room/MicLevelMeter';
import { ScreenShareStage } from '../components/room/ScreenShareStage';
import { playTestChime } from '../utils/audioTest';
import { isSoundEnabled, setSoundEnabled, playHandRaiseSound } from '../utils/roomSounds';
import {
  Mic,
  MicOff,
  PhoneOff,
  Users,
  Hand,
  ShieldAlert,
  HelpCircle,
  Clock,
  Copy,
  Check,
  Radio,
  Loader2,
  LogIn,
  AlertCircle,
  Database,
  Trash2,
  ArrowLeft,
  Volume2,
  Headphones,
  Info,
  Monitor,
  Lock,
  Unlock,
  Bell,
  BellOff,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import {
  useRoom,
  useRoomParticipants,
  useJoinRoom,
  useLeaveRoom,
  useCloseRoom,
} from '../hooks/useRooms';
import { useTopic } from '../hooks/useTopics';
import { useRoomSocket } from '../hooks/useRoomSocket';
import { useVoiceRoom } from '../hooks/useVoiceRoom';
import { AdBanner } from '../components/ads/AdBanner';
import { IcebreakerCard } from '../components/rooms/IcebreakerCard';
import { OpenStageSeat } from '../components/room/OpenStageSeat';
import { AudioWaveVisualizer } from '../components/room/AudioWaveVisualizer';
import { FloatingReactions } from '../components/room/FloatingReactions';

export const VoiceRoomPreviewPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();

  const [handRaised, setHandRaised] = useState(false);
  const [secondsElapsed, setSecondsElapsed] = useState(0);
  const [copiedLink, setCopiedLink] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [soundEffectsOn, setSoundEffectsOn] = useState(() => isSoundEnabled());

  // TanStack Query hooks for persistent REST data
  const {
    data: queryRoom,
    isLoading: loadingRoom,
    isError: roomError,
    refetch: refetchRoom,
  } = useRoom(id);

  const {
    data: queryParticipants = [],
    isLoading: loadingParticipants,
    refetch: refetchParticipants,
  } = useRoomParticipants(id);

  const joinMutation = useJoinRoom();
  const leaveMutation = useLeaveRoom();
  const closeMutation = useCloseRoom();

  // Socket.IO real-time hook for room state & presence
  const {
    room: socketRoom,
    participants: socketParticipants,
    isConnected,
    isReconnecting,
    isClosed: socketClosed,
    error: socketError,
    activeScreenShare,
    joinRoom: socketJoinRoom,
    leaveRoom: socketLeaveRoom,
    toggleLock: socketToggleLock,
  } = useRoomSocket(id);

  // WebRTC Voice Chat Hook (Mesh architecture, max 5 participants)
  const {
    isVoiceJoined,
    isConnecting: isVoiceConnecting,
    isMuted: isVoiceMuted,
    isSpeaking: isLocalSpeaking,
    localStream,
    remoteStreams,
    isScreenSharing,
    screenStream,
    voiceParticipants,
    error: voiceError,
    joinVoice,
    leaveVoice,
    toggleMute,
    startScreenShare,
    stopScreenShare,
    clearError: clearVoiceError,
  } = useVoiceRoom(id);

  // Authoritative merged room state (Socket.IO updates take precedence over initial REST snapshot)
  const room = socketRoom || queryRoom;
  const participants = socketParticipants.length > 0 ? socketParticipants : queryParticipants;

  // Try to load linked topic questions
  const { data: topicData } = useTopic(room?.topicId);

  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsElapsed((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTimer = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  // Check user participation status
  const currentUserId = user?.id || user?._id || user?.firebaseUid;
  const isParticipant = participants.some(
    (p) =>
      (currentUserId && (p.userId === currentUserId || p.userId === user?.firebaseUid)) ||
      (user?.username && p.username === user.username)
  );

  const isHost =
    (currentUserId && (room?.hostId === currentUserId || room?.hostId === user?.firebaseUid)) ||
    participants.some(
      (p) =>
        p.role === 'host' &&
        ((currentUserId && (p.userId === currentUserId || p.userId === user?.firebaseUid)) ||
          (user?.username && p.username === user.username))
    );

  const canCloseRoom = isHost || isAdmin || user?.role === 'admin';

  // Ambient speaker simulation for demo participants when user is listening
  const [simulatedSpeakerId, setSimulatedSpeakerId] = useState<string | null>(null);

  useEffect(() => {
    // Only simulate when user is not speaking and there are other participants
    if (isLocalSpeaking || participants.length <= 1) {
      setSimulatedSpeakerId(null);
      return;
    }

    const interval = setInterval(() => {
      const otherParticipants = participants.filter(
        (p) => p.userId !== currentUserId && p.userId !== user?.firebaseUid
      );
      if (otherParticipants.length > 0 && Math.random() > 0.3) {
        const randomSpeaker = otherParticipants[Math.floor(Math.random() * otherParticipants.length)];
        setSimulatedSpeakerId(randomSpeaker.userId);

        setTimeout(() => {
          setSimulatedSpeakerId(null);
        }, 4000);
      }
    }, 8500);

    return () => clearInterval(interval);
  }, [isLocalSpeaking, participants, currentUserId, user?.firebaseUid]);

  // Determine active speaker name and whether audio is active
  const activeSpeakerParticipant = participants.find((p) => p.userId === simulatedSpeakerId);
  const activeRemoteVoiceSpeaker = voiceParticipants.find((vp) => vp.isSpeaking);

  const activeSpeakerName = isLocalSpeaking
    ? (user?.name || user?.username || 'You')
    : activeRemoteVoiceSpeaker?.displayName ||
      activeRemoteVoiceSpeaker?.username ||
      activeSpeakerParticipant?.displayName ||
      activeSpeakerParticipant?.username;

  const isAnyoneSpeaking = Boolean(
    isLocalSpeaking ||
    activeRemoteVoiceSpeaker ||
    simulatedSpeakerId
  );

  const handleJoin = async () => {
    if (!id) return;
    setActionError(null);
    if (!user) {
      navigate('/login');
      return;
    }
    try {
      await joinMutation.mutateAsync(id);
      socketJoinRoom();
      refetchRoom();
      refetchParticipants();
    } catch (err: any) {
      console.error('Failed to join room:', err);
      setActionError(err.response?.data?.message || err.message || 'Failed to join speaking room');
    }
  };

  const handleLeave = async () => {
    if (!id) return;
    setActionError(null);
    try {
      // Clean up voice session if active
      if (isVoiceJoined) {
        leaveVoice();
      }
      try {
        await socketLeaveRoom();
      } catch {}

      try {
        await leaveMutation.mutateAsync(id);
      } catch (err: any) {
        console.warn('Leave room mutation handled:', err?.message);
      }
      navigate('/rooms');
    } catch (err: any) {
      console.warn('Proceeding to rooms despite leave notice:', err);
      navigate('/rooms');
    }
  };

  const handleCloseRoom = async () => {
    if (!id) return;
    if (
      !window.confirm(
        'Are you sure you want to end and close this speaking room for all participants?'
      )
    ) {
      return;
    }
    try {
      if (isVoiceJoined) {
        leaveVoice();
      }
      await closeMutation.mutateAsync(id);
      navigate('/rooms');
    } catch (err: any) {
      console.error('Failed to close room:', err);
      setActionError(err.response?.data?.message || err.message || 'Failed to close speaking room');
    }
  };

  if (loadingRoom && !room) {
    return (
      <div className="py-24 max-w-6xl mx-auto px-4 text-center space-y-4">
        <Loader2 className="w-10 h-10 text-indigo-600 animate-spin mx-auto" />
        <p className="text-sm text-slate-500 font-medium">Entering speaking room...</p>
      </div>
    );
  }

  if (roomError || !room) {
    return (
      <div className="py-20 max-w-lg mx-auto px-4 text-center space-y-4">
        <AlertCircle className="w-12 h-12 text-rose-500 mx-auto" />
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Speaking Room Not Found</h2>
        <p className="text-xs text-slate-500">
          This room may have been closed by the host or the link has expired.
        </p>
        <Link to="/rooms">
          <Button variant="outline" size="sm">
            Browse Active Rooms
          </Button>
        </Link>
      </div>
    );
  }

  const isClosed = room.status === 'closed' || socketClosed;
  const currentCount = room.participantCount ?? participants.length;
  const maxCapacity = room.maxParticipants || 6;
  const isFull = currentCount >= maxCapacity;

  // Voice session capacity (Max 5 speakers)
  const currentVoiceCount = (isVoiceJoined ? 1 : 0) + voiceParticipants.length;
  const isVoiceFull = currentVoiceCount >= 5;

  const discussionQuestions =
    topicData?.questions && topicData.questions.length > 0
      ? topicData.questions
      : [
          'What motivated you to practice speaking English today?',
          'What is a memorable experience or story related to this topic in your life?',
          'If you could share one piece of advice with other English learners, what would it be?',
        ];

  return (
    <div className="py-6 max-w-6xl mx-auto px-4 sm:px-6 space-y-6">
      {/* Hidden audio elements for all remote WebRTC peer audio streams */}
      <div aria-hidden="true" className="sr-only">
        {Array.from(remoteStreams.entries()).map(([peerId, stream]) => (
          <RemoteAudio key={peerId} peerId={peerId} stream={stream} />
        ))}
      </div>

      {/* Real-time sync & Phase 5 WebRTC notification banner */}
      <div className="rounded-xl border border-indigo-100 dark:border-indigo-900/40 bg-indigo-50/70 dark:bg-indigo-950/20 p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2.5 text-indigo-900 dark:text-indigo-200">
          <Volume2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span>
            WebRTC Voice Chat Active: Multi-user audio mesh (max 5 simultaneous speakers) with real-time speaking detection.
          </span>
        </div>
        <div className="flex items-center gap-2">
          <ConnectionStatusBadge
            isConnected={isConnected}
            isReconnecting={isReconnecting}
          />
        </div>
      </div>

      {/* Room Locked Notice Banner */}
      {room?.isLocked && !isClosed && (
        <div className="rounded-xl border border-amber-200/80 dark:border-amber-900/60 bg-amber-50 dark:bg-amber-950/40 p-3.5 flex flex-wrap items-center justify-between gap-3 text-xs text-amber-900 dark:text-amber-200">
          <div className="flex items-center gap-2.5">
            <div className="p-1 rounded-md bg-amber-200 dark:bg-amber-900/60 text-amber-800 dark:text-amber-200">
              <Lock className="w-3.5 h-3.5" />
            </div>
            <div>
              <span className="font-bold">Room Locked by Host:</span>{' '}
              <span className="text-amber-800 dark:text-amber-300">
                New learners cannot enter. The session is closed for private practice.
              </span>
            </div>
          </div>
          {isHost && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => socketToggleLock(false)}
              className="border-amber-300 dark:border-amber-700 text-amber-800 dark:text-amber-200 text-xs py-1 h-auto shrink-0"
              leftIcon={<Unlock className="w-3.5 h-3.5" />}
            >
              Unlock Room
            </Button>
          )}
        </div>
      )}

      {/* Closed room overlay / notice */}
      {isClosed && (
        <div className="rounded-2xl border border-rose-200 dark:border-rose-900/60 bg-rose-50/90 dark:bg-rose-950/40 p-6 text-center space-y-3">
          <AlertCircle className="w-8 h-8 text-rose-600 dark:text-rose-400 mx-auto" />
          <h2 className="text-lg font-bold text-rose-900 dark:text-rose-200">
            This Speaking Room Has Ended
          </h2>
          <p className="text-xs text-rose-700 dark:text-rose-400 max-w-md mx-auto">
            The host has ended this room or all participants left. You can browse other active rooms to continue speaking.
          </p>
          <div className="pt-2">
            <Link to="/rooms">
              <Button variant="primary" size="sm" leftIcon={<ArrowLeft className="w-4 h-4" />}>
                Back to All Rooms
              </Button>
            </Link>
          </div>
        </div>
      )}

      {/* Action / Socket / Voice Error Banner */}
      {(actionError || socketError || voiceError) && (
        <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 flex items-start justify-between gap-2.5 text-xs text-rose-700 dark:text-rose-400">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{actionError || socketError?.message || voiceError?.message}</span>
          </div>
          {voiceError && (
            <button
              onClick={clearVoiceError}
              className="text-[11px] font-semibold text-rose-600 hover:underline shrink-0"
            >
              Dismiss
            </button>
          )}
        </div>
      )}

      {/* Room Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500 mb-1 flex-wrap">
            <span className="font-semibold text-slate-800 dark:text-slate-200">
              {room.topicTitle || room.topic}
            </span>
            <span aria-hidden="true">·</span>
            <LevelTag level={room.englishLevel} />
            <span aria-hidden="true">·</span>
            {isClosed ? (
              <span className="text-rose-500 font-semibold">Closed</span>
            ) : (
              <span className="text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Live ({participants.length}/{maxCapacity} participants)
              </span>
            )}
          </div>

          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white">
            {room.name}
          </h1>
          {room.description && (
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-2xl">
              {room.description}
            </p>
          )}
        </div>

        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
          <div className="flex items-center gap-1.5 font-mono text-xs px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
            <Clock className="w-3.5 h-3.5 text-indigo-500" />
            <span>{formatTimer(secondsElapsed)}</span>
          </div>

          <button
            onClick={handleCopyLink}
            aria-label="Copy room invite link"
            className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors"
            title="Copy Invite Link"
          >
            {copiedLink ? (
              <Check className="w-4 h-4 text-emerald-500" />
            ) : (
              <Copy className="w-4 h-4" />
            )}
          </button>

          {/* Join / Leave / Close Room Buttons */}
          {!isClosed && !isParticipant && (
            <Button
              variant="primary"
              size="sm"
              disabled={isFull || joinMutation.isPending}
              isLoading={joinMutation.isPending}
              onClick={handleJoin}
              leftIcon={<LogIn className="w-4 h-4" />}
            >
              {isFull ? 'Room Full' : 'Join Room'}
            </Button>
          )}

          {!isClosed && isParticipant && (
            <Button
              variant="danger"
              size="sm"
              disabled={leaveMutation.isPending}
              isLoading={leaveMutation.isPending}
              onClick={handleLeave}
              leftIcon={<PhoneOff className="w-4 h-4" />}
            >
              Leave Room
            </Button>
          )}

          {!isClosed && canCloseRoom && (
            <Button
              variant="outline"
              size="sm"
              disabled={closeMutation.isPending}
              isLoading={closeMutation.isPending}
              onClick={handleCloseRoom}
              className="text-rose-600 border-rose-200 hover:bg-rose-50 dark:border-rose-900/60 dark:hover:bg-rose-950/40"
              leftIcon={<Trash2 className="w-4 h-4 text-rose-500" />}
            >
              {isHost ? 'End Room' : 'End Room (Admin)'}
            </Button>
          )}
        </div>
      </div>

      {/* AdSense / Sponsor Banner in Voice Room */}
      <AdBanner placement="leaderboard" />

      {/* Main Grid: Speaker Stage & Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Speaker Seating Stage */}
        <div className="lg:col-span-2 space-y-4">
          {/* Seating Stage Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Radio className="w-4 h-4 text-emerald-500 animate-pulse" />
              <span>Speaking Stage</span>
              <span className="text-xs font-normal text-slate-400">
                ({participants.length}/{maxCapacity} attendees · {currentVoiceCount}/5 on voice)
              </span>
            </h2>

            <div className="flex items-center gap-2 text-xs text-slate-500">
              <span className="inline-flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                Live WebRTC Voice Mesh
              </span>
            </div>
          </div>

          {/* Dedicated Voice Chat Control Banner */}
          {!isClosed && isParticipant && (
            <div className="p-4 rounded-2xl border bg-slate-900 text-white dark:border-slate-800 shadow-md">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      Voice Stage (Max 5)
                    </span>
                    <span className="text-xs text-slate-400">
                      {currentVoiceCount} of 5 mic slots filled
                    </span>
                  </div>
                  <p className="text-xs text-slate-300">
                    {isVoiceJoined
                      ? 'You are live on microphone. Everyone in voice can hear you.'
                      : isVoiceFull
                      ? 'The voice stage has reached maximum capacity (5 speakers). You can listen in the room.'
                      : 'Join the live voice mesh to practice speaking with other attendees.'}
                  </p>
                </div>

                <div className="flex items-center gap-2.5 flex-wrap">
                  {!isVoiceJoined ? (
                    <Button
                      variant="primary"
                      size="md"
                      disabled={isVoiceConnecting || isVoiceFull}
                      isLoading={isVoiceConnecting}
                      onClick={joinVoice}
                      aria-label="Join voice chat"
                      className="bg-emerald-600 hover:bg-emerald-500 text-white border-0 shadow-lg shadow-emerald-600/20"
                      leftIcon={<Mic className="w-4 h-4" />}
                    >
                      {isVoiceConnecting
                        ? 'Connecting mic...'
                        : isVoiceFull
                        ? 'Voice Full (5/5)'
                        : 'Join Voice'}
                    </Button>
                  ) : (
                    <>
                      <Button
                        variant={isVoiceMuted ? 'danger' : 'secondary'}
                        size="md"
                        onClick={toggleMute}
                        aria-label={isVoiceMuted ? 'Unmute microphone' : 'Mute microphone'}
                        leftIcon={
                          isVoiceMuted ? (
                            <MicOff className="w-4 h-4" />
                          ) : (
                            <Mic className="w-4 h-4 text-emerald-400" />
                          )
                        }
                      >
                        {isVoiceMuted ? 'Unmute Mic' : 'Mute Mic'}
                      </Button>

                      <Button
                        variant="outline"
                        size="md"
                        onClick={leaveVoice}
                        aria-label="Leave voice chat"
                        className="text-slate-300 border-slate-700 hover:bg-slate-800"
                        leftIcon={<PhoneOff className="w-4 h-4 text-rose-400" />}
                      >
                        Leave Voice
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Active Screen Share Stage */}
          {(isScreenSharing || (activeScreenShare && activeScreenShare.isSharing)) && (
            <div className="mb-2">
              <ScreenShareStage
                stream={
                  isScreenSharing
                    ? screenStream
                    : activeScreenShare?.userId
                    ? remoteStreams.get(activeScreenShare.userId) || null
                    : null
                }
                presenterName={
                  isScreenSharing
                    ? (user?.name || user?.username || 'You')
                    : (activeScreenShare?.username || 'Speaker')
                }
                isLocalUser={isScreenSharing}
                onStopSharing={stopScreenShare}
              />
            </div>
          )}

          {/* Real-time Studio Audio Spectrum & Broadcast Visualizer */}
          <AudioWaveVisualizer
            isAnyoneSpeaking={isAnyoneSpeaking}
            speakerName={activeSpeakerName}
            isCurrentUserSpeaking={isLocalSpeaking}
            isVoiceConnected={isVoiceJoined}
          />

          {/* Seating Stage Container with Floating Reactions Layer */}
          <div className="relative rounded-3xl p-3 sm:p-4 bg-gradient-to-b from-slate-100/70 via-white to-slate-50 dark:from-slate-900/60 dark:via-slate-900/40 dark:to-slate-950/60 border border-slate-200/80 dark:border-slate-800/80 space-y-4 shadow-inner">
            {/* Seating Grid with Animated Participant Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4 relative z-10">
              <AnimatePresence mode="popLayout">
                {participants.map((p) => {
                  const isCurrentUser = Boolean(
                    (currentUserId && (p.userId === currentUserId || p.userId === user?.firebaseUid)) ||
                    (user?.username && p.username === user.username)
                  );
                  const participantIsHost = p.role === 'host' || room.hostId === p.userId;

                  // Voice status for this participant
                  const inVoice = isCurrentUser
                    ? isVoiceJoined
                    : voiceParticipants.some((vp) => vp.userId === p.userId);

                  const speaking = isCurrentUser
                    ? isLocalSpeaking
                    : voiceParticipants.find((vp) => vp.userId === p.userId)?.isSpeaking ||
                      simulatedSpeakerId === p.userId ||
                      false;

                  const muted = isCurrentUser
                    ? isVoiceMuted
                    : voiceParticipants.find((vp) => vp.userId === p.userId)?.isMuted || false;

                  return (
                    <ParticipantCard
                      key={p.userId || p._id}
                      participant={p}
                      isCurrentUser={isCurrentUser}
                      isHost={participantIsHost}
                      isInVoice={inVoice}
                      isSpeaking={speaking}
                      isMuted={muted}
                      isHandRaised={isCurrentUser ? handRaised : false}
                    />
                  );
                })}
              </AnimatePresence>

              {/* Animated Empty Stage Seats */}
              {Array.from({
                length: Math.max(0, maxCapacity - participants.length),
              }).map((_, i) => (
                <OpenStageSeat
                  key={`empty-seat-${i}`}
                  seatIndex={participants.length + i}
                  isParticipant={isParticipant}
                  isClosed={isClosed}
                  onJoin={handleJoin}
                />
              ))}
            </div>

            {/* Interactive Live Reaction Cannon */}
            <div className="relative z-20 pt-1">
              <FloatingReactions isAnyoneSpeaking={isAnyoneSpeaking} />
            </div>
          </div>

          {/* Bottom Audio & Speaking Helper Bar */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-2">
              {isVoiceJoined ? (
                <Button
                  variant={isVoiceMuted ? 'danger' : 'primary'}
                  size="md"
                  onClick={toggleMute}
                  aria-label={isVoiceMuted ? 'Unmute microphone' : 'Mute microphone'}
                  leftIcon={
                    isVoiceMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />
                  }
                >
                  {isVoiceMuted ? 'Unmute Mic' : 'Mute Mic'}
                </Button>
              ) : isParticipant ? (
                <Button
                  variant="primary"
                  size="md"
                  disabled={isVoiceConnecting || isVoiceFull}
                  onClick={joinVoice}
                  aria-label="Join voice chat"
                  leftIcon={<Mic className="w-4 h-4" />}
                >
                  {isVoiceConnecting ? 'Connecting...' : 'Join Voice Chat'}
                </Button>
              ) : null}

              {/* Screen Sharing Control */}
              {isVoiceJoined && (
                <Button
                  variant={isScreenSharing ? 'danger' : 'outline'}
                  size="md"
                  onClick={isScreenSharing ? stopScreenShare : startScreenShare}
                  aria-label={isScreenSharing ? 'Stop sharing screen' : 'Share your screen'}
                  leftIcon={<Monitor className="w-4 h-4" />}
                >
                  {isScreenSharing ? 'Stop Screen' : 'Share Screen'}
                </Button>
              )}

              {/* Host Room Lock Control */}
              {isHost && !isClosed && (
                <Button
                  variant={room?.isLocked ? 'danger' : 'outline'}
                  size="md"
                  onClick={() => socketToggleLock(!room?.isLocked)}
                  title={
                    room?.isLocked
                      ? 'Room is locked. Click to allow new learners to join.'
                      : 'Lock room to prevent new learners from entering.'
                  }
                  leftIcon={room?.isLocked ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
                >
                  {room?.isLocked ? 'Room Locked' : 'Lock Room'}
                </Button>
              )}

              <Button
                variant={handRaised ? 'primary' : 'outline'}
                size="md"
                disabled={!isParticipant || isClosed}
                onClick={() => {
                  const nextState = !handRaised;
                  setHandRaised(nextState);
                  if (nextState) playHandRaiseSound();
                }}
                aria-label={handRaised ? 'Lower hand' : 'Raise hand'}
                leftIcon={<Hand className="w-4 h-4" />}
              >
                {handRaised ? 'Hand Raised' : 'Raise Hand'}
              </Button>

              {/* Doorbell Sounds Toggle */}
              <button
                type="button"
                onClick={() => {
                  const next = !soundEffectsOn;
                  setSoundEffectsOn(next);
                  setSoundEnabled(next);
                }}
                className={`p-2.5 rounded-xl border transition-colors cursor-pointer flex items-center gap-1.5 text-xs font-semibold ${
                  soundEffectsOn
                    ? 'border-indigo-200 dark:border-indigo-800 bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300'
                    : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-400'
                }`}
                title={soundEffectsOn ? 'Doorbell audio enabled (chimes when learners enter/leave)' : 'Doorbell audio muted'}
              >
                {soundEffectsOn ? <Bell className="w-4 h-4" /> : <BellOff className="w-4 h-4" />}
                <span className="hidden sm:inline">{soundEffectsOn ? 'Chimes' : 'Muted'}</span>
              </button>
            </div>

            <div className="flex items-center gap-3 text-xs text-slate-500">
              {isVoiceJoined && (
                <MicLevelMeter stream={localStream} isMuted={isVoiceMuted} />
              )}
              <button
                type="button"
                onClick={() => playTestChime()}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-[11px] font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors cursor-pointer"
                title="Click to play a test sound through your speakers/headphones"
              >
                <Volume2 className="w-3.5 h-3.5 text-indigo-500" />
                <span>Test Audio</span>
              </button>
              <span className="hidden sm:inline-flex items-center gap-1 text-[11px] text-slate-400 border-l border-slate-200 dark:border-slate-800 pl-3">
                <Database className="w-3.5 h-3.5 text-indigo-400" />
                WebRTC Mesh HD Voice
              </span>
            </div>
          </div>

          {/* Solo Warm-up Banner when room has 1 participant */}
          {participants.length <= 1 && !isClosed && (
            <div className="p-3.5 rounded-2xl bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border border-amber-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-amber-900 dark:text-amber-200">
              <div className="flex items-center gap-2.5">
                <Sparkles className="w-4 h-4 text-amber-500 shrink-0 animate-pulse" />
                <span>
                  <strong>Solo Warm-Up Mode Active:</strong> You arrived early! Practice reading the conversation prompt below aloud for 60 seconds while other learners connect.
                </span>
              </div>
              <button
                type="button"
                onClick={handleCopyLink}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold shrink-0 text-xs shadow-xs transition-all active:scale-95 cursor-pointer"
              >
                {copiedLink ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedLink ? 'Link Copied!' : 'Invite a Friend'}</span>
              </button>
            </div>
          )}

          {/* Interactive Conversation Sparks / Icebreaker Deck (Positioned below the speaking stage) */}
          <IcebreakerCard />
        </div>

        {/* Right Sidebar: Discussion Questions & Rules */}
        <div className="space-y-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-5 space-y-4">
            <div className="flex items-center gap-2 text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
              <HelpCircle className="w-4 h-4" />
              <span>Discussion Questions</span>
            </div>

            <div className="space-y-2.5">
              {discussionQuestions.map((q, index) => (
                <div
                  key={index}
                  className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300 leading-relaxed"
                >
                  <span className="font-semibold text-indigo-600 dark:text-indigo-400 mr-1.5">
                    {index + 1}.
                  </span>
                  "{q}"
                </div>
              ))}
            </div>
          </div>

          {/* Quick Safety Box */}
          <div className="bg-slate-50 dark:bg-slate-900/60 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-4 space-y-2 text-xs text-slate-600 dark:text-slate-400">
            <span className="font-semibold text-slate-900 dark:text-white flex items-center gap-1.5">
              <ShieldAlert className="w-3.5 h-3.5 text-amber-500" /> Speaking Guidelines
            </span>
            <p className="text-[11px] leading-relaxed">
              Take turns speaking. Keep your microphone unmuted when actively conversing, or muted in noisy environments. Be encouraging and supportive of all language levels.
            </p>
          </div>
        </div>
      </div>

      {/* Mobile Floating Bottom Call Controls Bar (Clubhouse & Discord Mobile Style) */}
      {isVoiceJoined && (
        <div className="md:hidden fixed bottom-18 left-3 right-3 z-40 bg-slate-900/95 border border-slate-700/80 backdrop-blur-xl rounded-2xl p-2.5 px-4 shadow-2xl flex items-center justify-between animate-in slide-in-from-bottom-4 duration-200">
          {/* Mute Button */}
          <button
            type="button"
            onClick={toggleMute}
            className={`w-11 h-11 rounded-full flex items-center justify-center transition-all cursor-pointer ${
              isVoiceMuted
                ? 'bg-rose-600 text-white shadow-md shadow-rose-600/30'
                : 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
            }`}
            aria-label={isVoiceMuted ? 'Unmute microphone' : 'Mute microphone'}
          >
            {isVoiceMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </button>

          {/* Hand Raise */}
          <button
            type="button"
            onClick={() => {
              const nextState = !handRaised;
              setHandRaised(nextState);
              if (nextState) playHandRaiseSound();
            }}
            className={`w-11 h-11 rounded-full flex items-center justify-center transition-all cursor-pointer ${
              handRaised
                ? 'bg-amber-500 text-slate-950 font-bold'
                : 'bg-slate-800 text-slate-300'
            }`}
            aria-label="Raise hand"
          >
            <Hand className="w-5 h-5" />
          </button>

          {/* Test Audio Chime */}
          <button
            type="button"
            onClick={() => playTestChime()}
            className="w-11 h-11 rounded-full bg-slate-800 text-indigo-400 flex items-center justify-center cursor-pointer"
            title="Test audio"
          >
            <Volume2 className="w-5 h-5" />
          </button>

          {/* Leave Call */}
          <button
            type="button"
            onClick={handleLeave}
            className="w-11 h-11 rounded-full bg-rose-600/20 text-rose-400 border border-rose-500/40 flex items-center justify-center cursor-pointer"
            title="Leave speaking room"
          >
            <PhoneOff className="w-5 h-5" />
          </button>
        </div>
      )}
    </div>
  );
};
