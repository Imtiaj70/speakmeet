import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/common/Button';
import { Mic, ArrowLeft } from 'lucide-react';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="py-24 text-center px-4 max-w-md mx-auto space-y-5">
      <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto">
        <Mic className="w-6 h-6" />
      </div>
      <h1 className="text-4xl font-black text-slate-900 dark:text-white">404</h1>
      <p className="text-sm text-slate-600 dark:text-slate-400">
        The room or page you're searching for isn't open right now.
      </p>
      <div>
        <Link to="/">
          <Button variant="primary" size="md" leftIcon={<ArrowLeft className="w-4 h-4" />}>
            Back to Home
          </Button>
        </Link>
      </div>
    </div>
  );
};
