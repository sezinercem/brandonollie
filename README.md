# Goldkrest Group

A five-page Goldkrest Group website with the supplied brand artwork, gold (#BDB04C) and olive (#303A1C) palette, and a continuously animated geometric background. Pages: Home, Brickwork, Landscaping, Pressure Washing and Contact Us. Includes server-rendered metadata, request protection and launch controls.

Background motion can be paused, remembers that preference locally and respects reduced-motion device settings. Contact links use the supplied telephone and email; the email link can carry the selected service into the subject. There is no server-side contact form or stored enquiry data.

## Local development

Use Node 24 and npm. Run `npm run install:ci`, then `npm run build` to generate the local Worker configuration. Apply the initial local database migration once:

```sh
node --import ./scripts/sites-env.mjs ./node_modules/wrangler/bin/wrangler.js d1 execute DB --local --config dist/server/wrangler.json --persist-to .wrangler/state --file drizzle/0000_panoramic_rhodey.sql
npm run dev
```

The development preview uses port 5173. `npm start -- --port 4173` serves the production build locally. Both use `.wrangler/state`. Production migrations are applied by Sites during deployment. Do not replay an already-applied migration; append new migrations for subsequent schema changes.

## Metadata and launch

`lib/site.ts` owns the name, title, description, language, locale, canonical domain, search-engine verification tokens and optional business information. Root metadata includes Open Graph and Twitter cards, responsive viewport, theme colour, favicon and web manifest. No social image is invented.

Indexing is OFF by default. This produces `noindex, nofollow` in HTML and response headers, disallows crawling in robots.txt, omits structured data and leaves the sitemap empty. Before public launch:

1. Confirm the canonical HTTPS domain and language/locale in `lib/site.ts`. The supplied Goldkrest business name, description, email and telephone are already configured.
2. Review the five pages and their service copy. They already have distinct page metadata and sitemap entries. Add page-specific metadata and sitemap entries for future routes.
3. Complete applicable business fields; add verified address/hours and a specific LocalBusiness subtype only when the business details are known. No fabricated reviews, ratings, locations or services.
4. Connect and verify the domain with the hosting provider. Set `indexable: true` only after the real content is ready and the domain is configured.
5. Configure Google/Bing verification and submit the sitemap using the owner's accounts. Search rankings cannot be guaranteed by technical setup.

The current preview is owner-private. Its noindex setting is separate from access control. There are no accounts, contact forms, cookies, analytics, payments, uploads or external embeds in this foundation.

## Security and request limits

The request proxy supplies a unique cryptographic CSP nonce, disallows framing and plugins, restricts browser permissions, disables MIME sniffing, and adds referrer, opener and HTTPS transport policies. HTML is not cached because it contains a per-request nonce. Production scripts/styles do not permit unsafe-inline or unsafe-eval. Development only relaxes the policy for hot reload. Static assets bypass application rate counting and use the host's asset handler, with nosniff, frame and referrer headers configured through public/_headers.

Only GET and HEAD are allowed. Write requests return 405; URLs longer than 4096 characters return 414. No user-controlled content is rendered. JSON-LD escapes HTML delimiters. Keep secrets out of Git; `.env.example` is the only tracked environment file.

Dynamic requests share a D1-backed 120-request budget per trusted Cloudflare client IP per fixed 60-second window. The counter is atomic and shared across Worker instances. The next window starts a fresh budget, so short bursts across a boundary can reach twice the nominal limit. All dynamic paths share a bucket, including 404s and SEO routes; static assets are excluded. Rejected requests return 429 with Retry-After. Storage failures fail closed with 503. Local development intentionally shares a local-preview bucket. Production must run behind the trusted Cloudflare edge, which sets CF-Connecting-IP; do not deploy the same trust policy behind an arbitrary proxy.

Only a rotating SHA-256-derived client key is stored, never the raw IP address. This is pseudonymisation, not guaranteed anonymisation. Expired keys are eligible for deletion after at most two minutes; each request removes up to 100 expired records. During inactivity or heavy backlog, expired records remain until later cleanup requests. No client identifiers are written to application logs.

This application limit is not a substitute for provider-level DDoS protection, bot controls, cost limits or monitoring. Configure those for the final hosting/domain plan. Shared-IP networks share a budget. If forms, authentication, uploads or APIs are added, implement input validation, origin/CSRF checks, authorization, payload limits and tighter endpoint-specific budgets before enabling writes.

## Checks

```sh
npm run typecheck
npm test
npm run build
npm audit --audit-level=high
# With the built local server running, in a fresh rate-limit window:
node tests/http-smoke.mjs
```

The SQL tests check simultaneous callers, independent clients, window resets, expiry cleanup and failure behaviour. The HTTP smoke check verifies metadata, nonce propagation, headers, 404/405 responses, robots/sitemap/manifest and the 429 boundary. It uses example IPs only against the local server. CI runs type checking, unit tests, build and dependency security checks. Audit findings should be reviewed after dependency updates, including packages labelled development-only that are bundled into the Worker.

The GitHub origin remains `sezinercem/brandonollie`. Sites publication uses a separate source repository with short-lived per-command authentication; no credential is stored in the repository.
