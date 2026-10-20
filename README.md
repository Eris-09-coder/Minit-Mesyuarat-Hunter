# Penjana Minit Mesyuarat & Minit Curai — Gemini + ChatGPT

## What is included
- `index.html`: user interface with Gemini / ChatGPT selection, fields, notes, preview, PDF printing, and PDF/DOCX/TXT/image text extraction.
- `api/generate.js`: server-side API route. Calls Gemini or OpenAI and returns structured agenda text.
- `package.json`, `vercel.json`: deployment configuration.

## Deploy (recommended: Vercel + GitHub)
GitHub Pages hosts static files only and cannot run `/api/generate.js`. Use Vercel for both the frontend and API:
1. Create a GitHub repository and upload all files, keeping `api/generate.js` inside the `api` folder.
2. Import that repository into https://vercel.com/ and deploy it as a Node project.
3. In Vercel project **Settings → Environment Variables**, add one or both:
   - `GEMINI_API_KEY` = your Google AI Studio API key
   - `OPENAI_API_KEY` = your OpenAI API key
   Optional model overrides:
   - `GEMINI_MODEL` = `gemini-2.5-flash`
   - `OPENAI_MODEL` = `gpt-4.1-mini`
4. Redeploy after setting/changing environment variables.
5. Test both providers from the website. If only one provider key is set, the other option will return a clear error until its key is configured.

## Get API keys
- Gemini: https://aistudio.google.com/app/apikey
- OpenAI: https://platform.openai.com/api-keys

API access and billing are separate from ChatGPT subscriptions or Google consumer plans. Review each provider's pricing, quotas and school data policies before use.

## Critical security notes
- Never place either API key in `index.html`, GitHub code, or any browser-side JavaScript. This project keeps the keys on the server as environment variables.
- Do not commit `.env` files or API keys. Anyone with access to your Vercel project settings may be able to manage its secrets.
- This starter does not implement DELIMa login, teacher roles, usage quotas, or user authentication. The deployed URL may be usable by anyone who can reach it, and API calls may incur costs. Add authentication/rate limiting before a school-wide launch.
- Avoid confidential pupil/staff data until the school approves the hosting and AI provider arrangements. The text submitted for AI generation is sent to the selected provider's API.
- PDF/DOCX extraction and image OCR occur in the browser; extraction libraries are downloaded from public CDNs. Image OCR supports English and Malay where language data is available.
- Old `.doc` files should be converted to `.docx` or PDF first.
- The current preview is an approximate HTML layout, not a pixel-perfect copy of the supplied Word template. Strict exact-format output requires using the approved DOCX as the source template and filling placeholders with a server-side DOCX generation workflow.

## How teachers use it
1. Enter meeting metadata.
2. Paste notes or upload a file to extract its text.
3. Choose Gemini or ChatGPT.
4. Click **Jana dengan AI**.
5. Check names, dates, decisions and action owners against the original source.
6. Edit the result and click **Cetak / Simpan PDF**.

The AI must not be treated as an official record without human review.
