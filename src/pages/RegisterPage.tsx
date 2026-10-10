import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mic, ArrowRight, Mail, Lock, User, AtSign, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Button } from '../components/common/Button';
import { UnauthorizedDomainAlert } from '../components/auth/UnauthorizedDomainAlert';
import { useAuth } from '../context/AuthContext';
import { userService } from '../services/userService';

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const { register, loginWithGoogle, loginDemo } = useAuth();

  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [showUnauthorizedAlert, setShowUnauthorizedAlert] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleSubmitting, setIsGoogleSubmitting] = useState(false);

  // Username validation state
  const [usernameChecking, setUsernameChecking] = useState(false);
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null);

  const handleUsernameBlur = async () => {
    const trimmed = username.trim().toLowerCase();
    if (trimmed.length < 3) {
      setUsernameAvailable(null);
      return;
    }

    if (!/^[a-zA-Z0-9_]{3,20}$/.test(trimmed)) {
      setUsernameAvailable(false);
      setError('Username must be 3-20 characters with letters, numbers, and underscores only.');
      return;
    }

    setUsernameChecking(true);
    try {
      const res = await userService.checkUsername(trimmed);
      setUsernameAvailable(res.available);
      if (!res.available) {
        setError('That username is already taken. Please choose another.');
      } else {
        setError('');
      }
    } catch (e) {
      console.warn('Username check error:', e);
    } finally {
      setUsernameChecking(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const cleanUsername = username.trim().toLowerCase();

    if (!name.trim()) {
      setError('Please provide your full name.');
      return;
    }

    if (!/^[a-zA-Z0-9_]{3,20}$/.test(cleanUsername)) {
      setError('Username must be 3 to 20 characters and contain only letters, numbers, or underscores.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match. Please verify your password.');
      return;
    }

    setIsSubmitting(true);
    try {
      // Re-verify username availability before registering
      const availability = await userService.checkUsername(cleanUsername);
      if (!availability.available) {
        setError('Username is already taken by another speaker.');
        setIsSubmitting(false);
        return;
      }

      await register(email.trim(), password, name.trim(), cleanUsername);
      // Redirect directly to Profile Setup after registration
      navigate('/profile/setup');
    } catch (err: any) {
      console.error('[Register] Error:', err);
      if (err.code === 'auth/email-already-in-use') {
        setError('An account with this email already exists. Try signing in instead.');
      } else if (err.code === 'auth/invalid-email') {
        setError('Please enter a valid email address.');
      } else if (err.code === 'auth/weak-password') {
        setError('Password is too weak. Include upper/lowercase letters and numbers.');
      } else {
        setError(err.message || 'Registration failed. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleSignUp = async () => {
    if (isGoogleSubmitting) return;
    setError('');
    setShowUnauthorizedAlert(false);
    setIsGoogleSubmitting(true);
    try {
      await loginWithGoogle();
      const token = localStorage.getItem('speakmate_auth_token');
      if (token) {
        navigate('/profile/setup');
      }
    } catch (err: any) {
      if (
        err?.code === 'auth/cancelled-popup-request' ||
        err?.code === 'auth/popup-closed-by-user'
      ) {
        console.log('[Google Sign-up] Popup closed or cancelled by user.');
        return;
      }
      if (
        err?.code === 'auth/unauthorized-domain' ||
        (err?.message && err.message.includes('unauthorized-domain'))
      ) {
        setShowUnauthorizedAlert(true);
      } else if (err?.code === 'auth/popup-blocked') {
        setError('Sign-in popup was blocked by your browser. Please enable popups or register with email below.');
      } else {
        console.warn('[Google Sign-up] Issue encountered:', err?.message || err);
        setError(err?.message || 'Google sign-up failed. Please try again.');
      }
    } finally {
      setIsGoogleSubmitting(false);
    }
  };

  const handleDemoSignUp = () => {
    loginDemo('user');
    navigate('/profile/setup', { replace: true });
  };

  return (
    <div className="py-12 sm:py-16 px-4 sm:px-6 lg:px-8 max-w-md mx-auto">
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-8 shadow-sm space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center mx-auto shadow-sm">
            <Mic className="w-5 h-5" />
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Create Your Account
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Join thousands of active English speakers practicing daily
          </p>
        </div>

        {showUnauthorizedAlert && (
          <UnauthorizedDomainAlert
            onRetry={handleGoogleSignUp}
            projectId="skill-swap-ad87c"
          />
        )}

        {error && (
          <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 text-xs text-rose-600 dark:text-rose-400 flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Google Sign-in */}
        <button
          type="button"
          onClick={handleGoogleSignUp}
          disabled={isGoogleSubmitting || isSubmitting}
          className="w-full py-2.5 px-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700/60 text-slate-800 dark:text-slate-100 text-sm font-semibold flex items-center justify-center gap-3 transition-colors shadow-xs disabled:opacity-50 cursor-pointer"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
            />
            <path
              fill="#34A853"
              d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.24v3.15C3.26 21.4 7.33 24 12 24z"
            />
            <path
              fill="#FBBC05"
              d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.24C.45 8.15 0 9.92 0 12s.45 3.85 1.24 5.42l4.04-3.15z"
            />
            <path
              fill="#EA4335"
              d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.6 1.24 6.58l4.04 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
            />
          </svg>
          {isGoogleSubmitting ? 'Signing up with Google...' : 'Sign up with Google'}
        </button>

        {/* Instant Demo Account */}
        <button
          type="button"
          onClick={handleDemoSignUp}
          className="w-full py-2 px-3 rounded-lg border border-dashed border-indigo-300 dark:border-indigo-800 bg-indigo-50/50 dark:bg-indigo-950/20 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer"
        >
          <span>⚡</span>
          <span>Quick 1-Click Instant Demo Account</span>
        </button>

        <div className="relative flex items-center justify-center">
          <div className="w-full border-t border-slate-200 dark:border-slate-800" />
          <span className="bg-white dark:bg-slate-900 px-3 text-[11px] font-medium text-slate-400 uppercase tracking-wider">
            or register with email
          </span>
        </div>

        {/* Register Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Full Name
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Sofia Chen"
                className="w-full pl-10 pr-3.5 py-2.5 text-sm bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Username
              </label>
              {usernameChecking && <span className="text-[10px] text-slate-400">Checking...</span>}
              {usernameAvailable === true && (
                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 flex items-center gap-1 font-medium">
                  <CheckCircle2 className="w-3 h-3" /> Available
                </span>
              )}
            </div>
            <div className="relative">
              <AtSign className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value.toLowerCase().replace(/\s+/g, ''));
                  setUsernameAvailable(null);
                }}
                onBlur={handleUsernameBlur}
                placeholder="sofia_speaks"
                className={`w-full pl-10 pr-3.5 py-2.5 text-sm bg-slate-50 dark:bg-slate-800/60 border rounded-lg text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 ${
                  usernameAvailable === true
                    ? 'border-emerald-500'
                    : usernameAvailable === false
                    ? 'border-rose-500'
                    : 'border-slate-200 dark:border-slate-700 focus:border-indigo-500'
                }`}
              />
            </div>
            <p className="text-[10px] text-slate-400 mt-1">
              Letters, numbers, underscores only (3-20 chars).
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="sofia@example.com"
                className="w-full pl-10 pr-3.5 py-2.5 text-sm bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min 6 chars"
                  className="w-full pl-10 pr-3 py-2.5 text-sm bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Confirm
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  minLength={6}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repeat pass"
                  className="w-full pl-10 pr-3 py-2.5 text-sm bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>
            </div>
          </div>

          <Button
            type="submit"
            size="md"
            className="w-full font-semibold mt-2"
            isLoading={isSubmitting}
            rightIcon={<ArrowRight className="w-4 h-4" />}
          >
            Create Account & Continue
          </Button>
        </form>

        {/* Footer */}
        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 text-center text-xs text-slate-500">
          <span>Already have an account? </span>
          <Link
            to="/login"
            className="font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
          >
            Log in
          </Link>
        </div>
      </div>
    </div>
  );
};
