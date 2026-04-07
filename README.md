# PulseAI

PulseAI is an automated daily news briefing that now runs on **GitHub Actions** instead of a local n8n instance.

It:
- pulls top stories from **The New York Times, NPR, BBC News, and The Verge**
- parses RSS and Atom feeds into a shared article format
- merges and deduplicates articles
- sends the compiled feed stack to **Google Gemini**
- generates a concise daily briefing
- emails the final briefing automatically every morning
- uploads run artifacts for debugging in GitHub Actions

## Final repository structure

```text
pulse-ai/
├─ .github/
│  └─ workflows/
│     └─ pulseai.yml
├─ src/
│  ├─ index.mjs
│  ├─ config.mjs
│  ├─ utils.mjs
│  ├─ feeds.mjs
│  ├─ compile.mjs
│  ├─ gemini.mjs
│  └─ email.mjs
├─ docs/
│  ├─ architecture.md
│  ├─ feed-sources.md
│  ├─ migration-notes.md
│  ├─ setup.md
│  └─ troubleshooting.md
├─ examples/
│  ├─ sample-briefing.txt
│  └─ sample-input-articles.txt
├─ workflow/
│  ├─ PulseAI-public.json
│  └─ PulseAI-private.template.json
├─ artifacts/
│  └─ .gitkeep
├─ screenshots/
│  └─ .gitkeep
├─ assets/
│  └─ .gitkeep
├─ .env.example
├─ .gitignore
├─ .nvmrc
├─ LICENSE
├─ package.json
└─ README.md
```

## How it runs now

```text
GitHub Actions schedule / manual dispatch
→ fetch RSS + Atom feeds
→ parse XML
→ normalize and deduplicate article objects
→ compile prompt text
→ call Gemini generateContent
→ extract briefing
→ send SMTP email
→ upload artifacts
```

## What changed from the n8n version

The original n8n workflow is still included in `workflow/` as a legacy reference, but the production path is now:

- **runtime:** GitHub Actions
- **logic:** Node.js modules in `src/`
- **LLM call:** Gemini REST API
- **delivery:** SMTP via Nodemailer
- **debugging:** GitHub Actions artifacts

## Quick start

1. Add the repo files to GitHub.
2. Add the required **Actions secrets** listed in `docs/setup.md`.
3. Push `pulseai.yml` to your **default branch**.
4. Run the workflow once from **Actions → PulseAI Daily Briefing → Run workflow**.
5. Check the artifact bundle and your inbox.

## Local test

```bash
npm install
cp .env.example .env
# fill in your real values
npm run run:local
```

Set `DRY_RUN=true` in `.env` if you want to generate the briefing without sending email.

## Notes

- This repo intentionally does **not** include `workflow/PulseAI-private.json`.
- Do not commit `.env`.
- If you uploaded a live Gemini API key anywhere before this cleanup, rotate it.

## Suggested repo description

> Automated GitHub Actions workflow that turns major news RSS feeds into a daily AI-generated email briefing using Google Gemini.
