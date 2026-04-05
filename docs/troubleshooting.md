# Troubleshooting

## RSS Feed Trigger vs RSS Read confusion
Some n8n builds surface the RSS Feed Trigger node instead of a direct read-style RSS node. In this project, HTTP Request + XML parsing was used as the more reliable path.

## Reuters and AP feed issues
Not every publisher's legacy RSS endpoint worked consistently. The final working setup used:
- NYT
- NPR
- BBC
- The Verge

## The Verge feed shape is different
The Verge uses an Atom-style feed, not the same RSS shape as the other sources. That required a separate parsing code path using `feed.entry` instead of `rss.channel.item`.

## Gemini body formatting errors
This project hit several request-shape issues during setup.

The final working approach:
- compile the article text in a Code node
- build a JSON request string in another Code node
- send it via the Gemini HTTP Request node

## Gemini model quota issues
`gemini-2.0-flash` caused quota or deprecation-related issues. The final working model was:

`gemini-2.5-flash-lite`

## SMTP issues
If Gmail SMTP fails:
- confirm 2-Step Verification is enabled
- use an app password, not your normal Gmail password
- verify host and port values carefully

## Public repo safety
Before uploading the workflow JSON publicly:
- remove real API keys
- remove private email addresses
- remove SMTP credentials
