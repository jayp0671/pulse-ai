import { toDisplayDate } from './utils.mjs';

export function formatCompiledArticles(articles) {
  return articles
    .map((article, index) => `${index + 1}. Source: ${article.source}
Title: ${article.title}
Published: ${article.published || 'Unknown'}
Summary: ${article.description || 'No summary available.'}
Link: ${article.link}`)
    .join('\n\n');
}

export function buildPrompt({ compiledArticles, storiesToSummarize }) {
  const generatedAt = toDisplayDate();

  const systemInstruction = [
    'You are PulseAI, a market intelligence analyst.',
    'You turn a stack of news feed entries into one crisp email briefing.',
    'You are allowed to consolidate overlapping coverage from multiple sources into a single item when that makes the briefing more useful.',
    'Return plain text only. Do not use markdown fences or bullet symbols beyond numbered sections.'
  ].join(' ');

  const userPrompt = `Create a daily briefing from the feed entries below.

Requirements:
- Pick the ${storiesToSummarize} most important stories overall.
- For each story include:
  Headline:
  Source:
  Summary:
  Why it matters:
  Tags:
- Prefer AI, technology, business, and geopolitics when they are truly important, but do not force them if the feed mix suggests something else matters more.
- Use 2 to 3 sentences for Summary.
- Keep Why it matters to 1 sentence.
- Keep Tags to a short comma-separated list.
- Remove duplicates and group together obviously overlapping stories.
- Keep the tone professional, concise, and easy to skim in a morning email.
- Start the briefing with the title "PulseAI Daily Briefing" and a generated timestamp line using this exact timestamp: ${generatedAt}.
- End with a short section titled "Watchlist" containing 2 to 3 themes to monitor next.

Articles:

${compiledArticles}`;

  return {
    systemInstruction,
    userPrompt
  };
}
