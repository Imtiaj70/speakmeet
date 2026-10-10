import React from 'react';
import { Link } from 'react-router-dom';
import { useRooms } from '../../hooks/useRooms';
import { RoomCard } from '../rooms/RoomCard';
import { Plus, ArrowRight, Loader2, Sparkles } from 'lucide-react';
import { Button } from '../common/Button';

export const LiveRoomsSection: React.FC = () => {
  const { data: roomsResponse, isLoading } = useRooms({ limit: 6 });
  const liveRooms = roomsResponse?.data || [];

  return (
    <section className="py-16 sm:py-24 bg-white dark:bg-slate-950 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 mb-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Happening Now</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Live Language Speaking Lounges
            </h2>
            <p className="text-base text-slate-600 dark:text-slate-400 mt-2 max-w-xl">
              Global learners are practicing right now. Pick an open microphone or sit in as a listener to warm up.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link to="/rooms/create">
              <Button variant="outline" size="sm" leftIcon={<Plus className="w-4 h-4" />}>
                Host a Room
              </Button>
            </Link>
            <Link to="/rooms">
              <Button variant="primary" size="sm" rightIcon={<ArrowRight className="w-4 h-4" />}>
                Browse All Rooms
              </Button>
            </Link>
          </div>
        </div>

        {/* Live Rooms Grid */}
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
          </div>
        ) : liveRooms.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {liveRooms.slice(0, 6).map((room) => (
              <RoomCard key={room.id} room={room} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 px-4 rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
            <div className="inline-flex p-3 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 mb-3">
              <Sparkles className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">No active rooms at the moment</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-md mx-auto">
              Be the first to open a speaking room and invite other learners to practice conversational English!
            </p>
            <div className="mt-5">
              <Link to="/rooms/create">
                <Button variant="primary" size="sm" leftIcon={<Plus className="w-4 h-4" />}>
                  Create the First Room
                </Button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
