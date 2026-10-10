import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { MOCK_TOPICS } from '../../data/mockTopics';
import { LevelTag } from '../common/LevelTag';
import { MessageSquare, ArrowRight, HelpCircle } from 'lucide-react';

export const PopularTopicsSection: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<string>('All');

  const categories = ['All', 'Daily Life', 'Travel', 'Technology', 'Career', 'IELTS'];

  const filteredTopics = activeCategory === 'All'
    ? MOCK_TOPICS.slice(0, 6)
    : MOCK_TOPICS.filter((t) => t.category === activeCategory);

  return (
    <section className="py-16 sm:py-24 border-t border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              Structured Dialogues
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight mt-1">
              Popular Conversation Topics
            </h2>
            <p className="text-base text-slate-600 dark:text-slate-400 mt-2 max-w-xl">
              Never run out of things to say. Every SpeakMate room is seeded with stimulating prompts designed to trigger natural debates.
            </p>
          </div>

          <Link
            to="/topics"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 shrink-0"
          >
            <span>View All Topics Library</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Category Filter Buttons (Functional filter bar, not static pill slop) */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-8 scrollbar-none">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={`px-3.5 py-1.5 text-xs font-medium rounded-lg transition-colors shrink-0 ${
                activeCategory === category
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Topics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTopics.map((topic) => (
            <div
              key={topic.id}
              className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-800 p-6 flex flex-col justify-between hover:border-slate-300 dark:hover:border-slate-700 transition-colors"
            >
              <div>
                <div className="flex items-center justify-between text-xs text-slate-500 mb-3">
                  <span className="font-medium text-slate-700 dark:text-slate-300">{topic.category}</span>
                  <span aria-hidden="true">·</span>
                  <LevelTag level={topic.difficulty} />
                </div>

                <h3 className="font-bold text-base text-slate-900 dark:text-white mb-2">
                  {topic.title}
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
                  {topic.description}
                </p>

                {/* Sample Prompt */}
                <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800">
                  <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1 mb-1">
                    <HelpCircle className="w-3 h-3 text-indigo-500" /> Discussion Starter:
                  </span>
                  <p className="text-xs text-slate-700 dark:text-slate-300 italic">
                    "{topic.questions[0]}"
                  </p>
                </div>
              </div>

              <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
                <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                  <MessageSquare className="w-3.5 h-3.5" />
                  {(topic.popularCount ?? 120).toLocaleString()} conversations
                </span>
                <Link
                  to={`/rooms?topic=${encodeURIComponent(topic.category)}`}
                  className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-0.5"
                >
                  Find Rooms →
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
