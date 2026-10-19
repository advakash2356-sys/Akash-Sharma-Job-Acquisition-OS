# Search engines and channel links (owner steps)

## Google Search Console (Akash, with his Google account)
1. Open https://search.google.com/search-console and click **Add property**.
2. Choose **URL prefix** and enter `https://akash-sharma-job-acquisition-os.vercel.app/` (the Domain option needs DNS access, which a vercel.app address does not give you).
3. Pick **HTML tag**. Copy only the `content="…"` value.
4. In `index.html`, uncomment `<meta name="google-site-verification" …>` and paste the value. Commit to main; Vercel redeploys.
5. Back in Search Console click **Verify**. Then open **Sitemaps** and submit `sitemap.xml`.
6. Use **URL inspection** on `/`, `/about`, `/privacy` and click **Request indexing**.

## Bing Webmaster Tools
1. Open https://www.bing.com/webmasters and sign in.
2. Easiest: **Import from Google Search Console** (after step 5 above). Or add the site, choose **HTML meta tag**, paste the code into the `msvalidate.01` line in `index.html`, uncomment, deploy and verify.
3. Submit `https://akash-sharma-job-acquisition-os.vercel.app/sitemap.xml`.

## What is already in place
- Canonical URL, title and description per page (set when the page opens), Open Graph and Twitter card, `og.jpg` 1200×630.
- JSON-LD: `Organization` (Akash Sync Agent) and `WebApplication` (Momentum, free, price 0). No ratings or reviews: add them only if they become real.
- Clean public URLs `/about`, `/terms`, `/feedback`, `/privacy` (rewrites in `vercel.json`), listed in `sitemap.xml`; `robots.txt` points to the sitemap.

## Channel links (GoatCounter counts the source)
Each link carries `ref=<channel>`; GoatCounter shows it under **Campaigns / Referrers**, and an event `from_<channel>` is counted too.

| Channel | Link |
|---|---|
| Instagram | https://akash-sharma-job-acquisition-os.vercel.app/?ref=instagram&utm_campaign=launch-oct26 |
| YouTube | https://akash-sharma-job-acquisition-os.vercel.app/?ref=youtube&utm_campaign=launch-oct26 |
| Facebook | https://akash-sharma-job-acquisition-os.vercel.app/?ref=facebook&utm_campaign=launch-oct26 |
| LinkedIn | https://akash-sharma-job-acquisition-os.vercel.app/?ref=linkedin&utm_campaign=launch-oct26 |
| X | https://akash-sharma-job-acquisition-os.vercel.app/?ref=x&utm_campaign=launch-oct26 |
| WhatsApp | https://akash-sharma-job-acquisition-os.vercel.app/?ref=whatsapp&utm_campaign=launch-oct26 |
| In-app "Share with a friend" | https://akash-sharma-job-acquisition-os.vercel.app/?ref=share |
