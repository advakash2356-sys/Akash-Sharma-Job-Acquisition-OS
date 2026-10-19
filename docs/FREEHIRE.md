# FreeHire integration: verification notes

Checked 2026-10-19 from the repo, its docs and live requests.

## What it is
- Repo https://github.com/strelov1/freehire, **MIT licence** (LICENSE: "Copyright (c) 2026 freehire contributors"). Hosted at https://freehire.me. Active (last push 2026-10-18).
- README: "public, keyless HTTP API"; 225 sources (ATS platforms such as Workday, Greenhouse, Lever, plus aggregators), 3.3M+ open postings. Reference: https://freehire.me/docs/api (generated from `docs/API.md`).
- Marketed as an **IT** job aggregator, but aggregator sources also carry legal and operations roles (see test below).

## Endpoint used
`GET https://freehire.me/api/v1/jobs/search`
- `q` full text (quoted = order-independent AND), `q_fields=title`, `limit` 1-100, `offset` (offset+limit <= 10000), `sort`, `order`.
- Facets (comma = OR): `countries=IN`, `work_mode=remote`, `regions=global,apac`. Geography facets (`regions`, `countries`, `cities`) widen each other (OR); other facets AND. Unknown params are ignored and reported in `meta.ignored_params`.
- Response: `{"data":[job...],"meta":{"total","limit","offset"}}`; errors `{"error": msg}`. Job fields we use: `public_slug`, `title`, `company`, `location`, `url` (original employer/ATS link), `posted_at`, `source`, `work_mode`, `description`, `skills`, `closed_at`.

## Limits, CORS, terms
- Rate limit: response headers `x-ratelimit-limit: 600` (per minute). The app makes at most 8 upstream calls per search.
- CORS: docs say job/search endpoints "may be called cross-origin", but we call it **server-side** through `/api/jobs/search`, so the browser never contacts FreeHire.
- Terms (https://freehire.me/terms, 2026-10-16): "no scraping beyond our documented API, no attempting to bypass rate limits or authentication". We use only the documented API and stay far under the limit. Listings are third-party content, not guaranteed open ("we don't guarantee a listing is still open"). No attribution requirement was found; we label every job "FreeHire" anyway.
- Uptime: no SLA is published. One probe returned 200 in about 0.6 s. The app handles failure with an explicit error plus job-board search links.

## Live test (2026-10-19)
| Query (title only) | Filter | Total matches |
|---|---|---|
| "contract manager" | countries=IN | 425 |
| "legal operations" | countries=IN | 192 |
| "contract manager" | remote, regions=global,apac | 25 |
| "legal operations" | remote, regions=global,apac | 4 |
| "contract manager" | remote (any region) | 296 (mostly US-only, so not used) |

Every one of 100 sampled India results had an `http(s)` URL and a `posted_at`. Top sources: workday, oracle, greenhouse, smartrecruiters, zohorecruit.

## How the app uses it
- `server/jobsSearch.ts` (`api/jobs/search.ts`, and Express route in dev): validates input (<= 4 titles, 2-letter country codes), caches identical searches 10 min (in memory, per server instance), limits 12 searches/min per client IP, validates each result (needs title, company, http(s) URL, slug; drops closed), dedupes by slug, URL and title+company+location, returns <= 40 newest.
- Data sent to FreeHire: titles, country codes, remote flag. Not the resume.
- Gemini (`fit-jobs`) only scores fit and writes one-line summaries for postings FreeHire returned. On Gemini failure the UI uses a keyword-match score and labels it.

## Other sources evaluated
- **SarkariMap RSS** (public feed, read server-side, 30-min cache): used for government notices; labelled as an aggregator, last date parsed and required to be in the future.
- **FreeHire official-source postings**: used only when the text has a .gov.in/.nic.in link and a future last date.
- Not used: NCS / DSSSB / SSC / Employment News (no open API; scraping not permitted), Adzuna and Jooble (need keys), Apify scrapers (paid / ToS risk), JobsForce India (not verified as maintained).
