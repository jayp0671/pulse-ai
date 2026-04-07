# Troubleshooting

## No email arrived

Check these in order:

1. **Actions tab**
   - Did the workflow run?
   - Did it fail before the email step?

2. **Artifacts**
   - Open `briefing.txt`.
   - Open `email-result.json` if it exists.

3. **SMTP auth**
   - Wrong app password is the most common issue.
   - Make sure `SMTP_PORT` and `SMTP_SECURE` match.

4. **Inbox folders**
   - Check Spam, Promotions, Junk, and Sent Mail.

## GitHub schedule did not fire

Common causes:
- the workflow file is not on the default branch
- the workflow was disabled
- the repo had no activity for a long time in a public repo
- the run was delayed because GitHub was busy near the top of the hour

## Gmail SMTP failed

For Gmail, use an **app password**, not your regular account password.

If app passwords are missing from your Google account, first confirm that 2-Step Verification is enabled.

## Gemini request failed

Open these artifacts:
- `prompt-user.txt`
- `gemini-request.json`
- `gemini-response.json`

That will usually tell you whether the issue is:
- missing API key
- invalid model name
- empty prompt input
- temporary API failure

## Feed parsing looks wrong

Check:
- `feeds/nytimes.xml`
- `feeds/npr.xml`
- `feeds/bbc.xml`
- `feeds/the-verge.xml`

If a publisher changes feed structure, update the corresponding normalization logic in `src/feeds.mjs`.
