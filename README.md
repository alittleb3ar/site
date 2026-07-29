# mpdonovan.com

Source for my personal site — a static, hand-authored portfolio served from GitHub
Pages at [mpdonovan.com](https://mpdonovan.com). No build step, no framework: plain
HTML, one shared stylesheet, and a little vanilla JavaScript.

## Layout

```
.
├── index.html              # home — hero, project list, about, contact
├── assets/
│   ├── style.css           # the whole design system (shared by every page)
│   ├── reveal.js           # scroll-reveal (.in) for cards as they enter view
│   ├── node-notes.js       # click-to-open "why this tech" popovers (plotline)
│   ├── favicon.svg         # ~/ prompt mark
│   ├── og-image.png        # 1200×630 social/link-preview image
│   └── logos/              # "worked with" SVG marks
├── pyloseq/
│   ├── index.html          # notebook index (lazy-loaded iframes)
│   └── notebooks/          # nbconvert HTML exports
├── plotline/
│   └── index.html          # architecture + deployment diagram, apps, reports
├── CNAME                   # custom domain for GitHub Pages
└── .nojekyll               # serve files as-is, skip Jekyll
```

Each page pulls the shared `assets/style.css`, so the theme (colors, type, spacing)
lives in one place — the `:root` custom properties at the top. A dark variant is
provided under `@media (prefers-color-scheme: dark)`.

## Adding content

The content on each page is driven by a small array near the bottom of that page's
HTML — edit the array, no templating required.

- **A project** (home): add an object to `PROJECTS` in `index.html`
  (`title`, `lang`, `status`, `desc`, `stack`, `link`, `open`, `viz`). `viz` picks the
  little canvas figure: `scatter`, `bars`, or `line`.
- **A pyloseq notebook**: export it with `jupyter nbconvert --to html nb.ipynb`, drop
  the HTML in `pyloseq/notebooks/`, then add an entry to `NOTEBOOKS` in
  `pyloseq/index.html` pointing `file` at it.
- **A plotline app / report**: append to `APPS` or `REPORTS` in `plotline/index.html`.
- **A deployment-diagram note**: add a `label: "why this was picked"` pair to
  `NODE_NOTES` in `plotline/index.html`.

## Local preview

No build. Serve the folder over HTTP so relative paths and iframes resolve:

```sh
python3 -m http.server 8000
# then open http://localhost:8000
```

## Deploy

Push to the default branch — GitHub Pages publishes from the repository root. `CNAME`
sets the custom domain and `.nojekyll` disables Jekyll processing.

## Notes

- The site is intentionally dependency-light: the only third party is Google Fonts.
- Every animation respects `prefers-reduced-motion`.
- Regenerate `assets/og-image.png` from the scratch HTML if the hero copy changes.
