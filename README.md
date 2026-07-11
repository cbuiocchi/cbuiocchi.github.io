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

## Adding a third game window (e.g. All Hands on Deck!)

1. Copy one of the existing `<section class="xp-window">` blocks in `index.html` (Deckborn's is the closest match if it'll have a playable embed; Wrong Bird's if it's download-only).
2. Give it a new unique `id` (e.g. `win-ahoad`) and update `data-title`.
3. Add a matching desktop icon button (`data-window="win-ahoad"`) in `.desktop-icons`, and a matching entry in the start menu list.
4. Draw or reuse an SVG icon in `img/` for it and reference it in both the icon button and the title bar.

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
