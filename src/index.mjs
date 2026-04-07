import { loadConfig } from './config.mjs';
import { formatCompiledArticles, buildPrompt } from './compile.mjs';
import { sendBriefingEmail } from './email.mjs';
import { fetchAllFeeds } from './feeds.mjs';
import { generateBriefing } from './gemini.mjs';
import { ensureDir, nowIso, writeArtifact } from './utils.mjs';

async function main() {
  const config = loadConfig();
  await ensureDir(config.artifactsDir);

  await writeArtifact(config.artifactsDir, 'run-config.json', {
    generatedAt: nowIso(),
    dryRun: config.dryRun,
    geminiModel: config.geminiModel,
    articleLimitPerFeed: config.articleLimitPerFeed,
    storiesToSummarize: config.storiesToSummarize,
    emailSubjectPrefix: config.emailSubjectPrefix,
    emailTo: config.dryRun ? null : config.emailTo,
    feeds: ['The New York Times', 'NPR', 'BBC News', 'The Verge']
  });

  const feedResult = await fetchAllFeeds({
    articleLimitPerFeed: config.articleLimitPerFeed,
    artifactsDir: config.artifactsDir
  });

  if (feedResult.failures.length > 0) {
    await writeArtifact(config.artifactsDir, 'feed-failures.json', feedResult.failures);
  }

  await writeArtifact(config.artifactsDir, 'articles.json', feedResult.articles);

  const compiledArticles = formatCompiledArticles(feedResult.articles);
  await writeArtifact(config.artifactsDir, 'compiled-articles.txt', compiledArticles);

  const prompt = buildPrompt({
    compiledArticles,
    storiesToSummarize: config.storiesToSummarize
  });

  await writeArtifact(config.artifactsDir, 'prompt-system.txt', prompt.systemInstruction);
  await writeArtifact(config.artifactsDir, 'prompt-user.txt', prompt.userPrompt);

  const gemini = await generateBriefing({
    apiKey: config.geminiApiKey,
    model: config.geminiModel,
    systemInstruction: prompt.systemInstruction,
    userPrompt: prompt.userPrompt
  });

  await writeArtifact(config.artifactsDir, 'gemini-request.json', gemini.requestBody);
  await writeArtifact(config.artifactsDir, 'gemini-response.json', gemini.responseJson);
  await writeArtifact(config.artifactsDir, 'briefing.txt', gemini.briefing);

  let emailResult = null;
  if (!config.dryRun) {
    emailResult = await sendBriefingEmail(config, gemini.briefing);
    await writeArtifact(config.artifactsDir, 'email-result.json', emailResult);
  }

  const summary = {
    generatedAt: nowIso(),
    dryRun: config.dryRun,
    feedSourcesSucceeded: feedResult.feeds.length,
    feedSourcesFailed: feedResult.failures.length,
    mergedArticleCount: feedResult.articles.length,
    emailSent: !config.dryRun,
    emailResult
  };

  await writeArtifact(config.artifactsDir, 'summary.json', summary);

  console.log(JSON.stringify(summary, null, 2));
}

main().catch(async (error) => {
  const message = error instanceof Error ? error.stack || error.message : String(error);
  console.error(message);
  process.exitCode = 1;
});
