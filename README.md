# Clay's Portfolio Site (Windows XP desktop)

A single-page portfolio styled as a Windows XP desktop. No build step — just HTML, CSS, and vanilla JS. Open `index.html` in a browser (or run a local server, see below) and everything works.

## Files

```
index.html      All the markup: desktop icons, every window's content, taskbar, start menu.
css/xp.css      The "window chrome" system — title bars, buttons, the .xp-window box itself.
                Reusable: any element with class="xp-window" + the title-bar markup gets full XP styling.
css/style.css   Everything specific to THIS desktop: wallpaper, taskbar, start menu, icon
                layout, and content styling (screenshot strips, the game embed box, mobile layout).
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

## Folders (Deckborn & Wrong Bird)

The two projects are **folders**, not single windows. A folder is an Explorer-style window whose body is `<div class="window-body folder-body">` containing an `.explorer-bar` (the "Address" strip) and a `.folder-view` grid of `.folder-item` icons. Each icon is either:
- a `<button class="folder-item" data-window="win-…">` that opens a **child window**, or
- an `<a class="folder-item" href="…">` external shortcut (e.g. the itch.io link).

Any element with `data-window="win-X"` opens window `win-X` — this is the same mechanism the desktop icons use, so folder icons need **no JS**. The child windows (game / devlogs / GDD / screenshots) are just more `<section class="xp-window">` blocks living in `index.html`; each project's set is grouped under a comment banner.

Naming convention: `win-deckborn` is the folder; its children are `win-deckborn-game`, `win-deckborn-devlogs`, `win-deckborn-gdd`, `win-deckborn-shots`, and devlog entries `win-deckborn-devlog-N`. Wrong Bird mirrors this.

### Adding a devlog entry

1. Copy an existing `<section class="xp-window" id="win-deckborn-devlog-1" …>` block, give it a new id (`…-devlog-2`), update `data-title`, and fill in the `.notepad-body` text.
2. In that project's Devlogs folder (`#win-deckborn-devlogs .folder-view`), add a matching `<button class="folder-item" data-window="win-deckborn-devlog-2">`.

### Adding GDD content

Edit the `.notepad-body` inside `#win-deckborn-gdd` / `#win-wrongbird-gdd` directly — the scaffold headings are placeholders to replace.

### Adding a third project folder

1. Add a folder `<section class="xp-window" id="win-newgame" …>` (copy Deckborn's folder block) plus its child windows.
2. Add a desktop icon button (`data-window="win-newgame"`) in `.desktop-icons` and a matching start-menu entry.
3. Draw or reuse SVG icons in `img/` (there's a folder icon per project, plus shared `icon-notepad`, `icon-gdd`, `icon-screenshots`).

No JS changes needed — `main.js` discovers windows and triggers by their `data-window` attribute automatically.

## Swapping in a real itch.io embed

Deckborn's embed is a direct `<iframe>` pointing at itch.io's HTML5 build URL (found by inspecting the "Run game" button's HTML on the itch.io page — it's the `data-iframe` attribute). If Clay re-uploads a new build to itch.io, that URL will change. To update it:

1. Go to the game's itch.io page, view page source, search for `data-iframe`.
2. Copy the `src="..."` value out of the embedded `<iframe>` markup.
3. Paste it into the `<iframe src="...">` in the `#win-deckborn` window in `index.html`.

Alternatively, itch.io's dashboard (Edit game → Distribute → Embed options) gives an official embed snippet you can drop in wholesale.

## Updating copy

- **Bio** — edit the paragraphs inside `#win-about .window-body` directly in `index.html`.
- **Contact info** — edit `#win-contact .window-body` (itch.io, email, and LinkedIn links all live there; LinkedIn is mirrored in the Start menu's external links list too).
- **Game pitches** — edit the `<p class="pitch">` text in each game's window.

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
