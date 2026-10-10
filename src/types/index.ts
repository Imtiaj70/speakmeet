export type EnglishLevel = 
  | 'All Levels'
  | 'Any Level'
  | 'Beginner'
  | 'Elementary'
  | 'Intermediate'
  | 'Upper Intermediate'
  | 'Advanced'
  | 'Fluent';

export type LanguageLevel = EnglishLevel;

export type LearningGoal =
  | 'Daily conversation'
  | 'IELTS'
  | 'Academic English'
  | 'Job interview'
  | 'Travel'
  | 'International communication'
  | 'General improvement';

export type UserRole = 'user' | 'moderator' | 'admin';

export interface UserProfile {
  id?: string;
  _id?: string;
  firebaseUid?: string;
  name: string;
  username: string;
  email: string;
  avatar?: string;
  avatarUrl?: string;
  country: string;
  countryCode?: string;
  nativeLanguage: string;
  englishLevel: EnglishLevel;
  learningGoals: LearningGoal[];
  interests: string[];
  bio: string;
  speakingSessions: number;
  speakingMinutes: number;
  currentStreak: number;
  longestStreak: number;
  role: UserRole;
  isBanned?: boolean;
  isOnline?: boolean;
  isProfileComplete?: boolean;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

export interface SpeakingRoom {
  _id?: string;
  id: string;
  name: string;
  slug?: string;
  topic?: string;
  topicId?: string;
  topicTitle?: string;
  description: string;
  englishLevel: EnglishLevel | 'All Levels';
  hostId: string;
  hostName: string;
  hostCountry?: string;
  hostAvatar?: string;
  participantCount?: number;
  currentParticipants: number;
  maxParticipants: number;
  isPrivate?: boolean;
  visibility?: 'public' | 'private';
  conversationLanguage?: string;
  language?: string;
  isLocked?: boolean;
  status: 'waiting' | 'active' | 'closed' | 'full' | 'ended';
  createdAt: string;
  updatedAt?: string;
  tags?: string[];
}

export interface RoomParticipant {
  _id?: string;
  roomId?: string;
  userId: string;
  username: string;
  displayName?: string;
  avatar?: string;
  photoURL?: string;
  country?: string;
  englishLevel: string;
  role?: 'host' | 'participant' | 'moderator' | 'admin';
  isHost?: boolean;
  isOnline?: boolean;
  joinedAt?: string;
  isMuted?: boolean;
}

export interface TopicItem {
  _id?: string;
  id: string;
  slug?: string;
  title: string;
  description: string;
  category: string;
  difficulty: EnglishLevel;
  questions: string[];
  popularCount?: number;
  iconName?: string;
  createdAt?: string;
}

export interface PlatformStat {
  label: string;
  value: string;
  subtext: string;
  icon: string;
}

export interface TestimonialItem {
  id: string;
  name: string;
  country: string;
  countryCode: string;
  avatar: string;
  quote: string;
  levelProgress: string;
  minutesPracticed: number;
}
