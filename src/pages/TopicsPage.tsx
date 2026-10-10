import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTopics } from '../hooks/useTopics';
import { LevelTag } from '../components/common/LevelTag';
import { Button } from '../components/common/Button';
import { Search, HelpCircle, MessageSquare, Plus, Check, Copy, Loader2, AlertCircle } from 'lucide-react';
import { EnglishLevel } from '../types';

export const TopicsPage: React.FC = () => {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedLevel, setSelectedLevel] = useState<string>('All');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const categories = [
    'All',
    'Daily Life',
    'Travel',
    'Technology',
    'Movies',
    'Sports',
    'Education',
    'Career',
    'Food',
    'Culture',
    'Hobbies',
    'Programming',
    'IELTS',
  ];

  const levels = ['All', 'Beginner', 'Elementary', 'Intermediate', 'Upper Intermediate', 'Advanced'];

  // Fetch topics from MongoDB via TanStack Query
  const { data: topics = [], isLoading, isError, refetch } = useTopics({
    search: search ? search : undefined,
    category: selectedCategory !== 'All' ? selectedCategory : undefined,
    difficulty: selectedLevel !== 'All' ? selectedLevel : undefined,
  });

  const handleCopyQuestions = (topicId: string, questions: string[]) => {
    const text = questions.map((q, i) => `${i + 1}. ${q}`).join('\n');
    navigator.clipboard.writeText(text);
    setCopiedId(topicId);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="py-8 sm:py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
            Discussion Library (36+ Curated Topics)
          </span>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight mt-1">
            Conversation Topics & Prompts
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 max-w-2xl">
            Explore curated conversation questions across 12 practical categories. Use them during speaking sessions to keep dialogues vibrant, structured, and engaging.
          </p>
        </div>

        <Link to="/rooms/create">
          <Button size="md" leftIcon={<Plus className="w-4 h-4" />}>
            Create Room With Topic
          </Button>
        </Link>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-800 p-4 space-y-4 shadow-sm">
        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search topics by keyword, prompt question, or category..."
            className="w-full pl-10 pr-4 py-2 text-sm bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
          />
        </div>

        {/* Category & Level Selectors */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pt-2 border-t border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none max-w-full">
            <span className="text-xs font-semibold text-slate-400 mr-2 shrink-0">Category:</span>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-colors shrink-0 ${
                  selectedCategory === cat
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none shrink-0">
            <span className="text-xs font-semibold text-slate-400 mr-2 shrink-0">Level:</span>
            {levels.map((lvl) => (
              <button
                key={lvl}
                onClick={() => setSelectedLevel(lvl)}
                className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors shrink-0 ${
                  selectedLevel === lvl
                    ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-sm'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {lvl}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Topics Content */}
      {isLoading ? (
        <div className="py-24 flex flex-col items-center justify-center space-y-3">
          <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
          <span className="text-xs text-slate-500 font-medium">Loading topics library...</span>
        </div>
      ) : isError ? (
        <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-xl border border-rose-200 dark:border-rose-900/50 p-6 space-y-3">
          <AlertCircle className="w-8 h-8 text-rose-500 mx-auto" />
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">Failed to load topic library</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Unable to fetch topics from MongoDB. Please check your connection and retry.
          </p>
          <Button size="sm" variant="outline" onClick={() => refetch()}>
            Retry
          </Button>
        </div>
      ) : topics.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {topics.map((topic) => (
            <div
              key={topic.id}
              className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-800 p-6 flex flex-col justify-between hover:border-slate-300 dark:hover:border-slate-700 transition-colors shadow-sm"
            >
              <div>
                <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
                  <span className="font-semibold text-slate-700 dark:text-slate-300">{topic.category}</span>
                  <span aria-hidden="true">·</span>
                  <LevelTag level={topic.difficulty} />
                </div>

                <h3 className="font-bold text-base text-slate-900 dark:text-white mb-2">
                  {topic.title}
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
                  {topic.description}
                </p>

                {/* Conversation Questions list */}
                <div className="space-y-2 mb-4">
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                    <HelpCircle className="w-3.5 h-3.5 text-indigo-500" />
                    Discussion Prompts ({topic.questions.length}):
                  </span>
                  <ul className="space-y-2">
                    {topic.questions.map((q, idx) => (
                      <li
                        key={idx}
                        className="text-xs text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/50 p-2.5 rounded-lg border border-slate-100 dark:border-slate-800 leading-relaxed"
                      >
                        <span className="font-semibold text-indigo-600 dark:text-indigo-400 mr-1.5">
                          {idx + 1}.
                        </span>
                        {q}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Actions */}
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                <button
                  onClick={() => handleCopyQuestions(topic.id, topic.questions)}
                  className="text-xs font-medium text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white flex items-center gap-1.5 transition-colors"
                  title="Copy prompts to clipboard"
                >
                  {copiedId === topic.id ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-500" />
                      <span className="text-emerald-600 dark:text-emerald-400">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy prompts</span>
                    </>
                  )}
                </button>

                <Link to={`/rooms?topic=${encodeURIComponent(topic.category)}`}>
                  <Button variant="ghost" size="sm" className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                    Find Rooms →
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-800 space-y-3">
          <MessageSquare className="w-10 h-10 text-slate-400 mx-auto mb-1" />
          <h3 className="text-base font-bold text-slate-900 dark:text-white">No topics match your filters</h3>
          <p className="text-xs text-slate-500 mt-1">Try resetting your search query or selecting "All".</p>
          <button
            onClick={() => {
              setSearch('');
              setSelectedCategory('All');
              setSelectedLevel('All');
            }}
            className="mt-2 text-xs font-medium text-indigo-600 hover:underline"
          >
            Clear all filters
          </button>
        </div>
      )}
    </div>
  );
};
