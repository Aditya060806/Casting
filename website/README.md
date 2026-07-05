# Casting — Website

The public landing + docs site for [casting-cli](https://www.npmjs.com/package/casting-cli).

It's a **zero-build static site** (HTML + CSS + vanilla JS) — no framework, no dependencies.

## Local preview

Just open `index.html` in a browser, or serve the folder:

```bash
npx serve .
# or
python -m http.server 5173
```

## Deploy to Vercel

This folder is fully configured for Vercel.

1. Import the GitHub repo `Aditya060806/Casting` into Vercel.
2. In **Project Settings → General**, set **Root Directory** to `website`.
3. **Framework Preset:** `Other` · **Build Command:** _(leave empty)_ · **Output Directory:** _(leave empty)_.
4. Deploy. Vercel serves the static files directly.

`vercel.json` handles clean URLs, caching, and security headers.

## Files

| File | Purpose |
|------|---------|
| `index.html` | Landing page + documentation |
| `styles.css` | Theme, layout, animations |
| `app.js` | Starfield, reveal-on-scroll, typed terminal, tabs, copy buttons |
| `favicon.svg` | Site icon |
| `vercel.json` | Vercel static hosting config |

Built by [Aditya Pandey](https://www.linkedin.com/in/aditya-pandey-p1002/).
