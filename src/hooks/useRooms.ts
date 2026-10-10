import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { roomApi, GetRoomsParams, CreateRoomPayload } from '../services/roomApi';
import { SpeakingRoom, RoomParticipant } from '../types';

export function useRooms(params?: GetRoomsParams) {
  return useQuery<{
    data: SpeakingRoom[];
    pagination: { page: number; limit: number; total: number; totalPages: number };
  }>({
    queryKey: ['rooms', params],
    queryFn: () => roomApi.getRooms(params),
    staleTime: 1000 * 15, // 15 seconds
  });
}

export function useRoom(id?: string) {
  return useQuery<SpeakingRoom | null>({
    queryKey: ['room', id],
    queryFn: () => (id ? roomApi.getRoomById(id) : Promise.resolve(null)),
    enabled: !!id,
    staleTime: 1000 * 10,
  });
}

export function useRoomParticipants(roomId?: string) {
  return useQuery<RoomParticipant[]>({
    queryKey: ['roomParticipants', roomId],
    queryFn: () => (roomId ? roomApi.getRoomParticipants(roomId) : Promise.resolve([])),
    enabled: !!roomId,
    staleTime: 1000 * 30, // Real-time Socket.IO pushes live changes directly into query cache
  });
}

export function useCreateRoom() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateRoomPayload) => roomApi.createRoom(payload),
    onSuccess: (newRoom) => {
      queryClient.invalidateQueries({ queryKey: ['rooms'] });
      queryClient.setQueryData(['room', newRoom.id], newRoom);
    },
  });
}

export function useJoinRoom() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (roomId: string) => roomApi.joinRoom(roomId),
    onSuccess: (result, roomId) => {
      queryClient.invalidateQueries({ queryKey: ['rooms'] });
      queryClient.invalidateQueries({ queryKey: ['room', roomId] });
      queryClient.invalidateQueries({ queryKey: ['roomParticipants', roomId] });
    },
  });
}

export function useLeaveRoom() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (roomId: string) => roomApi.leaveRoom(roomId),
    onSuccess: (_, roomId) => {
      queryClient.invalidateQueries({ queryKey: ['rooms'] });
      queryClient.invalidateQueries({ queryKey: ['room', roomId] });
      queryClient.invalidateQueries({ queryKey: ['roomParticipants', roomId] });
    },
  });
}

export function useUpdateRoom() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ roomId, data }: { roomId: string; data: Partial<CreateRoomPayload> }) =>
      roomApi.updateRoom(roomId, data),
    onSuccess: (updatedRoom, { roomId }) => {
      queryClient.invalidateQueries({ queryKey: ['rooms'] });
      queryClient.setQueryData(['room', roomId], updatedRoom);
    },
  });
}

export function useCloseRoom() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (roomId: string) => roomApi.closeRoom(roomId),
    onSuccess: (_, roomId) => {
      queryClient.invalidateQueries({ queryKey: ['rooms'] });
      queryClient.invalidateQueries({ queryKey: ['room', roomId] });
    },
  });
}
