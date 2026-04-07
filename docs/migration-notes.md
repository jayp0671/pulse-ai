# Migration Notes

## Original state

The original PulseAI build lived entirely in n8n:

```text
Schedule Trigger
→ HTTP Request nodes
→ XML nodes
→ Code nodes
→ Merge nodes
→ Gemini HTTP Request
→ Extract Briefing
→ Send an Email
```

That workflow worked, but only while the n8n instance was actually running.

## Problem that forced the migration

A local n8n instance cannot execute scheduled workflows when:
- the VS Code terminal is closed
- the machine is asleep
- the local server is not running

That made PulseAI unreliable as a daily product.

## GitHub Actions migration mapping

| n8n concept | GitHub Actions repo equivalent |
|---|---|
| Schedule Trigger | `.github/workflows/pulseai.yml` |
| HTTP Request nodes | `src/feeds.mjs` + `fetch()` |
| XML nodes | `fast-xml-parser` |
| Code nodes | `src/compile.mjs`, `src/feeds.mjs`, `src/gemini.mjs` |
| Gemini HTTP Request | `src/gemini.mjs` |
| Send Email node | `src/email.mjs` |
| n8n execution data | Actions logs + uploaded artifacts |

## What was preserved

- same four feed sources
- same top-items-per-feed behavior by default
- same Gemini-based summarization step
- same email delivery concept
- same original n8n JSON exports for portfolio/reference

## What improved

- no dependency on a local laptop session
- version-controlled runtime logic
- easier debugging through artifacts
- cleaner secret management in GitHub
- simpler path to future enhancements like tests or Slack delivery
