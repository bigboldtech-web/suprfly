'use client';

import Link from 'next/link';
import { useAccounts, useDisconnectAccount, useRefreshSession } from '@/hooks/useAccounts';
import { useGlobalQuota } from '@/hooks/useAnalytics';
import { getInitials } from '@/lib/utils';
import { RefreshCw, Trash2, Plus, Shield, ChevronRight } from 'lucide-react';
import type { ConnectedAccount, QuotaSnapshot } from '@/types';

export default function AccountsPage() {
  const { data: accounts = [] } = useAccounts();
  const { data: quota } = useGlobalQuota();

  const xAccounts = accounts.filter((a) => a.platform === 'TWITTER');
  const liAccounts = accounts.filter((a) => a.platform === 'LINKEDIN');

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Manage Accounts</h1>
        <p className="text-sm text-slate-500 mt-1">Connect unlimited accounts to Suprfly, and automate your comments!</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AccountColumn
          title="X (Twitter) Accounts"
          accounts={xAccounts}
          quota={quota}
          icon={<XLogo />}
          connectHelp="Open the Suprfly Chrome extension while logged in to X to connect."
        />
        <AccountColumn
          title="LinkedIn Accounts"
          accounts={liAccounts}
          quota={quota}
          icon={<LinkedinIcon />}
          connectHelp="Open the Suprfly Chrome extension while logged in to LinkedIn to connect personal or company pages."
        />
      </div>
    </div>
  );
}

function AccountColumn({
  title, accounts, quota, icon, connectHelp,
}: { title: string; accounts: ConnectedAccount[]; quota: QuotaSnapshot | undefined; icon: React.ReactNode; connectHelp: string }) {
  return (
    <div className="rounded-2xl bg-white border border-slate-200 p-5 flex flex-col">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center">{icon}</div>
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900">{title}</h2>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">{accounts.length}</span>
          </div>
          <div className="text-xs text-slate-500">Connect accounts for further configuration</div>
        </div>
      </div>

      <div className="flex-1 space-y-4">
        {accounts.length === 0 && (
          <div className="rounded-xl border border-dashed border-slate-200 p-6 text-center text-xs text-slate-500">
            No accounts yet. {connectHelp}
          </div>
        )}

        {accounts.map((account) => (
          <AccountCard key={account.id} account={account} quota={quota} />
        ))}
      </div>

      <button
        className="mt-4 inline-flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-blue-500 hover:bg-blue-600 text-white text-sm font-semibold"
        onClick={() => {
          // Trigger Chrome extension installation prompt or deep-link
          window.open('https://chromewebstore.google.com/', '_blank');
        }}
      >
        <Plus className="w-4 h-4" />
        Connect new account
      </button>
    </div>
  );
}

function AccountCard({ account, quota }: { account: ConnectedAccount; quota: QuotaSnapshot | undefined }) {
  const disconnect = useDisconnectAccount();
  const refresh = useRefreshSession();

  const accountQuota = quota?.accounts?.find((a) => a.accountId === account.id);
  const used = accountQuota?.used ?? account.commentsTodayCount ?? 0;
  const max = accountQuota?.max ?? 50;
  const pct = Math.min(100, Math.round((used / Math.max(1, max)) * 100));

  return (
    <div className="rounded-xl border border-slate-100 bg-slate-50/40 p-4">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          {account.avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={account.avatarUrl} alt={account.platformUsername} className="w-10 h-10 rounded-full object-cover" />
          ) : (
            <div className="w-10 h-10 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center text-xs font-bold">
              {getInitials(account.platformUsername)}
            </div>
          )}
          <div>
            <div className="text-sm font-semibold text-slate-800 flex items-center gap-2">
              {account.platformUsername}
              {account.accountKind === 'COMPANY' && <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-100 text-blue-700 font-bold">COMPANY</span>}
            </div>
            <div className="flex items-center gap-2 mt-0.5">
              <span className={`inline-flex items-center gap-1 text-[10px] font-semibold ${account.sessionValid ? 'text-emerald-600' : 'text-slate-400'}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${account.sessionValid ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                {account.sessionValid ? 'Active' : 'Inactive'}
              </span>
              <button
                onClick={() => refresh.mutate(account.id)}
                className="inline-flex items-center gap-1 text-[10px] font-semibold text-slate-500 hover:text-slate-700"
              >
                <RefreshCw className="w-3 h-3" /> Refresh
              </button>
            </div>
          </div>
        </div>
        <button
          onClick={() => {
            if (confirm(`Disconnect ${account.platformUsername}?`)) disconnect.mutate(account.id);
          }}
          className="p-1.5 rounded-lg text-red-400 hover:bg-red-50"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      <div className="rounded-lg bg-white border border-slate-100 px-3 py-2 mb-2">
        <div className="flex items-center justify-between text-[11px]">
          <span className="text-slate-500 font-medium">Account Daily Quota</span>
          <span className="font-bold text-slate-700">{used}<span className="text-slate-400">/{max}</span></span>
        </div>
        <div className="mt-2 w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
          <div className="h-full bg-blue-500 rounded-full transition-all" style={{ width: `${pct}%` }} />
        </div>
      </div>
      <div className="text-[10px] text-slate-400 px-1 mb-3 flex items-center gap-1">
        <Shield className="w-3 h-3" /> This limit is applied by default to ensure your account safety.
      </div>

      <div className="space-y-1.5">
        {(account.workflows ?? []).map((wf) => (
          <Link
            key={wf.id}
            href={`/workflows?id=${wf.id}`}
            className="flex items-center justify-between rounded-lg px-3 py-2 bg-white border border-slate-100 hover:border-blue-200 hover:bg-blue-50/30 transition-colors"
          >
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-6 h-6 rounded bg-slate-100 flex items-center justify-center text-[10px]">
                {account.platform === 'TWITTER' ? <XLogo small /> : <LinkedinIcon small />}
              </div>
              <div className="min-w-0">
                <div className="text-xs font-semibold text-slate-700 truncate">{wf.name}</div>
                <div className="text-[10px] text-slate-400">{wf.dailyLimit} comments per day</div>
              </div>
            </div>
            <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
          </Link>
        ))}
      </div>
    </div>
  );
}

function LinkedinIcon({ small }: { small?: boolean } = {}) {
  const sz = small ? 'w-3 h-3' : 'w-4 h-4';
  return (
    <svg viewBox="0 0 24 24" className={`${sz} text-blue-600`} fill="currentColor">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.063 2.063 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  );
}

function XLogo({ small }: { small?: boolean } = {}) {
  const sz = small ? 'w-3 h-3' : 'w-4 h-4';
  return (
    <svg viewBox="0 0 24 24" className={sz} fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24h-6.66l-5.214-6.817-5.97 6.817H1.673l7.73-8.834L1.254 2.25h6.831l4.713 6.231zm-1.16 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}
