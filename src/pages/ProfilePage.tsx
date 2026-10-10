import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useUser } from '../hooks/useUser';
import { Button } from '../components/common/Button';
import { LevelTag } from '../components/common/LevelTag';
import { ProfileSkeleton } from '../components/common/ProfileSkeleton';
import {
  Flame,
  Clock,
  Award,
  Globe,
  Edit3,
  Languages,
  Target,
  Sparkles,
  Calendar,
  Shield,
} from 'lucide-react';

export const ProfilePage: React.FC = () => {
  const { user: authUser, loading: authLoading } = useAuth();
  const { profile: mongoProfile, isLoading: queryLoading } = useUser();

  const user = mongoProfile || authUser;
  const isLoading = (authLoading || queryLoading) && !user;

  if (isLoading) {
    return <ProfileSkeleton />;
  }

  const avatarUrl =
    user?.avatar ||
    user?.avatarUrl ||
    `https://api.dicebear.com/7.x/bottts/svg?seed=${user?.username || 'speaker'}`;

  const memberSince = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString('en-US', {
        month: 'short',
        year: 'numeric',
      })
    : '2026';

  return (
    <div className="py-8 sm:py-12 max-w-4xl mx-auto px-4 sm:px-6 space-y-8">
      {/* Profile Header Card */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-6 sm:p-8 space-y-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6">
          <div className="flex items-center gap-5">
            <img
              src={avatarUrl}
              alt={user?.name || 'User Avatar'}
              className="w-20 h-20 rounded-2xl border-2 border-indigo-500/80 bg-slate-100 dark:bg-slate-800 p-1 object-cover shadow-sm shrink-0"
            />
            <div className="space-y-1">
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">
                  {user?.name || 'SpeakMate Learner'}
                </h1>
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" title="Online now" />
                {user?.role && user.role !== 'user' && (
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
                    <Shield className="w-3 h-3" />
                    {user.role.toUpperCase()}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                @{user?.username || 'learner'}
              </p>
              <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400 pt-1 flex-wrap">
                <span className="flex items-center gap-1 font-medium">
                  <Globe className="w-3.5 h-3.5 text-indigo-500" />
                  {user?.country || 'Global'}
                </span>
                <span aria-hidden="true">·</span>
                <span className="flex items-center gap-1">
                  <Languages className="w-3.5 h-3.5 text-teal-500" />
                  Native: {user?.nativeLanguage || 'English'}
                </span>
                <span aria-hidden="true">·</span>
                <LevelTag level={user?.englishLevel || 'Intermediate'} />
              </div>
            </div>
          </div>

          <Link to="/profile/edit">
            <Button variant="outline" size="sm" leftIcon={<Edit3 className="w-4 h-4" />}>
              Edit Profile
            </Button>
          </Link>
        </div>

        {/* Bio and Learning Goals */}
        <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800">
          <div>
            <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
              About Me
            </h2>
            <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
              {user?.bio || 'Ready to join speaking rooms and practice natural English daily.'}
            </p>
          </div>

          {user?.learningGoals && user.learningGoals.length > 0 && (
            <div>
              <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                Speaking Goals
              </h2>
              <div className="flex flex-wrap gap-1.5">
                {user.learningGoals.map((goal, idx) => (
                  <span
                    key={idx}
                    className="text-xs font-medium text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-200/60 dark:border-indigo-900/40 px-2.5 py-1 rounded-md"
                  >
                    {goal}
                  </span>
                ))}
              </div>
            </div>
          )}

          {user?.interests && user.interests.length > 0 && (
            <div>
              <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                Conversation Topics & Interests
              </h2>
              <div className="flex flex-wrap gap-1.5">
                {user.interests.map((item, idx) => (
                  <span
                    key={idx}
                    className="text-xs text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-md"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="pt-2 flex items-center gap-2 text-xs text-slate-400">
            <Calendar className="w-3.5 h-3.5" />
            <span>Member since {memberSince}</span>
          </div>
        </div>
      </div>

      {/* Fluency & Streak Statistics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Current Streak</span>
            <Flame className="w-4 h-4 text-amber-500 fill-amber-500" />
          </div>
          <p className="text-3xl font-extrabold text-slate-900 dark:text-white">
            {user?.currentStreak || 1} <span className="text-xs font-normal text-slate-500">days</span>
          </p>
          <span className="text-[11px] text-emerald-600 font-medium">
            Best: {user?.longestStreak || 1} days
          </span>
        </div>

        <div className="p-5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Speaking Time</span>
            <Clock className="w-4 h-4 text-indigo-500" />
          </div>
          <p className="text-3xl font-extrabold text-slate-900 dark:text-white">
            {user?.speakingMinutes || 0} <span className="text-xs font-normal text-slate-500">mins</span>
          </p>
          <span className="text-[11px] text-slate-500">
            {((user?.speakingMinutes || 0) / 60).toFixed(1)} Spoken Hours
          </span>
        </div>

        <div className="p-5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Rooms Joined</span>
            <Award className="w-4 h-4 text-purple-500" />
          </div>
          <p className="text-3xl font-extrabold text-slate-900 dark:text-white">
            {user?.speakingSessions || 0} <span className="text-xs font-normal text-slate-500">sessions</span>
          </p>
          <span className="text-[11px] text-slate-500">Active speaker</span>
        </div>

        <div className="p-5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Primary Focus</span>
            <Target className="w-4 h-4 text-teal-500" />
          </div>
          <p className="text-sm font-bold text-slate-900 dark:text-white pt-1 truncate">
            {user?.learningGoals?.[0] || 'Daily conversation'}
          </p>
          <span className="text-[11px] text-slate-500">Fluency target</span>
        </div>
      </div>
    </div>
  );
};
