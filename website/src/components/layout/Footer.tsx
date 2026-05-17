import Link from 'next/link';
import Logo from './Logo';

const productLinks = [
  { href: '/features', label: 'Features' },
  { href: '/pricing', label: 'Pricing' },
  { href: '/use-cases', label: 'Use Cases' },
  { href: '/chrome-extension', label: 'Chrome Extension' },
];

const resourceLinks = [
  { href: '/blog', label: 'Blog' },
  { href: '/changelog', label: 'Changelog' },
  { href: '/about', label: 'About' },
  { href: '/contact', label: 'Contact' },
];

const legalLinks = [
  { href: '/privacy', label: 'Privacy Policy' },
  { href: '/terms', label: 'Terms of Service' },
];

export default function Footer() {
  return (
    <footer className="border-t border-border mt-20 py-16">
      <div className="max-w-[1200px] mx-auto px-6">
        <div className="flex flex-wrap justify-between gap-10 mb-10">
          <div className="max-w-[280px]">
            <Logo />
            <p className="text-sm text-text-dim mt-3 leading-relaxed">
              Your AI wingman for LinkedIn & X. Auto-comment with AI that sounds exactly like you.
            </p>
          </div>

          <div className="flex flex-wrap gap-16">
            <FooterCol title="Product" links={productLinks} />
            <FooterCol title="Resources" links={resourceLinks} />
            <FooterCol title="Legal" links={legalLinks} />
          </div>
        </div>

        <div className="flex flex-wrap justify-between items-center pt-6 border-t border-border gap-3">
          <p className="text-xs text-text-dim">&copy; 2026 Suprfly. All rights reserved.</p>
          <div className="flex gap-5">
            <Link href="/privacy" className="text-xs text-text-dim hover:text-text-muted transition-colors">Privacy</Link>
            <Link href="/terms" className="text-xs text-text-dim hover:text-text-muted transition-colors">Terms</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({ title, links }: { title: string; links: { href: string; label: string }[] }) {
  return (
    <div>
      <h5 className="text-xs font-bold text-text-dim uppercase tracking-widest mb-3.5">{title}</h5>
      {links.map((l) => (
        <Link key={l.href} href={l.href} className="block text-sm text-text-muted py-1 hover:text-white transition-colors">
          {l.label}
        </Link>
      ))}
    </div>
  );
}
