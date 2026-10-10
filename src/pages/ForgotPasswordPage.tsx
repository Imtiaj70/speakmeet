import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mic, ArrowRight, ArrowLeft, Mail, CheckCircle2, AlertCircle } from 'lucide-react';
import { Button } from '../components/common/Button';
import { useAuth } from '../context/AuthContext';

export const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const { resetPassword } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setErrorMessage('Please provide your registered email address.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');

    try {
      await resetPassword(email.trim());
      setIsSubmitted(true);
    } catch (err: any) {
      console.error('[ForgotPassword] Error:', err);
      if (err.code === 'auth/user-not-found') {
        setErrorMessage('No account was found with this email address.');
      } else if (err.code === 'auth/invalid-email') {
        setErrorMessage('Please enter a valid email format.');
      } else {
        setErrorMessage(err.message || 'Unable to send password reset email. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
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
            Reset Your Password
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Enter your registered email and we'll send you a link to reset your account password.
          </p>
        </div>

        {errorMessage && (
          <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 text-xs text-rose-600 dark:text-rose-400 flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        {isSubmitted ? (
          <div className="space-y-5 text-center">
            <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 text-emerald-800 dark:text-emerald-300 space-y-2">
              <CheckCircle2 className="w-8 h-8 text-emerald-600 dark:text-emerald-400 mx-auto" />
              <h2 className="text-sm font-bold">Password Reset Email Dispatched</h2>
              <p className="text-xs text-emerald-700 dark:text-emerald-400/90 leading-relaxed">
                If an account exists for <strong>{email}</strong>, you will receive password reset instructions in your inbox shortly.
              </p>
            </div>

            <div className="pt-2">
              <Link to="/login">
                <Button variant="primary" size="md" className="w-full">
                  Return to Sign In
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
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
                  placeholder="e.g. learner@example.com"
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
              Send Reset Link
            </Button>
          </form>
        )}

        {/* Footer */}
        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 text-center">
          <Link
            to="/login"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Sign In
          </Link>
        </div>
      </div>
    </div>
  );
};
