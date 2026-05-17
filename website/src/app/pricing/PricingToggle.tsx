'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Check, Zap } from 'lucide-react';

const tiers = [
  {
    name: 'Starter',
    monthly: 0,
    annual: 0,
    description: 'Perfect for testing the waters.',
    features: [
      '50 comments/month',
      '1 social account',
      'Basic tone matching',
      'Keyword targeting',
      'Community support',
    ],
    cta: 'Get Started Free',
    href: 'https://app.suprfly.io/register',
    featured: false,
  },
  {
    name: 'Growth',
    monthly: 49,
    annual: 39,
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
    href: 'https://app.suprfly.io/register',
    featured: true,
  },
  {
    name: 'Agency',
    monthly: 149,
    annual: 119,
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
    href: '/contact',
    featured: false,
  },
];

export default function PricingToggle() {
  const [annual, setAnnual] = useState(false);

  return (
    <>
      {/* Toggle */}
      <div className="flex items-center justify-center gap-4 mb-16">
        <span className={`text-sm font-medium ${!annual ? 'text-white' : 'text-text-dim'}`}>Monthly</span>
        <button
          onClick={() => setAnnual(!annual)}
          className="relative w-14 h-7 rounded-full bg-bg border border-border transition-colors"
          aria-label="Toggle annual billing"
        >
          <span
            className={`absolute top-0.5 w-6 h-6 rounded-full bg-amber transition-transform ${
              annual ? 'translate-x-7' : 'translate-x-0.5'
            }`}
          />
        </button>
        <span className={`text-sm font-medium ${annual ? 'text-white' : 'text-text-dim'}`}>
          Annual
          <span className="ml-2 text-xs text-green font-semibold">Save 20%</span>
        </span>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {tiers.map((tier) => {
          const price = annual ? tier.annual : tier.monthly;
          return (
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
                <span className="text-4xl font-black text-white">${price}</span>
                <span className="text-text-dim text-sm">/mo</span>
              </div>
              <Link
                href={tier.href}
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
          );
        })}
      </div>
    </>
  );
}
