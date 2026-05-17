import type { Metadata } from 'next';
import PageHero from '@/components/sections/PageHero';

export const metadata: Metadata = {
  title: 'Changelog',
  description:
    'See what is new in Suprfly. Browse our latest features, improvements, and bug fixes.',
};

type BadgeType = 'Feature' | 'Improvement' | 'Fix';

const badgeColors: Record<BadgeType, string> = {
  Feature: 'bg-[#22c55e]/10 text-[#22c55e]',
  Improvement: 'bg-[#22d3ee]/10 text-[#22d3ee]',
  Fix: 'bg-[#f43f5e]/10 text-[#f43f5e]',
};

interface Entry {
  version: string;
  date: string;
  badge: BadgeType;
  title: string;
  description: string;
}

const entries: Entry[] = [
  {
    version: 'v1.4.0',
    date: 'March 15, 2026',
    badge: 'Feature',
    title: 'Multi-Language Comment Support',
    description:
      'Suprfly now generates comments in 12 languages including Spanish, French, German, Portuguese, Japanese, and more. The AI detects the language of the original post and responds in kind, or you can set a preferred language per account.',
  },
  {
    version: 'v1.3.0',
    date: 'March 1, 2026',
    badge: 'Feature',
    title: 'Prompt Builder',
    description:
      'A visual interface for crafting your AI personality. Adjust tone, formality, emoji usage, and topic focus with sliders and previews. No more editing raw prompt text.',
  },
  {
    version: 'v1.2.2',
    date: 'February 20, 2026',
    badge: 'Improvement',
    title: 'Faster Post Discovery',
    description:
      'Optimised our feed-scanning pipeline to discover relevant posts 3x faster. Average time from post publication to Suprfly comment dropped from 12 minutes to under 4.',
  },
  {
    version: 'v1.2.0',
    date: 'February 10, 2026',
    badge: 'Feature',
    title: 'Analytics Dashboard',
    description:
      'Track impressions, replies, profile visits, and follower growth driven by your Suprfly comments. Filter by platform, date range, and campaign for a clear picture of ROI.',
  },
  {
    version: 'v1.1.1',
    date: 'January 28, 2026',
    badge: 'Fix',
    title: 'Session Refresh Fix',
    description:
      'Resolved an issue where LinkedIn sessions would occasionally fail to refresh after 48 hours. The Chrome extension now retries with exponential backoff and notifies you if manual re-login is needed.',
  },
  {
    version: 'v1.1.0',
    date: 'January 15, 2026',
    badge: 'Feature',
    title: 'X (Twitter) Support',
    description:
      'Suprfly now supports X alongside LinkedIn. Connect your X account through the Chrome extension and start auto-commenting on tweets that match your niche.',
  },
  {
    version: 'v1.0.0',
    date: 'January 1, 2026',
    badge: 'Feature',
    title: 'Official Launch',
    description:
      'Suprfly is live. AI-powered auto-commenting for LinkedIn with customizable personas, smart post targeting, and the Chrome extension for secure account connection.',
  },
];

export default function ChangelogPage() {
  return (
    <>
      <PageHero
        breadcrumb={[{ label: 'Home', href: '/' }, { label: 'Changelog' }]}
        title="WHAT'S NEW"
        subtitle="A timeline of every feature, improvement, and fix shipped to Suprfly."
      />

      <section className="py-24 md:py-36">
        <div className="max-w-[800px] mx-auto px-6">
          <div className="relative border-l-2 border-white/[.08] ml-4">
            {entries.map((entry) => (
              <div key={entry.version} className="relative pl-10 pb-16 last:pb-0">
                {/* Amber dot */}
                <span className="absolute left-[-9px] top-1.5 w-4 h-4 rounded-full bg-[#f59e0b] border-4 border-[#0a0a0f]" />

                {/* Date + version badge */}
                <div className="flex flex-wrap items-center gap-3 mb-3">
                  <time className="text-sm text-[#71717a] font-medium">{entry.date}</time>
                  <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-white/[.06] text-[#e4e4e7]">
                    {entry.version}
                  </span>
                  <span
                    className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${badgeColors[entry.badge]}`}
                  >
                    {entry.badge}
                  </span>
                </div>

                <h3 className="font-[var(--font-display)] text-lg font-bold text-white mb-2">
                  {entry.title}
                </h3>
                <p className="text-[#a1a1aa] leading-relaxed">{entry.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
