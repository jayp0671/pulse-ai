import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

const ENTITY_MAP = {
  amp: '&',
  lt: '<',
  gt: '>',
  quot: '"',
  apos: "'",
  nbsp: ' '
};

export function ensureArray(value) {
  if (Array.isArray(value)) return value;
  if (value === undefined || value === null) return [];
  return [value];
}

export function textValue(value) {
  if (value === undefined || value === null) return '';

  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
    return String(value).trim();
  }

  if (Array.isArray(value)) {
    return value.map(textValue).filter(Boolean).join(' ').trim();
  }

  if (typeof value === 'object') {
    if (typeof value._ === 'string') return value._.trim();
    if (typeof value['#text'] === 'string') return value['#text'].trim();
    if (typeof value.href === 'string') return value.href.trim();
    if (typeof value.src === 'string') return value.src.trim();
  }

  return '';
}

export function stripHtml(value) {
  if (!value) return '';

  return decodeHtmlEntities(
    String(value)
      .replace(/<\s*br\s*\/?>/gi, '\n')
      .replace(/<\s*\/\s*p\s*>/gi, '\n\n')
      .replace(/<[^>]+>/g, ' ')
  );
}

export function decodeHtmlEntities(value) {
  if (!value) return '';

  return String(value).replace(/&(#x?[0-9a-fA-F]+|[a-zA-Z]+);/g, (match, entity) => {
    if (entity.startsWith('#x') || entity.startsWith('#X')) {
      const codePoint = Number.parseInt(entity.slice(2), 16);
      return Number.isFinite(codePoint) ? String.fromCodePoint(codePoint) : match;
    }

    if (entity.startsWith('#')) {
      const codePoint = Number.parseInt(entity.slice(1), 10);
      return Number.isFinite(codePoint) ? String.fromCodePoint(codePoint) : match;
    }

    return ENTITY_MAP[entity] ?? match;
  });
}

export function normalizeWhitespace(value) {
  if (!value) return '';
  return String(value)
    .replace(/\r/g, '')
    .replace(/\t/g, ' ')
    .replace(/\u00a0/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .replace(/[ ]{2,}/g, ' ')
    .split('\n')
    .map((line) => line.trim())
    .join('\n')
    .trim();
}

export function cleanText(value) {
  return normalizeWhitespace(stripHtml(value));
}

export function canonicalizeLink(value) {
  if (!value) return '';

  try {
    const url = new URL(value);
    url.hash = '';

    const removableParams = [
      'utm_source',
      'utm_medium',
      'utm_campaign',
      'utm_term',
      'utm_content',
      'utm_name',
      'smid',
      'partner',
      'fbclid',
      'gclid'
    ];

    for (const param of removableParams) {
      url.searchParams.delete(param);
    }

    return url.toString();
  } catch {
    return String(value).trim();
  }
}

export function normalizeForKey(value) {
  return String(value ?? '')
    .toLowerCase()
    .replace(/https?:\/\//g, '')
    .replace(/www\./g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

export function dedupeArticles(articles) {
  const seen = new Set();
  const deduped = [];

  for (const article of articles) {
    const linkKey = canonicalizeLink(article.link);
    const titleKey = normalizeForKey(article.title);
    const compositeKey = linkKey || `${normalizeForKey(article.source)}::${titleKey}`;

    if (!compositeKey || seen.has(compositeKey)) {
      continue;
    }

    seen.add(compositeKey);
    deduped.push({
      ...article,
      link: linkKey || article.link
    });
  }

  return deduped;
}

export async function ensureDir(dirPath) {
  await mkdir(dirPath, { recursive: true });
}

export async function writeArtifact(baseDir, relativePath, content) {
  const fullPath = path.join(baseDir, relativePath);
  await mkdir(path.dirname(fullPath), { recursive: true });

  const output = typeof content === 'string' ? content : JSON.stringify(content, null, 2);
  await writeFile(fullPath, output, 'utf8');
  return fullPath;
}

export function nowIso() {
  return new Date().toISOString();
}

export function toDisplayDate(date = new Date()) {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    timeZoneName: 'short'
  }).format(date);
}

export function tryParseDate(value) {
  if (!value) return null;
  const timestamp = Date.parse(value);
  if (Number.isNaN(timestamp)) return null;
  return new Date(timestamp);
}
