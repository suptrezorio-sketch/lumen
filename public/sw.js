/* LUMEN Bank Service Worker — Web Push + Cache */

const CACHE_NAME = 'lumen-v1';

// Install — precache shell
self.addEventListener('install', (event) => {
  self.skipWaiting();
});

// Activate — clean old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(keys => 
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

// Web Push handler — shows native notification with sound
self.addEventListener('push', (event) => {
  let data = { title: 'LUMEN Bank', body: 'You have a new notification' };
  
  try {
    if (event.data) {
      const payload = event.data.json();
      data = {
        title: payload.title || 'LUMEN Bank',
        body: payload.body || payload.message || 'New notification',
        icon: '/icons/icon-192.png',
        badge: '/icons/icon-192.png',
        tag: payload.tag || 'lumen-notification',
        data: payload.data || {},
        // These make the notification more prominent on iOS
        requireInteraction: false,
        silent: false, // NOT silent — this triggers the system sound
      };
    }
  } catch (e) {
    // If not JSON, use text
    data.body = event.data ? event.data.text() : data.body;
  }

  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: data.icon || '/icons/icon-192.png',
      badge: data.badge || '/icons/icon-192.png',
      tag: data.tag,
      data: data.data,
      requireInteraction: data.requireInteraction,
      silent: data.silent,
    })
  );
});

// Notification click — open the app
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  const url = event.notification.data?.url || '/';
  
  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(clients => {
      // Focus existing window if available
      for (const client of clients) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          client.navigate(url);
          return client.focus();
        }
      }
      // Otherwise open new window
      return self.clients.openWindow(url);
    })
  );
});

// Fetch — network first, fallback to cache
self.addEventListener('fetch', (event) => {
  // Skip non-GET
  if (event.request.method !== 'GET') return;
  // Skip API calls
  if (event.request.url.includes('/api/')) return;
  
  event.respondWith(
    fetch(event.request)
      .then(response => {
        const clone = response.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});
