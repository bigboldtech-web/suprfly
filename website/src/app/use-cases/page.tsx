import type { Metadata } from 'next';
import {
  Rocket,
  Building2,
  Handshake,
  Video,
  Code2,
  GraduationCap,
  ArrowRight,
} from 'lucide-react';
import Link from 'next/link';
import PageHero from '@/components/sections/PageHero';
import CTA from '@/components/sections/CTA';

export const metadata: Metadata = {
  title: 'Use Cases',
  description:
    'See how SaaS founders, agencies, sales teams, creators, DevRel, and coaches use Suprfly to grow their audience and pipeline on LinkedIn & X.',
};

const useCases = [
  {
    icon: <Rocket className="w-7 h-7 text-amber" />,
    title: 'SaaS Founders',
    subtitle: 'Turn thought leadership into pipeline',
    description:
      'You are building in public, sharing lessons, and trying to get noticed. Suprfly engages with the right people in your ICP so every post you publish gets amplified — and every comment you leave drives traffic back to your product.',
    results: [
      '3x increase in inbound demo requests',
      '40% more profile views per week',
      'Saved 10+ hours/week on manual engagement',
    ],
  },
  {
    icon: <Building2 className="w-7 h-7 text-cyan" />,
    title: 'Agencies',
    subtitle: 'Scale engagement across client accounts',
    description:
      'Managing social engagement for multiple clients is a nightmare without automation. Suprfly lets you run 10+ accounts from one dashboard with unique tone profiles per brand — and white-label reports your clients will love.',
    results: [
      'Manage 10+ client accounts from one dashboard',
      'Unique tone profiles per brand',
      'White-label performance reports',
    ],
  },
  {
    icon: <Handshake className="w-7 h-7 text-green" />,
    title: 'Sales Teams',
    subtitle: 'Warm up prospects before the cold outreach',
    description:
      'The best salespeople engage with prospect content before sliding into DMs. Suprfly automates this warm-up step — commenting on your target accounts so they recognize your name before you ever send a message.',
    results: [
      '28% higher reply rate on outbound',
      'Prospects recognize your name before outreach',
      'Automatic engagement on target account posts',
    ],
  },
  {
    icon: <Video className="w-7 h-7 text-rose" />,
    title: 'Creators',
    subtitle: 'Grow your following while you create',
    description:
      'You already spend hours creating content. Suprfly handles the engagement side — commenting on posts in your niche to drive followers back to your profile. More reach, more followers, more brand deals.',
    results: [
      '2x follower growth in 90 days',
      'Consistent engagement even while creating',
      'Niche-targeted audience building',
    ],
  },
  {
    icon: <Code2 className="w-7 h-7 text-purple" />,
    title: 'DevRel',
    subtitle: 'Be everywhere in the developer community',
    description:
      'Developer advocates need to be present in every conversation about their stack. Suprfly watches for mentions of your technology, frameworks, and competitor tools — then drops thoughtful, technical comments that build trust.',
    results: [
      'Never miss a conversation about your stack',
      'Technical tone that resonates with developers',
      'Track community sentiment in real-time',
    ],
  },
  {
    icon: <GraduationCap className="w-7 h-7 text-amber-light" />,
    title: 'Coaches & Consultants',
    subtitle: 'Build authority and fill your calendar',
    description:
      'Your expertise is your product, and visibility is everything. Suprfly positions you as the go-to expert in your niche by engaging with the exact audience that needs your services — consistently, authentically, and at scale.',
    results: [
      'Position yourself as the niche expert',
      'Fill your calendar with inbound leads',
      'Build trust before the first call',
    ],
  },
];

export default function UseCasesPage() {
  return (
    <>
      <PageHero
        breadcrumb={[
          { label: 'Home', href: '/' },
          { label: 'Use Cases' },
        ]}
        title="BUILT FOR HOW YOU GROW"
        subtitle="Whether you are a solo founder or a 50-person agency, Suprfly adapts to your workflow and scales with your ambitions."
      />

      {/* ═══════════ USE CASE CARDS ═══════════ */}
      <section className="py-24 md:py-36">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {useCases.map((uc) => (
              <div
                key={uc.title}
                className="bg-bg-card border border-border rounded-2xl p-8 hover:border-border-hover hover:-translate-y-0.5 transition-all flex flex-col"
              >
                <div className="w-14 h-14 rounded-xl bg-white/5 flex items-center justify-center mb-6">
                  {uc.icon}
                </div>
                <h3 className="text-xl font-bold text-white mb-1">{uc.title}</h3>
                <p className="text-sm text-amber font-semibold mb-4">{uc.subtitle}</p>
                <p className="text-text-muted text-sm leading-relaxed mb-6 flex-1">{uc.description}</p>
                <div className="border-t border-border pt-5">
                  <div className="text-xs uppercase tracking-widest text-text-dim font-bold mb-3">
                    Key Results
                  </div>
                  <ul className="space-y-2">
                    {uc.results.map((r) => (
                      <li key={r} className="flex items-start gap-2 text-sm text-text-muted">
                        <ArrowRight className="w-3.5 h-3.5 text-amber mt-0.5 shrink-0" />
                        {r}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════ CTA ═══════════ */}
      <CTA
        title="SEE YOURSELF HERE?"
        subtitle="Start your 7-day free trial and see why 10,000+ professionals trust Suprfly to grow their presence."
      />
    </>
  );
}
