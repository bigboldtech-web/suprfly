'use client';

import { useState } from 'react';
import { Send } from 'lucide-react';

export default function ContactForm() {
  const [submitted, setSubmitted] = useState(false);

  if (submitted) {
    return (
      <div className="bg-[#12121a] border border-white/[.06] rounded-2xl p-12 text-center">
        <div className="w-12 h-12 rounded-full bg-[#22c55e]/10 text-[#22c55e] flex items-center justify-center mx-auto mb-4">
          <Send className="w-5 h-5" />
        </div>
        <h3 className="font-[var(--font-display)] text-xl font-bold text-white mb-2">
          Message Sent
        </h3>
        <p className="text-[#a1a1aa]">
          Thanks for reaching out. We will get back to you within 24 hours.
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        setSubmitted(true);
      }}
      className="bg-[#12121a] border border-white/[.06] rounded-2xl p-8 space-y-6"
    >
      <div className="grid sm:grid-cols-2 gap-6">
        <div>
          <label htmlFor="name" className="block text-sm font-semibold text-[#e4e4e7] mb-2">
            Name <span className="text-[#f43f5e]">*</span>
          </label>
          <input
            id="name"
            name="name"
            type="text"
            required
            className="w-full rounded-xl bg-white/[.04] border border-white/[.08] px-4 py-3 text-white placeholder:text-[#71717a] focus:outline-none focus:border-[#f59e0b]/50 transition-colors"
            placeholder="Jane Smith"
          />
        </div>
        <div>
          <label htmlFor="email" className="block text-sm font-semibold text-[#e4e4e7] mb-2">
            Email <span className="text-[#f43f5e]">*</span>
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            className="w-full rounded-xl bg-white/[.04] border border-white/[.08] px-4 py-3 text-white placeholder:text-[#71717a] focus:outline-none focus:border-[#f59e0b]/50 transition-colors"
            placeholder="jane@company.com"
          />
        </div>
      </div>

      <div>
        <label htmlFor="company" className="block text-sm font-semibold text-[#e4e4e7] mb-2">
          Company <span className="text-[#71717a] font-normal">(optional)</span>
        </label>
        <input
          id="company"
          name="company"
          type="text"
          className="w-full rounded-xl bg-white/[.04] border border-white/[.08] px-4 py-3 text-white placeholder:text-[#71717a] focus:outline-none focus:border-[#f59e0b]/50 transition-colors"
          placeholder="Acme Inc."
        />
      </div>

      <div>
        <label htmlFor="subject" className="block text-sm font-semibold text-[#e4e4e7] mb-2">
          Subject <span className="text-[#f43f5e]">*</span>
        </label>
        <select
          id="subject"
          name="subject"
          required
          className="w-full rounded-xl bg-white/[.04] border border-white/[.08] px-4 py-3 text-white focus:outline-none focus:border-[#f59e0b]/50 transition-colors appearance-none"
        >
          <option value="" className="bg-[#12121a]">Select a topic...</option>
          <option value="general" className="bg-[#12121a]">General Inquiry</option>
          <option value="support" className="bg-[#12121a]">Technical Support</option>
          <option value="billing" className="bg-[#12121a]">Billing Question</option>
          <option value="feature" className="bg-[#12121a]">Feature Request</option>
          <option value="enterprise" className="bg-[#12121a]">Enterprise / Demo</option>
          <option value="partnership" className="bg-[#12121a]">Partnership</option>
        </select>
      </div>

      <div>
        <label htmlFor="message" className="block text-sm font-semibold text-[#e4e4e7] mb-2">
          Message <span className="text-[#f43f5e]">*</span>
        </label>
        <textarea
          id="message"
          name="message"
          required
          rows={5}
          className="w-full rounded-xl bg-white/[.04] border border-white/[.08] px-4 py-3 text-white placeholder:text-[#71717a] focus:outline-none focus:border-[#f59e0b]/50 transition-colors resize-none"
          placeholder="Tell us how we can help..."
        />
      </div>

      <button
        type="submit"
        className="inline-flex items-center gap-2 px-7 py-3 font-bold text-[#0a0a0f] bg-gradient-to-br from-[#fbbf24] to-[#f59e0b] rounded-xl shadow-[0_2px_20px_rgba(245,158,11,0.3)] hover:shadow-[0_4px_30px_rgba(245,158,11,0.4)] hover:-translate-y-0.5 transition-all cursor-pointer"
      >
        <Send className="w-4 h-4" />
        Send Message
      </button>
    </form>
  );
}
