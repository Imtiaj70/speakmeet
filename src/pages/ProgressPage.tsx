import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Flame, Clock, Award, Users, CheckCircle2, TrendingUp } from 'lucide-react';

export const ProgressPage: React.FC = () => {
  const { user } = useAuth();

  const achievements = [
    { title: 'First Conversation', desc: 'Completed your very first live voice room.', unlocked: true },
    { title: '10 Conversations', desc: 'Joined 10 distinct discussion rooms.', unlocked: true },
    { title: '1 Hour Speaking', desc: 'Accumulated 60 minutes of real spoken English.', unlocked: true },
    { title: '10 Hours Speaking', desc: 'Accumulated 600 minutes of active voice practice.', unlocked: true },
    { title: '7 Day Streak', desc: 'Practiced 7 consecutive days in a row.', unlocked: true },
    { title: '30 Day Streak', desc: 'Maintain a full monthly speaking habit.', unlocked: false },
    { title: 'Met 10 People', desc: 'Spoke with learners from 10 different countries.', unlocked: true },
    { title: 'Topic Explorer', desc: 'Explored conversations across 5 different topics.', unlocked: true },
  ];

  return (
    <div className="py-8 sm:py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
      <div>
        <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
          Fluency Metrics
        </span>
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight mt-1">
          Your Speaking Progress
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 max-w-2xl">
          Consistent vocal output builds subconscious fluency. Track your minutes, milestones, and consistency records.
        </p>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Total Speaking Time</span>
            <Clock className="w-4 h-4 text-indigo-500" />
          </div>
          <p className="text-3xl font-extrabold text-slate-900 dark:text-white">
            {user?.speakingMinutes || 890} <span className="text-xs font-normal text-slate-500">mins</span>
          </p>
          <span className="text-[11px] text-slate-500">+145 mins this week</span>
        </div>

        <div className="p-5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Daily Streak</span>
            <Flame className="w-4 h-4 text-amber-500 fill-amber-500" />
          </div>
          <p className="text-3xl font-extrabold text-slate-900 dark:text-white">
            {user?.currentStreak || 12} <span className="text-xs font-normal text-slate-500">days</span>
          </p>
          <span className="text-[11px] text-emerald-600 font-medium">Record: 21 days</span>
        </div>

        <div className="p-5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Rooms Joined</span>
            <Users className="w-4 h-4 text-purple-500" />
          </div>
          <p className="text-3xl font-extrabold text-slate-900 dark:text-white">
            {user?.speakingSessions || 42}
          </p>
          <span className="text-[11px] text-slate-500">Across 6 topic categories</span>
        </div>

        <div className="p-5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Fluency Score</span>
            <TrendingUp className="w-4 h-4 text-teal-500" />
          </div>
          <p className="text-3xl font-extrabold text-slate-900 dark:text-white">
            Level B2
          </p>
          <span className="text-[11px] text-indigo-600 dark:text-indigo-400 font-medium">Approaching C1 Fluency</span>
        </div>
      </div>

      {/* Badges & Achievements Grid */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-6 sm:p-8 space-y-6">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            Fluency Milestone Badges
          </h2>
          <p className="text-xs text-slate-500">
            Earn badges as you unlock milestones in vocal practice and global connections.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {achievements.map((ach) => (
            <div
              key={ach.title}
              className={`p-4 rounded-xl border flex flex-col justify-between space-y-2 ${
                ach.unlocked
                  ? 'bg-indigo-50/50 dark:bg-indigo-950/20 border-indigo-200 dark:border-indigo-800/80'
                  : 'bg-slate-50/60 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800 opacity-60'
              }`}
            >
              <div className="flex items-center justify-between">
                <Award className={`w-5 h-5 ${ach.unlocked ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400'}`} />
                {ach.unlocked && <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
              </div>
              <div>
                <h3 className="text-xs font-bold text-slate-900 dark:text-white">
                  {ach.title}
                </h3>
                <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed mt-0.5">
                  {ach.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
