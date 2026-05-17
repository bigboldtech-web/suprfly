import Link from 'next/link';

export default function Logo() {
  return (
    <Link href="/" className="flex items-center gap-1.5">
      {/* Bee icon — beehiiv-style: amber gradient circle + white bee silhouette */}
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 36 36" className="w-6 h-6">
        <defs>
          <linearGradient id="logoBg" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fbbf24" />
            <stop offset="100%" stopColor="#d97706" />
          </linearGradient>
        </defs>
        <circle cx="18" cy="18" r="18" fill="url(#logoBg)" />
        <rect x="11" y="14" width="14" height="3" rx="1.5" fill="white" />
        <rect x="12" y="19" width="12" height="3" rx="1.5" fill="white" />
        <rect x="13" y="24" width="10" height="2.5" rx="1.25" fill="white" />
        <circle cx="18" cy="10.5" r="3.5" fill="white" />
        <ellipse cx="8.5" cy="14" rx="4" ry="2" fill="white" opacity="0.6" transform="rotate(-15 8.5 14)" />
        <ellipse cx="27.5" cy="14" rx="4" ry="2" fill="white" opacity="0.6" transform="rotate(15 27.5 14)" />
        <line x1="15.5" y1="7.5" x2="12" y2="4" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="20.5" y1="7.5" x2="24" y2="4" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
      <span className="text-[1.4rem] font-extrabold tracking-tight text-white font-[var(--font-display)]">
        supr<em className="not-italic text-amber">fly</em>
      </span>
    </Link>
  );
}
