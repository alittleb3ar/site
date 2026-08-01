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
│   ├── node-notes.js       # click-to-open chip notes (plotline, both diagrams)
│   ├── favicon.svg         # ~/ prompt mark
│   ├── og-image.png        # 1200×630 social/link-preview image
│   └── logos/              # "worked with" SVG marks
├── pyloseq/
│   ├── index.html          # notebook index (lazy-loaded iframes)
│   └── notebooks/          # nbconvert HTML exports
├── plotline/
│   ├── index.html          # architecture, data model, schedule, deployment,
│   │                       #   live demo, surfaces, reports
│   └── stats.json          # generated in the plotline repo — see below
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
- **A plotline surface / report**: append to `SURFACES` or `REPORTS` in
  `plotline/index.html`. `SURFACES` is for things you can open — the app, the
  reports, read-only Dagster, the dbt docs. The Reports section stays hidden
  while `REPORTS` is empty; an empty section that says "coming soon" reads as
  abandoned.
- **A chip note**: add an entry to `NODE_NOTES` in `plotline/index.html`, keyed
  by the chip's label text (trailing version numbers are stripped, so `React 19`
  finds `React`). One entry annotates that chip on *every* diagram. Each entry
  takes `why`, an optional `scar` (what it cost — these render in ochre and mark
  the chip with an asterisk), an optional `href`, and an optional
  `live: {url, label}` for an instance actually running, which marks the chip
  with a teal pip.

## The plotline figure strip

The numbers under the plotline hero are read from `plotline/stats.json` at page
load. That file is **generated in the plotline repo**, not edited here:

```sh
# in the plotline repo, on a machine that can see the warehouse
python scripts/export_site_stats.py path/to/site/plotline/stats.json \
    --snapshot warehouse/analytics.duckdb \
    --graph warehouse/person_graph.duckdb
```

Figures countable from the catalog need neither flag. Figures marked
`"source": "documented"` are numbers from the project's own docs rather than
measurements — the page prints those with a leading `~` and says so under the
strip, and they are replaced the first time the script runs somewhere the
warehouse is reachable. A run that can't see the warehouse merges over the
existing file rather than deleting what a run that could see it wrote.

If the fetch fails the strip simply doesn't render. No strip beats a wrong one.

## The live degrees demo

The widget lives in the Live surfaces list, moved under the first entry at
render time — it is that entry, playable, rather than a section of its own.

It calls `plotline.mpdonovan.com/api/person-graph` directly. That
is a cross-origin call, so it works only while the plotline deployment sets
`PORTFOLIO_ORIGIN=https://mpdonovan.com`. Without it — or while the person graph
is mid-rebuild, when the API answers 503 by design — the widget shows a labelled
example instead. That fallback is the documented behaviour, not an error path,
so don't "fix" it by removing it.

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
