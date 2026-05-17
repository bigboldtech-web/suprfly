import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import PageHero from '@/components/sections/PageHero';
import CTA from '@/components/sections/CTA';
import { articles, categories } from '@/lib/blog';
import CategoryFilter from './CategoryFilter';

export const metadata: Metadata = {
  title: 'Blog',
  description:
    'Actionable insights on LinkedIn growth, X engagement, AI-powered social media strategy, and personal branding for B2B professionals.',
  openGraph: {
    title: 'The Suprfly Blog',
    description:
      'Actionable insights on LinkedIn growth, X engagement, AI-powered social media strategy, and personal branding.',
  },
};

function FeaturedCard() {
  const featured = articles[0];
  return (
    <Link
      href={`/blog/${featured.slug}`}
      className="group block bg-[#12121a] border border-white/[.06] rounded-2xl overflow-hidden hover:border-white/[.12] transition-all mb-16"
    >
      <div className="grid md:grid-cols-2 gap-0">
        {/* Left: Gradient visual */}
        <div className="relative min-h-[260px] bg-gradient-to-br from-[#f59e0b]/20 via-[#12121a] to-[#22d3ee]/10 flex items-center justify-center">
          <div className="text-6xl md:text-8xl font-[var(--font-display)] font-black text-white/[.06] uppercase select-none">
            Featured
          </div>
        </div>
        {/* Right: Content */}
        <div className="p-8 md:p-10 flex flex-col justify-center">
          <span
            className={`inline-block w-fit text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-full mb-4 ${featured.categoryColor}`}
          >
            {featured.category}
          </span>
          <h2 className="font-[var(--font-display)] text-2xl md:text-3xl font-black uppercase tracking-tight leading-tight text-white mb-3 group-hover:text-[#f59e0b] transition-colors">
            {featured.title}
          </h2>
          <p className="text-[#a1a1aa] leading-relaxed mb-5 line-clamp-3">
            {featured.description}
          </p>
          <div className="flex items-center gap-4 text-xs text-[#71717a]">
            <span>{featured.date}</span>
            <span className="w-1 h-1 rounded-full bg-[#71717a]" />
            <span>{featured.readTime} read</span>
          </div>
          <div className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-[#f59e0b] group-hover:gap-3 transition-all">
            Read Article <ArrowRight className="w-4 h-4" />
          </div>
        </div>
      </div>
    </Link>
  );
}

function BlogCard({ slug, title, description, category, categoryColor, date, readTime }: {
  slug: string;
  title: string;
  description: string;
  category: string;
  categoryColor: string;
  date: string;
  readTime: string;
}) {
  const excerpt = description.length > 150 ? description.slice(0, 150) + '...' : description;
  return (
    <Link
      href={`/blog/${slug}`}
      className="group flex flex-col bg-[#12121a] border border-white/[.06] rounded-2xl p-7 hover:border-white/[.12] hover:bg-[#1a1a26] transition-all"
    >
      <span
        className={`inline-block w-fit text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-full mb-4 ${categoryColor}`}
      >
        {category}
      </span>
      <h3 className="font-[var(--font-display)] text-lg font-bold uppercase tracking-tight leading-snug text-white mb-3 group-hover:text-[#f59e0b] transition-colors">
        {title}
      </h3>
      <p className="text-[#a1a1aa] text-sm leading-relaxed mb-5 flex-1">
        {excerpt}
      </p>
      <div className="flex items-center gap-4 text-xs text-[#71717a]">
        <span>{date}</span>
        <span className="w-1 h-1 rounded-full bg-[#71717a]" />
        <span>{readTime} read</span>
      </div>
    </Link>
  );
}

function NewsletterBox() {
  return (
    <div className="bg-[#12121a] border border-white/[.06] rounded-2xl p-10 md:p-14 text-center mt-20">
      <h3 className="font-[var(--font-display)] text-2xl md:text-3xl font-black uppercase tracking-tight text-white mb-3">
        Stay in the Loop
      </h3>
      <p className="text-[#a1a1aa] max-w-md mx-auto mb-7">
        Get weekly insights on LinkedIn growth, AI engagement strategies, and
        personal branding delivered to your inbox.
      </p>
      <form
        className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto"
        action="#"
      >
        <input
          type="email"
          placeholder="you@company.com"
          className="flex-1 px-5 py-3.5 rounded-xl bg-[#0a0a0f] border border-white/[.06] text-white text-sm placeholder:text-[#71717a] focus:outline-none focus:border-[#f59e0b]/40 transition-colors"
        />
        <button
          type="submit"
          className="px-7 py-3.5 rounded-xl bg-gradient-to-br from-[#fbbf24] to-[#f59e0b] text-[#0a0a0f] text-sm font-bold hover:shadow-[0_2px_20px_rgba(245,158,11,0.3)] hover:-translate-y-0.5 transition-all"
        >
          Subscribe
        </button>
      </form>
      <p className="text-[11px] text-[#71717a] mt-4">
        No spam. Unsubscribe anytime.
      </p>
    </div>
  );
}

export default function BlogPage() {
  return (
    <>
      <PageHero
        breadcrumb={[
          { label: 'Home', href: '/' },
          { label: 'Blog' },
        ]}
        title="THE SUPRFLY BLOG"
        subtitle="Actionable insights on LinkedIn growth, X engagement, AI strategy, and personal branding for B2B professionals."
      />

      <section className="max-w-[1200px] mx-auto px-6 pb-24">
        {/* Category filter */}
        <CategoryFilter categories={categories} articles={articles} />

        {/* Featured article */}
        <FeaturedCard />

        {/* Article grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {articles.map((article) => (
            <BlogCard
              key={article.slug}
              slug={article.slug}
              title={article.title}
              description={article.description}
              category={article.category}
              categoryColor={article.categoryColor}
              date={article.date}
              readTime={article.readTime}
            />
          ))}
        </div>

        {/* Newsletter */}
        <NewsletterBox />
      </section>

      <CTA />
    </>
  );
}
