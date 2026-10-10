/**
 * SpeakMate In-Memory Room Presence Manager
 * Tracks live socket connections per user per room to support multi-tab/device sessions
 * without modifying persistent database membership on temporary disconnects.
 */

export interface SocketDisconnectionEvent {
  roomId: string;
  userId: string;
  wasLastSocket: boolean;
}

export class PresenceManager {
  // Map of roomId -> Map of userId -> Set of socketIds
  private roomUsers: Map<string, Map<string, Set<string>>> = new Map();

  // Map of socketId -> { userId, roomIds }
  private socketInfo: Map<string, { userId: string; roomIds: Set<string> }> = new Map();

  /**
   * Register a user's socket joining a room.
   * Returns whether this is the first active socket for this user in the room.
   */
  joinRoom(
    socketId: string,
    userId: string,
    roomId: string
  ): { isFirstSocketInRoom: boolean } {
    // 1. Update socketInfo
    let info = this.socketInfo.get(socketId);
    if (!info) {
      info = { userId, roomIds: new Set() };
      this.socketInfo.set(socketId, info);
    }
    info.roomIds.add(roomId);

    // 2. Update roomUsers
    let usersMap = this.roomUsers.get(roomId);
    if (!usersMap) {
      usersMap = new Map();
      this.roomUsers.set(roomId, usersMap);
    }

    let sockets = usersMap.get(userId);
    let isFirstSocketInRoom = false;

    if (!sockets) {
      sockets = new Set();
      usersMap.set(userId, sockets);
      isFirstSocketInRoom = true;
    } else if (sockets.size === 0) {
      isFirstSocketInRoom = true;
    }

    sockets.add(socketId);

    return { isFirstSocketInRoom };
  }

  /**
   * Explicitly leave a room from a socket.
   */
  leaveRoom(
    socketId: string,
    roomId: string
  ): { userId?: string; wasLastSocketInRoom: boolean } {
    const info = this.socketInfo.get(socketId);
    if (!info) {
      return { wasLastSocketInRoom: false };
    }

    info.roomIds.delete(roomId);
    const userId = info.userId;

    const usersMap = this.roomUsers.get(roomId);
    if (!usersMap) {
      return { userId, wasLastSocketInRoom: false };
    }

    const sockets = usersMap.get(userId);
    let wasLastSocketInRoom = false;

    if (sockets) {
      sockets.delete(socketId);
      if (sockets.size === 0) {
        usersMap.delete(userId);
        wasLastSocketInRoom = true;
      }
    }

    if (usersMap.size === 0) {
      this.roomUsers.delete(roomId);
    }

    return { userId, wasLastSocketInRoom };
  }

  /**
   * Handle socket disconnection across all rooms the socket was in.
   * Returns an array of rooms where this user had their last socket removed.
   */
  handleDisconnect(socketId: string): SocketDisconnectionEvent[] {
    const info = this.socketInfo.get(socketId);
    if (!info) {
      return [];
    }

    const { userId, roomIds } = info;
    const events: SocketDisconnectionEvent[] = [];

    for (const roomId of roomIds) {
      const usersMap = this.roomUsers.get(roomId);
      if (!usersMap) continue;

      const sockets = usersMap.get(userId);
      let wasLastSocket = false;

      if (sockets) {
        sockets.delete(socketId);
        if (sockets.size === 0) {
          usersMap.delete(userId);
          wasLastSocket = true;
        }
      }

      if (usersMap.size === 0) {
        this.roomUsers.delete(roomId);
      }

      events.push({
        roomId,
        userId,
        wasLastSocket,
      });
    }

    this.socketInfo.delete(socketId);
    return events;
  }

  /**
   * Check whether a user has at least one active socket connected to a room.
   */
  isUserLiveInRoom(userId: string, roomId: string): boolean {
    const usersMap = this.roomUsers.get(roomId);
    if (!usersMap) return false;
    const sockets = usersMap.get(userId);
    return !!(sockets && sockets.size > 0);
  }

  /**
   * Get all userIds currently live in a given room.
   */
  getLiveUserIdsInRoom(roomId: string): string[] {
    const usersMap = this.roomUsers.get(roomId);
    if (!usersMap) return [];
    const activeUserIds: string[] = [];
    for (const [userId, sockets] of usersMap.entries()) {
      if (sockets.size > 0) {
        activeUserIds.push(userId);
      }
    }
    return activeUserIds;
  }

  /**
   * Total number of live sockets in a room.
   */
  /**
   * Total number of live sockets in a room.
   */
  getRoomSocketCount(roomId: string): number {
    const usersMap = this.roomUsers.get(roomId);
    if (!usersMap) return 0;
    let count = 0;
    for (const sockets of usersMap.values()) {
      count += sockets.size;
    }
    return count;
  }

  /**
   * Total number of live sockets across the entire server.
   */
  getTotalSockets(): number {
    return this.socketInfo.size;
  }
}

export const presenceManager = new PresenceManager();
