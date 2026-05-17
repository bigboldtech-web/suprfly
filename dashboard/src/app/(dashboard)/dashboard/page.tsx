'use client';

import Link from 'next/link';
import dynamic from 'next/dynamic';
import { useState } from 'react';
import { useAnalyticsSummary, useAnalyticsTimeseries } from '@/hooks/useAnalytics';
import { formatNumber } from '@/lib/utils';
import { MessageSquare, Eye, ThumbsUp, Users, ChevronDown, CheckCircle2, ChevronRight, type LucideIcon } from 'lucide-react';

const AnalyticsChart = dynamic(() => import('@/components/charts/AnalyticsChart'), {
  ssr: false,
  loading: () => <div className="h-72 w-full flex items-center justify-center text-xs text-slate-400">Loading chart…</div>,
});

const FAQ_ITEMS = [
  {
    q: 'What happens when my free trial ends?',
    a: "When your free trial ends, your access to premium features will be limited. To continue using the full service, you'll need to subscribe to a paid plan.",
  },
  {
    q: 'Can I cancel my subscription at any time?',
    a: 'Yes — cancel from the Billing page. Your plan stays active until the end of the current billing period.',
  },
  {
    q: 'What benefits do I get with a subscription?',
    a: 'Higher daily comment quotas, more accounts, more workflows per account, plus priority support and CSV export.',
  },
  {
    q: 'Will my data be saved after the trial ends?',
    a: 'Yes — your accounts, tones, workflows, and historical comments stay intact. You can resume by subscribing at any time.',
  },
];

type Range = '24h' | '7d' | '30d';

export default function AnalyticsPage() {
  const [range, setRange] = useState<Range>('24h');
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const { data: summary } = useAnalyticsSummary();
  const { data: series } = useAnalyticsTimeseries(range);

  const chartData = (series ?? []).map((p) => ({
    time: new Date(p.timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
    Comments: p.comments,
    Impressions: p.impressions,
    Followers: p.followers,
  }));

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto">
      <h1 className="text-2xl font-bold text-slate-900">My dashboard</h1>

      <div className="rounded-2xl border border-emerald-100 bg-gradient-to-r from-emerald-50/60 to-white p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <div className="text-sm font-semibold text-slate-800">All systems running</div>
            <div className="text-xs text-slate-500">
              Your workflows are active. <span className="font-semibold text-slate-700">{summary?.commentsToday ?? 0} comments</span> posted in the last 24h.
            </div>
          </div>
        </div>
        <Link
          href="/comments"
          className="hidden sm:inline-flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white text-sm font-semibold rounded-lg"
        >
          <Eye className="w-4 h-4" />
          View all comments
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Comments today" value={summary?.commentsToday ?? 0} icon={MessageSquare} tint="blue" />
        <StatCard label="Impressions today" value={summary?.impressionsToday ?? 0} icon={Eye} tint="violet" />
        <StatCard label="Likes today" value={summary?.likesToday ?? 0} icon={ThumbsUp} tint="emerald" />
        <StatCard label="Followers today" value={summary?.followersToday ?? 0} icon={Users} tint="amber" />
      </div>

      <div className="rounded-2xl bg-white border border-slate-200 p-6">
        <div className="flex items-start justify-between mb-2">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Comments, Impressions & Followers</h2>
            <p className="text-xs text-slate-500">Performance over time</p>
          </div>
          <div className="relative">
            <select
              value={range}
              onChange={(e) => setRange(e.target.value as Range)}
              className="appearance-none pl-3 pr-8 py-1.5 text-xs font-medium border border-slate-200 rounded-lg bg-white text-slate-700"
            >
              <option value="24h">Last 24hrs</option>
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>

        <div className="h-72 w-full mt-4">
          <AnalyticsChart data={chartData} />
        </div>
      </div>

      <div className="rounded-2xl bg-white border border-slate-200 p-6">
        <h2 className="text-lg font-bold text-slate-900 mb-4">Frequently Asked Questions</h2>
        <div className="divide-y divide-slate-100">
          {FAQ_ITEMS.map((item, i) => {
            const open = openFaq === i;
            return (
              <button
                key={i}
                onClick={() => setOpenFaq(open ? null : i)}
                className="w-full text-left py-3 group"
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="text-sm font-semibold text-slate-800">{item.q}</span>
                  <ChevronRight
                    className={`w-4 h-4 text-slate-400 transition-transform ${open ? 'rotate-90' : ''}`}
                  />
                </div>
                {open && <p className="mt-2 text-xs text-slate-500 leading-relaxed">{item.a}</p>}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function StatCard({
  label, value, icon: Icon, tint,
}: { label: string; value: number; icon: LucideIcon; tint: 'blue' | 'violet' | 'emerald' | 'amber' }) {
  const tints: Record<string, string> = {
    blue: 'bg-blue-50 text-blue-500',
    violet: 'bg-violet-50 text-violet-500',
    emerald: 'bg-emerald-50 text-emerald-500',
    amber: 'bg-amber-50 text-amber-500',
  };
  return (
    <div className="rounded-2xl bg-white border border-slate-200 p-5">
      <div className={`w-9 h-9 rounded-lg flex items-center justify-center mb-4 ${tints[tint]}`}>
        <Icon className="w-4 h-4" />
      </div>
      <div className="text-3xl font-bold text-slate-900">{formatNumber(value)}</div>
      <div className="text-xs text-slate-500 mt-1">{label}</div>
    </div>
  );
}
