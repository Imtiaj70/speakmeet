import React from 'react';
import { FileText, ShieldAlert, Users, CheckCircle } from 'lucide-react';

export const TermsPage: React.FC = () => {
  return (
    <div className="py-10 sm:py-16 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
      {/* Header */}
      <div className="border-b border-slate-200 dark:border-slate-800 pb-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 text-xs font-bold mb-3">
          <FileText className="w-3.5 h-3.5" />
          <span>Terms of Service & Community Guidelines</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Terms of Service
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
          Effective date: September 2026. Please read carefully before using SpeakMate.
        </p>
      </div>

      <div className="space-y-6 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
        <section className="space-y-3">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">1. Acceptance of Terms</h2>
          <p>
            By accessing or using <strong>SpeakMate</strong>, you agree to be bound by these Terms of Service.
            If you do not agree, please do not use our live audio communication services.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">2. SpeakMate Community Code of Conduct</h2>
          <p>
            SpeakMate is an inclusive, multicultural learning sanctuary. To keep our community safe, productive, and friendly:
          </p>
          <ul className="list-disc pl-5 space-y-2 text-slate-600 dark:text-slate-400">
            <li><strong>Respect Global Learners:</strong> No discrimination based on race, religion, nationality, gender, or language proficiency. Beginners are always welcome.</li>
            <li><strong>Zero Tolerance for Harassment & Hate Speech:</strong> Any vulgar, offensive, sexually explicit, abusive, or threatening speech will result in immediate room ejection and account ban.</li>
            <li><strong>No Spam or Commercial Exploitation:</strong> Do not join speaking rooms solely to broadcast uninvited advertisements, spam links, or harass learners.</li>
            <li><strong>Respect Speaking Turn:</strong> Give everyone a chance to practice speaking. Avoid interrupting peers aggressively.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">3. Room Hosting & Moderation</h2>
          <p>
            Room hosts maintain the authority to manage their own rooms, including removing disruptive members.
            Administrators reserve the right to close inactive or violating rooms at any time without prior notice.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">4. VIP & Supporter Badges</h2>
          <p>
            Contributions made through "Buy Me a Coffee", bKash, or Nagad are voluntary donations given in appreciation of the free service. VIP supporter perks (such as badges or featured room placement) are granted as a token of gratitude and do not create an employment or contractual partnership.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">5. Disclaimer of Warranties</h2>
          <p>
            The service is provided on an "as-is" and "as-available" basis. SpeakMate does not guarantee uninterrupted connection, specific learning outcomes, or the conduct of other room participants.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">6. Inquiries & Abuse Reports</h2>
          <p>
            To report room violations or submit legal inquiries, email us at:{' '}
            <a href="mailto:imtiajuddinsohag99@gmail.com" className="text-indigo-600 dark:text-indigo-400 underline font-semibold">
              imtiajuddinsohag99@gmail.com
            </a>
          </p>
        </section>
      </div>
    </div>
  );
};
