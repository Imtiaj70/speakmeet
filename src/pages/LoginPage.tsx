import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Mic, ArrowRight, Mail, Lock, AlertCircle } from 'lucide-react';
import { Button } from '../components/common/Button';
import { UnauthorizedDomainAlert } from '../components/auth/UnauthorizedDomainAlert';
import { useAuth } from '../context/AuthContext';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showUnauthorizedAlert, setShowUnauthorizedAlert] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleSubmitting, setIsGoogleSubmitting] = useState(false);

  const { login, loginWithGoogle, loginDemo } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const fromPath = (location.state as any)?.from?.pathname || '/dashboard';

  const handleStandardSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setShowUnauthorizedAlert(false);

    if (!email.trim() || !password) {
      setError('Please provide your registered email and password.');
      return;
    }

    setIsSubmitting(true);
    try {
      await login(email.trim(), password);
      navigate(fromPath, { replace: true });
    } catch (err: any) {
      console.error('[Login] Error:', err);
      if (
        err.code === 'auth/wrong-password' ||
        err.code === 'auth/user-not-found' ||
        err.code === 'auth/invalid-credential'
      ) {
        setError(
          err.message && !err.message.includes('auth/')
            ? err.message
            : 'Invalid email or password combination. If you have not created an account yet, please register or use the Direct Admin login below.'
        );
      } else if (err.code === 'auth/invalid-email') {
        setError('Please enter a valid email address.');
      } else if (err.code === 'auth/too-many-requests') {
        setError('Access temporarily disabled due to multiple failed login attempts. Try resetting your password.');
      } else {
        setError(err.message || 'Unable to sign in. Please check your connection.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleSignIn = async () => {
    if (isGoogleSubmitting) return;
    setError('');
    setShowUnauthorizedAlert(false);
    setIsGoogleSubmitting(true);
    try {
      await loginWithGoogle();
      const token = localStorage.getItem('speakmate_auth_token');
      if (token) {
        navigate(fromPath, { replace: true });
      }
    } catch (err: any) {
      if (
        err?.code === 'auth/cancelled-popup-request' ||
        err?.code === 'auth/popup-closed-by-user'
      ) {
        console.log('[Google Sign-in] Popup closed or cancelled by user.');
        return;
      }
      if (
        err?.code === 'auth/unauthorized-domain' ||
        (err?.message && err.message.includes('unauthorized-domain'))
      ) {
        setShowUnauthorizedAlert(true);
      } else if (err?.code === 'auth/popup-blocked') {
        setError('Sign-in popup was blocked by your browser. Please enable popups or sign in with email below.');
      } else {
        console.warn('[Google Sign-in] Issue encountered:', err?.message || err);
        setError(err?.message || 'Google authentication encountered an issue.');
      }
    } finally {
      setIsGoogleSubmitting(false);
    }
  };

  const handleDemoLogin = () => {
    loginDemo('user');
    navigate('/dashboard', { replace: true });
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
            Welcome back to SpeakMate
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Sign in to continue practicing with speakers across the world
          </p>
        </div>

        {showUnauthorizedAlert && (
          <UnauthorizedDomainAlert
            onRetry={handleGoogleSignIn}
            projectId="skill-swap-ad87c"
          />
        )}

        {error && (
          <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 text-xs text-rose-700 dark:text-rose-300 space-y-2.5">
            <div className="flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-500" />
              <span>{error}</span>
            </div>

            <div className="pt-2 border-t border-rose-200/60 dark:border-rose-900/50 flex items-center gap-2">
              <Link
                to="/register"
                className="px-3 py-1.5 text-[11px] font-semibold rounded-lg bg-white dark:bg-slate-800 border border-rose-300 dark:border-rose-800 text-slate-700 dark:text-slate-200 hover:bg-rose-100/50 dark:hover:bg-slate-700 transition-colors"
              >
                Register New Account
              </Link>
            </div>
          </div>
        )}

        {/* Google Authentication Button */}
        <button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={isGoogleSubmitting || isSubmitting}
          className="w-full py-2.5 px-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700/60 text-slate-800 dark:text-slate-100 text-sm font-semibold flex items-center justify-center gap-3 transition-colors shadow-xs disabled:opacity-50"
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
          {isGoogleSubmitting ? 'Connecting with Google...' : 'Continue with Google'}
        </button>

        <div className="relative flex items-center justify-center">
          <div className="w-full border-t border-slate-200 dark:border-slate-800" />
          <span className="bg-white dark:bg-slate-900 px-3 text-[11px] font-medium text-slate-400 uppercase tracking-wider">
            or sign in with email
          </span>
        </div>

        {/* Standard Form */}
        <form onSubmit={handleStandardSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@domain.com"
                className="w-full pl-10 pr-3.5 py-2.5 text-sm bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                Password
              </label>
              <Link
                to="/forgot-password"
                className="text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:underline"
              >
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-3.5 py-2.5 text-sm bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>
          </div>

          <Button
            type="submit"
            size="md"
            className="w-full font-semibold"
            isLoading={isSubmitting}
            rightIcon={<ArrowRight className="w-4 h-4" />}
          >
            Sign In
          </Button>
        </form>

        {/* Demo Fast Login Banner */}
        <div className="p-3.5 rounded-xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-200/60 dark:border-indigo-900/40 space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold text-indigo-900 dark:text-indigo-300">
            <span>Fast Prototype Sign-in</span>
            <span className="text-[10px] text-indigo-500 uppercase tracking-wider">Instant Access</span>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="w-full text-xs bg-white dark:bg-slate-800"
            onClick={handleDemoLogin}
          >
            Quick Learner Demo
          </Button>
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 text-center text-xs text-slate-500">
          <span>Don't have an account yet? </span>
          <Link
            to="/register"
            className="font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
          >
            Register now
          </Link>
        </div>
      </div>
    </div>
  );
};
