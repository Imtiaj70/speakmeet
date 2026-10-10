import React, { useState } from 'react';
import { Button } from '../components/common/Button';
import { LevelTag } from '../components/common/LevelTag';
import { Search, Globe, MessageCircle, Send, Check } from 'lucide-react';
import { EnglishLevel } from '../types';

export const PartnerPage: React.FC = () => {
  const [search, setSearch] = useState('');
  const [invitedId, setInvitedId] = useState<string | null>(null);

  const partners = [
    {
      id: 'usr-1',
      name: 'Kenji Sato',
      username: 'kenji_tokyo',
      country: 'Japan',
      nativeLanguage: 'Japanese',
      level: 'Intermediate' as EnglishLevel,
      interests: ['Cinema', 'Anime', 'Travel', 'Coding'],
      bio: 'Practicing English daily to speak more naturally during international work meetings.',
      isOnline: true,
    },
    {
      id: 'usr-2',
      name: 'Amina Al-Mansoor',
      username: 'amina_ielts',
      country: 'UAE',
      nativeLanguage: 'Arabic',
      level: 'Upper Intermediate' as EnglishLevel,
      interests: ['IELTS', 'Literature', 'Debates'],
      bio: 'Preparing for IELTS Band 7.5. Looking for serious, regular speaking partners.',
      isOnline: true,
    },
    {
      id: 'usr-3',
      name: 'Lucas Silva',
      username: 'lucas_sp',
      country: 'Brazil',
      nativeLanguage: 'Portuguese',
      level: 'Intermediate' as EnglishLevel,
      interests: ['Tech', 'Music', 'Hiking'],
      bio: 'Software developer who loves discussing open source and global travel stories.',
      isOnline: false,
    },
    {
      id: 'usr-4',
      name: 'Sophie Mercier',
      username: 'sophie_paris',
      country: 'France',
      nativeLanguage: 'French',
      level: 'Beginner' as EnglishLevel,
      interests: ['Art', 'Culinary', 'Books'],
      bio: 'Learning English slowly and patiently. Want friendly conversation partners.',
      isOnline: true,
    },
  ];

  const handleInvite = (id: string) => {
    setInvitedId(id);
    setTimeout(() => setInvitedId(null), 2500);
  };

  return (
    <div className="py-8 sm:py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
      <div>
        <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
          Peer Matching
        </span>
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight mt-1">
          Find a Speaking Partner
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 max-w-2xl">
          Connect with language learners worldwide who share your English level, schedule, and conversation interests.
        </p>
      </div>

      {/* Search */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200/80 dark:border-slate-800">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search partners by name, country, interests, or native language..."
            className="w-full pl-10 pr-4 py-2 text-sm bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
          />
        </div>
      </div>

      {/* Partners List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {partners.map((partner) => (
          <div
            key={partner.id}
            className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-800 p-6 flex flex-col justify-between space-y-4"
          >
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 font-bold text-lg flex items-center justify-center">
                    {partner.name.charAt(0)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                        {partner.name}
                      </h2>
                      {partner.isOnline ? (
                        <span className="w-2 h-2 rounded-full bg-emerald-500" title="Online" />
                      ) : (
                        <span className="w-2 h-2 rounded-full bg-slate-400" title="Offline" />
                      )}
                    </div>
                    <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                      <Globe className="w-3 h-3" /> {partner.country} · Native {partner.nativeLanguage}
                    </p>
                  </div>
                </div>

                <LevelTag level={partner.level} />
              </div>

              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                {partner.bio}
              </p>

              <div className="flex flex-wrap gap-1">
                {partner.interests.map((interest) => (
                  <span
                    key={interest}
                    className="text-[11px] text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded"
                  >
                    {interest}
                  </span>
                ))}
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <span className="text-xs text-slate-500">
                {partner.isOnline ? 'Active now' : 'Seen recently'}
              </span>
              <Button
                variant={invitedId === partner.id ? 'secondary' : 'primary'}
                size="sm"
                onClick={() => handleInvite(partner.id)}
                leftIcon={invitedId === partner.id ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Send className="w-3.5 h-3.5" />}
              >
                {invitedId === partner.id ? 'Invitation Sent' : 'Invite to Practice'}
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
