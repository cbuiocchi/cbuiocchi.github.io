# Clay's Portfolio Site (Windows XP desktop)

A single-page portfolio styled as a Windows XP desktop. No build step — just HTML, CSS, and vanilla JS. Open `index.html` in a browser (or run a local server, see below) and everything works.

## Files

```
index.html      All the markup: desktop icons, every window's content, taskbar, start menu.
css/xp.css      The "window chrome" system — title bars, buttons, the .xp-window box itself.
                Reusable: any element with class="xp-window" + the title-bar markup gets full XP styling.
css/style.css   Everything specific to THIS desktop: wallpaper, taskbar, start menu, icon
                layout, the project mini-sites, and content styling (game embed box, mobile layout).
js/main.js      The window manager. One IIFE, no framework. Handles: opening/closing/minimizing
                windows, dragging by the title bar, z-order/focus, the taskbar buttons, the start
                menu, the clock, and the boot-screen intro.
img/            Desktop icons (SVG, hand-drawn to match XP style) + downloaded itch.io screenshots.
```

## How a window works

Every window is a `<section class="xp-window" id="win-something">` in `index.html` with:
- a `.title-bar` (icon, text, minimize/maximize/close buttons)
- a `.window-body` (your actual content — put whatever HTML you want in here)

`main.js` finds every `.xp-window` on page load and wires up dragging + the three buttons automatically. You don't need to touch JS to add content to an *existing* window — just edit the HTML inside `.window-body`.

A window can preset its opening size/position with optional `data-width` / `data-height` / `data-left` / `data-top` attributes on the `<section>` (in px). Without them it opens at the cascaded 620×480 default.

## Project sites (Deckborn & Wrong Bird)

Each project is a single **browser-style window** holding a whole mini website, so a visitor sees everything about a game on one scrolling page instead of clicking through folders. `#win-deckborn` and `#win-wrongbird` are `<section class="xp-window browser-window site-…">` blocks whose body is `<div class="window-body site-body">` containing:

- an `.explorer-bar` (the "Address" strip, pinned at the top), then
- a `.site-page` (the scrolling page) holding a fixed-width `.site-wrap`, laid out like a mid-2000s fan site: a `.site-hero` banner, a sticky `.site-nav` jump bar, then `.site-columns` with the content (`.site-main`, one boxed `.site-section` per topic) and a `.site-sidebar` of little `.side-box` panels, and finally a `.site-footer` with fake 88x31 `.web-badges`.

Deckborn's sections are Play (the embedded build), Devlogs, GDD, and Links; Wrong Bird's are About, Screenshots, GDD, and Links.

The nav links carry `data-scroll-to="<section id>"`; `main.js` scrolls the page *inside* the window (a plain `#anchor` jump would also scroll the desktop). Any link with `data-scroll-to` inside a `.site-page` works this way (the sidebar's devlog links use it too), so no JS changes are needed to add a section. Just add the section and a nav link.

Styling lives under `PROJECT SITES` in `css/style.css`. The shared rules there only handle layout; each game then has its own themed block:

- **Deckborn: fantasy.** A starry night banner with a floating fan of cards, a gilded nav bar, a "town crier" ticker (a CSS stand-in for `<marquee>`; update its text when a new devlog goes up), parchment panels under royal-purple title bars, Cinzel / IM Fell English type, and a Quest Log in the sidebar. The palette is the pop-up ad's purple and gold, set as `--db-*` variables on `.site-deckborn`.
- **Wrong Bird: cartoon.** Sky and falling snow, an inline-SVG cartoon penguin in flight goggles flapping in the banner, Luckiest Guy / Fredoka type with chunky outlines, glossy gel buttons, taped-down polaroid screenshots, and a CSS-only sidebar poll. The palette is set as `--wb-*` variables on `.site-wrongbird`.

The web fonts come from Google Fonts (linked in `<head>`); each stack falls back to classic web-safe fonts. When the window gets narrower than 640px (resized, or on a phone), a container query drops the sidebar under the content. All the motion (ticker, twinkling stars, penguin, snow) turns off under `prefers-reduced-motion: reduce`. The visitor counters are static numbers, just for the 2005 look.

### Adding a devlog entry

Devlogs live inline in Deckborn's `#deckborn-devlogs` section, newest first.

1. Copy an existing `<article class="devlog" id="deckborn-devlog-N">`, put it at the top of the list, give it the next id, and fill in the header (`Entry NN`, title, `<time>`) and body (`<h4>` headings, `<ul>` bullets, and a closing `<h4 class="devlog-reflection-head">Reflection</h4>` + `<p class="devlog-reflection">`).
2. Add a matching line to the `.devlog-index` list at the top of the section (and update the sidebar's "Latest Chronicles" box and the ticker text): `<li><a href="#deckborn-devlog-N" data-scroll-to="deckborn-devlog-N"><span>Mon D</span> Title</a></li>`.

### Updating GDD content

Both GDDs are real PDFs at the repo root: `Deckborn_GDD.pdf` and `Wrong_Bird_GDD.pdf`. Each site's GDD section has a one-line summary, "Open in new tab" / "Download PDF" buttons, and an embedded `<iframe data-src="…_GDD.pdf" loading="lazy">`. `main.js` loads every `data-src` iframe in a window when it opens (and unloads them on close); `loading="lazy"` holds the PDF off until it's scrolled near. On mobile the embeds are hidden and only the buttons show. To update one, overwrite its PDF. Keep it small (the committed copies have their images recompressed to JPEG: Deckborn ~2MB vs. a 16MB export, Wrong Bird ~1.3MB vs. 15MB).

### Adding a third project

1. Copy one of the site `<section>` blocks, give it a new id (`win-newgame`) and a new `site-newgame` class, and write a themed `.site-newgame` block in `style.css` (the shared layout rules work without one, but they're deliberately undressed).
2. Add a desktop icon button (`data-window="win-newgame"`) in `.desktop-icons` and a matching start-menu entry.
3. Draw or reuse SVG icons in `img/` (there's a folder icon per project for the desktop, plus shared `icon-notepad`, `icon-gdd`, `icon-screenshots` used as section icons).

No JS changes needed. `main.js` discovers windows and triggers by their `data-window` attribute automatically.

## The Deckborn pop-up ad

`#win-deckborn-ad` is a fake XP-era popup ad for Deckborn, in the game's royal-purple-and-gold palette. It's a normal `.xp-window`, so it drags, focuses, and reflows on mobile like every other window — but it only has a **close** button (no minimize/maximize) and it deliberately stays out of the taskbar, so closing it is final.

- **Markup** — the `<section class="xp-window ad-window">` block near the top of `index.html`, before the Welcome window. It sits first in the window order on purpose: on mobile, windows stack in DOM order, so that puts the ad at the top of the page.
- **Styling** — the `.ad-window` block in `css/style.css`. The purple/gold palette is defined as CSS variables scoped to `.ad-window`, so it can't leak into the normal windows. Change `--db-purple` / `--db-gold` there to retune the colors.
- **Behavior** — `openAd()` in `js/main.js`, called ~1.2s after the boot screen clears. On desktop it parks itself against the right edge, vertically centered and clear of the Welcome window; on mobile the responsive rules drop it into the page flow and the JS leaves its geometry alone.
- **Link** — the `.ad-cta` anchor points at `https://claybuiocchi.itch.io/deckborn-ue5`.

All the animation (marquee, blinking kicker, pulsing button, pop-in) is disabled under `prefers-reduced-motion: reduce`.

Because the ad has no minimize/maximize button, `main.js` binds the title-bar controls through `bindControl()`, which skips any control a window doesn't have. Windows can safely omit controls.

## Swapping in a real itch.io embed

Deckborn's embed is a direct `<iframe>` pointing at itch.io's HTML5 build URL (found by inspecting the "Run game" button's HTML on the itch.io page — it's the `data-iframe` attribute). If Clay re-uploads a new build to itch.io, that URL will change. To update it:

1. Go to the game's itch.io page, view page source, search for `data-iframe`.
2. Copy the `src="..."` value out of the embedded `<iframe>` markup.
3. Paste it into the `data-src` of the `<iframe>` in the `#deckborn-play` section of `index.html`.

Alternatively, itch.io's dashboard (Edit game → Distribute → Embed options) gives an official embed snippet you can drop in wholesale.

## Updating copy

- **Bio** — edit the paragraphs inside `#win-about .window-body` directly in `index.html`.
- **Contact info** — edit `#win-contact .window-body` (itch.io, email, and LinkedIn links all live there; LinkedIn is mirrored in the Start menu's external links list too).
- **Game pitches** — edit the `<p class="pitch">` text in each project site (and the `.site-hero` tagline and facts above it).

## Running locally

Any static file server works, e.g. from this folder:

```
npx serve .
```

or

```
python -m http.server 8000
```

Then open `http://localhost:8000` (or whatever port it prints).

## Deploying to GitHub Pages

```
git init
git add .
git commit -m "Initial XP portfolio site"
gh repo create cbuiocchi.github.io --public --source=. --push
```

Then in the repo's Settings → Pages, set the source to the `master`/`main` branch, root folder. The site goes live at `https://cbuiocchi.github.io` within a minute or two. (If you'd rather not use a user-site repo name, any repo name works too — it'll just live at `https://cbuiocchi.github.io/<repo-name>` instead, and GitHub Pages needs to be turned on manually in Settings either way.)
