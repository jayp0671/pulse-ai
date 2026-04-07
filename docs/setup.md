# Setup Guide

## 1. Put the repo on GitHub

Create a GitHub repository for PulseAI and upload the files in this package.

Make sure `.github/workflows/pulseai.yml` lands on your **default branch**.

## 2. Add GitHub Actions secrets

Open:

`Repo → Settings → Secrets and variables → Actions`

Create these **repository secrets**:

- `GEMINI_API_KEY`
- `SMTP_HOST`
- `SMTP_PORT`
- `SMTP_SECURE`
- `SMTP_USER`
- `SMTP_PASS`
- `EMAIL_FROM`
- `EMAIL_TO`

### Recommended Gmail SMTP values

- `SMTP_HOST = smtp.gmail.com`
- `SMTP_PORT = 465`
- `SMTP_SECURE = true`
- `SMTP_USER = your Gmail address`
- `SMTP_PASS = your Google app password`
- `EMAIL_FROM = PulseAI <your-email@gmail.com>`
- `EMAIL_TO = your target inbox`

## 3. Optional GitHub Actions variables

In the same Actions settings area, you can optionally create **repository variables**:

- `GEMINI_MODEL`
- `ARTICLE_LIMIT_PER_FEED`
- `STORIES_TO_SUMMARIZE`
- `EMAIL_SUBJECT_PREFIX`
- `DRY_RUN`
- `RECIPIENT_OVERRIDE`

If you do not set them, the code falls back to defaults.

Recommended defaults:

- `GEMINI_MODEL = gemini-2.5-flash-lite`
- `ARTICLE_LIMIT_PER_FEED = 5`
- `STORIES_TO_SUMMARIZE = 5`
- `EMAIL_SUBJECT_PREFIX = PulseAI Daily Briefing`
- `DRY_RUN = false`

## 4. Commit and push

Push the repo to GitHub.

Once the workflow file is on the default branch, GitHub Actions can run it.

## 5. Run a manual test first

Open:

`Repo → Actions → PulseAI Daily Briefing → Run workflow`

Then confirm:
- the run completes successfully
- the artifact bundle exists
- `briefing.txt` looks good
- the email arrives in your inbox

## 6. Let the schedule take over

The workflow is configured for **8:07 AM America/Chicago** every day.

## 7. Local test path

For local testing:

```bash
npm install
cp .env.example .env
# fill in real values
npm run run:local
```

Set `DRY_RUN=true` in `.env` to skip email delivery while testing.

## 8. Final safety check

Never commit:
- `.env`
- live API keys
- SMTP passwords
- `workflow/PulseAI-private.json`
