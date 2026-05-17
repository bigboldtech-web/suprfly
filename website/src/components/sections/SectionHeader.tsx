export default function SectionHeader({
  tag,
  title,
  subtitle,
  center = true,
}: {
  tag?: string;
  title: string;
  subtitle?: string;
  center?: boolean;
}) {
  return (
    <div className={`mb-16 ${center ? 'text-center' : ''}`}>
      {tag && (
        <div className="text-xs uppercase tracking-[0.14em] text-amber font-bold mb-4">
          {tag}
        </div>
      )}
      <h2
        className="font-[var(--font-display)] text-3xl md:text-4xl lg:text-[3.5rem] font-black uppercase tracking-tight leading-[1.1] text-white mb-4"
        dangerouslySetInnerHTML={{ __html: title }}
      />
      {subtitle && (
        <p className={`text-lg text-text-muted leading-relaxed ${center ? 'max-w-xl mx-auto' : 'max-w-xl'}`}>
          {subtitle}
        </p>
      )}
    </div>
  );
}
