# PulseAI Architecture

## Overview

PulseAI is an end-to-end automation workflow that collects news, restructures it, summarizes it with Gemini, and emails the result.

## Flow breakdown

### 1. Schedule Trigger
Runs the workflow on a daily schedule. In the current build, it is configured for **8:00 AM**.

### 2. Feed ingestion
PulseAI fetches XML or Atom feeds from:
- The New York Times
- NPR
- BBC News
- The Verge

Each feed is requested through an HTTP Request node.

### 3. XML parsing
Each feed is converted from raw XML into JSON using n8n's XML node.

### 4. Normalization
Custom Code nodes transform each source into a consistent article structure:

- `source`
- `title`
- `link`
- `description`
- `published` (when available)

This step matters because different publishers expose their feed data differently.

### 5. Merge
The article streams are merged into one combined list of articles.

### 6. Formatting
A Code node turns the merged article list into one large text block that Gemini can understand clearly.

### 7. Gemini summarization
A second Code node prepares the request body. The Gemini HTTP Request node sends that compiled article input to Gemini and asks for:
- the 5 most important stories
- 2–3 sentence summaries
- tags for AI, business, technology, or geopolitics
- a short "why it matters" style framing

### 8. Response extraction
A final Code node extracts the generated briefing text from Gemini's response JSON.

### 9. Email delivery
The briefing is emailed through an SMTP-based Send Email node.

## Why this design works

This workflow keeps the heavy lifting deterministic:
- feed retrieval
- parsing
- field normalization
- merging
- scheduling
- email sending

It uses the LLM only where it adds the most value:
- ranking what matters
- synthesizing multiple sources
- turning raw articles into a readable daily briefing
