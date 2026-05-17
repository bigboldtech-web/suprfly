'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { Menu, X } from 'lucide-react';
import Logo from './Logo';
import { cn } from '@/lib/utils';

const links = [
  { href: '/features', label: 'Features' },
  { href: '/pricing', label: 'Pricing' },
  { href: '/use-cases', label: 'Use Cases' },
  { href: '/blog', label: 'Blog' },
  { href: '/chrome-extension', label: 'Extension' },
];

export default function Nav() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl bg-bg/80 border-b border-border">
        <div className="max-w-[1200px] mx-auto px-6 py-3.5 flex items-center justify-between">
          <Logo />

          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-7">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className={cn(
                  'text-sm font-medium transition-colors',
                  pathname === l.href || pathname.startsWith(l.href + '/')
                    ? 'text-white'
                    : 'text-text-muted hover:text-white'
                )}
              >
                {l.label}
              </Link>
            ))}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2.5">
            <Link
              href="https://app.suprfly.io/login"
              className="hidden sm:inline-flex items-center px-5 py-2.5 text-sm font-semibold text-text-muted border border-border rounded-[10px] hover:text-white hover:border-border-hover transition-all"
            >
              Login
            </Link>
            <Link
              href="https://app.suprfly.io/register"
              className="inline-flex items-center px-5 py-2.5 text-sm font-bold text-bg bg-gradient-to-br from-amber-light to-amber rounded-[10px] shadow-[0_2px_20px_rgba(245,158,11,0.3)] hover:shadow-[0_4px_30px_rgba(245,158,11,0.4)] hover:-translate-y-0.5 transition-all"
            >
              Start Free Trial
            </Link>
            <button
              onClick={() => setMobileOpen(true)}
              className="md:hidden p-2 text-white"
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-[200] bg-bg flex flex-col items-center justify-center gap-6">
          <button
            onClick={() => setMobileOpen(false)}
            className="absolute top-5 right-6 text-white"
          >
            <X className="w-6 h-6" />
          </button>
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              onClick={() => setMobileOpen(false)}
              className="text-xl font-bold font-[var(--font-display)] text-white hover:text-amber transition-colors"
            >
              {l.label}
            </Link>
          ))}
          <Link
            href="https://app.suprfly.io/register"
            onClick={() => setMobileOpen(false)}
            className="mt-4 px-8 py-3 text-base font-bold text-bg bg-gradient-to-br from-amber-light to-amber rounded-xl"
          >
            Start Free Trial
          </Link>
        </div>
      )}
    </>
  );
}
