import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useUser } from '../hooks/useUser';
import { useRooms } from '../hooks/useRooms';
import { RoomCard } from '../components/rooms/RoomCard';
import { Button } from '../components/common/Button';
import {
  Flame,
  Clock,
  Radio,
  Plus,
  Award,
  Globe,
  ArrowRight,
  Sparkles,
  Loader2,
} from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const { user: authUser } = useAuth();
  const { profile: mongoProfile } = useUser();
  const user = mongoProfile || authUser;

  // Fetch real rooms from MongoDB
  const { data: roomsResponse, isLoading: loadingRooms } = useRooms({
    englishLevel: user?.englishLevel !== 'Beginner' ? user?.englishLevel : undefined,
    limit: 3,
  });

  const recommendedRooms = roomsResponse?.data || [];

  return (
    <div className="py-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
      {/* Profile Incomplete Banner (if applicable) */}
      {user && user.isProfileComplete === false && (
        <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 text-amber-900 dark:text-amber-200 text-xs sm:text-sm">
            <Sparkles className="w-5 h-5 text-amber-500 shrink-0" />
            <div>
              <p className="font-semibold">Your speaking profile is not fully complete yet!</p>
              <p className="text-amber-700/80 dark:text-amber-300/80 text-xs">
                Set your speaking goals and native language to get matched with the best conversation partners.
              </p>
            </div>
          </div>
          <Link to="/profile/setup" className="shrink-0 w-full sm:w-auto">
            <Button size="sm" variant="primary" className="w-full text-xs">
              Complete Profile Setup
            </Button>
          </Link>
        </div>
      )}

      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 rounded-2xl p-6 sm:p-8 text-white relative overflow-hidden shadow-sm">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-indigo-300">
              Personalized Practice Hub
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Welcome back, {user?.name || 'Fellow Speaker'}! 👋
            </h1>
            <p className="text-sm text-indigo-100/90 max-w-xl">
              Ready for your daily practice? You have a <strong>{user?.currentStreak || 1}-day consistency streak</strong>. Join a live room to keep your momentum going!
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <Link to="/rooms/create">
              <Button size="md" className="bg-white text-slate-900 hover:bg-slate-100 font-semibold" leftIcon={<Plus className="w-4 h-4 text-indigo-600" />}>
                Host a Room
              </Button>
            </Link>
            <Link to="/rooms">
              <Button variant="outline" size="md" className="border-indigo-400/40 text-white hover:bg-white/10" leftIcon={<Radio className="w-4 h-4 text-emerald-400" />}>
                Quick Join
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Speaking Streak</span>
            <Flame className="w-4 h-4 text-amber-500 fill-amber-500" />
          </div>
          <p className="text-2xl font-extrabold text-slate-900 dark:text-white">
            {user?.currentStreak || 1} <span className="text-xs font-normal text-slate-500">days</span>
          </p>
          <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
            Personal best: {user?.longestStreak || 1} days
          </span>
        </div>

        <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Spoken Minutes</span>
            <Clock className="w-4 h-4 text-indigo-500" />
          </div>
          <p className="text-2xl font-extrabold text-slate-900 dark:text-white">
            {user?.speakingMinutes || 0} <span className="text-xs font-normal text-slate-500">mins</span>
          </p>
          <span className="text-[11px] text-slate-500">
            ~{((user?.speakingMinutes || 0) / 60).toFixed(1)} hours active vocalization
          </span>
        </div>

        <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Completed Sessions</span>
            <Award className="w-4 h-4 text-purple-500" />
          </div>
          <p className="text-2xl font-extrabold text-slate-900 dark:text-white">
            {user?.speakingSessions || 0} <span className="text-xs font-normal text-slate-500">rooms</span>
          </p>
          <span className="text-[11px] text-slate-500">Consistent learner</span>
        </div>

        <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Level & Goal</span>
            <Globe className="w-4 h-4 text-teal-500" />
          </div>
          <p className="text-base font-bold text-slate-900 dark:text-white truncate">
            {user?.englishLevel || 'Intermediate'}
          </p>
          <span className="text-[11px] text-indigo-600 dark:text-indigo-400 font-medium truncate block">
            {user?.learningGoals?.[0] || 'Daily conversation'}
          </span>
        </div>
      </div>

      {/* Recommended Rooms Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            Recommended Rooms for Your Level ({user?.englishLevel || 'Intermediate'})
          </h2>
          <Link to="/rooms" className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1">
            Browse all rooms <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {loadingRooms ? (
          <div className="py-12 flex justify-center items-center gap-2 text-slate-400 text-xs">
            <Loader2 className="w-5 h-5 animate-spin text-indigo-500" />
            <span>Finding matching speaking rooms...</span>
          </div>
        ) : recommendedRooms.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recommendedRooms.slice(0, 3).map((room) => (
              <RoomCard key={room.id} room={room} />
            ))}
          </div>
        ) : (
          <div className="text-center py-10 bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-800 p-6 space-y-3">
            <Radio className="w-8 h-8 text-slate-400 mx-auto" />
            <p className="text-xs text-slate-500">No rooms currently waiting for this level. Be the first to start one!</p>
            <Link to="/rooms/create">
              <Button size="sm" leftIcon={<Plus className="w-3.5 h-3.5" />}>
                Create Room
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};
