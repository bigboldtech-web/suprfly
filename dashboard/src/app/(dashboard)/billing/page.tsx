'use client';

import { Card, CardContent } from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import { useAuthStore } from '@/stores/authStore';
import { Check } from 'lucide-react';

const PLANS = [
  {
    name: 'Starter',
    price: '$19',
    period: '/mo',
    desc: 'For getting started',
    features: ['1 account', '5 keywords', '10 creators', '50 comments/day', 'Basic analytics'],
    cta: 'Get Starter',
    featured: false,
  },
  {
    name: 'Growth',
    price: '$49',
    period: '/mo',
    desc: 'Best for solopreneurs & founders',
    features: ['2 accounts (LinkedIn + X)', '10 keywords', '50 creators', '150 comments/day', 'CSV export', 'Custom tone & voice', 'Priority support'],
    cta: 'Get Growth',
    featured: true,
  },
  {
    name: 'Agency',
    price: '$149',
    period: '/mo',
    desc: 'For teams managing multiple brands',
    features: ['5 accounts', '25 keywords', '100 creators', '150 comments/account', 'Team dashboard', 'White-label reports', 'API access'],
    cta: 'Contact Sales',
    featured: false,
  },
];

export default function BillingPage() {
  const user = useAuthStore((s) => s.user);

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Billing</h1>
        <p className="text-sm text-slate-500 mt-1">Manage your subscription and usage.</p>
      </div>

      {/* Current Plan */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Current Plan</h2>
              <div className="flex items-center gap-3 mt-2">
                <Badge variant="info" className="text-sm px-3 py-1">{user?.plan || 'FREE'}</Badge>
              </div>
            </div>
            <div className="text-right text-sm text-slate-500 space-y-1">
              <p>Workflows: <strong>{user?.maxWorkflowsPerAccount || 0}</strong> per account</p>
              <p>Keywords: <strong>{user?.maxKeywordsPerWorkflow || 0}</strong> per workflow</p>
              <p>Comments: <strong>{user?.maxCommentsDayGlobal || 0}</strong>/day global</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Plan Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {PLANS.map((plan) => (
          <Card key={plan.name} className={plan.featured ? 'border-amber-300 ring-1 ring-amber-200 relative' : ''}>
            {plan.featured && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <Badge variant="warning" className="text-xs">MOST POPULAR</Badge>
              </div>
            )}
            <CardContent className="p-6">
              <p className="text-sm font-semibold text-slate-500">{plan.name}</p>
              <div className="mt-2 mb-1">
                <span className="text-3xl font-extrabold text-slate-900">{plan.price}</span>
                <span className="text-sm text-slate-400">{plan.period}</span>
              </div>
              <p className="text-xs text-slate-400 mb-6">{plan.desc}</p>

              <Button
                className="w-full mb-6"
                variant={plan.featured ? 'primary' : 'secondary'}
              >
                {plan.cta}
              </Button>

              <ul className="space-y-2.5">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm text-slate-600">
                    <Check className="w-4 h-4 text-amber-500 flex-shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
