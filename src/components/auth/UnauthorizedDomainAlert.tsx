import React, { useState } from 'react';
import { ShieldAlert, Copy, Check, ExternalLink, RefreshCw } from 'lucide-react';
import { Button } from '../common/Button';

interface UnauthorizedDomainAlertProps {
  onRetry: () => Promise<void>;
  projectId?: string;
}

export const UnauthorizedDomainAlert: React.FC<UnauthorizedDomainAlertProps> = ({
  onRetry,
  projectId = 'skill-swap-ad87c',
}) => {
  const [copied, setCopied] = useState(false);
  const [isAuthorizing, setIsAuthorizing] = useState(false);
  const [autoStatus, setAutoStatus] = useState<string | null>(null);

  const currentHost = typeof window !== 'undefined' ? window.location.hostname : '';

  const handleCopy = () => {
    if (currentHost && navigator.clipboard) {
      navigator.clipboard.writeText(currentHost);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleAutoAuthorizeAndRetry = async () => {
    setIsAuthorizing(true);
    setAutoStatus('Registering domain with Firebase...');
    try {
      const res = await fetch('/api/auth/authorize-domain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ domain: currentHost }),
      });
      const data = await res.json();
      if (data.success) {
        setAutoStatus('Domain registered! Retrying Google Sign-in...');
        await new Promise((r) => setTimeout(r, 1200));
        await onRetry();
      } else {
        setAutoStatus('Auto-registration not completed. Please add domain manually in Firebase Console.');
      }
    } catch (err: any) {
      setAutoStatus('Network error during auto-registration. Try manual setup or Email login.');
    } finally {
      setIsAuthorizing(false);
    }
  };

  const consoleUrl = `https://console.firebase.google.com/project/${projectId}/authentication/settings`;

  return (
    <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 text-xs text-amber-900 dark:text-amber-200 space-y-3 shadow-xs">
      <div className="flex items-start gap-2.5">
        <ShieldAlert className="w-5 h-5 shrink-0 text-amber-600 dark:text-amber-400 mt-0.5" />
        <div>
          <h4 className="font-semibold text-amber-950 dark:text-amber-100 text-[13px]">
            Google Sign-in: Domain Authorization
          </h4>
          <p className="mt-1 text-[11px] leading-relaxed text-amber-800 dark:text-amber-300">
            Firebase Auth requires this preview domain to be in the project's Authorized Domains list for Google OAuth.
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 p-2 rounded-lg bg-white/80 dark:bg-slate-900/80 border border-amber-200/80 dark:border-amber-800 font-mono text-[11px] text-slate-800 dark:text-slate-200 overflow-hidden">
        <span className="truncate flex-1 select-all">{currentHost}</span>
        <button
          type="button"
          onClick={handleCopy}
          className="shrink-0 inline-flex items-center gap-1 px-2 py-1 rounded bg-amber-100 dark:bg-amber-900/60 hover:bg-amber-200 dark:hover:bg-amber-800 text-amber-900 dark:text-amber-200 text-[10px] font-medium transition-colors"
        >
          {copied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
          <span>{copied ? 'Copied' : 'Copy'}</span>
        </button>
      </div>

      {autoStatus && (
        <p className="text-[11px] font-medium text-amber-700 dark:text-amber-300 animate-pulse">
          {autoStatus}
        </p>
      )}

      <div className="flex flex-wrap items-center gap-2 pt-1">
        <Button
          type="button"
          size="sm"
          onClick={handleAutoAuthorizeAndRetry}
          isLoading={isAuthorizing}
          leftIcon={<RefreshCw className={`w-3.5 h-3.5 ${isAuthorizing ? 'animate-spin' : ''}`} />}
          className="text-xs bg-amber-600 hover:bg-amber-700 text-white border-0"
        >
          Auto-Authorize & Retry
        </Button>

        <a
          href={consoleUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-amber-300 dark:border-amber-700 bg-white/90 dark:bg-slate-800 text-amber-900 dark:text-amber-200 hover:bg-amber-100/50 dark:hover:bg-slate-700 text-[11px] font-medium transition-colors"
        >
          <span>Firebase Console</span>
          <ExternalLink className="w-3 h-3" />
        </a>
      </div>

      <p className="text-[10px] text-amber-700/80 dark:text-amber-400/80">
        💡 <em>Tip: You can also sign in directly using email & password below without domain setup!</em>
      </p>
    </div>
  );
};
