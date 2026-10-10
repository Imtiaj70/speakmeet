import React from 'react';
import { Shield, Lock, Eye, FileText, CheckCircle2 } from 'lucide-react';

export const PrivacyPolicyPage: React.FC = () => {
  return (
    <div className="py-10 sm:py-16 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
      {/* Header */}
      <div className="border-b border-slate-200 dark:border-slate-800 pb-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 text-xs font-bold mb-3">
          <Shield className="w-3.5 h-3.5" />
          <span>Legal Compliance & Privacy Standards</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Privacy Policy
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
          Last updated: September 2026. Effective for all SpeakMate users globally.
        </p>
      </div>

      {/* Main Content Sections */}
      <div className="space-y-6 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
        <section className="space-y-3">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-indigo-600" />
            1. Overview & Our Commitment
          </h2>
          <p>
            At <strong>SpeakMate</strong> (referred to as "we", "us", or "our"), accessible via our web application,
            we are committed to protecting your personal information and your right to privacy. We do not sell your personal data to third parties.
            This Privacy Policy explains what information we collect, how we use it, and how WebRTC voice communication is handled.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-indigo-600" />
            2. Real-Time Audio Communication & WebRTC
          </h2>
          <p>
            SpeakMate enables peer-to-peer and relayed voice conversations using <strong>WebRTC</strong> (Web Real-Time Communication) technology.
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-slate-600 dark:text-slate-400">
            <li>
              <strong>No Audio Recording:</strong> We do NOT record, intercept, or store your live audio streams on our servers. Your voice packets flow directly between room participants.
            </li>
            <li>
              <strong>Microphone Access:</strong> Access to your microphone is requested solely during active voice rooms. You can mute or turn off your microphone at any moment.
            </li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-indigo-600" />
            3. Information We Collect
          </h2>
          <p>We collect only the minimal data necessary to provide a smooth language exchange experience:</p>
          <ul className="list-disc pl-5 space-y-1.5 text-slate-600 dark:text-slate-400">
            <li><strong>Account Data:</strong> Username, display name, email address (optional for guest users), profile avatar, native and learning languages, and country.</li>
            <li><strong>Room & Interaction Data:</strong> Public room titles, topics selected, group size preferences, and text chat messages sent within rooms.</li>
            <li><strong>Technical & Log Data:</strong> IP address, browser type, device information, and diagnostic timestamps for security and abuse prevention.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-indigo-600" />
            4. Google AdSense & Third-Party Advertising (Cookies)
          </h2>
          <p>
            We may use third-party advertising companies, such as <strong>Google AdSense</strong>, to serve ads when you visit our website.
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-slate-600 dark:text-slate-400">
            <li>
              Google, as a third-party vendor, uses cookies (including the DoubleClick cookie) to serve ads based on your prior visits to our website or other websites on the Internet.
            </li>
            <li>
              Users may opt out of personalized advertising by visiting Google's{' '}
              <a
                href="https://adssettings.google.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-indigo-600 dark:text-indigo-400 underline font-medium"
              >
                Ads Settings
              </a>.
            </li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-indigo-600" />
            5. Voluntary Donations & Payment Processing
          </h2>
          <p>
            When you support SpeakMate via Buy Me a Coffee, bKash, Nagad, or PayPal, your financial transactions are securely processed by those respective payment providers. SpeakMate does not store credit card or bank credentials on its servers.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-indigo-600" />
            6. Contact Us
          </h2>
          <p>
            If you have questions about this Privacy Policy or wish to request data deletion, please contact our administrator at:{' '}
            <a href="mailto:imtiajuddinsohag99@gmail.com" className="text-indigo-600 dark:text-indigo-400 underline font-semibold">
              imtiajuddinsohag99@gmail.com
            </a>
          </p>
        </section>
      </div>
    </div>
  );
};
