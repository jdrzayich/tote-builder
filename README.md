# Tote Storage Builder (v1)

Mobile-first tote storage configurator that submits a **quote request** (no deposit/payment yet).

## Deploy to Vercel (no coding)

1. Create a free account at Vercel.
2. Create a new project and upload this folder (ZIP or drag/drop).
3. Deploy.
4. Copy the Vercel URL (e.g. `https://tote-builder.vercel.app`).
5. In WordPress, create a page and embed:

```html
<iframe
  src="https://YOUR-PROJECT.vercel.app"
  style="width:100%;height:1200px;border:0;border-radius:20px;overflow:hidden;"
  loading="lazy"
  title="Tote Storage Builder">
</iframe>
```

## Hook up quote submissions

Set an environment variable in Vercel:

- `NEXT_PUBLIC_QUOTE_WEBHOOK_URL`

If it's not set, the app logs the payload to the browser console.

### Easiest: Zapier Catch Hook
- Create a Zapier **Catch Hook** trigger
- Copy the webhook URL
- Add it in Vercel:
  - Project → Settings → Environment Variables

Then in Zapier:
- Action 1: Create Spreadsheet Row (Google Sheets)
- Action 2: Send Email (Gmail) and/or SMS (Twilio)

## Local dev (optional)

```bash
npm install
npm run dev
```

Open http://localhost:3000
