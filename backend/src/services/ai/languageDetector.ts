// Simple language detection heuristics
// For production, consider using a library like franc or cld3

const LANG_PATTERNS: Array<{ lang: string; patterns: RegExp[] }> = [
  { lang: 'hi', patterns: [/[\u0900-\u097F]/] },           // Hindi (Devanagari)
  { lang: 'ar', patterns: [/[\u0600-\u06FF]/] },           // Arabic
  { lang: 'zh', patterns: [/[\u4E00-\u9FFF]/] },           // Chinese
  { lang: 'ja', patterns: [/[\u3040-\u309F\u30A0-\u30FF]/] }, // Japanese
  { lang: 'ko', patterns: [/[\uAC00-\uD7AF]/] },           // Korean
  { lang: 'ru', patterns: [/[\u0400-\u04FF]/] },            // Russian/Cyrillic
  { lang: 'es', patterns: [/\b(el|la|los|las|de|en|por|para|con|que|una|del)\b/i] },
  { lang: 'fr', patterns: [/\b(le|la|les|des|une|dans|pour|avec|sur|est|sont)\b/i] },
  { lang: 'de', patterns: [/\b(der|die|das|ein|eine|und|ist|von|mit|auf|den)\b/i] },
  { lang: 'pt', patterns: [/\b(o|a|os|as|de|em|para|com|por|uma|dos|das)\b/i] },
];

export function detectLanguage(text: string): string {
  // Check script-based languages first (most reliable)
  for (const { lang, patterns } of LANG_PATTERNS.slice(0, 6)) {
    for (const pattern of patterns) {
      const matches = text.match(new RegExp(pattern.source, 'g'));
      if (matches && matches.length >= 3) return lang;
    }
  }

  // Check European languages by word frequency
  const words = text.toLowerCase().split(/\s+/);
  const wordSet = new Set(words);

  for (const { lang, patterns } of LANG_PATTERNS.slice(6)) {
    let matchCount = 0;
    for (const pattern of patterns) {
      for (const word of wordSet) {
        if (pattern.test(word)) matchCount++;
      }
    }
    if (matchCount >= 3) return lang;
  }

  return 'en'; // Default to English
}
