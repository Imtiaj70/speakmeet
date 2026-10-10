import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Mic,
  Globe,
  Compass,
  BookOpen,
  Menu,
  X,
  User,
  LogOut,
  LayoutDashboard,
  Shield,
  Flame,
  Settings,
  ChevronDown,
  Crown,
  Copy,
  Check,
  Sun,
  Moon,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { ThemeToggle } from '../common/ThemeToggle';
import { Button } from '../common/Button';
import { VipModal } from '../common/VipModal';
import { SpeakMateLogo } from '../common/SpeakMateLogo';

export const Navbar: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [isVipModalOpen, setIsVipModalOpen] = useState(false);
  const [copiedId, setCopiedId] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const location = useLocation();
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setUserDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const navLinks = [
    { name: 'Live Rooms', href: '/rooms', icon: Globe },
    { name: 'Topics Library', href: '/topics', icon: BookOpen },
    { name: 'About & Method', href: '/about', icon: Compass },
  ];

  const authLinks = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Find Partner', href: '/partner', icon: Globe },
  ];

  const isActive = (path: string) => {
    if (path === '/rooms') {
      return location.pathname === '/' || location.pathname.startsWith('/rooms');
    }
    if (path === '/' && location.pathname !== '/') return false;
    return location.pathname.startsWith(path);
  };

  const avatarSrc =
    user?.avatar ||
    user?.avatarUrl ||
    `https://api.dicebear.com/7.x/bottts/svg?seed=${user?.username || 'user'}`;

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 dark:border-slate-800/80 bg-white/90 dark:bg-slate-950/90 backdrop-blur-md transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link
            to="/home"
            title="Go to SpeakMate Home Page"
            className="focus-visible:outline-indigo-500 rounded-lg py-1"
          >
            <SpeakMateLogo size="md" showTagline={true} />
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.href}
                className={`px-3.5 py-2 text-sm font-medium rounded-lg transition-colors ${
                  isActive(link.href)
                    ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50/70 dark:bg-indigo-950/40'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/70 dark:hover:bg-slate-800/60'
                }`}
              >
                {link.name}
              </Link>
            ))}

            {isAuthenticated &&
              authLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.href}
                  className={`px-3.5 py-2 text-sm font-medium rounded-lg transition-colors ${
                    isActive(link.href)
                      ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50/70 dark:bg-indigo-950/40'
                      : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/70 dark:hover:bg-slate-800/60'
                  }`}
                >
                  {link.name}
                </Link>
              ))}
          </nav>

          {/* Right Action Icons & Auth */}
          <div className="hidden md:flex items-center gap-3">
            <ThemeToggle />

            {isAuthenticated && user ? (
              <div className="flex items-center gap-3 pl-2 border-l border-slate-200 dark:border-slate-800 relative" ref={dropdownRef}>
                {/* Streak Badge */}
                <div className="flex items-center gap-1 text-xs font-semibold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/50 px-2.5 py-1 rounded-md border border-amber-200/60 dark:border-amber-900/50">
                  <Flame className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                  <span>{user.currentStreak || 1}d streak</span>
                </div>

                {/* Profile Trigger Button */}
                <button
                  type="button"
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2 p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors focus:outline-none border border-slate-200/80 dark:border-slate-700/80 bg-slate-50 dark:bg-slate-900 cursor-pointer"
                >
                  <img
                    src={avatarSrc}
                    alt={user.name}
                    className="w-7 h-7 rounded-full border border-indigo-500 bg-slate-200 dark:bg-slate-700 object-cover"
                  />
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200 leading-tight hidden lg:inline max-w-[110px] truncate">
                    {user.name}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 mr-0.5" />
                </button>

                {/* Free4Talk-Style Rich Profile Dropdown Menu */}
                {userDropdownOpen && (
                  <div className="absolute right-0 top-12 w-72 sm:w-80 bg-white dark:bg-[#131b26] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-4 z-50 animate-in fade-in zoom-in-95 duration-100 space-y-3">
                    {/* Centered Large Avatar & User Details */}
                    <div className="text-center space-y-1.5 pt-1">
                      <div className="relative inline-block">
                        <img
                          src={avatarSrc}
                          alt={user.name}
                          className="w-16 h-16 sm:w-18 sm:h-18 rounded-full border-2 border-indigo-500 shadow-md object-cover mx-auto bg-slate-100 dark:bg-slate-800"
                        />
                        <span className="absolute bottom-0 right-1 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-white dark:border-[#131b26]" title="Online" />
                      </div>

                      {/* Unique User ID with Copy Action */}
                      <div className="flex items-center justify-center gap-2 text-xs text-slate-500 dark:text-slate-400 pt-0.5">
                        <span className="font-mono font-medium">
                          ID: {(user.id || user.firebaseUid || 'UGVI1F2B2ECG').slice(0, 12).toUpperCase()}
                        </span>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigator.clipboard.writeText(
                              (user.id || user.firebaseUid || 'UGVI1F2B2ECG').slice(0, 12).toUpperCase()
                            );
                            setCopiedId(true);
                            setTimeout(() => setCopiedId(false), 2000);
                          }}
                          className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 hover:underline inline-flex items-center gap-1 cursor-pointer"
                        >
                          {copiedId ? (
                            <>
                              <Check className="w-3 h-3 text-emerald-500" />
                              <span className="text-emerald-500">Copied</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3" />
                              <span>Copy ID</span>
                            </>
                          )}
                        </button>
                      </div>

                      {/* Name & Email */}
                      <div>
                        <p className="text-sm font-bold text-slate-900 dark:text-white">
                          Name: {user.name}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                          Email: {user.email || `${user.username}@speakmate.com`}
                        </p>
                      </div>

                      {/* Social Counters: Followers / Friends / Following */}
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium flex items-center justify-center gap-3 pt-0.5">
                        <span>Followers: <strong className="text-slate-800 dark:text-slate-200">0</strong></span>
                        <span>Friends: <strong className="text-slate-800 dark:text-slate-200">0</strong></span>
                        <span>Following: <strong className="text-slate-800 dark:text-slate-200">0</strong></span>
                      </div>

                      {/* Account Creation Date */}
                      <p className="text-[10px] text-slate-400 dark:text-slate-500">
                        Created At: {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Active Member'}
                      </p>
                    </div>

                    <div className="border-t border-slate-100 dark:border-slate-800/80 my-2" />

                    {/* Navigation Actions Menu */}
                    <div className="space-y-0.5 text-xs">
                      <Link
                        to="/profile"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 rounded-lg font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/80 transition-colors"
                      >
                        <User className="w-4 h-4 text-slate-400" />
                        <span>My Profile</span>
                      </Link>

                      <button
                        type="button"
                        onClick={() => {
                          setUserDropdownOpen(false);
                          setIsVipModalOpen(true);
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/80 transition-colors text-left cursor-pointer"
                      >
                        <Crown className="w-4 h-4 text-amber-500" />
                        <span>Supporter / VIP Settings</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => toggleTheme()}
                        className="w-full flex items-center justify-between px-3 py-2 rounded-lg font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/80 transition-colors text-left cursor-pointer"
                      >
                        <div className="flex items-center gap-2.5">
                          {theme === 'dark' ? (
                            <Moon className="w-4 h-4 text-indigo-400" />
                          ) : (
                            <Sun className="w-4 h-4 text-amber-500" />
                          )}
                          <span>Theme Settings</span>
                        </div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                          {theme === 'dark' ? 'Dark' : 'Light'}
                        </span>
                      </button>

                      <Link
                        to="/dashboard"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 rounded-lg font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/80 transition-colors"
                      >
                        <LayoutDashboard className="w-4 h-4 text-slate-400" />
                        <span>Member Dashboard</span>
                      </Link>

                      {(isAdmin || user.role === 'admin') && (
                        <Link
                          to="/admin"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center gap-2.5 px-3 py-2 rounded-lg font-bold text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 hover:bg-amber-100 dark:hover:bg-amber-900/40 transition-colors"
                        >
                          <Shield className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                          <span>Platform Admin Console</span>
                        </Link>
                      )}

                      <Link
                        to="/profile/edit"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 rounded-lg font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/80 transition-colors"
                      >
                        <Settings className="w-4 h-4 text-slate-400" />
                        <span>Account & Learning Goals</span>
                      </Link>

                      <div className="border-t border-slate-100 dark:border-slate-800/80 my-1.5" />

                      <button
                        type="button"
                        onClick={() => {
                          setUserDropdownOpen(false);
                          logout();
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors cursor-pointer"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Logout</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2 pl-2">
                <Link to="/login">
                  <Button variant="ghost" size="sm">
                    Log In
                  </Button>
                </Link>
                <Link to="/register">
                  <Button variant="primary" size="sm">
                    Start Speaking
                  </Button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center gap-2">
            <ThemeToggle />
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 focus-visible:outline-indigo-500"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 px-4 pt-3 pb-6 space-y-3 shadow-lg">
          <div className="space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium ${
                  isActive(link.href)
                    ? 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40'
                    : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <link.icon className="w-4 h-4 text-slate-400" />
                {link.name}
              </Link>
            ))}

            {isAuthenticated && (
              <>
                <div className="pt-2 pb-1 border-t border-slate-200 dark:border-slate-800">
                  <span className="px-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Member Area
                  </span>
                </div>
                {authLinks.map((link) => (
                  <Link
                    key={link.name}
                    to={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    <link.icon className="w-4 h-4 text-slate-400" />
                    {link.name}
                  </Link>
                ))}
                <Link
                  to="/profile"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <User className="w-4 h-4 text-slate-400" />
                  My Profile ({user?.name})
                </Link>
                <Link
                  to="/profile/edit"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <Settings className="w-4 h-4 text-slate-400" />
                  Edit Profile & Goals
                </Link>

                {(isAdmin || user?.role === 'admin') && (
                  <Link
                    to="/admin"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-bold text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 hover:bg-amber-100 dark:hover:bg-amber-900/40 border border-amber-200 dark:border-amber-900/50"
                  >
                    <Shield className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                    Admin Control Center
                  </Link>
                )}
              </>
            )}
          </div>

          <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex flex-col gap-2">
            {isAuthenticated ? (
              <Button
                variant="outline"
                size="md"
                className="w-full justify-start text-rose-600 dark:text-rose-400"
                onClick={() => {
                  logout();
                  setMobileMenuOpen(false);
                }}
                leftIcon={<LogOut className="w-4 h-4" />}
              >
                Sign Out
              </Button>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="outline" size="md" className="w-full">
                    Log In
                  </Button>
                </Link>
                <Link to="/register" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="primary" size="md" className="w-full">
                    Start Speaking
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      )}

      {/* VIP Modal */}
      <VipModal isOpen={isVipModalOpen} onClose={() => setIsVipModalOpen(false)} />
    </header>
  );
};
