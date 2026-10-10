import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import {
  Shield,
  Users,
  AlertTriangle,
  Ban,
  Radio,
  CheckCircle,
  Trash2,
  Megaphone,
  Crown,
  Search,
  RefreshCw,
  Eye,
  Sparkles,
  Key,
  VolumeX,
  Volume2,
  Check,
  Globe,
  Sliders,
  AlertOctagon,
  UserX,
  ShieldCheck,
  DollarSign,
} from 'lucide-react';
import { Button } from '../components/common/Button';
import { adminApi, AdminStats, AdminReport } from '../services/adminApi';
import { UserProfile, SpeakingRoom } from '../types';
import { AdminFinancesTab } from '../components/admin/AdminFinancesTab';

export const AdminPage: React.FC = () => {
  const { user, isAdmin } = useAuth();

  const [activeTab, setActiveTab] = useState<'overview' | 'rooms' | 'users' | 'reports' | 'broadcast' | 'finances'>('overview');
  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 0,
    activeRooms: 0,
    totalRooms: 0,
    totalParticipants: 0,
    pendingReports: 0,
  });
  const [rooms, setRooms] = useState<SpeakingRoom[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [reports, setReports] = useState<AdminReport[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [actionMessage, setActionMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Search filter for users & rooms
  const [userSearch, setUserSearch] = useState('');
  const [roomSearch, setRoomSearch] = useState('');

  // Announcement state
  const [broadcastMessage, setBroadcastMessage] = useState('');
  const [broadcastActive, setBroadcastActive] = useState(true);
  const [broadcastType, setBroadcastType] = useState<'info' | 'warning' | 'success' | 'alert'>('info');
  const [isUpdatingBroadcast, setIsUpdatingBroadcast] = useState(false);

  const showNotification = (text: string, type: 'success' | 'error' = 'success') => {
    setActionMessage({ text, type });
    setTimeout(() => setActionMessage(null), 4000);
  };

  const loadAllData = async () => {
    setIsLoading(true);
    try {
      const [overviewRes, usersRes, roomsRes, reportsRes] = await Promise.all([
        adminApi.getOverview().catch(() => ({ success: false, stats: undefined })),
        adminApi.getUsers().catch(() => ({ success: false, users: [] })),
        adminApi.getAllRooms().catch(() => ({ success: false, rooms: [] })),
        adminApi.getReports().catch(() => ({ success: false, reports: [] })),
      ]);

      if (overviewRes.stats) {
        setStats(overviewRes.stats);
        if (overviewRes.stats.announcement) {
          setBroadcastMessage(overviewRes.stats.announcement.message || '');
          setBroadcastActive(overviewRes.stats.announcement.active ?? true);
          setBroadcastType(overviewRes.stats.announcement.type || 'info');
        }
      }

      if (usersRes.users) {
        setUsers(usersRes.users);
      }

      if (roomsRes.rooms) {
        setRooms(roomsRes.rooms);
      }

      if (reportsRes.reports) {
        setReports(reportsRes.reports);
      }
    } catch (err) {
      console.error('Failed to load admin data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  // Handle Room Actions
  const handleForceCloseRoom = async (roomId: string, roomName: string) => {
    if (!window.confirm(`Are you sure you want to forcibly terminate and purge "${roomName}"?`)) {
      return;
    }
    try {
      await adminApi.forceDeleteRoom(roomId);
      showNotification(`Room "${roomName}" successfully closed and removed!`, 'success');
      setRooms((prev) => prev.filter((r) => r.id !== roomId && (r as any)._id !== roomId));
      setStats((prev) => ({
        ...prev,
        activeRooms: Math.max(0, prev.activeRooms - 1),
        totalRooms: Math.max(0, prev.totalRooms - 1),
      }));
    } catch (err: any) {
      showNotification(err.response?.data?.message || 'Failed to close room', 'error');
    }
  };

  // Handle User Role Change
  const handleRoleChange = async (targetUid: string, targetName: string, newRole: 'user' | 'moderator' | 'admin') => {
    try {
      await adminApi.updateUserRole(targetUid, newRole);
      setUsers((prev) =>
        prev.map((u) => (u.firebaseUid === targetUid || u.id === targetUid ? { ...u, role: newRole } : u))
      );
      showNotification(`Updated role for ${targetName} to "${newRole.toUpperCase()}"`, 'success');
    } catch (err: any) {
      showNotification(err.response?.data?.message || 'Failed to update user role', 'error');
    }
  };

  // Handle Ban / Unban
  const handleToggleBan = async (targetUid: string, targetName: string, currentBanned: boolean) => {
    const action = currentBanned ? 'unban' : 'ban';
    if (!window.confirm(`Are you sure you want to ${action} ${targetName}?`)) {
      return;
    }
    try {
      await adminApi.toggleUserBan(targetUid, !currentBanned);
      setUsers((prev) =>
        prev.map((u) =>
          u.firebaseUid === targetUid || u.id === targetUid ? { ...u, isBanned: !currentBanned } : u
        )
      );
      showNotification(`User ${targetName} is now ${!currentBanned ? 'BANNED' : 'UNBANNED'}`, 'success');
    } catch (err: any) {
      showNotification(err.response?.data?.message || `Failed to ${action} user`, 'error');
    }
  };

  // Handle User Deletion
  const handleDeleteUser = async (targetUid: string, targetName: string) => {
    if (!window.confirm(`CRITICAL: Are you sure you want to permanently delete user account "${targetName}"?`)) {
      return;
    }
    try {
      await adminApi.deleteUser(targetUid);
      setUsers((prev) => prev.filter((u) => u.firebaseUid !== targetUid && u.id !== targetUid));
      showNotification(`User account "${targetName}" has been deleted.`, 'success');
    } catch (err: any) {
      showNotification(err.response?.data?.message || 'Failed to delete user account', 'error');
    }
  };

  // Handle Broadcast Announcement Update
  const handleSaveBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdatingBroadcast(true);
    try {
      await adminApi.updateAnnouncement({
        message: broadcastMessage,
        active: broadcastActive,
        type: broadcastType,
      });
      showNotification('Global broadcast announcement published successfully!', 'success');
    } catch (err: any) {
      showNotification(err.response?.data?.message || 'Failed to update announcement', 'error');
    } finally {
      setIsUpdatingBroadcast(false);
    }
  };

  // Handle Report Actions
  const handleReportAction = async (reportId: string, action: 'dismiss' | 'ban') => {
    try {
      await adminApi.actionReport(reportId, action);
      setReports((prev) =>
        prev.map((r) => (r.id === reportId ? { ...r, status: action === 'ban' ? 'banned' : 'resolved' } : r))
      );
      showNotification(action === 'ban' ? 'User has been banned and report resolved.' : 'Report dismissed.', 'success');
    } catch (err: any) {
      showNotification(err.response?.data?.message || 'Action failed', 'error');
    }
  };

  // Filter users
  const filteredUsers = users.filter((u) => {
    const q = userSearch.toLowerCase();
    return (
      (u.name && u.name.toLowerCase().includes(q)) ||
      (u.email && u.email.toLowerCase().includes(q)) ||
      (u.username && u.username.toLowerCase().includes(q)) ||
      (u.country && u.country.toLowerCase().includes(q))
    );
  });

  // Filter rooms
  const filteredRooms = rooms.filter((r) => {
    const q = roomSearch.toLowerCase();
    return (
      (r.name && r.name.toLowerCase().includes(q)) ||
      (r.hostName && r.hostName.toLowerCase().includes(q)) ||
      (r.topicTitle && r.topicTitle.toLowerCase().includes(q)) ||
      (r.topic && r.topic.toLowerCase().includes(q))
    );
  });

  return (
    <div className="py-8 sm:py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
      {/* Admin Privilege Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl bg-gradient-to-r from-amber-500/10 via-indigo-500/10 to-emerald-500/10 border border-amber-500/30 dark:border-amber-500/20 backdrop-blur-sm">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/30">
            <Shield className="w-3.5 h-3.5 text-amber-500" />
            <span>Super Administrator Console</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            SpeakMate Master Control Panel
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300">
            সম্পূর্ণ নিয়ন্ত্রণ (Full Administrative Control) · Authenticated Admin:{' '}
            <span className="font-semibold text-slate-900 dark:text-white">
              {user?.email || 'imtiajuddinsohag99@gmail.com'}
            </span>
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <Button
            variant="outline"
            size="sm"
            onClick={loadAllData}
            isLoading={isLoading}
            leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
          >
            Sync Data
          </Button>

          <Link to="/rooms">
            <Button variant="secondary" size="sm" leftIcon={<Eye className="w-3.5 h-3.5" />}>
              View Live Rooms
            </Button>
          </Link>
        </div>
      </div>

      {/* Action Notification Toast */}
      {actionMessage && (
        <div
          className={`p-4 rounded-xl flex items-center justify-between gap-3 text-sm font-medium animate-in fade-in slide-in-from-top-2 duration-200 ${
            actionMessage.type === 'success'
              ? 'bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200'
              : 'bg-rose-50 dark:bg-rose-950/60 border border-rose-300 dark:border-rose-800 text-rose-800 dark:text-rose-200'
          }`}
        >
          <div className="flex items-center gap-2">
            {actionMessage.type === 'success' ? (
              <CheckCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-rose-600 dark:text-rose-400" />
            )}
            <span>{actionMessage.text}</span>
          </div>
          <button onClick={() => setActionMessage(null)} className="text-xs opacity-70 hover:opacity-100">
            Dismiss
          </button>
        </div>
      )}

      {/* Real-time Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-800 space-y-1 shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>Registered Speakers</span>
            <Users className="w-4 h-4 text-indigo-500" />
          </div>
          <p className="text-2xl font-extrabold text-slate-900 dark:text-white">
            {stats.totalUsers || users.length || 1}
          </p>
          <span className="text-[11px] text-emerald-600 dark:text-emerald-400 flex items-center gap-1 font-medium">
            <Check className="w-3 h-3" /> Database connected
          </span>
        </div>

        <div className="p-5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-800 space-y-1 shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>Active Live Rooms</span>
            <Radio className="w-4 h-4 text-emerald-500 animate-pulse" />
          </div>
          <p className="text-2xl font-extrabold text-slate-900 dark:text-white">
            {rooms.filter((r) => r.status !== 'closed').length}
          </p>
          <span className="text-[11px] text-slate-500 dark:text-slate-400">
            {stats.totalParticipants || 0} active in audio
          </span>
        </div>

        <div className="p-5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-800 space-y-1 shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>Pending Reports</span>
            <AlertTriangle className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-2xl font-extrabold text-slate-900 dark:text-white">
            {reports.filter((r) => r.status === 'pending').length}
          </p>
          <span className="text-[11px] text-amber-600 dark:text-amber-400 font-medium">
            Moderation queue
          </span>
        </div>

        <div className="p-5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-800 space-y-1 shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>WebRTC Audio Health</span>
            <CheckCircle className="w-4 h-4 text-teal-500" />
          </div>
          <p className="text-2xl font-extrabold text-slate-900 dark:text-white">100%</p>
          <span className="text-[11px] text-slate-500 dark:text-slate-400">Low-latency audio mesh</span>
        </div>
      </div>

      {/* Tabs Header */}
      <div className="border-b border-slate-200 dark:border-slate-800">
        <nav className="flex space-x-2 sm:space-x-4 overflow-x-auto pb-px">
          {[
            { id: 'overview', label: 'Overview & System', icon: Sliders },
            { id: 'rooms', label: `Rooms Control (${rooms.length})`, icon: Radio },
            { id: 'users', label: `Users & Roles (${users.length})`, icon: Users },
            { id: 'broadcast', label: 'Broadcast Banner', icon: Megaphone },
            { id: 'reports', label: `Safety Reports (${reports.filter((r) => r.status === 'pending').length})`, icon: AlertTriangle },
            { id: 'finances', label: 'Finances & Payouts (পেমেন্ট ও রাজস্ব)', icon: DollarSign },
          ].map((tab) => {
            const Icon = tab.icon;
            const isSelected = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-3 px-3 sm:px-4 text-xs sm:text-sm font-semibold rounded-t-lg border-b-2 flex items-center gap-2 whitespace-nowrap transition-colors ${
                  isSelected
                    ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 bg-indigo-50/50 dark:bg-indigo-950/20'
                    : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:border-slate-300'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* TAB 1: OVERVIEW & SYSTEM */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Quick Admin Actions Box */}
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-800 p-6 space-y-4">
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Crown className="w-4 h-4 text-amber-500" />
                Admin Quick Controls
              </h2>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                You have master administrative authority over all voice chat rooms, attendee accounts, and real-time announcements.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <button
                  onClick={() => setActiveTab('rooms')}
                  className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 text-left transition-colors group"
                >
                  <div className="flex items-center gap-2 font-bold text-xs text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                    <Radio className="w-4 h-4 text-emerald-500" />
                    Manage Speaking Rooms
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                    Terminate, view, or purge any room
                  </p>
                </button>

                <button
                  onClick={() => setActiveTab('users')}
                  className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 text-left transition-colors group"
                >
                  <div className="flex items-center gap-2 font-bold text-xs text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                    <Users className="w-4 h-4 text-indigo-500" />
                    Manage Users & Bans
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                    Promote roles, ban abusive accounts
                  </p>
                </button>

                <button
                  onClick={() => setActiveTab('broadcast')}
                  className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 text-left transition-colors group"
                >
                  <div className="flex items-center gap-2 font-bold text-xs text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                    <Megaphone className="w-4 h-4 text-amber-500" />
                    Publish Site Notice
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                    Display global banner for all users
                  </p>
                </button>

                <Link
                  to="/rooms/create"
                  className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 text-left transition-colors group block"
                >
                  <div className="flex items-center gap-2 font-bold text-xs text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                    <Sparkles className="w-4 h-4 text-purple-500" />
                    Create Official Room
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                    Launch a featured speaking room
                  </p>
                </Link>
              </div>
            </div>

            {/* Current Broadcast Notice Preview */}
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-800 p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Megaphone className="w-4 h-4 text-indigo-500" />
                  Live Platform Announcement
                </h2>
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                    broadcastActive ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' : 'bg-slate-200 text-slate-600 dark:bg-slate-800'
                  }`}
                >
                  {broadcastActive ? 'Active' : 'Disabled'}
                </span>
              </div>

              <div className="p-4 rounded-xl bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                <p className="text-xs font-semibold text-slate-900 dark:text-white">
                  "{broadcastMessage || 'No announcement message configured.'}"
                </p>
                <div className="flex items-center gap-3 mt-2 text-[11px] text-slate-500 dark:text-slate-400">
                  <span>Type: <b className="capitalize">{broadcastType}</b></span>
                  <span>Visible to all site visitors</span>
                </div>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setActiveTab('broadcast')}
                className="w-full text-xs"
              >
                Edit Announcement Banner
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: ROOM MANAGEMENT */}
      {activeTab === 'rooms' && (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-800 p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Radio className="w-5 h-5 text-emerald-500" />
                Live Speaking Rooms Master Control
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Super Admins have full power to close, delete, or inspect any live speaking room immediately.
              </p>
            </div>

            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search rooms..."
                value={roomSearch}
                onChange={(e) => setRoomSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-200 dark:border-slate-800 text-slate-400 uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-3">Room Title</th>
                  <th className="py-3 px-3">Host</th>
                  <th className="py-3 px-3">Topic / Level</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3">Attendees</th>
                  <th className="py-3 px-3 text-right">Admin Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                {filteredRooms.length > 0 ? (
                  filteredRooms.map((room) => {
                    const roomId = room.id || (room as any)._id;
                    const isClosed = room.status === 'closed';
                    return (
                      <tr key={roomId} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors">
                        <td className="py-3 px-3 font-semibold text-slate-900 dark:text-white">
                          <Link to={`/rooms/${roomId}`} className="hover:text-indigo-600 dark:hover:text-indigo-400 flex items-center gap-1.5">
                            {room.name}
                            <Eye className="w-3.5 h-3.5 text-slate-400" />
                          </Link>
                        </td>
                        <td className="py-3 px-3 font-medium">
                          {room.hostName || 'Host'}
                          {room.hostCountry && (
                            <span className="text-slate-400 text-[10px] block">{room.hostCountry}</span>
                          )}
                        </td>
                        <td className="py-3 px-3">
                          <span className="font-medium text-slate-800 dark:text-slate-200">
                            {room.topicTitle || room.topic || 'General'}
                          </span>
                          <span className="text-[10px] text-slate-400 block">{room.englishLevel}</span>
                        </td>
                        <td className="py-3 px-3">
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                              isClosed
                                ? 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                                : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                            }`}
                          >
                            {!isClosed && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />}
                            {room.status || 'active'}
                          </span>
                        </td>
                        <td className="py-3 px-3 font-mono font-medium">
                          {room.participantCount ?? room.currentParticipants ?? 1}/{room.maxParticipants}
                        </td>
                        <td className="py-3 px-3 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Link to={`/rooms/${roomId}`}>
                              <Button variant="outline" size="sm" className="text-[11px] h-7 px-2">
                                Enter
                              </Button>
                            </Link>

                            <Button
                              variant="danger"
                              size="sm"
                              onClick={() => handleForceCloseRoom(roomId, room.name)}
                              className="text-[11px] h-7 px-2.5"
                              leftIcon={<Trash2 className="w-3.5 h-3.5" />}
                            >
                              Force Delete
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-400 text-sm">
                      {roomSearch ? 'No rooms match your search query.' : 'No active speaking rooms found.'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: USER MANAGEMENT & ROLE CONTROL */}
      {activeTab === 'users' && (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-800 p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Users className="w-5 h-5 text-indigo-500" />
                User Management & Access Control
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Promote or demote roles (Admin / Moderator / User), toggle user bans, and purge accounts.
              </p>
            </div>

            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search by name, email, username..."
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-200 dark:border-slate-800 text-slate-400 uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-3">User</th>
                  <th className="py-3 px-3">Email</th>
                  <th className="py-3 px-3">Level / Country</th>
                  <th className="py-3 px-3">Current Role</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3 text-right">Admin Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                {filteredUsers.length > 0 ? (
                  filteredUsers.map((u) => {
                    const uid = u.firebaseUid || u.id || (u as any)._id;
                    const isBanned = Boolean(u.isBanned);
                    const isSelf = u.email === user?.email || uid === user?.firebaseUid;

                    return (
                      <tr key={uid} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors">
                        <td className="py-3 px-3">
                          <div className="flex items-center gap-2.5">
                            <img
                              src={u.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${u.username || 'user'}`}
                              alt={u.name}
                              className="w-7 h-7 rounded-full bg-slate-200 dark:bg-slate-700 object-cover"
                            />
                            <div>
                              <p className="font-semibold text-slate-900 dark:text-white flex items-center gap-1.5">
                                {u.name}
                                {isSelf && (
                                  <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300">
                                    YOU
                                  </span>
                                )}
                              </p>
                              <span className="text-slate-400 text-[10px]">@{u.username}</span>
                            </div>
                          </div>
                        </td>

                        <td className="py-3 px-3 font-mono text-[11px] text-slate-600 dark:text-slate-300">
                          {u.email || 'N/A'}
                        </td>

                        <td className="py-3 px-3">
                          <span className="font-medium">{u.englishLevel || 'Intermediate'}</span>
                          <span className="text-[10px] text-slate-400 block">{u.country || 'Global'}</span>
                        </td>

                        <td className="py-3 px-3">
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                              u.role === 'admin'
                                ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-300 dark:border-amber-800'
                                : u.role === 'moderator'
                                ? 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300'
                                : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                            }`}
                          >
                            {u.role === 'admin' && <Crown className="w-3 h-3 text-amber-500" />}
                            {u.role || 'user'}
                          </span>
                        </td>

                        <td className="py-3 px-3">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                              isBanned
                                ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                                : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400'
                            }`}
                          >
                            {isBanned ? 'BANNED' : 'Active'}
                          </span>
                        </td>

                        <td className="py-3 px-3 text-right">
                          <div className="flex items-center justify-end gap-1.5 flex-wrap">
                            {/* Role Select Buttons */}
                            {u.role !== 'admin' && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleRoleChange(uid, u.name, 'admin')}
                                className="text-[10px] h-6 px-1.5 text-amber-600 border-amber-300 hover:bg-amber-50"
                              >
                                Make Admin
                              </Button>
                            )}

                            {u.role === 'admin' && !isSelf && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleRoleChange(uid, u.name, 'user')}
                                className="text-[10px] h-6 px-1.5"
                              >
                                Demote
                              </Button>
                            )}

                            {/* Ban / Unban Button */}
                            {!isSelf && (
                              <Button
                                variant={isBanned ? 'outline' : 'danger'}
                                size="sm"
                                onClick={() => handleToggleBan(uid, u.name, isBanned)}
                                className="text-[10px] h-6 px-2"
                              >
                                {isBanned ? 'Unban' : 'Ban'}
                              </Button>
                            )}

                            {/* Delete User */}
                            {!isSelf && (
                              <button
                                onClick={() => handleDeleteUser(uid, u.name)}
                                className="p-1 text-slate-400 hover:text-rose-600 transition-colors"
                                title="Delete user"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-400 text-sm">
                      {userSearch ? 'No users matched your search.' : 'No users found in database.'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: BROADCAST BANNER */}
      {activeTab === 'broadcast' && (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-800 p-6 max-w-2xl space-y-6">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Megaphone className="w-5 h-5 text-amber-500" />
              Global Website Announcement Banner
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              When enabled, this notice is displayed across the top header of all pages for every visitor and member.
            </p>
          </div>

          <form onSubmit={handleSaveBroadcast} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Announcement Message
              </label>
              <textarea
                rows={3}
                value={broadcastMessage}
                onChange={(e) => setBroadcastMessage(e.target.value)}
                placeholder="e.g. Welcome to SpeakMate! Free English practice rooms are live."
                className="w-full p-3 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Banner Style / Urgency
                </label>
                <select
                  value={broadcastType}
                  onChange={(e) => setBroadcastType(e.target.value as any)}
                  className="w-full p-2.5 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="info">Indigo (Standard Information)</option>
                  <option value="warning">Amber (Notice / Maintenance)</option>
                  <option value="success">Emerald (Feature Update / Success)</option>
                  <option value="alert">Rose (Urgent Alert)</option>
                </select>
              </div>

              <div className="flex items-center gap-3 pt-6">
                <input
                  type="checkbox"
                  id="activeToggle"
                  checked={broadcastActive}
                  onChange={(e) => setBroadcastActive(e.target.checked)}
                  className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500"
                />
                <label htmlFor="activeToggle" className="text-xs font-semibold text-slate-800 dark:text-slate-200 cursor-pointer">
                  Activate Banner Live on Site
                </label>
              </div>
            </div>

            <div className="pt-2">
              <Button
                type="submit"
                variant="primary"
                size="md"
                isLoading={isUpdatingBroadcast}
                leftIcon={<Megaphone className="w-4 h-4" />}
              >
                Publish Global Announcement
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* TAB 5: SAFETY REPORTS */}
      {activeTab === 'reports' && (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-800 p-6 space-y-4">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              Community Safety & Moderation Reports
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Users reported by community members for inappropriate behavior or noise abuse.
            </p>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {reports.map((rep) => (
              <div key={rep.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-xs">
                    <span className="font-bold text-slate-900 dark:text-white">@{rep.reportedUser}</span>
                    <span className="text-slate-400">reported by {rep.reporter} in room "{rep.room}"</span>
                    <span aria-hidden="true">·</span>
                    <span className="text-slate-400">{rep.date}</span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        rep.status === 'banned'
                          ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                          : rep.status === 'resolved'
                          ? 'bg-slate-100 text-slate-600 dark:bg-slate-800'
                          : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                      }`}
                    >
                      {rep.status}
                    </span>
                  </div>
                  <p className="text-xs text-rose-600 dark:text-rose-400 font-medium">
                    Reason: {rep.reason}
                  </p>
                </div>

                {rep.status === 'pending' && (
                  <div className="flex items-center gap-2 shrink-0">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleReportAction(rep.id, 'dismiss')}
                      className="text-xs"
                    >
                      Dismiss
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => handleReportAction(rep.id, 'ban')}
                      className="text-xs"
                      leftIcon={<Ban className="w-3.5 h-3.5" />}
                    >
                      Issue Ban
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 6: FINANCES, PAYOUTS & MONETIZATION */}
      {activeTab === 'finances' && <AdminFinancesTab />}
    </div>
  );
};
