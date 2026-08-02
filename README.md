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
│   ├── index.html          # the plotline project page — shape described below
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
  `plotline/index.html`. `SURFACES` is for things you can open — the two apps
  (However Many Degrees of Whoever, The Missing Link), the reports, read-only
  Dagster, the dbt docs. The count beside the section head is `SURFACES.length`
  and the row numbers are the index, so both follow on their own. Note that
  `summary` is written into the row with `innerHTML`, so a literal `<` in it
  has to be an entity. The Reports section stays hidden while `REPORTS` is
  empty; an empty section that says "coming soon" reads as abandoned.
- **A build card** (plotline, "What I built"): add an entry to `BUILT` in
  `plotline/index.html` — `{kind, title, body, tags?, link?}`. `body` is a
  string, or an array of them for more than one paragraph. Unlike everything
  else on that page, this copy is written *there* rather than pulled out of
  `NODE_NOTES` — a card and a chip note can say different things and neither
  breaks the other, which also means nothing keeps them agreeing except
  reading both. Every field is set with `textContent`, so markup in one shows
  up as markup. A card with no `title` drops rather than rendering "undefined".
- **A chip note**: add an entry to `NODE_NOTES` in `plotline/index.html`, keyed
  by the chip's label text (trailing version numbers are stripped, so `React 19`
  finds `React`). One entry annotates that chip on *every* diagram. Each entry
  takes `why`, an optional `scar` (what it cost — these render in ochre and mark
  the chip with an asterisk), an optional `href`, and an optional
  `live: {url, label}` for an instance actually running, which marks the chip
  with a teal pip.

## The plotline page shape

The page runs at three altitudes, deliberately: **claim** (hero — tagline, the
one-box constraint, the demo, the figure strip), **proof** ("What I built" and
the live surfaces), then **depth** ("How it's built"). The demo used to be the
fifth section, behind four diagrams; anyone skimming left before reaching the
one thing that shows the system runs.

"What I built" replaced a section that promoted four chip scars onto the page.
The scars are still there, on the chips, marked ✲ — but every chip is a tool
that was *chosen*, and a page made only of those reads as an assembly of other
people's software. The four cards name the parts that had to be written.

"How it's built" is four views in one tab strip rather than four stacked
sections — three of them share the same lane/flow grammar, so read one after
another they read as repetition rather than as depth. Some mechanics worth
knowing before editing it:

- Panels are **hidden, never absent** — Ctrl-F and crawlers still reach every
  chip. Nothing is hidden in the markup: script hides the inactive panels and
  the tab strip is shown only under `.js`, so the two cannot disagree.
- `[hidden]{display:none!important}` in `style.css` is load-bearing.
  `.diagram`, `.topo` and `.entries` all set `display`, which otherwise
  silently defeats the plain `hidden` attribute.
- `reveal.js` adds `.in` on intersection, and a hidden panel never intersects.
  The tab controller therefore hands `.in` to the cards in a panel it opens —
  without that they sit at `opacity:0` and the tab looks empty.
- Each view is deep-linkable (`#stack`, `#data`, `#day`, `#deploy`), written
  with `replaceState` so switching views doesn't fill the back button with
  four copies of the same page.

The `SOURCE` constant near `SURFACES` is the link to the plotline repository.
Left `null` the hero prints "Source is private — happy to walk through it."
rather than a button that goes nowhere. Set it or leave it, but don't delete
the line: a portfolio page with no code link and no mention of one reads as
though there is no code.

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

The widget sits in the hero, as its evidence. It is hidden in the markup and
unhidden by its own script, so that without JavaScript the page carries no
form that cannot be submitted.

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
