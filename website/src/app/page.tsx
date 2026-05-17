import type { Metadata } from 'next';
import Link from 'next/link';
import {
  Zap,
  MessageSquare,
  Shield,
  Globe,
  Search,
  Users,
  ArrowRight,
  Star,
  Clock,
  Sparkles,
  Check,
  Bot,
} from 'lucide-react';
import SectionHeader from '@/components/sections/SectionHeader';
import CTA from '@/components/sections/CTA';
import HomeFAQ from './HomeFAQ';

export const metadata: Metadata = {
  title: 'Suprfly — AI Auto-Comments for LinkedIn & X',
  description:
    'Suprfly auto-comments on LinkedIn & X posts that match your niche — with AI that sounds exactly like you. Build authority while you build your business.',
};

/* ─── stat cards for the dashboard mockup ─── */
const dashStats = [
  { label: 'Comments Today', value: '47', delta: '+12%', color: 'text-green' },
  { label: 'Profile Views', value: '1,284', delta: '+34%', color: 'text-cyan' },
  { label: 'Leads Generated', value: '18', delta: '+8%', color: 'text-amber' },
];

/* ─── comment previews ─── */
const commentPreviews = [
  {
    author: 'You',
    target: '@SarahCMO on LinkedIn',
    text: 'This is spot-on, Sarah. We saw the same pattern after switching to intent-based targeting — CAC dropped 23% in one quarter.',
  },
  {
    author: 'You',
    target: '@DevRel_Mike on X',
    text: 'Great thread. The DX improvements in v3 are exactly what mid-size teams needed. Shipped our migration last week — night and day.',
  },
];

/* ─── marquee stats ─── */
const marqueeItems = [
  '2.4M+ comments generated',
  '10,000+ active users',
  '4.9/5 average rating',
  '38% avg engagement lift',
  '12 languages supported',
  '<800ms average reply time',
  '99.7% uptime SLA',
  '0 accounts flagged',
];

/* ─── features bento ─── */
const features = [
  {
    icon: <MessageSquare className="w-6 h-6 text-amber" />,
    title: 'Your Tone, Every Time',
    description:
      'Suprfly learns from your past posts and writing style. Every comment sounds like you wrote it — because the AI was trained on you.',
  },
  {
    icon: <Clock className="w-6 h-6 text-cyan" />,
    title: 'Sub-Second Speed',
    description:
      'Comments land within 800ms of a post going live. Be first in the thread while everyone else is still scrolling.',
  },
  {
    icon: <Shield className="w-6 h-6 text-green" />,
    title: 'Platform-Safe',
    description:
      'Rate limiting, human-like delays, and randomized cadence keep your account in good standing. Zero flags since launch.',
  },
  {
    icon: <Globe className="w-6 h-6 text-purple" />,
    title: '12 Languages',
    description:
      'Engage natively in English, Spanish, French, German, Portuguese, Japanese, and six more. Auto-detects post language.',
  },
  {
    icon: <Search className="w-6 h-6 text-rose" />,
    title: 'Smart Keyword Targeting',
    description:
      'Define topics, hashtags, and keywords. Suprfly only comments on posts relevant to your niche — no spam, no noise.',
  },
  {
    icon: <Users className="w-6 h-6 text-amber-light" />,
    title: 'Creator Watchlists',
    description:
      'Follow key accounts and get early-bird engagement on every post. Build relationships with the people who matter.',
  },
];

/* ─── how it works ─── */
const steps = [
  {
    num: '01',
    title: 'Connect Your Accounts',
    description: 'Link your LinkedIn and X profiles in under 60 seconds via our secure Chrome Extension.',
  },
  {
    num: '02',
    title: 'Define Your Niche',
    description: 'Set keywords, topics, and creator watchlists. Tell us what conversations matter to you.',
  },
  {
    num: '03',
    title: 'Train Your Voice',
    description: 'Paste a few posts or let us analyze your feed. The AI captures your tone, vocabulary, and POV.',
  },
  {
    num: '04',
    title: 'Engage on Autopilot',
    description: 'Suprfly comments in real-time. Review, approve, or let it run fully autonomous — your call.',
  },
];

/* ─── pricing tiers ─── */
const tiers = [
  {
    name: 'Starter',
    price: '$0',
    period: '/mo',
    description: 'Perfect for testing the waters.',
    features: ['50 comments/month', '1 social account', 'Basic tone matching', 'Keyword targeting', 'Community support'],
    cta: 'Get Started Free',
    featured: false,
  },
  {
    name: 'Growth',
    price: '$49',
    period: '/mo',
    description: 'For professionals serious about pipeline.',
    features: [
      '1,000 comments/month',
      '3 social accounts',
      'Advanced tone cloning',
      'Creator watchlists',
      '12 languages',
      'Priority support',
      'Analytics dashboard',
    ],
    cta: 'Start Free Trial',
    featured: true,
  },
  {
    name: 'Agency',
    price: '$149',
    period: '/mo',
    description: 'Manage engagement for multiple brands.',
    features: [
      'Unlimited comments',
      '10 social accounts',
      'White-label reports',
      'Team collaboration',
      'API access',
      'Dedicated CSM',
      'Custom integrations',
    ],
    cta: 'Contact Sales',
    featured: false,
  },
];

/* ─── testimonials ─── */
const testimonials = [
  {
    quote: 'Suprfly doubled our inbound demo requests in 6 weeks. The ROI is absurd.',
    name: 'Jake Holman',
    role: 'Head of Growth, Stackly',
  },
  {
    quote: 'I was spending 2 hours a day commenting. Now I spend 5 minutes reviewing. Game changer.',
    name: 'Priya Sharma',
    role: 'SaaS Founder',
  },
  {
    quote: 'Our agency manages 14 client accounts. Suprfly handles all of them without a single flag.',
    name: 'Marcus Chen',
    role: 'Agency Owner, BoldReach',
  },
  {
    quote: 'The tone matching is scary good. Even my team can not tell which comments are AI.',
    name: 'Elena Rodriguez',
    role: 'VP Marketing, Clearpath',
  },
  {
    quote: 'Went from 200 to 3,000 followers in 3 months just from consistent, quality engagement.',
    name: 'David Park',
    role: 'DevRel, NeonDB',
  },
];

/* ─── FAQ items ─── */
const faqItems = [
  {
    q: 'Will my account get flagged or banned?',
    a: 'No. Suprfly uses human-like delays, rate limiting, and randomized cadence. We have had zero account flags across 10,000+ users since launch.',
  },
  {
    q: 'How does the AI match my writing style?',
    a: 'We analyze your existing posts, vocabulary, sentence structure, and tone. The model adapts to sound like you — not a generic chatbot.',
  },
  {
    q: 'Can I review comments before they post?',
    a: 'Absolutely. Choose between full autopilot, approval-required, or hybrid mode where you review flagged comments only.',
  },
  {
    q: 'Which platforms are supported?',
    a: 'Currently LinkedIn and X (formerly Twitter). Instagram and Threads are on our roadmap for Q3 2026.',
  },
  {
    q: 'Is there a free plan?',
    a: 'Yes. The Starter plan gives you 50 comments per month at no cost. No credit card required to start.',
  },
  {
    q: 'Can I cancel anytime?',
    a: 'Yes. All plans are month-to-month with no long-term contracts. Cancel in two clicks from your dashboard.',
  },
];

export default function HomePage() {
  return (
    <>
      {/* ═══════════ HERO ═══════════ */}
      <section className="pt-36 pb-20 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,rgba(245,158,11,0.08)_0%,transparent_60%)]" />
        <div className="max-w-[1200px] mx-auto px-6 relative z-10">
          {/* badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-amber/20 bg-amber/5 text-amber text-xs font-semibold mb-8">
            <Sparkles className="w-3.5 h-3.5" />
            Now with 12-language support
          </div>

          <h1 className="font-[var(--font-display)] text-4xl md:text-5xl lg:text-6xl font-black uppercase tracking-tight leading-[1.05] text-white mb-5 max-w-4xl mx-auto">
            YOUR POSTS GET LIKES.
            <br />
            <span className="text-amber">THEIRS GET CLIENTS.</span>
          </h1>

          <p className="text-lg md:text-xl text-text-muted max-w-2xl mx-auto leading-relaxed mb-10">
            Suprfly auto-comments on LinkedIn & X posts that match your niche — with AI that sounds exactly
            like you. Build authority while you build your business.
          </p>

          {/* CTAs */}
          <div className="flex gap-4 justify-center flex-wrap mb-10">
            <Link
              href="https://app.suprfly.io/register"
              className="inline-flex items-center gap-2 px-9 py-4 text-base font-bold text-bg bg-gradient-to-br from-amber-light to-amber rounded-xl shadow-[0_2px_20px_rgba(245,158,11,0.3)] hover:shadow-[0_4px_30px_rgba(245,158,11,0.4)] hover:-translate-y-0.5 transition-all"
            >
              <Zap className="w-4 h-4" />
              Start Free Trial
            </Link>
            <Link
              href="/features"
              className="inline-flex items-center gap-2 px-9 py-4 text-base font-semibold text-white border-[1.5px] border-white/20 rounded-xl hover:border-white/40 hover:bg-white/[.03] transition-all"
            >
              See How It Works
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* social proof */}
          <div className="flex items-center justify-center gap-6 flex-wrap text-sm text-text-muted">
            <div className="flex items-center gap-2">
              <div className="flex -space-x-2">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div
                    key={i}
                    className="w-8 h-8 rounded-full bg-bg-card border-2 border-bg flex items-center justify-center text-xs font-bold text-text-dim"
                  >
                    {String.fromCharCode(64 + i)}
                  </div>
                ))}
              </div>
              <span>10,000+ users</span>
            </div>
            <div className="flex items-center gap-1.5">
              {[1, 2, 3, 4, 5].map((i) => (
                <Star key={i} className="w-4 h-4 text-amber fill-amber" />
              ))}
              <span className="font-semibold text-white ml-1">4.9/5</span>
            </div>
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-green" />
              <span>SOC 2 Compliant</span>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════ DASHBOARD MOCKUP ═══════════ */}
      <section className="pb-24 md:pb-36">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="bg-bg-card border border-border rounded-2xl overflow-hidden shadow-2xl shadow-black/40">
            {/* browser chrome */}
            <div className="flex items-center gap-2 px-4 py-3 border-b border-border bg-bg-card">
              <div className="flex gap-1.5">
                <span className="w-3 h-3 rounded-full bg-rose/60" />
                <span className="w-3 h-3 rounded-full bg-amber/60" />
                <span className="w-3 h-3 rounded-full bg-green/60" />
              </div>
              <div className="flex-1 flex justify-center">
                <div className="bg-bg rounded-lg px-4 py-1 text-xs text-text-dim border border-border w-72 text-center">
                  app.suprfly.io/dashboard
                </div>
              </div>
            </div>

            <div className="p-6 md:p-8">
              {/* stat cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                {dashStats.map((s) => (
                  <div key={s.label} className="bg-bg rounded-xl border border-border p-5">
                    <div className="text-xs text-text-dim mb-1">{s.label}</div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl font-bold text-white">{s.value}</span>
                      <span className={`text-xs font-semibold ${s.color}`}>{s.delta}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* comment previews */}
              <div className="space-y-3">
                {commentPreviews.map((c, i) => (
                  <div key={i} className="bg-bg rounded-xl border border-border p-5">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-6 h-6 rounded-full bg-amber/20 flex items-center justify-center">
                        <Bot className="w-3.5 h-3.5 text-amber" />
                      </div>
                      <span className="text-xs font-semibold text-white">{c.author}</span>
                      <ArrowRight className="w-3 h-3 text-text-dim" />
                      <span className="text-xs text-text-dim">{c.target}</span>
                    </div>
                    <p className="text-sm text-text-muted leading-relaxed">{c.text}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════ MARQUEE ═══════════ */}
      <section className="border-y border-border py-5 overflow-hidden">
        <div className="flex animate-marquee whitespace-nowrap">
          {[...marqueeItems, ...marqueeItems].map((item, i) => (
            <span key={i} className="mx-8 text-sm text-text-dim font-medium flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-amber/60" />
              {item}
            </span>
          ))}
        </div>
      </section>

      {/* ═══════════ FEATURES BENTO ═══════════ */}
      <section className="py-24 md:py-36">
        <div className="max-w-[1200px] mx-auto px-6">
          <SectionHeader
            tag="Features"
            title="EVERYTHING YOU NEED TO<br/>DOMINATE THE FEED"
            subtitle="Six core capabilities that turn passive scrolling into pipeline generation."
          />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((f) => (
              <div
                key={f.title}
                className="bg-bg-card border border-border rounded-2xl p-8 hover:border-border-hover hover:-translate-y-0.5 transition-all"
              >
                <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center mb-5">
                  {f.icon}
                </div>
                <h3 className="text-lg font-bold text-white mb-2">{f.title}</h3>
                <p className="text-text-muted text-sm leading-relaxed">{f.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════ HOW IT WORKS ═══════════ */}
      <section className="py-24 md:py-36 bg-bg-card/40">
        <div className="max-w-[1200px] mx-auto px-6">
          <SectionHeader
            tag="How It Works"
            title="FOUR STEPS TO<br/>AUTOPILOT ENGAGEMENT"
            subtitle="Set up in under five minutes. No code, no complex workflows."
          />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {steps.map((s) => (
              <div
                key={s.num}
                className="bg-bg-card border border-border rounded-2xl p-8 hover:border-border-hover hover:-translate-y-0.5 transition-all relative"
              >
                <div className="text-5xl font-black text-amber/10 absolute top-4 right-6 font-[var(--font-display)]">
                  {s.num}
                </div>
                <div className="text-xs font-bold text-amber mb-4 uppercase tracking-widest">
                  Step {s.num}
                </div>
                <h3 className="text-lg font-bold text-white mb-2">{s.title}</h3>
                <p className="text-text-muted text-sm leading-relaxed">{s.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════ PLATFORMS ═══════════ */}
      <section className="py-24 md:py-36">
        <div className="max-w-[1200px] mx-auto px-6">
          <SectionHeader
            tag="Platforms"
            title="BUILT FOR WHERE<br/>YOUR AUDIENCE LIVES"
            subtitle="Deep integrations with the two platforms that drive B2B pipeline."
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* LinkedIn */}
            <div className="bg-bg-card border border-border rounded-2xl p-8 hover:border-border-hover transition-all">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-xl bg-[#0A66C2]/10 flex items-center justify-center">
                  <Bot className="w-6 h-6 text-[#0A66C2]" />
                </div>
                <h3 className="text-xl font-bold text-white">LinkedIn</h3>
              </div>
              <ul className="space-y-3">
                {[
                  'Comment on feed posts, articles, and newsletters',
                  'Target by industry, role, and company size',
                  'Auto-engage with connection requests',
                  'Track profile view spikes from engagement',
                  'Respect LinkedIn rate limits natively',
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3 text-sm text-text-muted">
                    <Check className="w-4 h-4 text-green mt-0.5 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* X */}
            <div className="bg-bg-card border border-border rounded-2xl p-8 hover:border-border-hover transition-all">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center">
                  <Bot className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white">X (Twitter)</h3>
              </div>
              <ul className="space-y-3">
                {[
                  'Reply to tweets, threads, and Spaces recaps',
                  'Hashtag and cashtag keyword targeting',
                  'Engage with quote tweets and retweets',
                  'Thread-aware context for multi-post replies',
                  'Built-in compliance with X API policies',
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3 text-sm text-text-muted">
                    <Check className="w-4 h-4 text-green mt-0.5 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════ PRICING ═══════════ */}
      <section className="py-24 md:py-36 bg-bg-card/40">
        <div className="max-w-[1200px] mx-auto px-6">
          <SectionHeader
            tag="Pricing"
            title="SIMPLE PRICING,<br/>SERIOUS RESULTS"
            subtitle="Start free. Upgrade when you are ready. Cancel anytime."
          />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {tiers.map((tier) => (
              <div
                key={tier.name}
                className={`rounded-2xl p-8 transition-all relative ${
                  tier.featured
                    ? 'bg-bg-card border-2 border-amber/30 shadow-[0_0_40px_rgba(245,158,11,0.08)]'
                    : 'bg-bg-card border border-border hover:border-border-hover'
                }`}
              >
                {tier.featured && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-gradient-to-r from-amber-light to-amber text-bg text-xs font-bold rounded-full">
                    Most Popular
                  </div>
                )}
                <h3 className="text-lg font-bold text-white mb-1">{tier.name}</h3>
                <p className="text-sm text-text-dim mb-5">{tier.description}</p>
                <div className="flex items-baseline gap-1 mb-6">
                  <span className="text-4xl font-black text-white">{tier.price}</span>
                  <span className="text-text-dim text-sm">{tier.period}</span>
                </div>
                <Link
                  href={tier.name === 'Agency' ? '/contact' : 'https://app.suprfly.io/register'}
                  className={`block text-center py-3.5 rounded-xl font-bold text-sm mb-8 transition-all ${
                    tier.featured
                      ? 'bg-gradient-to-br from-amber-light to-amber text-bg shadow-[0_2px_20px_rgba(245,158,11,0.3)] hover:shadow-[0_4px_30px_rgba(245,158,11,0.4)] hover:-translate-y-0.5'
                      : 'border border-border text-white hover:border-border-hover hover:bg-white/[.03]'
                  }`}
                >
                  {tier.cta}
                </Link>
                <ul className="space-y-3">
                  {tier.features.map((f) => (
                    <li key={f} className="flex items-center gap-3 text-sm text-text-muted">
                      <Check className="w-4 h-4 text-green shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════ TESTIMONIALS ═══════════ */}
      <section className="py-24 md:py-36">
        <div className="max-w-[1200px] mx-auto px-6">
          <SectionHeader
            tag="Testimonials"
            title="LOVED BY 10,000+<br/>PROFESSIONALS"
            subtitle="Hear from the founders, marketers, and sellers who grow with Suprfly."
          />
        </div>
        <div className="overflow-x-auto pb-4 -mx-6 px-6 scrollbar-hide">
          <div className="flex gap-5 w-max px-[max(1.5rem,calc((100vw-1200px)/2))]">
            {testimonials.map((t) => (
              <div
                key={t.name}
                className="bg-bg-card border border-border rounded-2xl p-8 w-[340px] shrink-0 hover:border-border-hover transition-all"
              >
                <div className="flex gap-1 mb-4">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star key={s} className="w-4 h-4 text-amber fill-amber" />
                  ))}
                </div>
                <p className="text-sm text-text-muted leading-relaxed mb-6">&ldquo;{t.quote}&rdquo;</p>
                <div>
                  <div className="text-sm font-semibold text-white">{t.name}</div>
                  <div className="text-xs text-text-dim">{t.role}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════ FAQ ═══════════ */}
      <section className="py-24 md:py-36 bg-bg-card/40">
        <div className="max-w-[1200px] mx-auto px-6">
          <SectionHeader
            tag="FAQ"
            title="FREQUENTLY ASKED<br/>QUESTIONS"
            subtitle="Everything you need to know before getting started."
          />
          <HomeFAQ items={faqItems} />
        </div>
      </section>

      {/* ═══════════ CTA ═══════════ */}
      <CTA />
    </>
  );
}
