import type { Metadata } from 'next';
import { Inter, Outfit } from 'next/font/google';
import './globals.css';
import Nav from '@/components/layout/Nav';
import Footer from '@/components/layout/Footer';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const outfit = Outfit({ subsets: ['latin'], variable: '--font-outfit' });

export const metadata: Metadata = {
  metadataBase: new URL('https://suprfly.io'),
  title: {
    default: 'Suprfly — AI Auto-Comments for LinkedIn & X',
    template: '%s | Suprfly',
  },
  description: 'Suprfly auto-comments on LinkedIn & X posts that match your niche — with AI that sounds exactly like you. Build authority while you build your business.',
  keywords: ['LinkedIn automation', 'X automation', 'AI comments', 'social media engagement', 'LinkedIn growth', 'auto commenting'],
  openGraph: {
    type: 'website',
    siteName: 'Suprfly',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${outfit.variable}`}>
      <body className="min-h-screen flex flex-col bg-bg text-text-primary font-[var(--font-body)] antialiased">
        <Nav />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
