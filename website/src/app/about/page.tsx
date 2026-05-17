import type { Metadata } from 'next';
import { Lightbulb, Heart, Shield, Rocket } from 'lucide-react';
import PageHero from '@/components/sections/PageHero';
import SectionHeader from '@/components/sections/SectionHeader';
import CTA from '@/components/sections/CTA';

export const metadata: Metadata = {
  title: 'About',
  description:
    'Learn about the mission behind Suprfly. We believe every professional deserves the reach that consistent, authentic engagement creates — without the time cost.',
};

const values = [
  {
    icon: <Lightbulb className="w-6 h-6 text-amber" />,
    title: 'Authenticity First',
    description:
      'We will never ship a feature that makes engagement feel robotic. Every comment Suprfly generates should be indistinguishable from one you typed yourself.',
  },
  {
    icon: <Heart className="w-6 h-6 text-rose" />,
    title: 'User Obsession',
    description:
      'We talk to users every single day. Feature requests go straight to the sprint board. Our roadmap is your roadmap.',
  },
  {
    icon: <Shield className="w-6 h-6 text-green" />,
    title: 'Platform Integrity',
    description:
      'We play by the rules. Suprfly is designed to complement platform policies, not circumvent them. Zero account flags since day one.',
  },
  {
    icon: <Rocket className="w-6 h-6 text-cyan" />,
    title: 'Relentless Improvement',
    description:
      'We ship every week. Our AI models get smarter with every comment, every feedback loop, and every new language we add.',
  },
];

const stats = [
  { value: '10,000+', label: 'Active Users' },
  { value: '2.4M+', label: 'Comments Generated' },
  { value: '12', label: 'Languages' },
  { value: '99.7%', label: 'Uptime SLA' },
];

export default function AboutPage() {
  return (
    <>
      <PageHero
        breadcrumb={[
          { label: 'Home', href: '/' },
          { label: 'About' },
        ]}
        title="THE TEAM BEHIND YOUR AUTOPILOT ENGAGEMENT"
        subtitle="We are a small, focused team obsessed with one thing: helping professionals build real authority through authentic, AI-powered engagement."
      />

      {/* ═══════════ MISSION ═══════════ */}
      <section className="py-24 md:py-36">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="max-w-3xl mx-auto">
            <SectionHeader
              tag="Our Mission"
              title="ENGAGEMENT SHOULD<br/>NOT BE A FULL-TIME JOB"
            />
            <div className="space-y-6 text-text-muted text-sm leading-relaxed">
              <p>
                Every day, thousands of professionals spend hours manually commenting on LinkedIn and X posts.
                They know that consistent engagement builds authority, generates leads, and opens doors. But
                the math does not work — two hours a day is ten hours a week that could be spent closing deals,
                building product, or just living your life.
              </p>
              <p>
                We built Suprfly because we lived this problem. As founders, we were spending more time engaging
                on social media than building our company. We knew there had to be a better way — one that
                preserved authenticity while reclaiming our time.
              </p>
              <p>
                Suprfly is not a generic bot. It is a purpose-built AI that learns your voice, targets your
                niche, and engages on your behalf with the nuance and context that only a human could provide.
                Except now, the AI can do it too.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════ VALUES ═══════════ */}
      <section className="py-24 md:py-36 bg-bg-card/40">
        <div className="max-w-[1200px] mx-auto px-6">
          <SectionHeader
            tag="Our Values"
            title="WHAT WE STAND FOR"
            subtitle="Four principles that guide every decision we make."
          />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {values.map((v) => (
              <div
                key={v.title}
                className="bg-bg-card border border-border rounded-2xl p-8 hover:border-border-hover hover:-translate-y-0.5 transition-all"
              >
                <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center mb-5">
                  {v.icon}
                </div>
                <h3 className="text-lg font-bold text-white mb-2">{v.title}</h3>
                <p className="text-text-muted text-sm leading-relaxed">{v.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════ STATS STRIP ═══════════ */}
      <section className="py-16 border-y border-border">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((s) => (
              <div key={s.label} className="text-center">
                <div className="text-3xl md:text-4xl font-black text-white font-[var(--font-display)]">
                  {s.value}
                </div>
                <div className="text-sm text-text-dim mt-1">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════ CTA ═══════════ */}
      <CTA title="WANT TO JOIN THE MISSION?" subtitle="We are always looking for talented people who care about authentic engagement. Check our open roles or just say hello." />
    </>
  );
}
