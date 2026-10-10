import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { roomApi } from '../services/roomApi';
import { useAuth } from '../context/AuthContext';

export function useQuickMatch() {
  const [isMatching, setIsMatching] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();

  const triggerQuickMatch = async () => {
    if (isMatching) return;
    setIsMatching(true);

    try {
      // 1. Fetch fresh live rooms directly from API
      const response = await roomApi.getRooms({ limit: 50 });
      const rooms = response.data || [];

      // 2. Prioritize active rooms with participants & available seats
      const populated = rooms.filter((r) => {
        const count = r.participantCount ?? r.currentParticipants ?? 0;
        return (
          count > 0 &&
          count < (r.maxParticipants || 6) &&
          !r.isLocked &&
          r.status !== 'closed'
        );
      });

      if (populated.length > 0) {
        // Pick best active room
        const target = populated[0];
        const targetId = target.id || (target as any)._id;
        navigate(`/rooms/${targetId}`);
        return;
      }

      // 3. Fallback: Any open room with open seats
      const openRooms = rooms.filter((r) => {
        const count = r.participantCount ?? r.currentParticipants ?? 0;
        return (
          count < (r.maxParticipants || 6) &&
          !r.isLocked &&
          r.status !== 'closed'
        );
      });

      if (openRooms.length > 0) {
        const target = openRooms[0];
        const targetId = target.id || (target as any)._id;
        navigate(`/rooms/${targetId}`);
        return;
      }

      // 4. If no open rooms exist, auto-create an instant speaking lounge
      const newRoom = await roomApi.createRoom({
        name: '⚡ Quick Match: IELTS & Daily Fluency',
        topicId: 'general',
        description: 'Instant speaking lounge created by Quick Match. Jump in and practice English!',
        englishLevel: 'All Levels',
        maxParticipants: 5,
        visibility: 'public',
        language: 'English',
        hostName: user?.name || user?.username || 'Speaker Host',
        hostUsername: user?.username || 'user',
        hostAvatar: user?.avatar,
        hostCountry: user?.country || 'Global',
      });

      const newId = newRoom.id || (newRoom as any)._id;
      navigate(`/rooms/${newId}`);
    } catch (err) {
      console.error('[QuickMatch] Error connecting to room:', err);
      navigate('/rooms');
    } finally {
      setIsMatching(false);
    }
  };

  return { isMatching, triggerQuickMatch };
}
