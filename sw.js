// sw.js — D&D Dice Roller offline support
// Sube la versión cada vez que cambies archivos del shell para forzar refresco.
const CACHE_VERSION  = "v5";
const PRECACHE_NAME  = `ddr-precache-${CACHE_VERSION}`;
const RUNTIME_NAME    = `ddr-runtime-${CACHE_VERSION}`;

// Archivos "core" que sabemos que existen y que la app necesita desde el primer instante.
// Si alguno no existe (404), no rompe la instalación gracias a la carga individual con allSettled.
const PRECACHE_URLS = [
  // CORE
  "./",
  "./index.html",
  "./manifest.json",
  "./info.html",
  // ASSETS
  "./assets/icon.png",
  "./assets/icon-192.png",
  "./assets/icon-256.png",
  "./assets/icon-512.png",
  "./assets/icon-maskable.png",
  "./assets/wood-bg.jpg",
  "./assets/nat-text.json",
  // ENGINE
  "./engine/assets/ammo/ammo.wasm.wasm",
  "./engine/dice-box.es.min.js",
  "./engine/world.offscreen.min.js",
  "./engine/world.onscreen.min.js",
  "./engine/Dice.min.js",
  // THEMES: se cargan bajo demanda (runtime cache) y no forman parte de la
  // carga inicial. Así se evita descargar de golpe todos los temas cuando
  // solo se va a usar uno o dos.
];

async function notifyClients(message) {
  const clientsList = await self.clients.matchAll({
    includeUncontrolled: true,
    type: "window",
  });
  clientsList.forEach((client) => client.postMessage(message));
}

self.addEventListener("install", (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(PRECACHE_NAME);
      const total = PRECACHE_URLS.length;
      let done = 0;

      await notifyClients({ type: "precache-progress", done, total });

      // allSettled: si un archivo no existe o falla, no cancela la instalación completa.
      await Promise.allSettled(
        PRECACHE_URLS.map(async (url) => {
          try {
            const response = await fetch(url, { cache: "no-cache" });
            if (response && response.ok) {
              await cache.put(url, response);
            }
          } catch (err) {
            console.warn("No se pudo precachear:", url, err);
          } finally {
            done++;
            await notifyClients({ type: "precache-progress", done, total });
          }
        })
      );

      await notifyClients({ type: "precache-complete" });
      await self.skipWaiting();
    })()
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(
        keys
          .filter((key) => key !== PRECACHE_NAME && key !== RUNTIME_NAME)
          .map((key) => caches.delete(key))
      );
      await self.clients.claim();
    })()
  );
});

// Estrategia:
// - Navegación (HTML): cache-first con fallback a red, y actualiza la cache en segundo plano.
// - Todo lo demás (assets propios, y también recursos de unpkg.com como el módulo dice-box, sus web workers y el .wasm de física): cache-first + se cachea en runtime la primera vez que se piden, así una vez que el usuario jugó una vez online con todos los temas/dados que use, quedan disponibles offline.
self.addEventListener("fetch", (event) => {
  const { request } = event;

  if (request.method !== "GET") return;

  const url = new URL(request.url);

  // Evitar interferir con peticiones que no queremos cachear (ej. analytics, si las hubiera).
  if (url.protocol !== "http:" && url.protocol !== "https:") return;

  if (request.mode === "navigate") {
    event.respondWith(networkFirstForNavigation(request));
    return;
  }

  event.respondWith(cacheFirstWithRuntimeCache(request));
});

async function networkFirstForNavigation(request) {
  const cache = await caches.open(PRECACHE_NAME);
  try {
    const fresh = await fetch(request);
    cache.put(request, fresh.clone());
    return fresh;
  } catch (err) {
    const cached = await cache.match(request) || await cache.match("./index.html");
    if (cached) return cached;
    throw err;
  }
}

// Contador de descargas runtime en curso (ej. texturas de un tema que aún
// no estaba en cache). Se usa para avisar a la página cuándo mostrar/ocultar
// el indicador de carga, incluso fuera de la precarga inicial.
let activeRuntimeFetches = 0;

async function cacheFirstWithRuntimeCache(request) {
  const precache = await caches.open(PRECACHE_NAME);
  const cachedPre = await precache.match(request);
  if (cachedPre) return cachedPre;

  const runtime = await caches.open(RUNTIME_NAME);
  const cachedRuntime = await runtime.match(request);
  if (cachedRuntime) return cachedRuntime;

  activeRuntimeFetches++;
  await notifyClients({ type: "runtime-fetch-start", active: activeRuntimeFetches });

  try {
    // no-cors permite cachear también recursos cross-origin (unpkg.com) aunque la respuesta sea "opaque" (no se puede inspeccionar, pero sí se puede servir offline).
    const response = await fetch(request);
    // Solo cacheamos respuestas válidas u opacas (opaque = cross-origin no-cors).
    if (response && (response.ok || response.type === "opaque")) {
      runtime.put(request, response.clone());
    }
    return response;
  } catch (err) {
    // Sin red y sin nada en cache: no hay nada más que hacer para este recurso.
    throw err;
  } finally {
    activeRuntimeFetches--;
    await notifyClients({ type: "runtime-fetch-end", active: activeRuntimeFetches });
  }
}
