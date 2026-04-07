import { XMLParser } from 'fast-xml-parser';
import {
  canonicalizeLink,
  cleanText,
  dedupeArticles,
  ensureArray,
  textValue,
  tryParseDate,
  writeArtifact
} from './utils.mjs';

const FEEDS = [
  {
    key: 'nytimes',
    fallbackSource: 'The New York Times',
    url: 'https://rss.nytimes.com/services/xml/rss/nyt/HomePage.xml',
    type: 'rss'
  },
  {
    key: 'npr',
    fallbackSource: 'NPR',
    url: 'https://feeds.npr.org/1001/rss.xml',
    type: 'rss'
  },
  {
    key: 'bbc',
    fallbackSource: 'BBC News',
    url: 'http://feeds.bbci.co.uk/news/rss.xml',
    type: 'rss'
  },
  {
    key: 'the-verge',
    fallbackSource: 'The Verge',
    url: 'https://www.theverge.com/rss/index.xml',
    type: 'atom'
  }
];

const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: '',
  textNodeName: '_',
  parseTagValue: false,
  parseAttributeValue: false,
  trimValues: true,
  removeNSPrefix: true,
  processEntities: true
});

function pickAtomLink(entry) {
  const links = ensureArray(entry?.link);
  const alternate = links.find((item) => item?.rel === 'alternate' && item?.href);
  const firstHref = links.find((item) => item?.href);

  if (alternate?.href) return alternate.href;
  if (firstHref?.href) return firstHref.href;
  return textValue(entry?.link);
}

function normalizeRssFeed(parsed, fallbackSource, limit) {
  const channel = parsed?.rss?.channel ?? parsed?.channel ?? {};
  const source = textValue(channel.title) || fallbackSource;
  const items = ensureArray(channel.item).slice(0, limit);

  return items.map((article) => ({
    source,
    title: cleanText(textValue(article.title)),
    link: canonicalizeLink(textValue(article.link)),
    description: cleanText(textValue(article.description) || textValue(article.summary) || textValue(article.contentEncoded)),
    published: textValue(article.pubDate) || textValue(article.published) || textValue(article.updated) || ''
  }));
}

function normalizeAtomFeed(parsed, fallbackSource, limit) {
  const feed = parsed?.feed ?? {};
  const source = cleanText(textValue(feed.title)) || fallbackSource;
  const entries = ensureArray(feed.entry).slice(0, limit);

  return entries.map((article) => ({
    source,
    title: cleanText(textValue(article.title)),
    link: canonicalizeLink(pickAtomLink(article)),
    description: cleanText(textValue(article.summary) || textValue(article.content)),
    published: textValue(article.published) || textValue(article.updated) || ''
  }));
}

function sortArticles(articles) {
  return [...articles].sort((a, b) => {
    const aDate = tryParseDate(a.published);
    const bDate = tryParseDate(b.published);

    if (!aDate && !bDate) return 0;
    if (!aDate) return 1;
    if (!bDate) return -1;
    return bDate.getTime() - aDate.getTime();
  });
}

async function fetchSingleFeed(feed, limit, artifactsDir) {
  const controller = AbortSignal.timeout(20_000);
  const response = await fetch(feed.url, {
    signal: controller,
    headers: {
      'User-Agent': 'PulseAI/1.0 (+GitHub Actions)'
    }
  });

  if (!response.ok) {
    throw new Error(`${feed.fallbackSource} request failed with ${response.status} ${response.statusText}`);
  }

  const xml = await response.text();
  const parsed = parser.parse(xml);

  const articles = feed.type === 'atom'
    ? normalizeAtomFeed(parsed, feed.fallbackSource, limit)
    : normalizeRssFeed(parsed, feed.fallbackSource, limit);

  const filteredArticles = articles.filter((article) => article.title && article.link);

  await writeArtifact(artifactsDir, `feeds/${feed.key}.xml`, xml);
  await writeArtifact(artifactsDir, `feeds/${feed.key}.json`, {
    source: feed.fallbackSource,
    url: feed.url,
    articleCount: filteredArticles.length,
    articles: filteredArticles
  });

  return {
    ...feed,
    articleCount: filteredArticles.length,
    articles: filteredArticles
  };
}

export async function fetchAllFeeds({ articleLimitPerFeed, artifactsDir }) {
  const results = await Promise.allSettled(
    FEEDS.map((feed) => fetchSingleFeed(feed, articleLimitPerFeed, artifactsDir))
  );

  const successes = [];
  const failures = [];

  for (let index = 0; index < results.length; index += 1) {
    const result = results[index];
    const feed = FEEDS[index];

    if (result.status === 'fulfilled') {
      successes.push(result.value);
    } else {
      failures.push({
        source: feed.fallbackSource,
        url: feed.url,
        error: result.reason instanceof Error ? result.reason.message : String(result.reason)
      });
    }
  }

  if (successes.length === 0) {
    throw new Error(`All feed fetches failed: ${failures.map((item) => `${item.source}: ${item.error}`).join(' | ')}`);
  }

  const mergedArticles = dedupeArticles(sortArticles(successes.flatMap((item) => item.articles)));

  return {
    feeds: successes,
    failures,
    articles: mergedArticles
  };
}
