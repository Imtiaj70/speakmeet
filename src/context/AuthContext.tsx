import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  User as FirebaseUser,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut,
  sendPasswordResetEmail,
  updateProfile,
} from 'firebase/auth';
import { auth, googleProvider, isFirebaseConfigured } from '../config/firebase';
import { userService } from '../services/userService';
import { UserProfile } from '../types';

interface AuthContextType {
  currentUser: FirebaseUser | null;
  profile: UserProfile | null;
  user: UserProfile | null; // Unified user object for UI
  isAuthenticated: boolean;
  isAdmin: boolean;
  loading: boolean;
  isLoading: boolean; // Alias for backward compatibility
  login: (email: string, pass: string) => Promise<void>;
  register: (email: string, pass: string, name?: string, username?: string) => Promise<UserProfile | void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  refreshProfile: () => Promise<UserProfile | null>;
  loginDemo: (role?: 'user' | 'admin') => void;
  loginAsAdmin: (email?: string, name?: string) => void;
  activateAdminMode: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const DEMO_DEFAULT_PROFILE: UserProfile = {
  id: 'usr_demo_101',
  firebaseUid: 'demo-uid-101',
  name: 'Elena Rostova',
  username: 'elena_fluent',
  email: 'elena@example.com',
  avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=elena_fluent',
  country: 'Spain',
  countryCode: 'ES',
  nativeLanguage: 'Spanish',
  englishLevel: 'Intermediate',
  learningGoals: ['Daily conversation', 'Job interview', 'International communication'],
  interests: ['Tech', 'Cinema', 'Hiking', 'Cuisine'],
  bio: 'Product designer living in Valencia. Practicing English daily to speak confidently with international teams.',
  speakingSessions: 42,
  speakingMinutes: 890,
  currentStreak: 12,
  longestStreak: 21,
  role: 'user',
  isOnline: true,
  isProfileComplete: true,
  createdAt: '2026-01-15T10:00:00Z',
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(() => {
    const saved = localStorage.getItem('speakmate_profile');
    return saved ? JSON.parse(saved) : null;
  });
  const [loading, setLoading] = useState(true);

  // Sync profile to localStorage for instant hydration
  useEffect(() => {
    if (profile) {
      localStorage.setItem('speakmate_profile', JSON.stringify(profile));
    } else {
      localStorage.removeItem('speakmate_profile');
    }
  }, [profile]);

  // Fetch MongoDB profile for the current user
  const fetchUserProfile = async (firebaseUser?: FirebaseUser | null): Promise<UserProfile | null> => {
    try {
      const userProfile = await userService.getMe();
      setProfile(userProfile);
      return userProfile;
    } catch (err) {
      console.warn('[AuthContext] Could not retrieve MongoDB user profile:', err);
      // If user is authenticated in Firebase but profile isn't saved in MongoDB yet, build temporary profile
      if (firebaseUser) {
        const fallbackProfile: UserProfile = {
          firebaseUid: firebaseUser.uid,
          name: firebaseUser.displayName || profile?.name || 'New Speaker',
          username: (profile?.username || firebaseUser.email?.split('@')[0] || `user_${Date.now().toString(36)}`).replace(/[^a-zA-Z0-9_]/g, '_').toLowerCase(),
          email: firebaseUser.email || profile?.email || '',
          avatar: firebaseUser.photoURL || profile?.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${firebaseUser.uid}`,
          country: profile?.country || 'Global',
          nativeLanguage: profile?.nativeLanguage || 'English',
          englishLevel: profile?.englishLevel || 'Intermediate',
          learningGoals: profile?.learningGoals || ['Daily conversation'],
          interests: profile?.interests || ['General conversation'],
          bio: profile?.bio || 'English learner ready to speak.',
          role: profile?.role || 'user',
          speakingMinutes: profile?.speakingMinutes || 0,
          speakingSessions: profile?.speakingSessions || 0,
          currentStreak: profile?.currentStreak || 1,
          longestStreak: profile?.longestStreak || 1,
          isProfileComplete: profile?.isProfileComplete || false,
        };
        setProfile(fallbackProfile);
        return fallbackProfile;
      }
      return null;
    }
  };

  // Listen to Firebase auth state
  useEffect(() => {
    // Proactively register current host with Firebase Auth authorized domains
    if (typeof window !== 'undefined' && window.location.hostname && window.location.hostname !== 'localhost') {
      fetch('/api/auth/authorize-domain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ domain: window.location.hostname }),
      }).catch(() => {});
    }

    if (isFirebaseConfigured && auth) {
      const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
        setCurrentUser(fbUser);
        if (fbUser) {
          try {
            const token = await fbUser.getIdToken();
            localStorage.setItem('speakmate_auth_token', token);
            await fetchUserProfile(fbUser);
          } catch (e) {
            console.error('[AuthContext] Token acquisition error:', e);
          }
        } else {
          // Check if a demo session is active
          const isDemoActive = localStorage.getItem('speakmate_demo_active') === 'true';
          if (!isDemoActive) {
            setProfile(null);
            localStorage.removeItem('speakmate_auth_token');
          }
        }
        setLoading(false);
      });

      return () => unsubscribe();
    } else {
      // Firebase environment is in demo/prototype mode
      const isDemoActive = localStorage.getItem('speakmate_demo_active') === 'true';
      if (isDemoActive) {
        const saved = localStorage.getItem('speakmate_profile');
        if (saved) {
          try {
            setProfile(JSON.parse(saved));
          } catch {
            setProfile(DEMO_DEFAULT_PROFILE);
          }
        } else {
          setProfile(DEMO_DEFAULT_PROFILE);
        }
      }
      setLoading(false);
    }
  }, []);

  const login = async (email: string, pass: string) => {
    if (!isFirebaseConfigured || !auth) {
      // Check if user already registered in localStorage or saved profile
      const saved = localStorage.getItem('speakmate_profile');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (parsed && (parsed.email?.toLowerCase() === email.toLowerCase() || parsed.name)) {
            setProfile(parsed);
            localStorage.setItem('speakmate_demo_active', 'true');
            const tokenPayload = {
              uid: parsed.firebaseUid || parsed.id || 'usr_local',
              email: parsed.email || email,
              name: parsed.name,
              username: parsed.username,
            };
            const token = `demo-token-${btoa(unescape(encodeURIComponent(JSON.stringify(tokenPayload))))}`;
            localStorage.setItem('speakmate_auth_token', token);
            return;
          }
        } catch {}
      }
      loginDemo('user');
      return;
    }
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, pass);
      const token = await userCredential.user.getIdToken();
      localStorage.setItem('speakmate_auth_token', token);
      localStorage.removeItem('speakmate_demo_active');
      await fetchUserProfile(userCredential.user);
    } catch (primaryErr: any) {
      // In Firebase Auth, invalid-credential occurs when the account doesn't exist yet OR wrong password
      if (
        primaryErr.code === 'auth/invalid-credential' ||
        primaryErr.code === 'auth/user-not-found'
      ) {
        try {
          // If the user entered their desired password, seamlessly create the account
          const newCredential = await createUserWithEmailAndPassword(auth, email, pass);
          const token = await newCredential.user.getIdToken();
          localStorage.setItem('speakmate_auth_token', token);
          localStorage.removeItem('speakmate_demo_active');

          const cleanUsername = (email.split('@')[0] || `user_${Date.now().toString(36)}`)
            .replace(/[^a-zA-Z0-9_]/g, '_')
            .toLowerCase();

          try {
            await userService.createUser({
              firebaseUid: newCredential.user.uid,
              email,
              name: email.split('@')[0],
              username: cleanUsername,
            });
          } catch {}

          await fetchUserProfile(newCredential.user);
          return;
        } catch (autoErr: any) {
          // If email was already in use, password was truly wrong
          if (autoErr.code === 'auth/email-already-in-use') {
            const wrongPassErr: any = new Error(
              'Incorrect password for this registered email. Please check your password or reset it.'
            );
            wrongPassErr.code = 'auth/wrong-password';
            throw wrongPassErr;
          }
          if (autoErr.code === 'auth/weak-password') {
            const weakPassErr: any = new Error(
              'Password must be at least 6 characters long.'
            );
            weakPassErr.code = 'auth/weak-password';
            throw weakPassErr;
          }
          throw primaryErr;
        }
      }
      throw primaryErr;
    }
  };

  const register = async (
    email: string,
    pass: string,
    name?: string,
    username?: string
  ): Promise<UserProfile | void> => {
    const realName = name?.trim() || 'Speaker';
    const cleanUsername = (username || email.split('@')[0] || `user_${Date.now().toString(36)}`)
      .replace(/[^a-zA-Z0-9_]/g, '_')
      .toLowerCase();

    if (!isFirebaseConfigured || !auth) {
      // Fallback register when Firebase is not configured or in demo mode
      const uid = `usr_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 6)}`;
      const registeredUser: UserProfile = {
        ...DEMO_DEFAULT_PROFILE,
        id: uid,
        firebaseUid: uid,
        name: realName,
        username: cleanUsername,
        email,
        avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${cleanUsername}`,
        country: 'Global',
        isProfileComplete: false,
      };

      setProfile(registeredUser);
      localStorage.setItem('speakmate_demo_active', 'true');
      localStorage.setItem('speakmate_profile', JSON.stringify(registeredUser));

      const tokenPayload = {
        uid,
        email,
        name: realName,
        username: cleanUsername,
      };
      const token = `demo-token-${btoa(unescape(encodeURIComponent(JSON.stringify(tokenPayload))))}`;
      localStorage.setItem('speakmate_auth_token', token);

      // Save user to backend / MongoDB
      try {
        await userService.createUser({
          firebaseUid: uid,
          email,
          name: realName,
          username: cleanUsername,
          avatar: registeredUser.avatar,
          country: registeredUser.country,
        });
      } catch (err) {
        console.warn('[AuthContext] Backend register error:', err);
      }

      return registeredUser;
    }

    const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
    if (name) {
      await updateProfile(userCredential.user, { displayName: name });
    }

    // Force refresh token so the newly set displayName is included in the Firebase JWT payload
    const token = await userCredential.user.getIdToken(true);
    localStorage.setItem('speakmate_auth_token', token);
    localStorage.removeItem('speakmate_demo_active');

    // Create MongoDB profile document
    try {
      const created = await userService.createUser({
        firebaseUid: userCredential.user.uid,
        email,
        name: realName,
        username: cleanUsername,
      });
      setProfile(created);
      return created;
    } catch (err) {
      console.warn('[AuthContext] MongoDB initial user registration fallback:', err);
      const tempUser: UserProfile = {
        firebaseUid: userCredential.user.uid,
        name: realName,
        username: cleanUsername,
        email,
        country: 'Global',
        nativeLanguage: 'English',
        englishLevel: 'Intermediate',
        learningGoals: ['Daily conversation'],
        interests: ['General conversation'],
        bio: 'English learner ready to speak.',
        role: 'user',
        speakingMinutes: 0,
        speakingSessions: 0,
        currentStreak: 1,
        longestStreak: 1,
        isProfileComplete: false,
      };
      setProfile(tempUser);
      return tempUser;
    }
  };

  // Lock to prevent concurrent or duplicate Google popup requests
  const googleAuthPromiseRef = React.useRef<Promise<void> | null>(null);

  const loginWithGoogle = async () => {
    if (!isFirebaseConfigured || !auth || !googleProvider) {
      loginDemo('user');
      return;
    }

    if (googleAuthPromiseRef.current) {
      return googleAuthPromiseRef.current;
    }

    const promise = (async () => {
      let result;
      try {
        result = await signInWithPopup(auth, googleProvider);
      } catch (popupErr: any) {
        // If popup was cancelled by user, dismissed, or superseding popup triggered, handle gracefully
        if (
          popupErr.code === 'auth/cancelled-popup-request' ||
          popupErr.code === 'auth/popup-closed-by-user'
        ) {
          console.log('[Google Auth] Sign-in popup was closed or cancelled by user.');
          return;
        }

        // If domain is not authorized, trigger backend auto-authorization and retry once
        if (
          popupErr.code === 'auth/unauthorized-domain' ||
          (popupErr.message && popupErr.message.includes('unauthorized-domain'))
        ) {
          console.warn('[Google Sign-in] Domain unauthorized. Requesting backend auto-registration...');
          try {
            const authRes = await fetch('/api/auth/authorize-domain', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ domain: window.location.hostname }),
            });
            const authData = await authRes.json();
            if (authData.success) {
              console.log('[Google Sign-in] Domain registered. Retrying sign-in popup...');
              await new Promise((resolve) => setTimeout(resolve, 1200));
              result = await signInWithPopup(auth, googleProvider);
            } else {
              throw popupErr;
            }
          } catch {
            throw popupErr;
          }
        } else {
          throw popupErr;
        }
      }

      if (!result || !result.user) {
        return;
      }

      const token = await result.user.getIdToken();
      localStorage.setItem('speakmate_auth_token', token);
      localStorage.removeItem('speakmate_demo_active');

      // Check or create user profile
      const existing = await fetchUserProfile(result.user);
      if (!existing) {
        const initialUsername = (result.user.email?.split('@')[0] || `user_${Date.now().toString(36)}`)
          .replace(/[^a-zA-Z0-9_]/g, '_')
          .toLowerCase();
        try {
          const created = await userService.createUser({
            firebaseUid: result.user.uid,
            email: result.user.email || '',
            name: result.user.displayName || 'Google Speaker',
            avatar: result.user.photoURL || undefined,
            username: initialUsername,
          });
          setProfile(created);
        } catch (err) {
          console.warn('[AuthContext] Google registration MongoDB sync:', err);
        }
      }
    })().finally(() => {
      googleAuthPromiseRef.current = null;
    });

    googleAuthPromiseRef.current = promise;
    return promise;
  };

  const logout = async () => {
    if (auth) {
      await signOut(auth).catch(() => {});
    }
    setCurrentUser(null);
    setProfile(null);
    localStorage.removeItem('speakmate_profile');
    localStorage.removeItem('speakmate_auth_token');
    localStorage.removeItem('speakmate_demo_active');
    localStorage.removeItem('speakmate_admin_override');
  };

  const resetPassword = async (email: string) => {
    if (!isFirebaseConfigured || !auth) {
      // Simulate successful email dispatch in demo mode
      await new Promise((resolve) => setTimeout(resolve, 600));
      return;
    }
    await sendPasswordResetEmail(auth, email);
  };

  const refreshProfile = async (): Promise<UserProfile | null> => {
    return await fetchUserProfile(currentUser);
  };

  const loginDemo = (role: 'user' | 'admin' = 'user') => {
    if (role === 'admin') {
      loginAsAdmin('imtiajuddinsohag99@gmail.com', 'Admin (You)');
      return;
    }
    const demoUser: UserProfile = {
      ...DEMO_DEFAULT_PROFILE,
      role: 'user',
      name: DEMO_DEFAULT_PROFILE.name,
      username: DEMO_DEFAULT_PROFILE.username,
    };
    setProfile(demoUser);
    localStorage.setItem('speakmate_demo_active', 'true');
    localStorage.removeItem('speakmate_admin_override');
    localStorage.setItem('speakmate_auth_token', `demo-token-${demoUser.firebaseUid}-${Date.now()}`);
  };

  const loginAsAdmin = (adminEmail?: string, adminName?: string) => {
    // Only the authorized owner email can assume admin privileges
    const emailToUse = 'imtiajuddinsohag99@gmail.com';
    const nameToUse = adminName?.trim() || 'Admin (You)';
    const cleanUsername = 'sohag_admin';
    const adminUid = `admin_owner_${Date.now().toString(36)}`;

    const adminUser: UserProfile = {
      ...DEMO_DEFAULT_PROFILE,
      id: adminUid,
      firebaseUid: adminUid,
      name: nameToUse,
      username: cleanUsername,
      email: emailToUse,
      role: 'admin',
      isProfileComplete: true,
    };
    setProfile(adminUser);
    localStorage.setItem('speakmate_demo_active', 'true');
    localStorage.setItem('speakmate_profile', JSON.stringify(adminUser));
    const tokenPayload = {
      uid: adminUid,
      email: emailToUse,
      name: nameToUse,
      username: cleanUsername,
      role: 'admin',
    };
    const token = `demo-token-${btoa(unescape(encodeURIComponent(JSON.stringify(tokenPayload))))}`;
    localStorage.setItem('speakmate_auth_token', token);
  };

  const activateAdminMode = () => {
    const currentEmail = (profile?.email || currentUser?.email || '').toLowerCase().trim();
    if (currentEmail === 'imtiajuddinsohag99@gmail.com' || profile?.role === 'admin') {
      if (profile) {
        const updatedProfile: UserProfile = {
          ...profile,
          role: 'admin',
        };
        setProfile(updatedProfile);
        localStorage.setItem('speakmate_profile', JSON.stringify(updatedProfile));
      } else {
        loginAsAdmin('imtiajuddinsohag99@gmail.com');
      }
    } else {
      console.warn('[AuthContext] Admin activation denied. Only designated owner account has administrator privileges.');
    }
  };

  const userEmail = (profile?.email || currentUser?.email || '').toLowerCase().trim();
  const isDesignatedAdmin =
    userEmail === 'imtiajuddinsohag99@gmail.com' ||
    profile?.role === 'admin';

  const effectiveRole: 'user' | 'moderator' | 'admin' = isDesignatedAdmin ? 'admin' : (profile?.role || 'user');

  const rawUser = profile || (currentUser ? {
    id: currentUser.uid,
    firebaseUid: currentUser.uid,
    name: currentUser.displayName || 'Speaker',
    username: (currentUser.email?.split('@')[0] || 'speaker').replace(/[^a-zA-Z0-9_]/g, '_').toLowerCase(),
    email: currentUser.email || '',
    avatar: currentUser.photoURL || undefined,
    country: 'Global',
    nativeLanguage: 'English',
    englishLevel: 'Intermediate' as const,
    learningGoals: ['Daily conversation' as const],
    interests: ['Conversation'],
    bio: '',
    role: effectiveRole,
    speakingMinutes: 0,
    speakingSessions: 0,
    currentStreak: 1,
    longestStreak: 1,
    isProfileComplete: false,
  } : null);

  const unifiedUser = rawUser ? {
    ...rawUser,
    role: effectiveRole,
  } : null;

  const isAdmin = effectiveRole === 'admin';

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        profile,
        user: unifiedUser,
        isAuthenticated: !!unifiedUser,
        isAdmin,
        loading,
        isLoading: loading,
        login,
        register,
        loginWithGoogle,
        logout,
        resetPassword,
        refreshProfile,
        loginDemo,
        loginAsAdmin,
        activateAdminMode,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
