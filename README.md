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
- `projects.ts` — add GitHub / live / case-study URLs when they exist
- `technologies.ts` — stack map and architecture playground

Portraits:

- `public/profile.jpg` — café photo (hero, about, nav, contact)
- `public/profile-leetcode.jpg` — second photo (LeetCode section)

Email stays `null` until you add it.

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
