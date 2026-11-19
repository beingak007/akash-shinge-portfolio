# Akash Shinge — Portfolio

Personal site for **Akash Shinge**, Senior Software Engineer. Visual concept: **SYSTEM // HUMAN**.

## Stack

- React 19.3
- Vite
- TypeScript (strict)
- GSAP + ScrollTrigger + useGSAP
- Lenis (smooth scroll, wired to ScrollTrigger)

Requires Node 20.19+ or 22.12+ (Node 24 recommended; see `.nvmrc`).

## Scripts

```bash
npm install
npm run dev
npm run typecheck
npm run lint
npm run build
npm run preview
```

## Updating content

Edit files in `src/data/` only:

- `profile.ts` — name, LinkedIn, LeetCode, GitHub, email, canonical URL
- `leetcode.ts` — accepted counts from the public beingak007 profile
- `experience.ts` — roles and dates (do not invent missing dates)
- `projects.ts` — add GitHub / live / case-study URLs when they exist. Each
  project's `cover` lays out its generated preview (1600 × 1000 canvas); set
  `image` to a real screenshot path to replace it. `challenges` describe what
  makes the design hard, not results.
- `capabilities.ts` — the "What I do" disciplines
- `stats.ts` — About-section numbers, derived from `leetcode.ts`,
  `technologies.ts`, and `experience.ts` (nothing typed in by hand)
- `technologies.ts` — stack map, architecture playground, and the
  `coreSkillIds` shown in the skills marquee

Portraits:

Each photo appears exactly once on the page:

- `public/profile-desk.jpg` — at the laptop (hero; also the social share image)
- `public/profile-standing.jpg` — standing by the café table (About)
- `public/profile.jpg` — café portrait (Contact)

Add new portraits to `photoSizes` in `profile.ts` with their pixel size.

Email stays `null` until you add it. While it is `null`, the big Contact CTA
opens LinkedIn; once set, it becomes a `mailto:` link with a copy button.

## Motion and interaction

- `src/animations/mediaFx.ts` — the shared image interaction (tilt, magnetic
  drift, pointer light, animated border, press ripple, distortion pulse).
  Add `className="fx"` + `<FxLayers />` and call `useMediaFx(ref)`.
- `[data-split]` on a heading gives it the scroll-triggered line reveal.
- `src/utils/haptics.ts` — short Vibration API ticks (Android browsers only;
  everything else gets the visual buzz).
- Everything respects `prefers-reduced-motion`.

## Search (Google)

The live site is the official page for **Akash Shinge**, served at
`https://akash-shinge.vercel.app` (the only host that is indexable — every
other Vercel URL for this project sends `X-Robots-Tag: noindex`, see `vercel.json`).

What the code already does:

- The first HTML response contains the real content (name in the only `<h1>`,
  role, summary, skills, projects, experience, links), generated at build time
  from `src/data` by `src/seo/crawlerMarkup.ts`. React replaces it on load.
- `index.html` carries the title, description, canonical URL, Open Graph,
  `rel="me"` identity links, and `Person` structured data.
- `public/sitemap.xml` lists the page and its portraits.

What only the owner can do (once, after a deploy):

1. Open [Google Search Console](https://search.google.com/search-console) →
   **Add property** → URL prefix `https://akash-shinge.vercel.app/`.
2. Verify with the **HTML file** method: the file Google issued lives at
   `public/google845e6b7589a64793.html` (keep it; deleting it un-verifies the
   site), then click **Verify**.
3. **Sitemaps** → submit `https://akash-shinge.vercel.app/sitemap.xml`.
4. **URL inspection** → the home page → **Request indexing**.
5. Link the site from LinkedIn (Contact info → Website) and the GitHub profile.

Indexing usually takes a few days to a few weeks.

## Free host

This is a static Vite app. `npm run build` writes `dist/`. No server is required.

### Vercel (recommended)

1. Push this repo to GitHub (`beingak007/akash-shinge-portfolio`).
2. Open [vercel.com](https://vercel.com) → Sign in with GitHub → **Add New Project** → select the repo.
3. Keep the Vite defaults: build `npm run build`, output `dist`.
4. Production is live at `https://akash-shinge.vercel.app` (also `https://beingak007.vercel.app`).

Do not set `BASE_PATH` on Vercel. It must stay `/`.

### GitHub Pages (backup, automatic)

Pushes to `main` run [`.github/workflows/pages.yml`](.github/workflows/pages.yml) and publish:

`https://beingak007.github.io/akash-shinge-portfolio/`

In the GitHub repo: **Settings → Pages → Source: GitHub Actions**.

After the first live URL exists, set `links.website` and `seo.canonicalUrl` in `src/data/profile.ts` (and the same URL in `index.html`). Do not invent a domain before deploy.
