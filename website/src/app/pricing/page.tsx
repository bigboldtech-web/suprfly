import type { Metadata } from 'next';
import { Check } from 'lucide-react';
import PageHero from '@/components/sections/PageHero';
import SectionHeader from '@/components/sections/SectionHeader';
import CTA from '@/components/sections/CTA';
import PricingToggle from './PricingToggle';

export const metadata: Metadata = {
  title: 'Pricing',
  description:
    'Simple, transparent pricing for Suprfly. Start free with 50 comments/month. Upgrade to Growth or Agency for unlimited engagement and advanced features.',
};

const faqItems = [
  {
    q: 'Is there really a free plan?',
    a: 'Yes. The Starter plan gives you 50 AI-generated comments per month across one social account. No credit card required.',
  },
  {
    q: 'What happens if I hit my comment limit?',
    a: 'Suprfly pauses engagement until your next billing cycle or until you upgrade. You will never be charged overage fees.',
  },
  {
    q: 'Can I switch plans at any time?',
    a: 'Absolutely. Upgrade, downgrade, or cancel at any time from your dashboard. Changes take effect immediately with prorated billing.',
  },
  {
    q: 'Do you offer annual discounts?',
    a: 'Yes. Annual billing saves you 20% compared to monthly. That is $39/mo for Growth and $119/mo for Agency.',
  },
  {
    q: 'Is there a refund policy?',
    a: 'We offer a 14-day money-back guarantee on all paid plans. If you are not satisfied, we will refund you in full — no questions asked.',
  },
  {
    q: 'Do you offer custom enterprise plans?',
    a: 'Yes. For teams with 10+ accounts or custom compliance needs, contact our sales team for a tailored solution.',
  },
];

export default function PricingPage() {
  return (
    <>
      <PageHero
        breadcrumb={[
          { label: 'Home', href: '/' },
          { label: 'Pricing' },
        ]}
        title="SIMPLE PRICING, SERIOUS RESULTS"
        subtitle="Start free. Upgrade when you are ready. Save 20% with annual billing."
      />

      {/* ═══════════ PRICING CARDS WITH TOGGLE ═══════════ */}
      <section className="py-24 md:py-36">
        <div className="max-w-[1200px] mx-auto px-6">
          <PricingToggle />
        </div>
      </section>

      {/* ═══════════ FEATURE COMPARISON TABLE ═══════════ */}
      <section className="py-24 md:py-36 bg-bg-card/40">
        <div className="max-w-[1200px] mx-auto px-6">
          <SectionHeader
            tag="Compare Plans"
            title="FULL FEATURE<br/>COMPARISON"
            subtitle="See exactly what is included in every plan."
          />
          <FeatureTable />
        </div>
      </section>

      {/* ═══════════ FAQ ═══════════ */}
      <section className="py-24 md:py-36">
        <div className="max-w-[1200px] mx-auto px-6">
          <SectionHeader
            tag="FAQ"
            title="PRICING QUESTIONS<br/>ANSWERED"
            subtitle="Everything you need to know about our plans and billing."
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
            {faqItems.map((item) => (
              <div key={item.q}>
                <h3 className="text-sm font-semibold text-white mb-2">{item.q}</h3>
                <p className="text-sm text-text-muted leading-relaxed">{item.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <CTA />
    </>
  );
}

/* ─── Feature comparison table (server component) ─── */
const comparisonFeatures = [
  { feature: 'AI comments/month', starter: '50', growth: '1,000', agency: 'Unlimited' },
  { feature: 'Social accounts', starter: '1', growth: '3', agency: '10' },
  { feature: 'Tone matching', starter: 'Basic', growth: 'Advanced', agency: 'Advanced' },
  { feature: 'Keyword targeting', starter: true, growth: true, agency: true },
  { feature: 'Creator watchlists', starter: false, growth: true, agency: true },
  { feature: '12 languages', starter: false, growth: true, agency: true },
  { feature: 'Analytics dashboard', starter: false, growth: true, agency: true },
  { feature: 'A/B comment testing', starter: false, growth: false, agency: true },
  { feature: 'White-label reports', starter: false, growth: false, agency: true },
  { feature: 'Team collaboration', starter: false, growth: false, agency: true },
  { feature: 'API access', starter: false, growth: false, agency: true },
  { feature: 'Dedicated CSM', starter: false, growth: false, agency: true },
  { feature: 'Custom integrations', starter: false, growth: false, agency: true },
  { feature: 'Support', starter: 'Community', growth: 'Priority', agency: 'Dedicated' },
];

function FeatureTable() {
  const renderCell = (value: string | boolean) => {
    if (typeof value === 'string') {
      return <span className="text-text-muted">{value}</span>;
    }
    return value ? (
      <Check className="w-5 h-5 text-green mx-auto" />
    ) : (
      <span className="text-text-dim">—</span>
    );
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border">
            <th className="text-left py-4 pr-4 text-text-dim font-medium">Feature</th>
            <th className="text-center py-4 px-4 text-text-dim font-medium">Starter</th>
            <th className="text-center py-4 px-4 text-amber font-bold">Growth</th>
            <th className="text-center py-4 px-4 text-text-dim font-medium">Agency</th>
          </tr>
        </thead>
        <tbody>
          {comparisonFeatures.map((row) => (
            <tr key={row.feature} className="border-b border-border/50">
              <td className="py-4 pr-4 text-text-muted">{row.feature}</td>
              <td className="py-4 px-4 text-center">{renderCell(row.starter)}</td>
              <td className="py-4 px-4 text-center">{renderCell(row.growth)}</td>
              <td className="py-4 px-4 text-center">{renderCell(row.agency)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
