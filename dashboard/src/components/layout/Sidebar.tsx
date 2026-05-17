'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/stores/authStore';
import {
  LineChart, Users, Palette, Workflow, MessageSquare, Zap, Puzzle, Gift,
  HelpCircle, MessageCircle,
} from 'lucide-react';

const mainNav = [
  { href: '/dashboard', label: 'Analytics', icon: LineChart },
  { href: '/accounts', label: 'Accounts', icon: Users },
  { href: '/tones', label: 'Tones', icon: Palette },
  { href: '/workflows', label: 'Workflows', icon: Workflow },
];

const activityNav = [
  { href: '/comments', label: 'Comments', icon: MessageSquare },
];

export default function Sidebar() {
  const pathname = usePathname();
  const user = useAuthStore((s) => s.user);

  return (
    <aside className="fixed left-0 top-0 bottom-0 w-64 bg-white border-r border-slate-200 flex-col z-40 hidden lg:flex">
      <div className="px-6 py-5">
        <Link href="/dashboard" className="text-xl font-extrabold tracking-tight text-slate-900 flex items-center gap-2">
          <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-blue-500 text-white">
            <Zap className="w-4 h-4" />
          </span>
          <span>Suprfly</span>
        </Link>
      </div>

      <nav className="flex-1 px-3 py-2 space-y-6 overflow-y-auto">
        <div>
          <div className="px-3 mb-2 text-[10px] font-bold uppercase tracking-widest text-slate-400">MAIN</div>
          {mainNav.map((item) => {
            const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900',
                )}
              >
                <item.icon className="w-4 h-4" />
                {item.label}
              </Link>
            );
          })}
        </div>

        <div>
          <div className="px-3 mb-2 text-[10px] font-bold uppercase tracking-widest text-slate-400">ACTIVITY</div>
          {activityNav.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900',
                )}
              >
                <item.icon className="w-4 h-4" />
                {item.label}
              </Link>
            );
          })}
        </div>
      </nav>

      {user?.plan === 'FREE' && (
        <div className="mx-4 mb-3">
          <Link
            href="/billing"
            className="flex items-center justify-center gap-2 px-3 py-3 rounded-xl bg-blue-500 text-white text-sm font-semibold hover:bg-blue-600 transition-colors"
          >
            <Zap className="w-4 h-4" />
            Upgrade Now
          </Link>
        </div>
      )}

      <div className="mx-4 mb-2">
        <a
          href="mailto:support@suprfly.io"
          className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl border border-slate-200 text-slate-700 text-sm font-medium hover:bg-slate-50 transition-colors"
        >
          <MessageCircle className="w-4 h-4 text-emerald-500" />
          Contact Us
        </a>
      </div>

      <div className="px-3 pb-4 space-y-1 border-t border-slate-100 pt-3">
        <a href="#" className="flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium text-slate-500 hover:bg-slate-50">
          <Puzzle className="w-4 h-4" /> Chrome Extension
        </a>
        <a href="#" className="flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium text-slate-500 hover:bg-slate-50">
          <Gift className="w-4 h-4" /> Affiliate Program
        </a>
        <a href="#" className="flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium text-slate-500 hover:bg-slate-50">
          <HelpCircle className="w-4 h-4" /> Help
        </a>
      </div>
    </aside>
  );
}
