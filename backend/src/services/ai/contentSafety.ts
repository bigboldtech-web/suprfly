const SENSITIVE_PATTERNS = [
  // Politics
  /\b(election|political|democrat|republican|BJP|congress party|vote for|polling)\b/i,
  // Violence & tragedy
  /\b(shooting|massacre|bomb|terror|killed|murder|war zone|genocide)\b/i,
  // Discrimination
  /\b(racist|sexist|homophob|transphob|casteism|islamophob|antisemit)\b/i,
  // Self-harm
  /\b(suicide|self.harm|kill myself|end my life)\b/i,
  // Explicit
  /\b(porn|nsfw|sexual|nude|xxx)\b/i,
  // Religious conflict
  /\b(jihad|crusade|infidel|blasphemy|religious war)\b/i,
  // Drugs
  /\b(cocaine|heroin|meth|fentanyl|drug deal)\b/i,
];

export function checkPostSafety(postContent: string): { safe: boolean; reason?: string } {
  for (const pattern of SENSITIVE_PATTERNS) {
    if (pattern.test(postContent)) {
      return { safe: false, reason: `Matched sensitive pattern: ${pattern.source}` };
    }
  }
  return { safe: true };
}
