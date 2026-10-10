import React, { useState, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useRooms } from '../hooks/useRooms';
import { RoomCard } from '../components/rooms/RoomCard';
import { Button } from '../components/common/Button';
import {
  Search,
  Plus,
  Radio,
  RefreshCw,
  AlertCircle,
  Loader2,
  Crown,
  LayoutGrid,
  Zap,
} from 'lucide-react';
import { POPULAR_LANGUAGES } from '../data/languages';
import { BuyCoffeeButton } from '../components/common/BuyCoffeeButton';
import { AdBanner } from '../components/ads/AdBanner';
import { VipModal } from '../components/common/VipModal';
import { CreateRoomModal } from '../components/rooms/CreateRoomModal';
import { LiveOnlineCounter } from '../components/common/LiveOnlineCounter';
import { isUserVip } from '../config/vipStore';
import { useQuickMatch } from '../hooks/useQuickMatch';

export const RoomsPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const initialTopic = searchParams.get('topic') || 'All';
  const initialLanguage = searchParams.get('lang') || 'All';

  const [search, setSearch] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState<string>(initialLanguage);
  const [selectedTopic, setSelectedTopic] = useState<string>(initialTopic);
  const [selectedLevel, setSelectedLevel] = useState<string>('All');
  const [openSeatsOnly, setOpenSeatsOnly] = useState(false);
  const [isVipModalOpen, setIsVipModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [gridDensity, setGridDensity] = useState<'3x' | '2x' | '1x'>('3x');

  // Fetch real rooms from MongoDB via TanStack Query
  const { data: roomsResponse, isLoading, isError, refetch, isFetching } = useRooms({
    search: search ? search : undefined,
    language:
      selectedLanguage !== 'All' && selectedLanguage !== 'All Languages'
        ? selectedLanguage
        : undefined,
    topic: selectedTopic !== 'All' ? selectedTopic : undefined,
    englishLevel: selectedLevel !== 'All' ? selectedLevel : undefined,
    limit: 60,
  });

  const roomsList = roomsResponse?.data || [];

  // Live count per language for the tabs (just like Free4Talk's English (183), Bengali (26))
  const languageCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    roomsList.forEach((r) => {
      const lang = r.language || r.conversationLanguage || 'English';
      counts[lang] = (counts[lang] || 0) + 1;
    });
    return counts;
  }, [roomsList]);

  const filteredRooms = roomsList.filter((room) => {
    if (openSeatsOnly) {
      const currentCount = room.participantCount ?? room.currentParticipants ?? 1;
      if (currentCount >= room.maxParticipants) return false;
    }
    return true;
  });

  // Sort VIP & Featured rooms to top
  const sortedRooms = [...filteredRooms].sort((a, b) => {
    const aVip = isUserVip(a.hostId) || isUserVip(a.hostName) || (a as any).isFeatured ? 1 : 0;
    const bVip = isUserVip(b.hostId) || isUserVip(b.hostName) || (b as any).isFeatured ? 1 : 0;
    return bVip - aVip;
  });

  const { isMatching, triggerQuickMatch } = useQuickMatch();

  const handleRefresh = () => {
    refetch();
  };

  const gridClasses =
    gridDensity === '3x'
      ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5'
      : gridDensity === '2x'
      ? 'grid grid-cols-1 md:grid-cols-2 gap-6'
      : 'grid grid-cols-1 max-w-2xl mx-auto gap-6';

  return (
    <div className="py-6 sm:py-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-5">
      {/* ======================================================== */}
      {/* 1. CLEAN CENTERED HEADER & ACTION BAR (Above the Fold) */}
      {/* ======================================================== */}
      <div className="text-center space-y-3">
        <div className="flex items-center justify-center gap-2">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Language Practice Community
          </h1>
          <LiveOnlineCounter variant="compact" />
        </div>

        {/* Mobile Dual Action Buttons (Full Width on Mobile) */}
        <div className="grid grid-cols-2 gap-2 sm:hidden pt-1">
          <button
            type="button"
            disabled={isMatching}
            onClick={triggerQuickMatch}
            className="w-full inline-flex items-center justify-center gap-1.5 py-3 px-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 active:scale-95 text-white font-extrabold text-xs shadow-md shadow-emerald-500/20 cursor-pointer disabled:opacity-75"
          >
            {isMatching ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Zap className="w-4 h-4 fill-white" />
            )}
            <span>{isMatching ? 'Connecting...' : 'Quick Match'}</span>
          </button>

          <button
            type="button"
            onClick={() => setIsCreateModalOpen(true)}
            className="w-full inline-flex items-center justify-center gap-1.5 py-3 px-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white font-bold text-xs shadow-md shadow-indigo-500/20 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Create Room</span>
          </button>
        </div>

        {/* Desktop Quick Action Buttons Row */}
        <div className="hidden sm:flex flex-wrap items-center justify-center gap-2.5 pt-1">
          <button
            type="button"
            disabled={isMatching}
            onClick={triggerQuickMatch}
            className="inline-flex items-center gap-1.5 px-4.5 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-extrabold text-xs sm:text-sm shadow-md hover:shadow-emerald-500/25 active:scale-95 transition-all cursor-pointer disabled:opacity-75"
            title="Instantly jump into an active conversation room"
          >
            {isMatching ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Zap className="w-4 h-4 fill-white" />
            )}
            <span>{isMatching ? 'Connecting...' : 'Quick Match (১-ক্লিক জয়েন)'}</span>
          </button>

          <Button
            size="md"
            variant="primary"
            leftIcon={<Plus className="w-4 h-4" />}
            onClick={() => setIsCreateModalOpen(true)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-5 py-2 rounded-xl shadow-md hover:shadow-indigo-500/25 active:scale-95 text-xs sm:text-sm"
          >
            Create a New Room
          </Button>

          <BuyCoffeeButton variant="pill" />

          <button
            type="button"
            onClick={() => setIsVipModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-300 text-slate-950 font-extrabold text-xs shadow-xs hover:shadow transition-all active:scale-95 cursor-pointer"
            title="Become a SpeakMate VIP Supporter"
          >
            <Crown className="w-3.5 h-3.5 fill-slate-950" />
            <span>VIP Supporter</span>
          </button>

          <button
            onClick={handleRefresh}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer text-xs font-semibold"
            title="Refresh room list"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isFetching ? 'animate-spin text-indigo-500' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 2. INTEGRATED SEARCH & GRID DENSITY TOGGLE (3x / 2x / 1x) */}
      {/* ======================================================== */}
      <div className="bg-white dark:bg-slate-900/90 rounded-2xl border border-slate-200/90 dark:border-slate-800 p-2 sm:p-2.5 shadow-xs flex flex-col sm:flex-row items-center gap-2.5">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by topic, user, language or country..."
            className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm bg-slate-50 dark:bg-slate-800/70 border border-slate-200/80 dark:border-slate-700/60 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
          />
        </div>

        {/* Grid Density Controls (Visible on desktop sm: screens) */}
        <div className="hidden sm:flex items-center gap-1 shrink-0 bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl border border-slate-200/70 dark:border-slate-700/50">
          {(['3x', '2x', '1x'] as const).map((density) => (
            <button
              key={density}
              type="button"
              onClick={() => setGridDensity(density)}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                gridDensity === density
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
              title={`View ${density} columns`}
            >
              {density}
            </button>
          ))}
        </div>
      </div>

      {/* ======================================================== */}
      {/* 3. LIVE LANGUAGE PILLS WITH REAL ROOM COUNTS */}
      {/* ======================================================== */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none scroll-smooth">
        <button
          onClick={() => setSelectedLanguage('All')}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl transition-all shrink-0 cursor-pointer ${
            selectedLanguage === 'All'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-700'
          }`}
        >
          <span>All</span>
          <span
            className={`text-[10px] px-1.5 py-0.2 rounded-full ${
              selectedLanguage === 'All'
                ? 'bg-indigo-700 text-indigo-100'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
            }`}
          >
            {roomsList.length}
          </span>
        </button>

        {POPULAR_LANGUAGES.filter((l) => l.code !== 'all').map((lang) => {
          const count = languageCounts[lang.name] || 0;
          const isSelected = selectedLanguage.toLowerCase() === lang.name.toLowerCase();

          return (
            <button
              key={lang.code}
              onClick={() => setSelectedLanguage(lang.name)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-xl transition-all shrink-0 cursor-pointer ${
                isSelected
                  ? 'bg-indigo-600 text-white font-bold shadow-xs'
                  : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-700'
              }`}
            >
              <span className="text-sm leading-none">{lang.flag}</span>
              <span>{lang.name}</span>
              {count > 0 && (
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                    isSelected
                      ? 'bg-indigo-700 text-indigo-100'
                      : 'bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900'
                  }`}
                >
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ======================================================== */}
      {/* 4. ROOMS GRID (Directly visible, clean spacing) */}
      {/* ======================================================== */}
      {isLoading ? (
        <div className="py-20 flex flex-col items-center justify-center space-y-3">
          <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
          <span className="text-xs text-slate-500">Connecting to live speaking lounges...</span>
        </div>
      ) : isError ? (
        <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-2xl border border-rose-200 dark:border-rose-900/50 p-6 space-y-3">
          <AlertCircle className="w-8 h-8 text-rose-500 mx-auto" />
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            Failed to load speaking rooms
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            There was a problem communicating with the database. Please try refreshing.
          </p>
          <Button size="sm" variant="outline" onClick={() => refetch()}>
            Retry
          </Button>
        </div>
      ) : sortedRooms.length > 0 ? (
        <div className={gridClasses}>
          {sortedRooms.map((room, idx) => (
            <React.Fragment key={room.id}>
              <RoomCard room={room} />
              {/* Subtle In-Feed Sponsor banner after 3rd room */}
              {idx === 2 && <AdBanner placement="in-feed" />}
            </React.Fragment>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 space-y-4">
          <Radio className="w-10 h-10 text-slate-400 mx-auto" />
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            No live rooms found for {selectedLanguage !== 'All' ? selectedLanguage : 'this filter'}
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Be the first to open a live {selectedLanguage !== 'All' ? selectedLanguage : 'speaking'} room and meet other learners!
          </p>
          <div className="pt-2 flex justify-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSearch('');
                setSelectedLanguage('All');
                setSelectedTopic('All');
                setSelectedLevel('All');
                setOpenSeatsOnly(false);
              }}
            >
              Reset Filters
            </Button>
            <Button
              size="sm"
              leftIcon={<Plus className="w-4 h-4" />}
              onClick={() => setIsCreateModalOpen(true)}
            >
              Create Room
            </Button>
          </div>
        </div>
      )}

      {/* Create Room Modal */}
      <CreateRoomModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        defaultLanguage={selectedLanguage !== 'All' ? selectedLanguage : 'English'}
        defaultLevel={selectedLevel !== 'All' ? selectedLevel : 'All Levels'}
      />

      {/* VIP Modal */}
      <VipModal isOpen={isVipModalOpen} onClose={() => setIsVipModalOpen(false)} />
    </div>
  );
};
