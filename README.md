# Job OS

A private job-search workspace. Add jobs, score them against **your own resume**, and generate a tailored resume, cover letter and outreach with AI.

- **Your data stays in your browser** (localStorage). Export/import everything as JSON from the Resume page.
- **Bring your own free Gemini key** (Settings). It is stored only in your browser and forwarded to Google per request; it is never stored or logged by the server. Optionally set `GEMINI_API_KEY` on the server as a shared fallback.
- Optional "Load sample profile" fills demo data.

## Run
```
npm install
npm run dev     # http://localhost:3000
npm run build
```
On Vercel the AI routes are serverless functions in `api/ai/[action].ts`; locally they run through `server.ts`. Both share `server/handlers.ts`.

See `DESIGN.md` for the design tokens. License: MIT.
