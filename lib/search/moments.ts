/*
 * Two stage timestamp resolution for video results. The server, not the model,
 * picks the second: the best matching chapter, and only when no chapter matches,
 * the best matching transcript chunk. Pure functions, no I/O.
 */

/** The number of term slots in the moment GROQ query. */
export const MAX_MATCH_TERMS = 8;
const MAX_TERM_LENGTH = 40;

const STOPWORDS = new Set([
  "how", "do", "i", "the", "a", "an", "to", "in", "of", "for", "with", "and",
  "or", "learn", "about", "what", "is", "use", "using",
]);

function tokenize(text: string) {
  return text.toLowerCase().split(/[^a-z0-9]+/).filter(Boolean);
}

/**
 * Keywords from the learner's query plus the stems the model searched with,
 * cleaned to `[a-z0-9]`, deduped, and capped. Query keywords come first.
 */
export function buildMatchTerms(query: string, modelTerms: string[] = []) {
  const terms = [query, ...modelTerms]
    .flatMap(tokenize)
    .filter((term) => term.length >= 2 && term.length <= MAX_TERM_LENGTH && !STOPWORDS.has(term));
  return [...new Set(terms)].slice(0, MAX_MATCH_TERMS);
}

/**
 * GROQ params `t0`…`t7` as wildcard patterns. Unused slots repeat the first
 * term, so the query string stays static. Null when there are no terms.
 */
export function toTermParams(terms: string[]) {
  if (terms.length === 0) return null;
  return Object.fromEntries(
    Array.from({ length: MAX_MATCH_TERMS }, (_, index) => [
      `t${index}`,
      `${terms[index] ?? terms[0]}*`,
    ]),
  );
}

type Entry = { startSeconds: number | null; text: string | null };

export type Moment = { startSeconds: number; source: "chapter" | "transcript" };

/** Distinct terms an entry contains, by the same token prefix rule as GROQ. */
function score(text: string, terms: string[]) {
  const tokens = tokenize(text);
  return terms.filter((term) => tokens.some((token) => token.startsWith(term))).length;
}

/** The highest scoring entry, the earliest on a tie. */
function best(entries: Entry[], terms: string[]) {
  let winner: { startSeconds: number; score: number } | null = null;
  for (const entry of entries) {
    if (typeof entry.startSeconds !== "number" || !entry.text) continue;
    const entryScore = score(entry.text, terms);
    if (
      !winner ||
      entryScore > winner.score ||
      (entryScore === winner.score && entry.startSeconds < winner.startSeconds)
    ) {
      winner = { startSeconds: entry.startSeconds, score: entryScore };
    }
  }
  return winner?.startSeconds ?? null;
}

/**
 * `chapters` and `chunks` are the entries GROQ already matched against the
 * terms. Chapters win whenever any matched; chunks are only the fallback.
 */
export function pickMoment(chapters: Entry[], chunks: Entry[], terms: string[]): Moment | null {
  const chapter = best(chapters, terms);
  if (chapter !== null) return { startSeconds: chapter, source: "chapter" };
  const chunk = best(chunks, terms);
  if (chunk !== null) return { startSeconds: chunk, source: "transcript" };
  return null;
}
