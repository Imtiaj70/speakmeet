import React, { useState, useEffect } from 'react';
import { Megaphone, X } from 'lucide-react';
import { adminApi } from '../../services/adminApi';

export const AnnouncementBanner: React.FC = () => {
  const [announcement, setAnnouncement] = useState<{
    id: string;
    active: boolean;
    message: string;
    type: 'info' | 'warning' | 'success' | 'alert';
  } | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    let isMounted = true;
    adminApi
      .getAnnouncement()
      .then((res) => {
        if (isMounted && res?.announcement?.active && res.announcement.message) {
          // Check if previously dismissed this particular message
          const lastDismissedId = localStorage.getItem('dismissed_announcement_id');
          if (lastDismissedId !== res.announcement.id) {
            setAnnouncement(res.announcement);
          }
        }
      })
      .catch(() => {
        // Silently ignore if offline
      });

    return () => {
      isMounted = false;
    };
  }, []);

  if (!announcement || !announcement.active || dismissed) {
    return null;
  }

  const handleDismiss = () => {
    setDismissed(true);
    if (announcement.id) {
      localStorage.setItem('dismissed_announcement_id', announcement.id);
    }
  };

  const bgStyles = {
    info: 'bg-indigo-600 text-white',
    warning: 'bg-amber-600 text-white',
    success: 'bg-emerald-600 text-white',
    alert: 'bg-rose-600 text-white',
  }[announcement.type || 'info'];

  return (
    <div className={`relative px-4 py-2 text-xs sm:text-sm font-medium transition-all ${bgStyles}`}>
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 overflow-hidden">
          <Megaphone className="w-4 h-4 shrink-0 animate-bounce" />
          <span className="truncate">{announcement.message}</span>
        </div>
        <button
          onClick={handleDismiss}
          className="p-1 rounded hover:bg-black/20 focus:outline-none transition-colors shrink-0"
          aria-label="Dismiss banner"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
