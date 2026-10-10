import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useUser } from '../hooks/useUser';
import { Button } from '../components/common/Button';
import { EnglishLevel, LearningGoal } from '../types';
import { CheckCircle2, User, Globe, Languages, Sparkles, Image, Check } from 'lucide-react';

export const ProfileSetupPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, refreshProfile } = useAuth();
  const { updateProfile, isUpdating } = useUser();

  const [name, setName] = useState(user?.name || '');
  const [username, setUsername] = useState(user?.username || '');
  const [country, setCountry] = useState(user?.country || 'Spain');
  const [nativeLanguage, setNativeLanguage] = useState(user?.nativeLanguage || 'Spanish');
  const [englishLevel, setEnglishLevel] = useState<EnglishLevel>(
    (user?.englishLevel as EnglishLevel) || 'Intermediate'
  );
  const [selectedGoals, setSelectedGoals] = useState<LearningGoal[]>(
    user?.learningGoals?.length ? user.learningGoals : ['Daily conversation']
  );
  const [interests, setInterests] = useState(
    user?.interests?.join(', ') || 'Movies, Travel, Technology, Books'
  );
  const [bio, setBio] = useState(
    user?.bio || 'Excited to practice conversational English and connect with speakers globally!'
  );
  const [avatar, setAvatar] = useState(
    user?.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${user?.username || 'speaker'}`
  );
  const [error, setError] = useState('');

  const englishLevels: EnglishLevel[] = [
    'Beginner',
    'Elementary',
    'Intermediate',
    'Upper Intermediate',
    'Advanced',
  ];

  const learningGoals: LearningGoal[] = [
    'Daily conversation',
    'IELTS',
    'Academic English',
    'Job interview',
    'Travel',
    'International communication',
    'General improvement',
  ];

  const avatarPresets = [
    `https://api.dicebear.com/7.x/bottts/svg?seed=${username || 'alpha'}`,
    `https://api.dicebear.com/7.x/bottts/svg?seed=bravo_speak`,
    `https://api.dicebear.com/7.x/bottts/svg?seed=charlie_fluent`,
    `https://api.dicebear.com/7.x/bottts/svg?seed=delta_voice`,
    `https://api.dicebear.com/7.x/bottts/svg?seed=echo_echo`,
  ];

  const toggleGoal = (goal: LearningGoal) => {
    if (selectedGoals.includes(goal)) {
      if (selectedGoals.length > 1) {
        setSelectedGoals(selectedGoals.filter((g) => g !== goal));
      }
    } else {
      setSelectedGoals([...selectedGoals, goal]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const cleanUsername = username.trim().toLowerCase();
    if (!/^[a-zA-Z0-9_]{3,20}$/.test(cleanUsername)) {
      setError('Username must be 3-20 characters with letters, numbers, and underscores only.');
      return;
    }

    try {
      await updateProfile({
        name: name.trim(),
        username: cleanUsername,
        avatar,
        country: country.trim(),
        nativeLanguage: nativeLanguage.trim(),
        englishLevel,
        learningGoals: selectedGoals,
        interests: interests
          .split(',')
          .map((i) => i.trim())
          .filter(Boolean),
        bio: bio.trim(),
      });
      await refreshProfile();
      navigate('/dashboard');
    } catch (err: any) {
      console.error('[ProfileSetup] Error saving profile:', err);
      setError(err?.response?.data?.message || err.message || 'Failed to save profile. Please try again.');
    }
  };

  return (
    <div className="py-10 sm:py-16 max-w-2xl mx-auto px-4 sm:px-6">
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-6 sm:p-10 space-y-8 shadow-sm">
        {/* Header */}
        <div className="text-center space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
            Welcome to SpeakMate
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Complete Your Speaking Profile
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
            Help other learners know your speaking level, target goals, and favorite conversation topics.
          </p>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 text-xs text-rose-600 dark:text-rose-400">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Avatar Selector */}
          <div className="space-y-3">
            <label className="block text-xs font-semibold text-slate-900 dark:text-white">
              Profile Photo & Avatar
            </label>
            <div className="flex flex-col sm:flex-row items-center gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800">
              <img
                src={avatar}
                alt="Selected Avatar"
                className="w-16 h-16 rounded-2xl border-2 border-indigo-500 bg-white p-1 object-cover shadow-sm"
              />
              <div className="space-y-2 flex-1 text-center sm:text-left">
                <span className="text-[11px] text-slate-500 block">
                  Choose a preset avatar or paste an image URL:
                </span>
                <div className="flex flex-wrap items-center gap-2 justify-center sm:justify-start">
                  {avatarPresets.map((preset, idx) => (
                    <button
                      type="button"
                      key={idx}
                      onClick={() => setAvatar(preset)}
                      className={`w-9 h-9 rounded-xl border p-0.5 transition-transform hover:scale-105 ${
                        avatar === preset
                          ? 'border-indigo-600 ring-2 ring-indigo-500/20'
                          : 'border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800'
                      }`}
                    >
                      <img src={preset} alt={`Preset ${idx + 1}`} className="w-full h-full rounded-lg" />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Personal Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-900 dark:text-white mb-1.5">
                Full Name *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Sofia Chen"
                className="w-full px-3.5 py-2.5 text-sm bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-900 dark:text-white mb-1.5">
                Username *
              </label>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/\s+/g, ''))}
                placeholder="sofia_speaks"
                className="w-full px-3.5 py-2.5 text-sm bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-900 dark:text-white mb-1.5">
                Country of Residence
              </label>
              <input
                type="text"
                required
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                placeholder="e.g. Spain, Japan, Brazil"
                className="w-full px-3.5 py-2.5 text-sm bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-900 dark:text-white mb-1.5">
                Native Language
              </label>
              <input
                type="text"
                required
                value={nativeLanguage}
                onChange={(e) => setNativeLanguage(e.target.value)}
                placeholder="e.g. Spanish, Arabic, Japanese"
                className="w-full px-3.5 py-2.5 text-sm bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>
          </div>

          {/* English Level Selection */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-slate-900 dark:text-white">
              Current Spoken English Level *
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {englishLevels.map((lvl) => (
                <button
                  type="button"
                  key={lvl}
                  onClick={() => setEnglishLevel(lvl)}
                  className={`p-3 text-left rounded-xl border text-xs transition-all flex items-center justify-between ${
                    englishLevel === lvl
                      ? 'border-indigo-600 bg-indigo-50/60 dark:bg-indigo-950/40 text-indigo-950 dark:text-indigo-200 font-semibold'
                      : 'border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/40 text-slate-700 dark:text-slate-300 hover:border-slate-300'
                  }`}
                >
                  <span>{lvl}</span>
                  {englishLevel === lvl && <CheckCircle2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />}
                </button>
              ))}
            </div>
          </div>

          {/* Learning Goals */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-semibold text-slate-900 dark:text-white">
                Main Learning Goals
              </label>
              <span className="text-[11px] text-slate-500">Select one or more</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {learningGoals.map((goal) => {
                const isSelected = selectedGoals.includes(goal);
                return (
                  <button
                    type="button"
                    key={goal}
                    onClick={() => toggleGoal(goal)}
                    className={`p-2.5 text-left rounded-xl border text-xs transition-all flex items-center justify-between ${
                      isSelected
                        ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/30 text-indigo-900 dark:text-indigo-200 font-medium'
                        : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-slate-300'
                    }`}
                  >
                    <span>{goal}</span>
                    {isSelected && <Check className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Interests & Bio */}
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-900 dark:text-white mb-1.5">
                Conversation Topics & Interests (comma-separated)
              </label>
              <input
                type="text"
                value={interests}
                onChange={(e) => setInterests(e.target.value)}
                placeholder="Tech, Cinema, Travel, Cooking, Music"
                className="w-full px-3.5 py-2.5 text-sm bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-900 dark:text-white mb-1.5">
                Short Bio / Introduction
              </label>
              <textarea
                rows={3}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Tell potential speaking partners a little about yourself..."
                className="w-full px-3.5 py-2.5 text-sm bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>
          </div>

          <Button
            type="submit"
            size="lg"
            className="w-full font-semibold"
            isLoading={isUpdating}
            rightIcon={<Sparkles className="w-4 h-4" />}
          >
            Save Profile & Enter Dashboard
          </Button>
        </form>
      </div>
    </div>
  );
};
