'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

const faqs = [
  {
    question: 'Is the Chrome extension free?',
    answer:
      'Yes, the extension itself is completely free. It serves as the bridge between your browser and Suprfly. You only pay for your Suprfly subscription plan, which controls the volume and features of your AI commenting.',
  },
  {
    question: 'Does the extension slow down my browser?',
    answer:
      'Not at all. The extension is under 1 MB and only activates when you visit LinkedIn or X. It uses minimal memory and has zero impact on page load times. We run performance benchmarks with every release.',
  },
  {
    question: 'How are my session cookies kept secure?',
    answer:
      'Cookies are encrypted in transit using TLS 1.3 and stored with AES-256 encryption at rest. They are never logged, never shared with third parties, and automatically purged when you disconnect an account. Our infrastructure is SOC 2 compliant.',
  },
  {
    question: 'What happens if my session expires?',
    answer:
      'The extension monitors session health in real time. When it detects an expiring session, it silently refreshes the cookie in the background. If a manual re-login is needed, you will see a red badge on the extension icon with a one-click fix.',
  },
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div className="max-w-2xl mx-auto space-y-3">
      {faqs.map((faq, i) => {
        const isOpen = openIndex === i;
        return (
          <div
            key={i}
            className="bg-[#12121a] border border-white/[.06] rounded-2xl overflow-hidden hover:border-white/[.12] transition-all"
          >
            <button
              onClick={() => setOpenIndex(isOpen ? null : i)}
              className="w-full flex items-center justify-between gap-4 p-6 text-left cursor-pointer"
            >
              <span className="font-semibold text-white">{faq.question}</span>
              <ChevronDown
                className={`w-5 h-5 text-[#a1a1aa] shrink-0 transition-transform duration-200 ${
                  isOpen ? 'rotate-180' : ''
                }`}
              />
            </button>
            {isOpen && (
              <div className="px-6 pb-6 text-[#a1a1aa] leading-relaxed">
                {faq.answer}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
