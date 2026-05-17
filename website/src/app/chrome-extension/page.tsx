import type { Metadata } from 'next';
import Link from 'next/link';
import { Download, LogIn, Link2, Cookie, RefreshCw, Activity, Shield, ShieldOff } from 'lucide-react';
import PageHero from '@/components/sections/PageHero';
import SectionHeader from '@/components/sections/SectionHeader';
import CTA from '@/components/sections/CTA';
import FAQ from './FAQ';

export const metadata: Metadata = {
  title: 'Chrome Extension',
  description:
    'Connect your LinkedIn & X accounts to Suprfly with our lightweight Chrome extension. Secure cookie capture, auto-refresh sessions, and real-time status monitoring.',
};

const steps = [
  {
    num: '01',
    icon: Download,
    title: 'Install the Extension',
    description:
      'Head to the Chrome Web Store and click "Add to Chrome." The extension is lightweight (under 1 MB) and requires minimal permissions.',
  },
  {
    num: '02',
    icon: LogIn,
    title: 'Log In to Suprfly',
    description:
      'Click the Suprfly icon in your toolbar and sign in with your account. Your dashboard syncs instantly.',
  },
  {
    num: '03',
    icon: Link2,
    title: 'Connect Your Accounts',
    description:
      'Visit LinkedIn or X while logged in. The extension securely captures your session so Suprfly can comment on your behalf.',
  },
];

const features = [
  {
    icon: Cookie,
    title: 'Cookie Capture',
    description:
      'Securely reads your LinkedIn and X session cookies so Suprfly can interact with posts as you. No passwords are ever stored.',
  },
  {
    icon: RefreshCw,
    title: 'Auto-Refresh Sessions',
    description:
      'Sessions expire. The extension detects stale cookies and refreshes them automatically, keeping your commenting running 24/7.',
  },
  {
    icon: Activity,
    title: 'Status Monitoring',
    description:
      'A real-time badge shows connection health at a glance. Green means active, amber means expiring soon, red means action needed.',
  },
];

const access = [
  {
    icon: Shield,
    color: 'text-[#22c55e]',
    title: 'What We Access',
    items: [
      'Session cookies for LinkedIn and X only',
      'Your Suprfly account token for authentication',
      'Active tab URL to detect when you visit LinkedIn or X',
      'Extension badge state for status indicators',
    ],
  },
  {
    icon: ShieldOff,
    color: 'text-[#f43f5e]',
    title: 'What We Don\'t Access',
    items: [
      'Your passwords or login credentials',
      'Browsing history, bookmarks, or other cookies',
      'Personal files, downloads, or clipboard',
      'Camera, microphone, or location data',
    ],
  },
];

export default function ChromeExtensionPage() {
  return (
    <>
      {/* Hero */}
      <PageHero
        breadcrumb={[{ label: 'Home', href: '/' }, { label: 'Chrome Extension' }]}
        title="THE SUPRFLY CHROME EXTENSION"
        subtitle="A lightweight browser extension that securely connects your LinkedIn and X accounts to Suprfly. Install in seconds, stay connected forever."
      >
        <Link
          href="https://chrome.google.com/webstore"
          className="inline-flex items-center gap-2 px-7 py-3 font-bold text-[#0a0a0f] bg-gradient-to-br from-[#fbbf24] to-[#f59e0b] rounded-xl shadow-[0_2px_20px_rgba(245,158,11,0.3)] hover:shadow-[0_4px_30px_rgba(245,158,11,0.4)] hover:-translate-y-0.5 transition-all"
        >
          <Download className="w-4 h-4" />
          Add to Chrome — It&apos;s Free
        </Link>
      </PageHero>

      {/* Install Steps */}
      <section className="py-24 md:py-36">
        <div className="max-w-[1200px] mx-auto px-6">
          <SectionHeader
            tag="Get Started"
            title="INSTALL IN <span class='text-[#f59e0b]'>THREE STEPS</span>"
            subtitle="From zero to auto-commenting in under two minutes. No technical setup required."
          />
          <div className="grid md:grid-cols-3 gap-6">
            {steps.map((step) => (
              <div
                key={step.num}
                className="bg-[#12121a] border border-white/[.06] rounded-2xl p-8 hover:border-white/[.12] hover:-translate-y-0.5 transition-all"
              >
                <span className="text-xs font-bold text-[#f59e0b] tracking-widest">{step.num}</span>
                <step.icon className="w-8 h-8 text-[#f59e0b] mt-4 mb-4" />
                <h3 className="font-[var(--font-display)] text-lg font-bold text-white mb-2">
                  {step.title}
                </h3>
                <p className="text-[#a1a1aa] leading-relaxed">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* What It Does */}
      <section className="py-24 md:py-36">
        <div className="max-w-[1200px] mx-auto px-6">
          <SectionHeader
            tag="Features"
            title="WHAT THE EXTENSION <span class='text-[#22d3ee]'>DOES</span>"
            subtitle="Three core capabilities that keep your Suprfly connection rock-solid."
          />
          <div className="grid md:grid-cols-3 gap-6">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="bg-[#12121a] border border-white/[.06] rounded-2xl p-8 hover:border-white/[.12] hover:-translate-y-0.5 transition-all"
              >
                <feature.icon className="w-8 h-8 text-[#22d3ee] mb-4" />
                <h3 className="font-[var(--font-display)] text-lg font-bold text-white mb-2">
                  {feature.title}
                </h3>
                <p className="text-[#a1a1aa] leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Security */}
      <section className="py-24 md:py-36">
        <div className="max-w-[1200px] mx-auto px-6">
          <SectionHeader
            tag="Security"
            title="YOUR PRIVACY <span class='text-[#22c55e]'>MATTERS</span>"
            subtitle="We follow the principle of least privilege. The extension only requests what it absolutely needs."
          />
          <div className="grid md:grid-cols-2 gap-6">
            {access.map((col) => (
              <div
                key={col.title}
                className="bg-[#12121a] border border-white/[.06] rounded-2xl p-8 hover:border-white/[.12] hover:-translate-y-0.5 transition-all"
              >
                <col.icon className={`w-8 h-8 ${col.color} mb-4`} />
                <h3 className="font-[var(--font-display)] text-lg font-bold text-white mb-4">
                  {col.title}
                </h3>
                <ul className="space-y-3">
                  {col.items.map((item) => (
                    <li key={item} className="flex items-start gap-3 text-[#a1a1aa]">
                      <span className={`mt-1.5 w-1.5 h-1.5 rounded-full ${col.color.replace('text-', 'bg-')} shrink-0`} />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-24 md:py-36">
        <div className="max-w-[1200px] mx-auto px-6">
          <SectionHeader
            tag="FAQ"
            title="FREQUENTLY ASKED <span class='text-[#a855f7]'>QUESTIONS</span>"
            subtitle="Everything you need to know about the Chrome extension."
          />
          <FAQ />
        </div>
      </section>

      <CTA />
    </>
  );
}
