const CACHE = 'thewall-v2.1';

const SHELL = [
  '/',
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png',
];

// ഈ ഹോസ്റ്റുകളിൽ നിന്നുള്ള ഡാറ്റ കാഷെ ചെയ്യില്ല (Fresh data only)
const SKIP_HOSTS = [
  'alchemy.com',
  'walletconnect.com',
  'walletconnect.org',
  'coingecko.com',
  'anthropic.com',
  'niledb.com',
  'helius-rpc.com',
  'generativelanguage.googleapis.com' // Gemini API കൂടി ചേർത്തു 🦋
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE)
      .then(c => c.addAll(SHELL))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);

  // 1. GET അല്ലാത്തവയും API കളും ഒഴിവാക്കുക
  if (e.request.method !== 'GET') return;
  if (SKIP_HOSTS.some(h => url.hostname.includes(h))) return;
  if (url.pathname.startsWith('/api/')) return;

  // 2. പ്രധാന ഫയലുകൾക്ക് (Icons, Manifest) 'Cache-first' നൽകുക (വേഗതയ്ക്ക് വേണ്ടി)
  if (SHELL.includes(url.pathname)) {
    e.respondWith(
      caches.match(e.request).then(res => res || fetch(e.request))
    );
    return;
  }

  // 3. മറ്റുള്ളവയ്ക്ക് 'Network-first' (വാലറ്റ് ബാലൻസ് ശരിയാകാൻ)
  e.respondWith(
    fetch(e.request)
      .then(res => {
        if (res.status === 200) {
          const clone = res.clone();
          caches.open(CACHE).then(c => c.put(e.request, clone));
        }
        return res;
      })
      .catch(() => caches.match(e.request))
  );
});

self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// Push & Sync (നിന്റെ പഴയ കോഡ് ഇവിടെ ചേർക്കാം)
self.addEventListener('push', e => { /* ... */ });
self.addEventListener('sync', e => { /* ... */ });
