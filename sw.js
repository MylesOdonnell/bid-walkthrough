/* Bid Walkthrough — keeps the whole app on the device so it opens with no signal.

   HOW UPDATES WORK: bump VERSION below whenever index.html changes. The browser
   re-checks this file when the app launches; different bytes mean a new worker,
   which quietly downloads the new build in the background. The page then offers
   the user an Update button. Old caches are dropped on activate.

   Forget to bump VERSION and nobody gets the update. */
const VERSION = "bw-2026-08-26-8";
const SHELL   = "shell-" + VERSION;
const FONTS   = "fonts-v1";

const SHELL_FILES = [
  "./",
  "./index.html",
  "./manifest.webmanifest",
  "./icon-192.png",
  "./icon-512.png",
  "./icon-180.png",
  "./favicon-32.png"
];

self.addEventListener("install", (event) => {
  // No skipWaiting: the new build sits ready until the person taps Update,
  // so a version never swaps out from under someone mid-walkthrough.
  event.waitUntil(caches.open(SHELL).then((c) => c.addAll(SHELL_FILES)));
});

self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(
        keys.filter((k) => k !== SHELL && k !== FONTS).map((k) => caches.delete(k))
      ))
      .then(() => self.clients.claim())
  );
});

function isFontHost(url){
  return url.hostname === "fonts.googleapis.com" || url.hostname === "fonts.gstatic.com";
}

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;

  let url;
  try { url = new URL(req.url); } catch (e) { return; }

  // Typefaces: keep whatever we managed to fetch once, forever after.
  if (isFontHost(url)) {
    event.respondWith(
      caches.open(FONTS).then((cache) =>
        cache.match(req).then((hit) =>
          hit || fetch(req).then((res) => {
            if (res && (res.ok || res.type === "opaque")) cache.put(req, res.clone());
            return res;
          }).catch(() => hit)
        )
      )
    );
    return;
  }

  if (url.origin !== self.location.origin) return;

  // Everything else comes straight off the device. Opening the app never waits
  // on a network that may not be there. New builds arrive through VERSION.
  event.respondWith(
    caches.open(SHELL).then((cache) => {
      const key = (req.mode === "navigate") ? "./index.html" : req;
      return cache.match(key).then((hit) =>
        hit || fetch(req).then((res) => {
          if (res && res.ok && url.origin === self.location.origin) cache.put(req, res.clone());
          return res;
        })
      );
    })
  );
});
