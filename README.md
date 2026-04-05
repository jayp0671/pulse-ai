# PulseAI

PulseAI is an automated daily news briefing workflow built in **n8n**.

It:
- pulls top stories from **The New York Times, NPR, BBC News, and The Verge**
- parses XML/Atom feeds into structured article objects
- merges and formats the news into one compiled input
- sends that input to **Google Gemini**
- extracts a polished summary
- emails the final briefing automatically every morning

## Project structure

```text
pulse-ai/
├─ README.md
├─ .gitignore
├─ workflow/
│  ├─ PulseAI-public.json
│  └─ PulseAI-private.template.json
├─ docs/
│  ├─ architecture.md
│  ├─ setup.md
│  ├─ troubleshooting.md
│  └─ feed-sources.md
├─ examples/
│  ├─ sample-briefing.txt
│  └─ sample-input-articles.txt
├─ screenshots/
│  └─ .gitkeep
└─ assets/
   └─ .gitkeep
```

## Workflow pipeline

```text
Schedule Trigger
→ HTTP Request (NYT / NPR / BBC / The Verge)
→ XML parsing
→ Code nodes to normalize article fields
→ Merge feeds
→ Format compiled article block
→ Build Gemini request
→ Gemini HTTP Request
→ Extract briefing
→ Send Email
```

## Files you should care about

- `workflow/PulseAI-public.json`  
  Public-safe n8n export with placeholder values for secrets.

- `workflow/PulseAI-private.template.json`  
  Starter copy for your own local/private workflow configuration.

- `docs/setup.md`  
  Exact setup flow for n8n, Gemini, and SMTP.

- `docs/troubleshooting.md`  
  Notes on the weird issues we hit while building.

## Before you import the workflow

Update these placeholders in your private copy:
- `YOUR_GEMINI_API_KEY`
- `your-email@example.com`

Then reconnect your SMTP credential inside n8n.

## GitHub checklist

Before pushing this repo publicly:
1. Keep only the **public** workflow export in GitHub.
2. Do **not** upload real API keys.
3. Do **not** upload private SMTP credentials.
4. Add screenshots of:
   - the full n8n canvas
   - successful Gemini output
   - the final email in your inbox

## Suggested repo description

> Automated n8n workflow that turns major news RSS feeds into a daily AI-generated email briefing using Google Gemini.

## License

You can add an MIT license if you want to make the repo openly reusable.
