'use client';

import { useAuthStore } from '@/stores/authStore';
import { getInitials } from '@/lib/utils';
import { logout } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import { useGlobalQuota } from '@/hooks/useAnalytics';
import Badge from '../ui/Badge';
import { LogOut, ChevronDown, Zap, MessageSquare, Link2 } from 'lucide-react';
import { useState } from 'react';

export default function Topbar() {
  const user = useAuthStore((s) => s.user);
  const accounts = useAuthStore((s) => s.accounts);
  const router = useRouter();
  const [showDropdown, setShowDropdown] = useState(false);
  const { data: quota } = useGlobalQuota();

  async function handleLogout() {
    await logout();
    router.push('/login');
  }

  const used = quota?.globalUsed ?? 0;
  const max = quota?.globalMax ?? user?.maxCommentsDayGlobal ?? 50;
  const pct = Math.min(100, Math.round((used / Math.max(1, max)) * 100));
  const planLabel = user?.plan ?? 'FREE';
  const accountCount = accounts.length;

  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 sticky top-0 z-30 gap-6">
      <div className="flex items-center gap-6 flex-1 min-w-0">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500">
            <MessageSquare className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 text-xs">
              <span className="text-slate-500 font-medium">Global Daily Quota</span>
              <span className="text-slate-900 font-bold">{used}<span className="text-slate-400">/{max}</span></span>
            </div>
            <div className="mt-1 w-40 h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-500 rounded-full transition-all"
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
        </div>

        <div className="hidden md:flex items-center gap-2 text-xs px-3 py-2 rounded-lg bg-slate-50">
          <Link2 className="w-3.5 h-3.5 text-emerald-500" />
          <span className="text-slate-600 font-medium">
            {user && user.maxAccounts >= 99 ? 'Unlimited accounts' : `${accountCount}/${user?.maxAccounts ?? 1} accounts`}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="hidden md:flex items-center gap-2 px-3 py-2 rounded-lg bg-blue-50">
          <Zap className="w-3.5 h-3.5 text-blue-500" />
          <span className="text-xs font-semibold text-blue-700">{planLabel}</span>
          <span className="text-xs text-blue-500">Plan</span>
        </div>

        <div className="relative">
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-slate-50 transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold">
              {getInitials(user?.name)}
            </div>
            <ChevronDown className="w-4 h-4 text-slate-400" />
          </button>

          {showDropdown && (
            <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl border border-slate-200 shadow-lg py-2 z-50">
              <div className="px-4 py-2 border-b border-slate-100">
                <div className="text-sm font-semibold text-slate-700">{user?.name || 'User'}</div>
                <div className="text-xs text-slate-500">{user?.email}</div>
                <Badge variant="info" className="mt-1 text-[10px]">{planLabel}</Badge>
              </div>
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-slate-600 hover:bg-slate-50"
              >
                <LogOut className="w-4 h-4" />
                Log out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
