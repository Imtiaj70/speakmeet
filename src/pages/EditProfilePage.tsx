import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { useAuth } from '../context/AuthContext';
import { useUser } from '../hooks/useUser';
import { Button } from '../components/common/Button';
import { PageLoader } from '../components/common/PageLoader';
import { EnglishLevel, LearningGoal } from '../types';
import {
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Check,
  User,
  AtSign,
  Globe,
  Languages,
} from 'lucide-react';

interface EditProfileFormData {
  name: string;
  username: string;
  avatar: string;
  country: string;
  nativeLanguage: string;
  englishLevel: EnglishLevel;
  interestsString: string;
  bio: string;
}

export const EditProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const { user, refreshProfile } = useAuth();
  const { updateProfile, isUpdating, checkUsername } = useUser();

  const [selectedGoals, setSelectedGoals] = useState<LearningGoal[]>(
    user?.learningGoals || ['Daily conversation']
  );
  const [successMessage, setSuccessMessage] = useState('');
  const [apiError, setApiError] = useState('');

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

  const {
    register,
    handleSubmit,
    control,
    setValue,
    watch,
    formState: { errors },
  } = useForm<EditProfileFormData>({
    defaultValues: {
      name: user?.name || '',
      username: user?.username || '',
      avatar: user?.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${user?.username || 'speaker'}`,
      country: user?.country || 'Spain',
      nativeLanguage: user?.nativeLanguage || 'Spanish',
      englishLevel: (user?.englishLevel as EnglishLevel) || 'Intermediate',
      interestsString: user?.interests?.join(', ') || 'Movies, Travel, Technology',
      bio: user?.bio || '',
    },
  });

  const currentAvatar = watch('avatar');
  const currentUsername = watch('username');

  useEffect(() => {
    if (user) {
      setValue('name', user.name);
      setValue('username', user.username);
      setValue('avatar', user.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${user.username}`);
      setValue('country', user.country);
      setValue('nativeLanguage', user.nativeLanguage);
      setValue('englishLevel', user.englishLevel);
      setValue('interestsString', user.interests?.join(', ') || '');
      setValue('bio', user.bio);
      if (user.learningGoals?.length) {
        setSelectedGoals(user.learningGoals);
      }
    }
  }, [user, setValue]);

  const toggleGoal = (goal: LearningGoal) => {
    if (selectedGoals.includes(goal)) {
      if (selectedGoals.length > 1) {
        setSelectedGoals(selectedGoals.filter((g) => g !== goal));
      }
    } else {
      setSelectedGoals([...selectedGoals, goal]);
    }
  };

  const onSubmit = async (data: EditProfileFormData) => {
    setApiError('');
    setSuccessMessage('');

    const cleanUsername = data.username.trim().toLowerCase();

    // Check availability if changed
    if (user && cleanUsername !== user.username.toLowerCase()) {
      try {
        const avail = await checkUsername(cleanUsername);
        if (!avail.available) {
          setApiError('This username is already taken by another user.');
          return;
        }
      } catch {
        // Proceed if offline
      }
    }

    try {
      await updateProfile({
        name: data.name.trim(),
        username: cleanUsername,
        avatar: data.avatar.trim(),
        country: data.country.trim(),
        nativeLanguage: data.nativeLanguage.trim(),
        englishLevel: data.englishLevel,
        learningGoals: selectedGoals,
        interests: data.interestsString
          .split(',')
          .map((i) => i.trim())
          .filter(Boolean),
        bio: data.bio.trim(),
      });
      await refreshProfile();
      setSuccessMessage('Profile saved successfully!');
      setTimeout(() => {
        navigate('/profile');
      }, 1200);
    } catch (err: any) {
      console.error('[EditProfile] Error:', err);
      setApiError(err?.response?.data?.message || err.message || 'Failed to update profile.');
    }
  };

  return (
    <div className="py-8 sm:py-12 max-w-2xl mx-auto px-4 sm:px-6 space-y-6">
      <button
        onClick={() => navigate('/profile')}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Profile
      </button>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-6 sm:p-8 space-y-6 shadow-sm">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
            Account Management
          </span>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight mt-1">
            Edit Speaking Profile
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Update your public persona, spoken language fluency, and conversation topics.
          </p>
        </div>

        {successMessage && (
          <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 text-xs text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {apiError && (
          <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 text-xs text-rose-600 dark:text-rose-400 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{apiError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {/* Avatar Section */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-slate-900 dark:text-white">
              Avatar Image URL
            </label>
            <div className="flex items-center gap-4">
              <img
                src={currentAvatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${currentUsername || 'alpha'}`}
                alt="Avatar Preview"
                className="w-14 h-14 rounded-2xl border border-indigo-500/50 bg-slate-100 dark:bg-slate-800 p-1 object-cover shadow-xs"
              />
              <div className="flex-1">
                <input
                  type="text"
                  {...register('avatar', { required: 'Avatar URL is required' })}
                  placeholder="https://..."
                  className="w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
                <div className="flex items-center gap-2 mt-1.5">
                  <button
                    type="button"
                    onClick={() =>
                      setValue(
                        'avatar',
                        `https://api.dicebear.com/7.x/bottts/svg?seed=${currentUsername || 'bot'}`
                      )
                    }
                    className="text-[11px] font-medium text-indigo-600 dark:text-indigo-400 hover:underline"
                  >
                    Generate Robot
                  </button>
                  <span className="text-slate-300 dark:text-slate-700">·</span>
                  <button
                    type="button"
                    onClick={() =>
                      setValue(
                        'avatar',
                        `https://api.dicebear.com/7.x/avataaars/svg?seed=${currentUsername || 'human'}`
                      )
                    }
                    className="text-[11px] font-medium text-indigo-600 dark:text-indigo-400 hover:underline"
                  >
                    Generate Human
                  </button>
                </div>
              </div>
            </div>
            {errors.avatar && <p className="text-xs text-rose-500">{errors.avatar.message}</p>}
          </div>

          {/* Name and Username */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-900 dark:text-white mb-1">
                Full Name *
              </label>
              <input
                type="text"
                {...register('name', { required: 'Name is required' })}
                className="w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
              {errors.name && <p className="text-xs text-rose-500 mt-1">{errors.name.message}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-900 dark:text-white mb-1">
                Username *
              </label>
              <input
                type="text"
                {...register('username', {
                  required: 'Username is required',
                  pattern: {
                    value: /^[a-zA-Z0-9_]{3,20}$/,
                    message: 'Letters, numbers, underscores only (3-20 chars)',
                  },
                })}
                className="w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
              {errors.username && (
                <p className="text-xs text-rose-500 mt-1">{errors.username.message}</p>
              )}
            </div>
          </div>

          {/* Country & Language */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-900 dark:text-white mb-1">
                Country of Residence
              </label>
              <input
                type="text"
                {...register('country', { required: 'Country is required' })}
                className="w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-900 dark:text-white mb-1">
                Native Language
              </label>
              <input
                type="text"
                {...register('nativeLanguage', { required: 'Native language is required' })}
                className="w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>
          </div>

          {/* English Level */}
          <div>
            <label className="block text-xs font-semibold text-slate-900 dark:text-white mb-2">
              Target English Level
            </label>
            <Controller
              name="englishLevel"
              control={control}
              render={({ field }) => (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {englishLevels.map((lvl) => (
                    <button
                      type="button"
                      key={lvl}
                      onClick={() => field.onChange(lvl)}
                      className={`p-2.5 text-xs text-left rounded-lg border transition-all flex items-center justify-between ${
                        field.value === lvl
                          ? 'border-indigo-600 bg-indigo-50/60 dark:bg-indigo-950/40 text-indigo-950 dark:text-indigo-200 font-semibold'
                          : 'border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/40 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <span>{lvl}</span>
                      {field.value === lvl && <Check className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />}
                    </button>
                  ))}
                </div>
              )}
            />
          </div>

          {/* Learning Goals */}
          <div>
            <label className="block text-xs font-semibold text-slate-900 dark:text-white mb-1">
              Learning Goals
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-1.5">
              {learningGoals.map((goal) => {
                const isSelected = selectedGoals.includes(goal);
                return (
                  <button
                    type="button"
                    key={goal}
                    onClick={() => toggleGoal(goal)}
                    className={`p-2.5 text-left rounded-lg border text-xs transition-all flex items-center justify-between ${
                      isSelected
                        ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/30 text-indigo-900 dark:text-indigo-200 font-medium'
                        : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    <span>{goal}</span>
                    {isSelected && <Check className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Interests & Bio */}
          <div>
            <label className="block text-xs font-semibold text-slate-900 dark:text-white mb-1">
              Conversation Topics / Interests (comma-separated)
            </label>
            <input
              type="text"
              {...register('interestsString')}
              placeholder="Cinema, Tech, Architecture, Sports"
              className="w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-900 dark:text-white mb-1">
              Bio
            </label>
            <textarea
              rows={3}
              {...register('bio')}
              placeholder="Tell partners about your speaking routine and goals..."
              className="w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
          </div>

          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-3">
            <Button type="button" variant="outline" size="md" onClick={() => navigate('/profile')}>
              Cancel
            </Button>
            <Button type="submit" size="md" isLoading={isUpdating}>
              Save Changes
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
