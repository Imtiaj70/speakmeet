import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Radio, Sparkles, Mic, Volume2, Globe, Shield, MessageCircle } from 'lucide-react';
import { Button } from '../common/Button';

export const HeroSection: React.FC = () => {
  return (
    <section className="relative overflow-hidden pt-12 pb-16 lg:pt-20 lg:pb-28">
      {/* Subtle background glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-indigo-500/10 dark:bg-indigo-500/15 blur-[120px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* Left Column: Headline and CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="lg:col-span-7 text-center lg:text-left space-y-6"
          >
            {/* Subtle live indicator */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 text-xs text-slate-700 dark:text-slate-300">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="font-medium">5,200+ global speakers talking right now</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-[1.1]">
              Speak Any Language. <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-indigo-500 to-teal-500 dark:from-indigo-400 dark:via-indigo-300 dark:to-teal-300">
                Meet the World.
              </span>
            </h1>

            {/* Description */}
            <p className="text-lg sm:text-xl text-slate-600 dark:text-slate-300 leading-relaxed max-w-2xl mx-auto lg:mx-0">
              Practice English, Spanish, Bengali, French, German, Arabic, Japanese, and 20+ languages naturally through live voice rooms. Jump into open conversations, connect with native speakers, and speak confidently.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 pt-2">
              <Link to="/register" className="w-full sm:w-auto">
                <Button
                  size="lg"
                  className="w-full sm:w-auto text-base font-semibold px-8 shadow-md shadow-indigo-600/20"
                  leftIcon={<Mic className="w-5 h-5" />}
                >
                  Start Speaking
                </Button>
              </Link>
              <Link to="/rooms" className="w-full sm:w-auto">
                <Button
                  variant="outline"
                  size="lg"
                  className="w-full sm:w-auto text-base font-medium"
                  leftIcon={<Radio className="w-4 h-4 text-indigo-500" />}
                >
                  Explore Rooms
                </Button>
              </Link>
            </div>

            {/* Trust points */}
            <div className="pt-6 border-t border-slate-200/60 dark:border-slate-800/80 flex flex-wrap items-center justify-center lg:justify-start gap-y-2 gap-x-6 text-xs text-slate-500 dark:text-slate-400">
              <span className="flex items-center gap-1.5">
                <Shield className="w-4 h-4 text-emerald-500" /> Free to join
              </span>
              <span>·</span>
              <span className="flex items-center gap-1.5">
                <Globe className="w-4 h-4 text-indigo-500" /> All English levels welcome
              </span>
              <span>·</span>
              <span className="flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-500" /> Instant browser WebRTC
              </span>
            </div>
          </motion.div>

          {/* Right Column: Live Interactive Voice Room Card Preview */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.15, ease: 'easeOut' }}
            className="lg:col-span-5 relative"
          >
            {/* Visual voice room interface mockup */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xl relative overflow-hidden">
              {/* Header */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2.5">
                  <div className="w-3 h-3 rounded-full bg-emerald-500 animate-ping" />
                  <div>
                    <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                      Travel & Cultural Quirks
                    </h2>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      Intermediate · 5/6 Speakers Active
                    </p>
                  </div>
                </div>
                <span className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-200/50 dark:border-emerald-800/50">
                  LIVE 24:18
                </span>
              </div>

              {/* Prompt box */}
              <div className="my-4 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60">
                <div className="flex items-center gap-1.5 text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 mb-1">
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span>Current Question for the Room</span>
                </div>
                <p className="text-xs text-slate-700 dark:text-slate-300 font-medium">
                  "What is an unspoken social rule in your country that tourists usually misunderstand?"
                </p>
              </div>

              {/* Speaker Avatars Grid */}
              <div className="grid grid-cols-3 gap-3 my-4">
                {/* Speaker 1 (Active speaker) */}
                <div className="p-3 rounded-xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 flex flex-col items-center text-center relative">
                  <span className="absolute top-1.5 right-1.5 flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
                  </span>
                  <div className="w-12 h-12 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center text-sm shadow-md ring-2 ring-indigo-500 ring-offset-2 dark:ring-offset-slate-900">
                    S
                  </div>
                  <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 mt-2 truncate w-full">
                    Sophie 🇫🇷
                  </span>
                  <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-medium flex items-center gap-0.5 mt-0.5">
                    <Volume2 className="w-3 h-3 animate-pulse" /> Speaking
                  </span>
                </div>

                {/* Speaker 2 */}
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-700/50 flex flex-col items-center text-center">
                  <div className="w-12 h-12 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center text-sm">
                    K
                  </div>
                  <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 mt-2 truncate w-full">
                    Kenji 🇯🇵
                  </span>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                    Listening
                  </span>
                </div>

                {/* Speaker 3 */}
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-700/50 flex flex-col items-center text-center">
                  <div className="w-12 h-12 rounded-full bg-amber-600 text-white font-bold flex items-center justify-center text-sm">
                    M
                  </div>
                  <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 mt-2 truncate w-full">
                    Marco 🇮🇹
                  </span>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                    Host
                  </span>
                </div>
              </div>

              {/* Quick join action inside card */}
              <div className="pt-2 flex items-center justify-between gap-3 text-xs">
                <span className="text-slate-500 dark:text-slate-400">1 open microphone seat left</span>
                <Link to="/rooms/room-105">
                  <Button size="sm" variant="primary" leftIcon={<Radio className="w-3.5 h-3.5" />}>
                    Jump In & Listen
                  </Button>
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
