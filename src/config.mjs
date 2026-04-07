function isBlank(value) {
  return value === undefined || value === null || String(value).trim() === '';
}

function parseBoolean(value, fallback = false) {
  if (isBlank(value)) return fallback;
  const normalized = String(value).trim().toLowerCase();
  if (['1', 'true', 'yes', 'y', 'on'].includes(normalized)) return true;
  if (['0', 'false', 'no', 'n', 'off'].includes(normalized)) return false;
  throw new Error(`Invalid boolean value: ${value}`);
}

function parseInteger(value, fallback) {
  if (isBlank(value)) return fallback;
  const parsed = Number.parseInt(String(value), 10);
  if (!Number.isFinite(parsed)) {
    throw new Error(`Invalid integer value: ${value}`);
  }
  return parsed;
}

function fromEnv(name, fallback) {
  const value = process.env[name];
  return isBlank(value) ? fallback : String(value).trim();
}

function requireEnv(name) {
  const value = fromEnv(name);
  if (isBlank(value)) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export function loadConfig() {
  const dryRun = parseBoolean(fromEnv('DRY_RUN', 'false'), false);
  const smtpPort = parseInteger(fromEnv('SMTP_PORT', '465'), 465);
  const secureByDefault = smtpPort === 465;

  const config = {
    dryRun,
    artifactsDir: fromEnv('ARTIFACTS_DIR', 'artifacts/out'),
    geminiApiKey: requireEnv('GEMINI_API_KEY'),
    geminiModel: fromEnv('GEMINI_MODEL', 'gemini-2.5-flash-lite'),
    articleLimitPerFeed: parseInteger(fromEnv('ARTICLE_LIMIT_PER_FEED', '5'), 5),
    storiesToSummarize: parseInteger(fromEnv('STORIES_TO_SUMMARIZE', '5'), 5),
    emailSubjectPrefix: fromEnv('EMAIL_SUBJECT_PREFIX', 'PulseAI Daily Briefing'),
    smtpHost: fromEnv('SMTP_HOST'),
    smtpPort,
    smtpSecure: parseBoolean(fromEnv('SMTP_SECURE', String(secureByDefault)), secureByDefault),
    smtpUser: fromEnv('SMTP_USER'),
    smtpPass: fromEnv('SMTP_PASS'),
    emailFrom: fromEnv('EMAIL_FROM'),
    emailTo: fromEnv('RECIPIENT_OVERRIDE') || fromEnv('EMAIL_TO')
  };

  if (!dryRun) {
    for (const key of ['smtpHost', 'smtpUser', 'smtpPass', 'emailFrom', 'emailTo']) {
      if (isBlank(config[key])) {
        throw new Error(`Missing required environment variable for email delivery: ${key}`);
      }
    }
  }

  if (config.articleLimitPerFeed < 1) {
    throw new Error('ARTICLE_LIMIT_PER_FEED must be at least 1');
  }

  if (config.storiesToSummarize < 1) {
    throw new Error('STORIES_TO_SUMMARIZE must be at least 1');
  }

  return config;
}
