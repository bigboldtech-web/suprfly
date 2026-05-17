'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

export default function HomeFAQ({ items }: { items: { q: string; a: string }[] }) {
  const [open, setOpen] = useState<number | null>(null);

  const mid = Math.ceil(items.length / 2);
  const left = items.slice(0, mid);
  const right = items.slice(mid);

  const renderItem = (item: { q: string; a: string }, idx: number) => (
    <div key={idx} className="border-b border-border last:border-0">
      <button
        onClick={() => setOpen(open === idx ? null : idx)}
        className="w-full flex items-center justify-between py-5 text-left gap-4"
      >
        <span className="text-sm font-semibold text-white">{item.q}</span>
        <ChevronDown
          className={`w-4 h-4 text-text-dim shrink-0 transition-transform ${open === idx ? 'rotate-180' : ''}`}
        />
      </button>
      {open === idx && (
        <div className="pb-5 text-sm text-text-muted leading-relaxed">{item.a}</div>
      )}
    </div>
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12">
      <div>{left.map((item, i) => renderItem(item, i))}</div>
      <div>{right.map((item, i) => renderItem(item, i + mid))}</div>
    </div>
  );
}
