import type { Metadata } from 'next';
import { Mail, Clock, AtSign } from 'lucide-react';
import PageHero from '@/components/sections/PageHero';
import CTA from '@/components/sections/CTA';
import ContactForm from './ContactForm';

export const metadata: Metadata = {
  title: 'Contact Us',
  description:
    'Get in touch with the Suprfly team. We typically respond within 24 hours.',
};

const infoCards = [
  {
    icon: Mail,
    label: 'Email',
    value: 'support@suprfly.io',
    href: 'mailto:support@suprfly.io',
  },
  {
    icon: Clock,
    label: 'Response Time',
    value: 'Under 24 hours',
  },
  {
    icon: AtSign,
    label: 'Social',
    value: '@suprfly on X',
    href: 'https://x.com/suprfly',
  },
];

export default function ContactPage() {
  return (
    <>
      <PageHero
        breadcrumb={[{ label: 'Home', href: '/' }, { label: 'Contact' }]}
        title="GET IN TOUCH"
        subtitle="Have a question, feature request, or just want to say hello? We would love to hear from you."
      />

      <section className="py-24 md:py-36">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="grid lg:grid-cols-[1fr_380px] gap-12">
            {/* Form */}
            <ContactForm />

            {/* Info Cards */}
            <div className="space-y-6">
              {infoCards.map((card) => (
                <div
                  key={card.label}
                  className="bg-[#12121a] border border-white/[.06] rounded-2xl p-8 hover:border-white/[.12] hover:-translate-y-0.5 transition-all"
                >
                  <card.icon className="w-6 h-6 text-[#f59e0b] mb-3" />
                  <p className="text-xs uppercase tracking-widest text-[#71717a] font-bold mb-1">
                    {card.label}
                  </p>
                  {card.href ? (
                    <a
                      href={card.href}
                      className="text-white font-semibold hover:text-[#f59e0b] transition-colors"
                      target={card.href.startsWith('http') ? '_blank' : undefined}
                      rel={card.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                    >
                      {card.value}
                    </a>
                  ) : (
                    <p className="text-white font-semibold">{card.value}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <CTA />
    </>
  );
}
