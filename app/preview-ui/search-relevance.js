/* Deterministic local search. Queries stay in the browser: this module never transports them. */
(() => {
  'use strict';

  const STOP_WORDS = new Set(['a', 'an', 'and', 'are', 'as', 'at', 'be', 'but', 'by', 'do', 'for', 'from', 'how', 'i', 'in', 'is', 'it', 'me', 'my', 'of', 'on', 'or', 'our', 'the', 'to', 'we', 'what', 'when', 'where', 'with', 'you', 'your']);
  const normalize = value => String(value || '')
    .toLocaleLowerCase('en-US')
    .replace(/[’']/g, '')
    .replace(/wi[\s-]?fi/g, 'wifi')
    .replace(/\bcan\s*not\b/g, 'cant')
    .replace(/\bwon[’']?t\b/g, 'wont')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
    .replace(/\s+/g, ' ');
  const words = value => normalize(value).split(' ').filter(Boolean);
  const stem = word => {
    if (word.length < 4) return word;
    if (/ies$/.test(word)) return `${word.slice(0, -3)}y`;
    if (/sses$/.test(word)) return word.slice(0, -2);
    if (/s$/.test(word) && !/ss$/.test(word)) return word.slice(0, -1);
    return word;
  };
  const meaningfulWords = value => [...new Set(words(value).map(stem).filter(word => !STOP_WORDS.has(word)))];
  const hasWholePhrase = (haystack, phrase) => {
    const needle = normalize(phrase);
    return Boolean(needle) && ` ${normalize(haystack)} `.includes(` ${needle} `);
  };
  const wordRoots = word => {
    const roots = [word];
    if (word.length >= 6 && /ing$/.test(word)) roots.push(word.slice(0, -3));
    if (word.length >= 6 && /ers?$/.test(word)) roots.push(word.replace(/ers?$/, ''));
    return roots;
  };
  const equivalentWord = (left, right) => {
    if (left === right) return true;
    // Compare complete normalized words and their shared word beginning only.
    // This handles roofer/roofing and print/printer without letting short
    // fragments such as "is" trigger unrelated results.
    return wordRoots(left).some(leftRoot => wordRoots(right).some(rightRoot =>
      leftRoot.length >= 4 && rightRoot.length >= 4 && (leftRoot.startsWith(rightRoot) || rightRoot.startsWith(leftRoot))
    ));
  };
  const overlap = (queryWords, text) => {
    const textWords = meaningfulWords(text);
    return queryWords.reduce((count, word) => count + (textWords.some(candidate => equivalentWord(word, candidate)) ? 1 : 0), 0);
  };
  const pathIsArchived = (path, prefixes) => prefixes.some(prefix => String(path || '').startsWith(prefix));
  const explicitStudy = (query, row) => {
    const titleWords = meaningfulWords(row.title);
    const queryWords = new Set(meaningfulWords(query));
    return titleWords.length >= 2 && titleWords.filter(word => queryWords.has(word)).length >= 2;
  };
  const resultKey = row => {
    try { return new URL(String(row?.path || ''), 'https://littlefightnyc.local').pathname; }
    catch { return String(row?.path || '').split('#')[0]; }
  };

  function rank(rows, query, config = {}) {
    const normalizedQuery = normalize(query);
    const queryWords = meaningfulWords(query);
    if (!normalizedQuery || !queryWords.length) return [];
    const aliases = Array.isArray(config.aliases) ? config.aliases : [];
    const archivedPrefixes = Array.isArray(config.archivedPathPrefixes) ? config.archivedPathPrefixes : [];
    const candidates = new Map();
    const add = (row, score, source) => {
      if (!row?.path || score <= 0) return;
      const key = resultKey(row);
      const previous = candidates.get(key);
      if (!previous || score > previous.score) candidates.set(key, { row, score, source });
    };

    aliases.forEach(alias => {
      const terms = [alias.title, ...(Array.isArray(alias.aliases) ? alias.aliases : [])];
      const exact = terms.some(term => hasWholePhrase(normalizedQuery, term));
      const matchedWords = Math.max(...terms.map(term => overlap(queryWords, term)), 0);
      // An authored alias is an intentional task match. Exact phrases win;
      // two useful words still outrank incidental mentions elsewhere.
      if (exact) add(alias, 200 + Math.min(queryWords.length, 6), 'alias-exact');
      else if (matchedWords >= 2 || (queryWords.length === 1 && matchedWords === 1)) add(alias, 90 + matchedWords * 12, 'alias-words');
    });

    rows.forEach(row => {
      if (!row?.path || pathIsArchived(row.path, archivedPrefixes) && !explicitStudy(normalizedQuery, row)) return;
      const titleScore = overlap(queryWords, row.title) * 18;
      const questionScore = overlap(queryWords, Array.isArray(row.questions) ? row.questions.join(' ') : '') * 15;
      const descriptionScore = overlap(queryWords, row.description) * 6;
      const familyScore = overlap(queryWords, row.family) * 2;
      const phraseScore = hasWholePhrase(row.title, normalizedQuery) ? 70 : 0;
      const score = titleScore + questionScore + descriptionScore + familyScore + phraseScore;
      // A one-word query is useful only when the word appears in a visible
      // title. This avoids a broad body-string match swallowing task help.
      if (score > 0 && (queryWords.length > 1 || titleScore > 0 || questionScore > 0)) add(row, score, 'index');
    });

    return [...candidates.values()]
      .sort((a, b) => b.score - a.score || String(a.row.title).localeCompare(String(b.row.title)))
      .map(result => ({ ...result.row, _searchSource: result.source }));
  }

  window.LFSearch = Object.freeze({ normalize, meaningfulWords, rank });
})();
