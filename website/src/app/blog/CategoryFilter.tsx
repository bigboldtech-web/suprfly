'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import type { BlogArticle } from '@/lib/blog';

export default function CategoryFilter({
  categories,
  articles,
}: {
  categories: string[];
  articles: BlogArticle[];
}) {
  const [active, setActive] = useState<string | null>(null);

  const filtered = active
    ? articles.filter((a) => a.category === active)
    : null;

  return (
    <>
      {/* Filter buttons */}
      <div className="flex flex-wrap justify-center gap-2 mb-14">
        <button
          onClick={() => setActive(null)}
          className={`px-5 py-2 rounded-full text-sm font-semibold transition-all ${
            active === null
              ? 'bg-[#f59e0b] text-[#0a0a0f]'
              : 'bg-white/[.04] text-[#a1a1aa] hover:bg-white/[.08] hover:text-white'
          }`}
        >
          All
        </button>
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActive(cat)}
            className={`px-5 py-2 rounded-full text-sm font-semibold transition-all ${
              active === cat
                ? 'bg-[#f59e0b] text-[#0a0a0f]'
                : 'bg-white/[.04] text-[#a1a1aa] hover:bg-white/[.08] hover:text-white'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Filtered results (only shown when a category is selected) */}
      {filtered && (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {filtered.map((article) => {
            const excerpt =
              article.description.length > 150
                ? article.description.slice(0, 150) + '...'
                : article.description;
            return (
              <Link
                key={article.slug}
                href={`/blog/${article.slug}`}
                className="group flex flex-col bg-[#12121a] border border-white/[.06] rounded-2xl p-7 hover:border-white/[.12] hover:bg-[#1a1a26] transition-all"
              >
                <span
                  className={`inline-block w-fit text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-full mb-4 ${article.categoryColor}`}
                >
                  {article.category}
                </span>
                <h3 className="font-[var(--font-display)] text-lg font-bold uppercase tracking-tight leading-snug text-white mb-3 group-hover:text-[#f59e0b] transition-colors">
                  {article.title}
                </h3>
                <p className="text-[#a1a1aa] text-sm leading-relaxed mb-5 flex-1">
                  {excerpt}
                </p>
                <div className="flex items-center gap-4 text-xs text-[#71717a]">
                  <span>{article.date}</span>
                  <span className="w-1 h-1 rounded-full bg-[#71717a]" />
                  <span>{article.readTime} read</span>
                </div>
              </Link>
            );
          })}
          {filtered.length === 0 && (
            <p className="col-span-full text-center text-[#71717a] py-12">
              No articles in this category yet.
            </p>
          )}
        </div>
      )}
    </>
  );
}
