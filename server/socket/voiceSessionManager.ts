/**
 * In-Memory Voice Session Manager for SpeakMate WebRTC Mesh
 * Manages active voice participants per room with a strict maximum limit of 5.
 */

export interface VoiceParticipant {
  userId: string;
  uid?: string;
  socketId: string;
  username: string;
  displayName: string;
  photoURL?: string;
  isMuted: boolean;
  isSpeaking: boolean;
  joinedAt: string;
}

export const MAX_VOICE_PARTICIPANTS = 5;

export class VoiceSessionManager {
  // Map of roomId -> Map of userId -> VoiceParticipant
  private voiceRooms: Map<string, Map<string, VoiceParticipant>> = new Map();

  // Map of socketId -> { roomId, userId }
  private socketIndex: Map<string, { roomId: string; userId: string }> = new Map();

  /**
   * Get all active voice participants in a room
   */
  getVoiceParticipants(roomId: string): VoiceParticipant[] {
    const room = this.voiceRooms.get(roomId);
    if (!room) return [];
    return Array.from(room.values());
  }

  /**
   * Get count of current voice participants in a room
   */
  getVoiceCount(roomId: string): number {
    const room = this.voiceRooms.get(roomId);
    return room ? room.size : 0;
  }

  /**
   * Get a specific participant in a voice room (matches by userId, uid, or socketId)
   */
  getVoiceParticipant(roomId: string, targetUserId: string): VoiceParticipant | undefined {
    const room = this.voiceRooms.get(roomId);
    if (!room) return undefined;
    
    // Direct key check
    const direct = room.get(targetUserId);
    if (direct) return direct;

    // Scan for uid or socketId match
    for (const p of room.values()) {
      if (p.userId === targetUserId || p.uid === targetUserId || p.socketId === targetUserId) {
        return p;
      }
    }
    return undefined;
  }

  /**
   * Check if a user is actively connected to voice in a room
   */
  isUserInVoice(roomId: string, userId: string): boolean {
    const room = this.voiceRooms.get(roomId);
    if (!room) return false;
    if (room.has(userId)) return true;
    for (const p of room.values()) {
      if (p.userId === userId || p.uid === userId || p.socketId === userId) {
        return true;
      }
    }
    return false;
  }

  /**
   * Add a participant to the voice session.
   * Strictly enforces MAX_VOICE_PARTICIPANTS = 5.
   */
  addVoiceParticipant(
    roomId: string,
    participant: VoiceParticipant
  ): { success: boolean; code?: string; message?: string; participant?: VoiceParticipant } {
    let room = this.voiceRooms.get(roomId);
    if (!room) {
      room = new Map();
      this.voiceRooms.set(roomId, room);
    }

    // Check if user is already in voice session (by userId or uid)
    let existingKey: string | null = null;
    if (room.has(participant.userId)) {
      existingKey = participant.userId;
    } else {
      for (const [key, p] of room.entries()) {
        if (
          p.userId === participant.userId ||
          (participant.uid && p.uid === participant.uid) ||
          p.socketId === participant.socketId
        ) {
          existingKey = key;
          break;
        }
      }
    }

    if (existingKey) {
      const existing = room.get(existingKey)!;
      // Update socket ID if reconnected
      if (existing.socketId !== participant.socketId) {
        this.socketIndex.delete(existing.socketId);
      }
      existing.socketId = participant.socketId;
      existing.isMuted = participant.isMuted;
      if (participant.uid) existing.uid = participant.uid;
      this.socketIndex.set(participant.socketId, { roomId, userId: existing.userId });
      return { success: true, participant: existing };
    }

    // Check maximum voice limit
    if (room.size >= MAX_VOICE_PARTICIPANTS) {
      return {
        success: false,
        code: 'VOICE_ROOM_FULL',
        message: 'This voice room is full. Maximum 5 participants are allowed.',
      };
    }

    room.set(participant.userId, participant);
    this.socketIndex.set(participant.socketId, { roomId, userId: participant.userId });

    return { success: true, participant };
  }

  /**
   * Remove a user from a voice session by roomId and userId
   */
  removeVoiceParticipant(roomId: string, userId: string): VoiceParticipant | undefined {
    const room = this.voiceRooms.get(roomId);
    if (!room) return undefined;

    let targetKey = userId;
    let participant = room.get(targetKey);

    if (!participant) {
      for (const [key, p] of room.entries()) {
        if (p.userId === userId || p.uid === userId || p.socketId === userId) {
          targetKey = key;
          participant = p;
          break;
        }
      }
    }

    if (participant) {
      room.delete(targetKey);
      this.socketIndex.delete(participant.socketId);
      if (room.size === 0) {
        this.voiceRooms.delete(roomId);
      }
    }

    return participant;
  }

  /**
   * Handle socket disconnect: lookup user and remove from active voice session
   */
  removeSocket(socketId: string): { roomId: string; participant: VoiceParticipant } | undefined {
    const info = this.socketIndex.get(socketId);
    if (!info) return undefined;

    const { roomId, userId } = info;
    const participant = this.removeVoiceParticipant(roomId, userId);

    if (participant) {
      return { roomId, participant };
    }
    return undefined;
  }

  /**
   * Update participant state (e.g., isMuted, isSpeaking)
   */
  updateVoiceParticipant(
    roomId: string,
    userId: string,
    updates: Partial<VoiceParticipant>
  ): VoiceParticipant | undefined {
    const participant = this.getVoiceParticipant(roomId, userId);
    if (!participant) return undefined;

    Object.assign(participant, updates);
    return participant;
  }
}

export const voiceSessionManager = new VoiceSessionManager();
