import React from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from './Navbar';
import { Footer } from './Footer';
import { AnnouncementBanner } from '../common/AnnouncementBanner';
import { AboutCreatorFooterSection } from './AboutCreatorFooterSection';
import { MobileBottomNav } from './MobileBottomNav';

export const AppLayout: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
      <AnnouncementBanner />
      <Navbar />
      <main className="flex-1 pb-20 md:pb-0">
        <Outlet />
      </main>
      <AboutCreatorFooterSection />
      <Footer />
      <MobileBottomNav />
    </div>
  );
};
