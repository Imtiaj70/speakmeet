import React from 'react';
import { Link } from 'react-router-dom';
import { Mic, HeartHandshake, ShieldCheck, Sparkles, Globe, Brain } from 'lucide-react';
import { Button } from '../components/common/Button';
import { CreatorCoffeeSection } from '../components/common/CreatorCoffeeSection';

export const AboutPage: React.FC = () => {
  return (
    <div className="py-12 sm:py-16 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
      {/* Header */}
      <div className="text-center space-y-4">
        <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
          Our Mission & Philosophy
        </span>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Speaking English shouldn't feel terrifying.
        </h1>
        <p className="text-base sm:text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
          Millions of dedicated students spend decades reading grammar rules and memorizing vocabulary lists, only to experience complete mental block when it is time to say a single sentence aloud. SpeakMate exists to dismantle that barrier.
        </p>
      </div>

      {/* Core Values Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-3">
          <div className="w-10 h-10 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
            <Brain className="w-5 h-5" />
          </div>
          <h2 className="text-base font-bold text-slate-900 dark:text-white">
            The Muscle Memory of Speech
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
            Speaking is a physical motor skill, much like playing an instrument or learning to swim. You cannot learn it purely by silent reading. You must articulate sounds, test cadences, and train vocal reflexes.
          </p>
        </div>

        <div className="p-6 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-3">
          <div className="w-10 h-10 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <HeartHandshake className="w-5 h-5" />
          </div>
          <h2 className="text-base font-bold text-slate-900 dark:text-white">
            Judgment-Free Peer Solidarity
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
            In our rooms, everyone understands the vulnerability of learning a second language. Making grammatical mistakes is celebrated as evidence of active learning, not judged.
          </p>
        </div>

        <div className="p-6 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-3">
          <div className="w-10 h-10 rounded-lg bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center">
            <Globe className="w-5 h-5" />
          </div>
          <h2 className="text-base font-bold text-slate-900 dark:text-white">
            Global World English
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
            English is the international lingua franca. Communicating effectively with diverse accents and cultural perspectives is the exact competency you need in modern global workplaces.
          </p>
        </div>
      </div>

      {/* Community Guidelines */}
      <div className="bg-slate-50 dark:bg-slate-900/60 rounded-2xl p-8 border border-slate-200/80 dark:border-slate-800 space-y-6">
        <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400">
          <ShieldCheck className="w-6 h-6" />
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            Our Community Code of Conduct
          </h2>
        </div>
        <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
          To maintain a productive and respectful space for all members, every participant agrees to uphold these standards:
        </p>
        <ul className="space-y-3 text-sm text-slate-700 dark:text-slate-300">
          <li className="flex items-start gap-2.5">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-2 shrink-0" />
            <span><strong>Be patient with fellow speakers:</strong> Never interrupt, mock, or rush someone struggling to find the right words.</span>
          </li>
          <li className="flex items-start gap-2.5">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-2 shrink-0" />
            <span><strong>Share the microphone:</strong> Keep your turns concise so everyone gets fair speaking time during group discussions.</span>
          </li>
          <li className="flex items-start gap-2.5">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-2 shrink-0" />
            <span><strong>Zero harassment tolerance:</strong> Discriminatory language, personal insults, inappropriate sexual commentary, or harassment leads to immediate permanent bans.</span>
          </li>
          <li className="flex items-start gap-2.5">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-2 shrink-0" />
            <span><strong>Constructive feedback only when invited:</strong> Ask before offering grammar or accent corrections unless specifically requested by the speaker.</span>
          </li>
        </ul>

        {/* Creator Story & Buy Me a Coffee Section */}
        <CreatorCoffeeSection />

        <div className="pt-4 flex items-center justify-end">
          <Link to="/rooms">
            <Button size="md" leftIcon={<Mic className="w-4 h-4" />}>
              Join a Conversation Room
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};
