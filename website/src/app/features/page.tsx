import type { Metadata } from 'next';
import {
  MessageSquare,
  Clock,
  Shield,
  Globe,
  Search,
  Users,
  BarChart3,
  Sliders,
  Check,
  X,
} from 'lucide-react';
import PageHero from '@/components/sections/PageHero';
import SectionHeader from '@/components/sections/SectionHeader';
import CTA from '@/components/sections/CTA';

export const metadata: Metadata = {
  title: 'Features',
  description:
    'Explore every Suprfly feature: AI tone matching, sub-second speed, platform safety, 12 languages, keyword targeting, creator watchlists, analytics, and full control.',
};

const featureBlocks = [
  {
    tag: 'Tone Matching',
    title: 'AI THAT SOUNDS EXACTLY LIKE YOU',
    description:
      'Suprfly analyzes your past posts, vocabulary, sentence structure, and personality. Every auto-generated comment mirrors your authentic voice — no one can tell the difference.',
    bullets: [
      'Learns from your existing LinkedIn & X content',
      'Adapts to formal, casual, witty, or technical tones',
      'Improves over time as you provide feedback',
      'Supports persona switching for multiple brands',
    ],
    icon: <MessageSquare className="w-7 h-7 text-amber" />,
  },
  {
    tag: 'Speed',
    title: 'FIRST IN THE THREAD, EVERY TIME',
    description:
      'Comments land within 800 milliseconds of a post going live. Early engagement gets 3x more visibility on LinkedIn and X algorithms — Suprfly ensures you are always first.',
    bullets: [
      'Sub-second response time on new posts',
      'Real-time feed monitoring, not batch processing',
      'Priority queue for your top creator watchlists',
      'Configurable delay ranges for natural pacing',
    ],
    icon: <Clock className="w-7 h-7 text-cyan" />,
  },
  {
    tag: 'Safety',
    title: 'ZERO FLAGS. ZERO BANS. GUARANTEED.',
    description:
      'Our platform-safe engine uses human-like delays, randomized cadence, device fingerprint rotation, and strict rate limiting. We have never had an account flagged.',
    bullets: [
      'Rate limiting tuned to platform thresholds',
      'Randomized intervals between actions',
      'Session-aware engagement patterns',
      'Continuous compliance monitoring',
    ],
    icon: <Shield className="w-7 h-7 text-green" />,
  },
  {
    tag: 'Languages',
    title: 'ENGAGE NATIVELY IN 12 LANGUAGES',
    description:
      'Auto-detect post language and reply in the same language. Reach international audiences without hiring translators or managing separate accounts.',
    bullets: [
      'English, Spanish, French, German, Portuguese',
      'Japanese, Korean, Chinese, Hindi, Arabic',
      'Dutch and Italian',
      'Language-specific tone calibration',
    ],
    icon: <Globe className="w-7 h-7 text-purple" />,
  },
  {
    tag: 'Targeting',
    title: 'LASER-FOCUSED KEYWORD TARGETING',
    description:
      'Define the exact conversations that matter. Set keywords, hashtags, topics, and exclusion lists so Suprfly only engages where it will move the needle.',
    bullets: [
      'Keyword and hashtag inclusion/exclusion',
      'Industry and role-based filters',
      'Competitor mention alerts',
      'Negative keyword safeguards',
    ],
    icon: <Search className="w-7 h-7 text-rose" />,
  },
  {
    tag: 'Watchlists',
    title: 'NEVER MISS A KEY CREATOR',
    description:
      'Build watchlists of the people whose audiences overlap with yours. Get first-mover engagement on every post and nurture relationships that convert.',
    bullets: [
      'Unlimited creator watchlists',
      'Priority notification when they post',
      'Engagement history per creator',
      'Relationship strength scoring',
    ],
    icon: <Users className="w-7 h-7 text-amber-light" />,
  },
  {
    tag: 'Analytics',
    title: 'DATA-DRIVEN ENGAGEMENT',
    description:
      'Track impressions, profile views, follower growth, and inbound leads — all tied directly to Suprfly activity. Know exactly which comments drive pipeline.',
    bullets: [
      'Real-time engagement dashboard',
      'Comment-to-lead attribution',
      'Weekly performance reports',
      'A/B testing for comment styles',
    ],
    icon: <BarChart3 className="w-7 h-7 text-cyan" />,
  },
  {
    tag: 'Control',
    title: 'YOUR RULES, YOUR WORKFLOW',
    description:
      'Choose between full autopilot, approval-required, or hybrid mode. Set schedules, daily limits, and content guardrails. You are always in command.',
    bullets: [
      'Three engagement modes: auto, approval, hybrid',
      'Daily and weekly comment limits',
      'Content guardrails and blocked topics',
      'Pause and resume with one click',
    ],
    icon: <Sliders className="w-7 h-7 text-amber" />,
  },
];

const comparisonRows = [
  { feature: 'AI tone matching', suprfly: true, manual: false, generic: false },
  { feature: 'Sub-second response', suprfly: true, manual: false, generic: false },
  { feature: 'Platform safety engine', suprfly: true, manual: true, generic: false },
  { feature: '12 language support', suprfly: true, manual: false, generic: false },
  { feature: 'Keyword targeting', suprfly: true, manual: false, generic: true },
  { feature: 'Creator watchlists', suprfly: true, manual: false, generic: false },
  { feature: 'Analytics dashboard', suprfly: true, manual: false, generic: true },
  { feature: 'Approval workflows', suprfly: true, manual: true, generic: false },
  { feature: 'Zero account flags', suprfly: true, manual: true, generic: false },
];

export default function FeaturesPage() {
  return (
    <>
      <PageHero
        breadcrumb={[
          { label: 'Home', href: '/' },
          { label: 'Features' },
        ]}
        title="EVERY FEATURE YOU NEED TO GROW ON AUTOPILOT"
        subtitle="Eight powerful capabilities working together to turn your social presence into a lead generation engine."
      />

      {/* ═══════════ ALTERNATING FEATURE BLOCKS ═══════════ */}
      <section className="py-24 md:py-36">
        <div className="max-w-[1200px] mx-auto px-6 space-y-24">
          {featureBlocks.map((block, i) => (
            <div
              key={block.tag}
              className={`flex flex-col lg:flex-row items-center gap-12 ${
                i % 2 === 1 ? 'lg:flex-row-reverse' : ''
              }`}
            >
              {/* text side */}
              <div className="flex-1">
                <div className="text-xs uppercase tracking-[0.14em] text-amber font-bold mb-4">
                  {block.tag}
                </div>
                <h2 className="font-[var(--font-display)] text-3xl md:text-4xl font-black uppercase tracking-tight text-white leading-[1.1] mb-4">
                  {block.title}
                </h2>
                <p className="text-text-muted text-sm leading-relaxed mb-6">{block.description}</p>
                <ul className="space-y-3">
                  {block.bullets.map((b) => (
                    <li key={b} className="flex items-start gap-3 text-sm text-text-muted">
                      <Check className="w-4 h-4 text-green mt-0.5 shrink-0" />
                      {b}
                    </li>
                  ))}
                </ul>
              </div>

              {/* visual card side */}
              <div className="flex-1 w-full">
                <div className="bg-bg-card border border-border rounded-2xl p-10 flex items-center justify-center min-h-[280px]">
                  <div className="w-20 h-20 rounded-2xl bg-white/5 flex items-center justify-center">
                    {block.icon}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ═══════════ COMPARISON TABLE ═══════════ */}
      <section className="py-24 md:py-36 bg-bg-card/40">
        <div className="max-w-[1200px] mx-auto px-6">
          <SectionHeader
            tag="Compare"
            title="SUPRFLY vs THE<br/>ALTERNATIVES"
            subtitle="See why 10,000+ professionals chose Suprfly over manual engagement and generic bots."
          />
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-4 pr-4 text-text-dim font-medium">Feature</th>
                  <th className="text-center py-4 px-4 text-amber font-bold">Suprfly</th>
                  <th className="text-center py-4 px-4 text-text-dim font-medium">Manual</th>
                  <th className="text-center py-4 px-4 text-text-dim font-medium">Generic Bots</th>
                </tr>
              </thead>
              <tbody>
                {comparisonRows.map((row) => (
                  <tr key={row.feature} className="border-b border-border/50">
                    <td className="py-4 pr-4 text-text-muted">{row.feature}</td>
                    <td className="py-4 px-4 text-center">
                      {row.suprfly ? (
                        <Check className="w-5 h-5 text-green mx-auto" />
                      ) : (
                        <X className="w-5 h-5 text-rose mx-auto" />
                      )}
                    </td>
                    <td className="py-4 px-4 text-center">
                      {row.manual ? (
                        <Check className="w-5 h-5 text-green mx-auto" />
                      ) : (
                        <X className="w-5 h-5 text-rose mx-auto" />
                      )}
                    </td>
                    <td className="py-4 px-4 text-center">
                      {row.generic ? (
                        <Check className="w-5 h-5 text-green mx-auto" />
                      ) : (
                        <X className="w-5 h-5 text-rose mx-auto" />
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ═══════════ CTA ═══════════ */}
      <CTA />
    </>
  );
}
