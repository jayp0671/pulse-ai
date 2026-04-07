# PulseAI Architecture

## Overview

PulseAI is now a scheduled Node.js automation that runs inside GitHub Actions.

The workflow fetches the latest items from four news feeds, converts them into a shared article structure, compiles a prompt for Gemini, generates a daily briefing, and sends the result through SMTP.

## Flow breakdown

### 1. GitHub Actions trigger
The workflow is defined in `.github/workflows/pulseai.yml` and supports:
- a scheduled daily run
- a manual run through `workflow_dispatch`

### 2. Feed ingestion
`src/feeds.mjs` fetches XML from:
- The New York Times
- NPR
- BBC News
- The Verge

Each raw feed is saved into `artifacts/out/feeds/` during a workflow run.

### 3. XML parsing
`fast-xml-parser` converts raw RSS and Atom XML into JavaScript objects.

### 4. Normalization
Feed-specific normalization logic maps every article into:
- `source`
- `title`
- `link`
- `description`
- `published`

### 5. Merge and deduplication
All feed articles are merged and deduplicated by canonical link or fallback title key.

### 6. Prompt compilation
`src/compile.mjs` converts the merged article list into a structured plain-text input block and a Gemini prompt.

### 7. Gemini summarization
`src/gemini.mjs` sends a `generateContent` request to Gemini and extracts the briefing text from the first candidate.

### 8. Email delivery
`src/email.mjs` sends the final briefing over SMTP using Nodemailer.

### 9. Debug artifacts
Every run uploads artifacts, including:
- `articles.json`
- `compiled-articles.txt`
- `prompt-system.txt`
- `prompt-user.txt`
- `gemini-request.json`
- `gemini-response.json`
- `briefing.txt`
- `summary.json`

These artifacts make it easy to debug failures without SSH access or a live terminal.

## Why this design fits PulseAI better than local n8n

PulseAI is fundamentally a scheduled automation, not a hosted web app. GitHub Actions is a better fit because it:
- runs without your laptop staying on
- keeps secrets in repository settings
- stores execution logs and artifacts automatically
- supports manual reruns from the GitHub UI
- keeps the repo simple and portable
