import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShieldCheck, Globe, Sparkles } from 'lucide-react';
import { BuyCoffeeButton } from '../common/BuyCoffeeButton';
import { SpeakMateLogo } from '../common/SpeakMateLogo';

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-600 dark:text-slate-400 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-12">
          {/* Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <Link to="/home" title="Go to SpeakMate Home Page" className="inline-block py-1">
              <SpeakMateLogo size="md" showTagline={true} />
            </Link>
            <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed max-w-sm">
              The real-time conversation exchange where global English learners meet, overcome speaking anxiety, and achieve effortless fluency through live voice rooms.
            </p>
            <div className="flex items-center gap-3 pt-2 text-xs text-slate-500">
              <span className="inline-flex items-center gap-1.5 font-medium text-emerald-600 dark:text-emerald-400">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Live WebRTC Voice Mesh
              </span>
              <span>·</span>
              <span>138 Countries</span>
            </div>

            <div className="pt-2">
              <BuyCoffeeButton variant="pill" />
            </div>
          </div>

          {/* Practice & Rooms */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-900 dark:text-slate-200 mb-4">
              Practice
            </h3>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/rooms" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                  Explore Live Rooms
                </Link>
              </li>
              <li>
                <Link to="/topics" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                  Conversation Questions
                </Link>
              </li>
              <li>
                <Link to="/partner" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                  Find Speaking Partner
                </Link>
              </li>
              <li>
                <Link to="/rooms/create" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                  Host a Room
                </Link>
              </li>
            </ul>
          </div>

          {/* Platform & Methodology */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-900 dark:text-slate-200 mb-4">
              SpeakMate
            </h3>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/about" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                  Why Spoken Practice
                </Link>
              </li>
              <li>
                <Link to="/progress" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                  Fluency Milestones
                </Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                  Community Standards
                </Link>
              </li>
              <li>
                <span className="text-slate-400 dark:text-slate-600 cursor-not-allowed">
                  Mobile Apps (Coming)
                </span>
              </li>
            </ul>
          </div>

          {/* Trust & Safety */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-900 dark:text-slate-200 mb-4">
              Trust & Legal
            </h3>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/privacy" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/terms" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link to="/refund" className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                  Refund & Support Policy
                </Link>
              </li>
              <li className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 pt-1">
                <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
                <span>Zero-harassment Verified</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 mt-8 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 dark:text-slate-500">
          <p>© {new Date().getFullYear()} SpeakMate. All rights reserved. Free Language Practice Lounges.</p>
          <div className="flex flex-wrap items-center gap-4">
            <Link to="/privacy" className="hover:underline">Privacy</Link>
            <span>·</span>
            <Link to="/terms" className="hover:underline">Terms</Link>
            <span>·</span>
            <Link to="/refund" className="hover:underline">Refund Policy</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
