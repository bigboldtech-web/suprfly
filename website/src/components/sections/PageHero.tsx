import Link from 'next/link';

export default function PageHero({
  breadcrumb,
  title,
  subtitle,
  children,
}: {
  breadcrumb: { label: string; href?: string }[];
  title: string;
  subtitle?: string;
  children?: React.ReactNode;
}) {
  return (
    <section className="pt-32 pb-16 text-center">
      <div className="max-w-[1200px] mx-auto px-6">
        {/* Breadcrumb */}
        <div className="flex items-center justify-center gap-2 text-xs text-text-dim mb-5">
          {breadcrumb.map((item, i) => (
            <span key={i} className="flex items-center gap-2">
              {i > 0 && <span className="opacity-40">/</span>}
              {item.href ? (
                <Link href={item.href} className="text-text-muted hover:text-white transition-colors">
                  {item.label}
                </Link>
              ) : (
                <span>{item.label}</span>
              )}
            </span>
          ))}
        </div>

        <h1 className="font-[var(--font-display)] text-3xl md:text-4xl lg:text-5xl font-black uppercase tracking-tight leading-[1.1] text-white mb-4">
          {title}
        </h1>

        {subtitle && (
          <p className="text-lg text-text-muted max-w-xl mx-auto leading-relaxed">
            {subtitle}
          </p>
        )}

        {children && <div className="mt-8">{children}</div>}
      </div>
    </section>
  );
}
