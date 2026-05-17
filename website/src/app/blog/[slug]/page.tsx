import type { Metadata } from 'next';
import Link from 'next/link';
import Script from 'next/script';
import { notFound } from 'next/navigation';
import { ArrowRight, Clock, Calendar, User } from 'lucide-react';
import CTA from '@/components/sections/CTA';
import { articles, getArticle, getRelatedArticles } from '@/lib/blog';

/* ---------- Static generation ---------- */

export async function generateStaticParams() {
  return articles.map((a) => ({ slug: a.slug }));
}

/* ---------- Dynamic metadata ---------- */

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const article = getArticle(slug);
  if (!article) return {};

  return {
    title: article.title,
    description: article.description,
    openGraph: {
      title: article.title,
      description: article.description,
      type: 'article',
      publishedTime: article.date,
    },
    twitter: {
      card: 'summary_large_image',
      title: article.title,
      description: article.description,
    },
  };
}

/* ---------- Page component ---------- */

export default async function ArticlePage({ params }: Props) {
  const { slug } = await params;
  const article = getArticle(slug);
  if (!article) notFound();

  const related = getRelatedArticles(article.relatedSlugs);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: article.title,
    description: article.description,
    datePublished: article.date,
    author: {
      '@type': 'Organization',
      name: 'Suprfly',
      url: 'https://suprfly.io',
    },
    publisher: {
      '@type': 'Organization',
      name: 'Suprfly',
      url: 'https://suprfly.io',
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `https://suprfly.io/blog/${article.slug}`,
    },
  };

  return (
    <>
      {/* Schema.org JSON-LD */}
      <Script
        id="blog-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* ---- Header ---- */}
      <section className="pt-32 pb-10 text-center">
        <div className="max-w-[800px] mx-auto px-6">
          {/* Breadcrumb */}
          <nav className="flex items-center justify-center gap-2 text-xs text-[#71717a] mb-6">
            <Link
              href="/"
              className="text-[#a1a1aa] hover:text-white transition-colors"
            >
              Home
            </Link>
            <span className="opacity-40">/</span>
            <Link
              href="/blog"
              className="text-[#a1a1aa] hover:text-white transition-colors"
            >
              Blog
            </Link>
            <span className="opacity-40">/</span>
            <span className="truncate max-w-[200px]">{article.title}</span>
          </nav>

          {/* Category tag */}
          <span
            className={`inline-block text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-full mb-5 ${article.categoryColor}`}
          >
            {article.category}
          </span>

          {/* Title */}
          <h1 className="font-[var(--font-display)] text-3xl md:text-4xl lg:text-[2.75rem] font-black uppercase tracking-tight leading-[1.15] text-white mb-5">
            {article.title}
          </h1>

          {/* Meta */}
          <div className="flex items-center justify-center gap-5 text-sm text-[#71717a]">
            <span className="flex items-center gap-1.5">
              <User className="w-3.5 h-3.5" />
              Suprfly Team
            </span>
            <span className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" />
              {article.date}
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" />
              {article.readTime} read
            </span>
          </div>
        </div>
      </section>

      {/* ---- Key Takeaways ---- */}
      <section className="max-w-[720px] mx-auto px-6 mb-12">
        <div className="bg-[#12121a] border border-white/[.06] rounded-2xl p-7 md:p-9">
          <h2 className="font-[var(--font-display)] text-sm font-bold uppercase tracking-wider text-[#f59e0b] mb-4">
            Key Takeaways
          </h2>
          <ul className="space-y-3">
            {article.keyTakeaways.map((t, i) => (
              <li
                key={i}
                className="flex items-start gap-3 text-[#a1a1aa] text-sm leading-relaxed"
              >
                <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[#f59e0b] shrink-0" />
                {t}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ---- Article content ---- */}
      <article className="max-w-[720px] mx-auto px-6 pb-16">
        <div
          className="prose-article"
          dangerouslySetInnerHTML={{ __html: article.content }}
        />
      </article>

      {/* ---- Author card ---- */}
      <section className="max-w-[720px] mx-auto px-6 pb-20">
        <div className="bg-[#12121a] border border-white/[.06] rounded-2xl p-7 md:p-9 flex flex-col sm:flex-row items-center gap-6">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#f59e0b] to-[#d97706] flex items-center justify-center text-[#0a0a0f] font-[var(--font-display)] font-black text-xl shrink-0">
            S
          </div>
          <div className="text-center sm:text-left">
            <h3 className="font-[var(--font-display)] text-lg font-bold text-white mb-1">
              The Suprfly Team
            </h3>
            <p className="text-[#a1a1aa] text-sm leading-relaxed">
              We build AI-powered engagement tools that help B2B professionals
              grow their presence on LinkedIn and X. Our blog shares the
              strategies, data, and insights we learn along the way.
            </p>
          </div>
        </div>
      </section>

      {/* ---- Related articles ---- */}
      {related.length > 0 && (
        <section className="max-w-[1200px] mx-auto px-6 pb-20">
          <h2 className="font-[var(--font-display)] text-2xl md:text-3xl font-black uppercase tracking-tight text-white text-center mb-10">
            Related Articles
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {related.map((r) => (
              <Link
                key={r.slug}
                href={`/blog/${r.slug}`}
                className="group flex flex-col bg-[#12121a] border border-white/[.06] rounded-2xl p-7 hover:border-white/[.12] hover:bg-[#1a1a26] transition-all"
              >
                <span
                  className={`inline-block w-fit text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-full mb-4 ${r.categoryColor}`}
                >
                  {r.category}
                </span>
                <h3 className="font-[var(--font-display)] text-lg font-bold uppercase tracking-tight leading-snug text-white mb-3 group-hover:text-[#f59e0b] transition-colors">
                  {r.title}
                </h3>
                <p className="text-[#a1a1aa] text-sm leading-relaxed mb-5 flex-1 line-clamp-3">
                  {r.description}
                </p>
                <div className="flex items-center gap-4 text-xs text-[#71717a]">
                  <span>{r.date}</span>
                  <span className="w-1 h-1 rounded-full bg-[#71717a]" />
                  <span>{r.readTime} read</span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* ---- CTA ---- */}
      <CTA />

      {/* ---- Article content styles ---- */}
      <style>{`
        .prose-article h2 {
          font-family: var(--font-display);
          font-size: 1.5rem;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: -0.02em;
          color: #fff;
          margin-top: 2.5rem;
          margin-bottom: 1rem;
          line-height: 1.2;
        }
        .prose-article p {
          color: #a1a1aa;
          font-size: 1.0625rem;
          line-height: 1.8;
          margin-bottom: 1.25rem;
        }
        .prose-article ul {
          list-style: none;
          padding: 0;
          margin-bottom: 1.25rem;
        }
        .prose-article ul li {
          position: relative;
          padding-left: 1.25rem;
          color: #a1a1aa;
          font-size: 1.0625rem;
          line-height: 1.8;
          margin-bottom: 0.75rem;
        }
        .prose-article ul li::before {
          content: '';
          position: absolute;
          left: 0;
          top: 0.7em;
          width: 6px;
          height: 6px;
          border-radius: 9999px;
          background: #f59e0b;
        }
        .prose-article strong {
          color: #e4e4e7;
          font-weight: 600;
        }
        .prose-article blockquote {
          border-left: 3px solid #f59e0b;
          padding-left: 1.25rem;
          margin: 2rem 0;
          font-style: italic;
          color: #e4e4e7;
        }
        .prose-article a {
          color: #f59e0b;
          text-decoration: underline;
          text-underline-offset: 2px;
        }
        .prose-article a:hover {
          color: #fbbf24;
        }
      `}</style>
    </>
  );
}
