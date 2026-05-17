import Link from 'next/link';
import { Zap } from 'lucide-react';

export default function CTA({ title, subtitle }: { title?: string; subtitle?: string }) {
  return (
    <section className="px-5 py-20">
      <div className="max-w-[1100px] mx-auto bg-bg-card border border-border rounded-3xl text-center px-10 py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_50%,rgba(245,158,11,0.06)_0%,transparent_70%)]" />
        <h2 className="relative z-10 font-[var(--font-display)] text-3xl md:text-4xl font-black uppercase tracking-tight text-white leading-tight mb-4">
          {title || 'READY TO STOP\nMANUALLY COMMENTING?'}
        </h2>
        <p className="relative z-10 text-text-muted max-w-md mx-auto mb-9">
          {subtitle || 'Join 10,000+ professionals growing their network on autopilot. 7-day free trial, no card required.'}
        </p>
        <div className="relative z-10 flex gap-3.5 justify-center flex-wrap">
          <Link
            href="https://app.suprfly.io/register"
            className="inline-flex items-center gap-2 px-9 py-4 text-base font-bold text-bg bg-gradient-to-br from-amber-light to-amber rounded-xl shadow-[0_2px_20px_rgba(245,158,11,0.3)] hover:shadow-[0_4px_30px_rgba(245,158,11,0.4)] hover:-translate-y-0.5 transition-all"
          >
            <Zap className="w-4 h-4" />
            Start Free Trial
          </Link>
          <Link
            href="/contact"
            className="inline-flex items-center px-9 py-4 text-base font-semibold text-white border-[1.5px] border-white/20 rounded-xl hover:border-white/40 hover:bg-white/[.03] transition-all"
          >
            Book a Demo
          </Link>
        </div>
      </div>
    </section>
  );
}
