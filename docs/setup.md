# Setup Guide

## 1. Install and open n8n
Run n8n locally and open the editor in your browser.

## 2. Import the workflow
Import:

`workflow/PulseAI-public.json`

Then immediately save a private local copy before adding any credentials.

## 3. Create your private workflow copy
Duplicate the public workflow file and rename it:

`workflow/PulseAI-private.json`

Do not commit this file to GitHub.

## 4. Add your Gemini API key
Inside the Gemini HTTP Request node:
- keep the query parameter name as `key`
- replace `YOUR_GEMINI_API_KEY` with your actual Gemini key

## 5. Configure email sending
Inside the Send Email node, create or attach an SMTP credential.

### Example Gmail SMTP settings
- Host: `smtp.gmail.com`
- Port: `465` (SSL) or `587` (TLS)
- Username: your Gmail address
- Password: your Google app password

Then update:
- `fromEmail`
- `toEmail`

## 6. Test the workflow manually
Run the workflow once.

You should see:
- ~20 merged articles
- a formatted article block
- a Gemini response
- a final `briefing` field
- one email delivered to your inbox

## 7. Publish the workflow
After testing works end-to-end, publish the workflow so the schedule runs automatically.

## 8. Capture screenshots
Take screenshots for:
- the full workflow
- the Gemini success node
- the final email result

Add them to the `screenshots/` folder.

## 9. Push the public-safe repo
Make sure only the public JSON export is committed.

Never push:
- real API keys
- private workflow files
- SMTP credentials
