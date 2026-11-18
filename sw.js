const CACHE_PREFIX = "nasle-naw";
const CACHE_VERSION = "v1.0.0";
const CACHE_NAME = `${CACHE_PREFIX}-${CACHE_VERSION}`;
const BASE_URL = new URL("./", self.registration.scope);
const OFFLINE_URL = new URL("offline.html", BASE_URL).href;
const CORE_FILES = [
    OFFLINE_URL,
    new URL("index.html", BASE_URL).href,
    new URL("css/style.css", BASE_URL).href
];

self.addEventListener("install", event => {
    event.waitUntil((async () => {
        const cache = await caches.open(CACHE_NAME);
        await cache.add(OFFLINE_URL);
        await Promise.allSettled(
            CORE_FILES
                .filter(url => url !== OFFLINE_URL)
                .map(url => cache.add(url))
        );
        await self.skipWaiting();
    })());
});

self.addEventListener("activate", event => {
    event.waitUntil((async () => {
        const cacheNames = await caches.keys();
        await Promise.all(
            cacheNames
                .filter(name =>
                    name.startsWith(`${CACHE_PREFIX}-`) &&
                    name !== CACHE_NAME
                )
                .map(name => caches.delete(name))
        );
        await self.clients.claim();
    })());
});
function isSameOrigin(url) {
    return url.origin === self.location.origin;
}
async function handleNavigation(request) {
    try {
        const response = await fetch(request);
        if (response && response.ok && response.type === "basic") {
            const cache = await caches.open(CACHE_NAME);
            cache.put(request, response.clone()).catch(() => {});
        }
        return response;
    } catch (error) {
        const cachedPage = await caches.match(request);
        if (cachedPage) return cachedPage;
        const offlinePage = await caches.match(OFFLINE_URL);
        if (offlinePage) return offlinePage;
        return new Response(
            "اتصال به اینترنت برقرار نیست.",
            {
                status: 503,
                headers: { "Content-Type": "text/plain; charset=utf-8" }
            }
        );
    }
}
async function handleAsset(request) {
    const cached = await caches.match(request);
    if (cached) return cached;
    try {
        const response = await fetch(request);
        if (response && response.ok && response.type === "basic") {
            const cache = await caches.open(CACHE_NAME);
            cache.put(request, response.clone()).catch(() => {});
        }
        return response;
    } catch (error) {
        return new Response("", { status: 503, statusText: "Offline" });
    }
}

self.addEventListener("fetch", event => {
    const request = event.request;
    if (request.method !== "GET") return;
    const url = new URL(request.url);
    if (!isSameOrigin(url)) return;
    if (request.mode === "navigate") {
        event.respondWith(handleNavigation(request));
        return;
    }
    event.respondWith(handleAsset(request));
});
