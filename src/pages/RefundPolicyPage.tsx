import React from 'react';
import { Heart, RefreshCw, HelpCircle, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '../components/common/Button';

export const RefundPolicyPage: React.FC = () => {
  return (
    <div className="py-10 sm:py-16 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
      {/* Header */}
      <div className="border-b border-slate-200 dark:border-slate-800 pb-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 text-xs font-bold mb-3">
          <Heart className="w-3.5 h-3.5" />
          <span>Donation & Supporter Policy</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Refund & Support Policy
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
          Clear and transparent guidelines regarding voluntary donations and VIP supporter perks.
        </p>
      </div>

      <div className="space-y-6 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
        <section className="space-y-3">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">1. 100% Free Core Platform</h2>
          <p>
            SpeakMate is completely free to use. Joining rooms, practicing languages, creating speaking lounges, and messaging peers do not require any mandatory payment or credit card.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">2. Voluntary Donations & "Buy Me a Coffee"</h2>
          <p>
            When users make a contribution via <strong>Buy Me a Coffee</strong>, <strong>bKash</strong>, <strong>Nagad</strong>, or <strong>PayPal</strong>, these funds are treated as non-refundable voluntary donations designed to offset server bandwidth, WebRTC signaling costs, and ongoing platform development.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">3. VIP Supporter Status</h2>
          <p>
            Supporters who donate receive a voluntary digital badge (such as 👑 VIP Supporter) and featured lounge placement as a gesture of appreciation. Since these digital badges are delivered immediately upon confirmation, donations are generally non-refundable once processed.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">4. Accidental or Duplicate Charges</h2>
          <p>
            In the event that you were accidentally charged twice or made a payment in error, please contact us within 7 days of the transaction with your receipt or Transaction ID. We will promptly review and assist with a refund through the original payment processor where applicable.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">5. Contact Support</h2>
          <p>
            For any billing questions or donation inquiries, reach out directly to:{' '}
            <a href="mailto:imtiajuddinsohag99@gmail.com" className="text-indigo-600 dark:text-indigo-400 underline font-semibold">
              imtiajuddinsohag99@gmail.com
            </a>
          </p>
        </section>

        <div className="pt-4 flex items-center gap-3">
          <Link to="/rooms">
            <Button size="sm">Back to Live Lounges</Button>
          </Link>
          <Link to="/privacy">
            <Button variant="outline" size="sm">Read Privacy Policy</Button>
          </Link>
        </div>
      </div>
    </div>
  );
};
