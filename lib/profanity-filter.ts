/**
 * Simple profanity filter that redacts inappropriate words
 * Rather than blocking messages, replaces matched words with asterisks
 */

// Common profanity words (expandable)
const PROFANITY_WORDS = [
  'ass',
  'asshole',
  'bastard',
  'bitch',
  'damn',
  'dammit',
  'goddamn',
  'hell',
  'piss',
  'shit',
  'shitty',
  'crap',
  'crappy',
  'dick',
  'dickhead',
  'fag',
  'faggot',
  'fuck',
  'fucking',
  'fucked',
  'fucker',
  'whore',
  'slut',
  'dumbass',
  'jackass',
];

/**
 * Redact profanity words in text by replacing them with asterisks
 * Case-insensitive matching
 * Does NOT block the message, just sanitizes it
 */
export function filterProfanity(text: string): string {
  if (!text || typeof text !== 'string') {
    return text;
  }

  let filtered = text;

  // Sort by length (longest first) to avoid partial replacements
  const sortedWords = [...PROFANITY_WORDS].sort((a, b) => b.length - a.length);

  for (const word of sortedWords) {
    // Create case-insensitive regex with word boundaries
    const regex = new RegExp(`\\b${word}\\b`, 'gi');
    // Replace with asterisks matching the word length
    filtered = filtered.replace(regex, '*'.repeat(word.length));
  }

  return filtered;
}

/**
 * Check if text contains profanity
 * Returns true if profanity was found and filtered
 */
export function hasProfanity(text: string): boolean {
  if (!text || typeof text !== 'string') {
    return false;
  }

  const lowerText = text.toLowerCase();
  return PROFANITY_WORDS.some((word) => new RegExp(`\\b${word}\\b`).test(lowerText));
}
