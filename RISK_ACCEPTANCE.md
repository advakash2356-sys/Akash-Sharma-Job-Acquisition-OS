# Risk acceptance: /api/gov/postings rate limit (PR #27)

- **Decision:** Akash chose to accept this as a known residual risk, with a user-facing declaration on /gov-jobs (1 Nov 2026, t313u, clarified t315u): postings are scraped/aggregated from public feeds, not an official government site; hiring takes time; no personal data collected; verify on the official notice; rate limit and cache explained.
- **Finding:** Website Testing Final, Medium. Bursts of 60+ requests in about 2 minutes all returned 200. The in-memory limit is per instance, and the Vercel Firewall rule (12/min/IP) did not reliably return 429 in tests on preview (share-link cookie) or prod.
- **Why acceptable for now:** public, read-only list of government postings; no personal data in or out; upstream feeds fetched at most once per 30 minutes per instance; origin check (403 for other sites), `Vary: Origin`, query strings rejected (400), errors not cached.
- **Conditions (must stay true):** keep the 30-minute server cache; never add personal fields; keep the origin check and the Firewall rule "Rate limit gov postings API".
- **After merge:** burst-test PRODUCTION `/api/gov/postings` and record whether the Firewall returns 429; turn on Vercel spend alerts; if abuse or cost appears, add a shared limiter (for example Upstash Redis free tier, with Akash's OK).
- **Review date:** 1 Dec 2026.

Akash Sync Agent
