# Busy Bidder — standalone app

A complete, self-contained web app. No Claude account, no install from a store, no server
behind it. Put these files on any web host and it becomes an installable app on any phone.

## The files

| File | What it is |
| --- | --- |
| `index.html` | The whole app — markup, styles and code in one file |
| `sw.js` | Service worker. Stores the app on the device so it opens with no signal |
| `manifest.webmanifest` | Tells the phone the name, icon and colors when it's added to the home screen |
| `icon-192.png`, `icon-512.png`, `icon-180.png`, `favicon-32.png` | App icons |

All five must sit in the same folder, and the folder must be served over **https**
(or `http://localhost`). Service workers refuse to run over plain http, and without the
service worker the app won't open offline.

## Its permanent home — GitHub Pages

The address the app lives at is also the address its data is stored under, so pick one and
keep it. Moving to a different URL later means every phone starts empty.

1. Make a free account at <https://github.com>
2. **New repository** — name it `bid-walkthrough`, set it **Public**, create it
3. **Add file → Upload files**, drag all eight files in (not the folder — the files
   themselves, so they land at the top level), then **Commit changes**
4. **Settings → Pages**. Under *Branch* choose `main` and `/ (root)`. **Save**
5. Wait a minute or two, then load
   `https://YOUR-USERNAME.github.io/bid-walkthrough/`

Free, permanent, https included, and every update is one file upload.

## Pushing an update

1. Bump the version string at the top of `sw.js`:
   ```js
   const VERSION = "bw-2026-08-25-3";   // change the trailing number
   ```
2. Upload the new `index.html` **and** the new `sw.js` to the repo.

That's it. Nobody needs a new link and nobody reinstalls. The next time each phone opens
the app with a connection, it notices the new version, downloads it in the background, and
shows a bar at the bottom: *A newer version is ready* with an **Update** button. Tapping it
swaps to the new build in about a second. Walkthroughs, photos, rates and the saved email
address all survive — the update replaces the app, never the data.

Until they tap Update they keep running the version they have, so nobody gets yanked into a
new build in the middle of a walkthrough. There's also a **Check for a newer version**
button under the gear icon for anyone who wants to pull it early.

**Forgetting to bump `VERSION` means nobody gets the update.** It is the only signal.

## Putting it on a phone

Open the URL in the phone's browser, then:

- **iPhone (Safari):** Share button → *Add to Home Screen*
- **Android (Chrome):** ⋮ menu → *Add to Home screen* or *Install app*

It gets an icon and opens full-screen with no browser bars. **Open it once while you have
a connection** — that first load is when the app copies itself onto the device. After that
it opens with no signal at all. Settings tells you whether it's stored: *"Stored on this
device — it opens with no signal."*

Use the home-screen icon from then on, not the browser. Phones keep separate storage for
each, so a walkthrough started in the browser may not appear under the icon.

## Where the data lives

On the phone, and only on the phone. Nothing is uploaded anywhere.

- Walkthroughs, rates and settings: browser local storage
- Photos: IndexedDB

That means each person's phone holds their own walkthroughs, and clearing the browser's
site data for this address wipes them. Two things follow:

- Send walkthroughs out as you finish them — the envelope button emails the report.
- Use **Settings → Backup** before switching phones. It writes one `.json` file with
  everything including photos, and *Restore from a backup file* reads it back on the new phone.

## Adjusting the estimate

The production rates that turn square footage into hours are **generic commercial-cleaning
figures, not Myles O'Donnell's**. Edit them under the gear icon — *Square feet cleaned per
hour* and *Minutes added per fixture* — or hand the real crew numbers to Claude and have it
build them into `index.html` so every phone starts with them.
