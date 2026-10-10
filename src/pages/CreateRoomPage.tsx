import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import {
  Radio,
  Users,
  Lock,
  ArrowLeft,
  Loader2,
  AlertCircle,
  Globe,
  Sparkles,
  CheckCircle2,
  Compass,
} from 'lucide-react';
import { Button } from '../components/common/Button';
import { useTopics } from '../hooks/useTopics';
import { useCreateRoom } from '../hooks/useRooms';
import { useAuth } from '../context/AuthContext';
import { CREATABLE_LANGUAGES, getLanguageFlag } from '../data/languages';
import { generateRandomAITopic } from '../utils/aiTopicGenerator';

interface CreateRoomFormData {
  name: string;
  topicId: string;
  description: string;
  englishLevel: string;
  maxParticipants: number;
  visibility: 'public' | 'private';
  language: string;
}

const CAPACITY_OPTIONS = [
  { value: 2, label: '2 Seats', sub: '1-on-1 Practice' },
  { value: 3, label: '3 Seats', sub: 'Trio Lounge' },
  { value: 4, label: '4 Seats', sub: 'Balanced Group' },
  { value: 5, label: '5 Seats', sub: 'WebRTC Mesh HD' },
  { value: 6, label: '6 Seats', sub: 'Open Discussion' },
  { value: 8, label: '8 Seats', sub: 'Community Stage' },
];

const LEVEL_OPTIONS = [
  { id: 'All Levels', label: 'All Levels', desc: 'Open to everyone' },
  { id: 'Beginner', label: 'Beginner', desc: 'A1 - A2 Basics' },
  { id: 'Intermediate', label: 'Intermediate', desc: 'B1 - B2 Conversational' },
  { id: 'Advanced', label: 'Advanced', desc: 'C1 - C2 Fluency' },
  { id: 'IELTS / Exam', label: 'IELTS Prep', desc: 'Exam & Interview focus' },
];

export const CreateRoomPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: topics = [] } = useTopics();
  const createRoomMutation = useCreateRoom();

  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [aiGeneratedSuccess, setAiGeneratedSuccess] = useState(false);
  const [isCustomLanguage, setIsCustomLanguage] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<CreateRoomFormData>({
    defaultValues: {
      name: '',
      topicId: '',
      description: '',
      englishLevel: 'All Levels',
      maxParticipants: 4,
      visibility: 'public',
      language: 'English',
    },
  });

  const selectedName = watch('name') || '';
  const selectedLanguage = watch('language') || 'English';
  const selectedLevel = watch('englishLevel') || 'All Levels';
  const selectedCapacity = watch('maxParticipants') || 4;
  const selectedVisibility = watch('visibility') || 'public';

  // Handle Instant AI Topic Generation
  const handleAITopicGenerate = (category?: string) => {
    setIsGeneratingAI(true);
    setAiGeneratedSuccess(false);

    setTimeout(() => {
      const generated = generateRandomAITopic(category);
      setValue('name', generated.title, { shouldValidate: true });
      setValue('englishLevel', generated.level === 'All Levels' ? 'All Levels' : generated.level);

      const descQuestions = generated.questions.map((q, i) => `${i + 1}. ${q}`).join('\n');
      setValue('description', descQuestions);

      const matchingTopic = topics.find(
        (t) => t.category.toLowerCase().includes(generated.category.toLowerCase())
      );
      if (matchingTopic) {
        setValue('topicId', matchingTopic.id);
      }

      setIsGeneratingAI(false);
      setAiGeneratedSuccess(true);
      setTimeout(() => setAiGeneratedSuccess(false), 3000);
    }, 350);
  };

  const onSubmit = async (data: CreateRoomFormData) => {
    setErrorMessage(null);
    try {
      const selectedTopicId = data.topicId || (topics[0]?.id ? topics[0].id : 'general');
      const newRoom = await createRoomMutation.mutateAsync({
        name: data.name.trim(),
        topicId: selectedTopicId,
        description: data.description?.trim() || undefined,
        englishLevel: data.englishLevel,
        maxParticipants: Number(data.maxParticipants),
        visibility: data.visibility,
        language: data.language?.trim() || 'English',
        hostName: user?.name,
        hostUsername: user?.username,
        hostAvatar: user?.avatar,
        hostCountry: user?.country,
      });

      navigate(`/rooms/${newRoom.id}`);
    } catch (err: any) {
      console.error('Failed to create room:', err);
      const msg = err.response?.data?.message || err.message || 'Failed to create speaking room';
      setErrorMessage(msg);
    }
  };

  return (
    <div className="py-8 sm:py-12 max-w-3xl mx-auto px-4 sm:px-6 space-y-6">
      <button
        onClick={() => navigate('/rooms')}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to live rooms
      </button>

      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 sm:p-8 space-y-6 shadow-sm">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-5">
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200/60 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 text-xs font-bold mb-2">
              <Radio className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
              <span>SpeakMate Audio Studio</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              Create a Voice Lounge
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-xl">
              Host a live peer-to-peer audio space. Type a custom topic, generate one with AI, and invite global English learners to speak with you.
            </p>
          </div>
        </div>

        {errorMessage && (
          <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 flex items-start gap-2.5 text-xs text-rose-700 dark:text-rose-400 animate-in fade-in">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* 1. Custom Topic & AI Spark Generator */}
          <div className="space-y-2">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <label className="text-xs font-bold text-slate-900 dark:text-slate-200 flex items-center gap-1.5">
                <span>Room Topic / Theme *</span>
                <span className="text-[11px] font-normal text-slate-500">(Custom or AI Prompt)</span>
              </label>

              {/* AI Generator Button */}
              <button
                type="button"
                onClick={() => handleAITopicGenerate()}
                disabled={isGeneratingAI}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold text-violet-700 dark:text-violet-300 bg-violet-100 hover:bg-violet-200/80 dark:bg-violet-950/60 dark:hover:bg-violet-900/60 border border-violet-300 dark:border-violet-700 transition-all hover:scale-105 active:scale-95 cursor-pointer shadow-xs"
                title="Generate an interesting topic using AI"
              >
                <Sparkles className={`w-3.5 h-3.5 text-violet-600 dark:text-violet-400 ${isGeneratingAI ? 'animate-spin' : ''}`} />
                <span>{isGeneratingAI ? 'Generating...' : '✨ Generate with AI'}</span>
              </button>
            </div>

            <div className="relative">
              <input
                type="text"
                placeholder="e.g. AI & Future Jobs, IELTS Part 2, Daily Morning Coffee, Travel Shocks..."
                {...register('name', {
                  required: 'Please enter a room topic or title',
                  minLength: { value: 3, message: 'Topic must be at least 3 characters' },
                  maxLength: { value: 90, message: 'Topic cannot exceed 90 characters' },
                })}
                className="w-full px-4 py-2.5 text-sm bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium"
              />
            </div>

            {errors.name && (
              <span className="text-[11px] font-medium text-rose-500 block">
                {errors.name.message}
              </span>
            )}

            {/* Quick Category Pills */}
            <div className="flex items-center gap-1.5 flex-wrap pt-1">
              <span className="text-[11px] font-semibold text-slate-400">Quick ideas:</span>
              {[
                { label: '🎲 Surprise', cat: 'Surprise Me' },
                { label: '🗣️ IELTS', cat: 'IELTS Prep' },
                { label: '☕ Casual', cat: 'Casual Daily' },
                { label: '🚀 Tech & AI', cat: 'Technology' },
                { label: '🌍 Travel', cat: 'Travel & Culture' },
                { label: '💼 Career', cat: 'Career & Business' },
              ].map((item) => (
                <button
                  key={item.label}
                  type="button"
                  onClick={() => handleAITopicGenerate(item.cat)}
                  className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
                >
                  {item.label}
                </button>
              ))}
              {aiGeneratedSuccess && (
                <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 inline-flex items-center gap-1 animate-in fade-in">
                  <CheckCircle2 className="w-3 h-3" /> Topic applied!
                </span>
              )}
            </div>
          </div>

          {/* 2. Spoken Language & Target Level (Grid) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Spoken Language */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-900 dark:text-slate-200">
                  Spoken Language *
                </label>
                <button
                  type="button"
                  onClick={() => setIsCustomLanguage(!isCustomLanguage)}
                  className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
                >
                  {isCustomLanguage ? 'Common list' : '+ Other language'}
                </button>
              </div>

              {!isCustomLanguage ? (
                <select
                  value={selectedLanguage}
                  onChange={(e) => setValue('language', e.target.value)}
                  className="w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-medium"
                >
                  {CREATABLE_LANGUAGES.map((lang) => (
                    <option key={lang.code} value={lang.name}>
                      {lang.flag} {lang.name}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type="text"
                  placeholder="e.g. Italian, Korean, Turkish, Russian..."
                  {...register('language', { required: 'Please specify language' })}
                  className="w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-medium"
                />
              )}
            </div>

            {/* Target Proficiency Level */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-900 dark:text-slate-200">
                Target Proficiency *
              </label>
              <select
                value={selectedLevel}
                onChange={(e) => setValue('englishLevel', e.target.value)}
                className="w-full px-3.5 py-2 text-sm bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-medium"
              >
                {LEVEL_OPTIONS.map((lvl) => (
                  <option key={lvl.id} value={lvl.id}>
                    {lvl.label} ({lvl.desc})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* 3. Maximum People (Capacity Selector) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-900 dark:text-slate-200 flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-indigo-500" />
                <span>Maximum People (Seat Capacity) *</span>
              </label>
              <span className="text-[11px] text-slate-500">
                {selectedCapacity <= 2
                  ? 'Best for intense 1-on-1 partner exchange'
                  : selectedCapacity <= 5
                  ? 'Optimal low-latency WebRTC audio mesh'
                  : 'Larger open group conversation'}
              </span>
            </div>

            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2.5">
              {CAPACITY_OPTIONS.map((opt) => {
                const isSelected = Number(selectedCapacity) === opt.value;
                return (
                  <button
                    type="button"
                    key={opt.value}
                    onClick={() => setValue('maxParticipants', opt.value)}
                    className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-0.5 ${
                      isSelected
                        ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950/60 ring-2 ring-indigo-500/20 text-indigo-900 dark:text-indigo-200 font-bold shadow-xs'
                        : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-700'
                    }`}
                  >
                    <span className="text-xs">{opt.label}</span>
                    <span className="text-[10px] text-slate-400 dark:text-slate-500 leading-tight">
                      {opt.sub.split(' ')[0]}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 4. Privacy & Visibility */}
          <div className="p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                {selectedVisibility === 'public' ? (
                  <Globe className="w-4 h-4 text-emerald-500" />
                ) : (
                  <Lock className="w-4 h-4 text-amber-500" />
                )}
                <span className="text-xs font-bold text-slate-900 dark:text-white">
                  {selectedVisibility === 'public' ? 'Public Lounge (Recommended)' : 'Private Room (Direct invite link only)'}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                {selectedVisibility === 'public'
                  ? 'Visible in the live lobby so any learner can discover and join.'
                  : 'Hidden from public lobby. Accessible only via your direct invite link.'}
              </p>
            </div>

            <div className="flex items-center gap-1 bg-slate-200 dark:bg-slate-700 p-0.5 rounded-lg shrink-0 self-start sm:self-center">
              <button
                type="button"
                onClick={() => setValue('visibility', 'public')}
                className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${
                  selectedVisibility === 'public'
                    ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Public
              </button>
              <button
                type="button"
                onClick={() => setValue('visibility', 'private')}
                className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${
                  selectedVisibility === 'private'
                    ? 'bg-white dark:bg-slate-900 text-amber-600 dark:text-amber-400 shadow-xs'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Private
              </button>
            </div>
          </div>

          {/* 5. Live Card Preview */}
          <div className="rounded-2xl border border-indigo-100 dark:border-indigo-950/80 bg-gradient-to-br from-indigo-50/50 to-violet-50/30 dark:from-slate-800/40 dark:to-indigo-950/20 p-4 space-y-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 flex items-center gap-1">
              <Compass className="w-3.5 h-3.5" /> Live Lobby Card Preview
            </span>

            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 flex items-center justify-between gap-3 shadow-xs">
              <div className="space-y-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{getLanguageFlag(selectedLanguage)}</span>
                  <span className="text-sm font-bold text-slate-900 dark:text-white truncate">
                    {selectedName.trim() || 'Untitled Voice Lounge'}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <span className="font-semibold text-indigo-600 dark:text-indigo-400">
                    {selectedLanguage}
                  </span>
                  <span>·</span>
                  <span className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                    {selectedLevel}
                  </span>
                  <span>·</span>
                  <span>Hosted by You</span>
                </div>
              </div>

              <div className="shrink-0 flex items-center gap-1 text-xs font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2.5 py-1.5 rounded-lg">
                <Users className="w-3.5 h-3.5 text-indigo-500" />
                <span>1/{selectedCapacity}</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex items-center justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              size="md"
              onClick={() => navigate('/rooms')}
              disabled={isSubmitting}
            >
              Cancel
            </Button>

            <Button
              type="submit"
              variant="primary"
              size="md"
              disabled={isSubmitting || !selectedName.trim()}
              leftIcon={
                isSubmitting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Radio className="w-4 h-4" />
                )
              }
            >
              {isSubmitting ? 'Creating Lounge...' : 'Launch Voice Room'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
