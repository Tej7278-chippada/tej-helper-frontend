// public/service-worker.js
const CACHE_NAME = 'helper-v3.0.0';
const OFFLINE_URL = '/offline.html';

// Add to existing service worker
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  '/logo192.png',
  '/logo512.png',
  '/static/js/main.chunk.js',
  '/static/css/main.chunk.css'
];

// Install event
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
      .then(() => self.skipWaiting())
  );
});

// Activate event
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch event with network-first strategy
self.addEventListener('fetch', (event) => {
  // Skip cross-origin requests
  if (!event.request.url.startsWith(self.location.origin)) {
    return;
  }

  // API calls - network first
  if (event.request.url.includes('/api/')) {
    event.respondWith(
      fetch(event.request)
        .catch(() => {
          return caches.match(event.request);
        })
    );
    return;
  }

  // Static assets - cache first
  event.respondWith(
    caches.match(event.request)
      .then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;
        }

        return fetch(event.request)
          .then((response) => {
            // Don't cache if not a valid response
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // Clone the response
            const responseToCache = response.clone();

            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(event.request, responseToCache);
              });

            return response;
          })
          .catch(() => {
            // If offline and requesting a page, return offline page
            if (event.request.mode === 'navigate') {
              return caches.match(OFFLINE_URL);
            }
            return new Response('Network error occurred', {
              status: 408,
              headers: { 'Content-Type': 'text/plain' }
            });
          });
      })
  );
});

self.addEventListener('push', (event) => {
  let payload;
  try {
    payload = event.data.json();
  } catch (e) {
    // Fallback for non-JSON payloads
    payload = {
      title: 'New Notification',
      body: event.data.text() || 'You have a new notification',
      icon: '/logo192.png',
      data: { url: '/' }
    };
  }

   // Custom handling for nearby posts
  if (payload.type === 'nearby_post') {
    payload = {
      title: 'New Post Nearby!',
      body: payload.message || 'Someone nearby needs help or is offering a service',
      icon: '/logo192.png',
      badge: '/logo192.png',
      data: {
        url: payload.postId ? `/post/${payload.postId}` : '/',
        type: 'nearby_post',
        postId: payload.postId,
        distance: payload.distance
      },
      vibrate: [200, 100, 200],
      // Add timestamp to show freshness
      timestamp: payload.timestamp || Date.now()
    };
  }

  // Custom handling for chat messages
  if (payload.type === 'chat_message') {
    payload = {
      title: payload.senderName ? `New message from ${payload.senderName}` : 'New message',
      body: payload.text.length > 30 ? `${payload.text.substring(0, 30)}...` : payload.text,
      icon: payload.senderIcon || '/logo192.png',
      data: {
        // url: `/chat/${payload.chatId}`,
        url: `/chatsOfPost/${payload.postId}`,
        // chatId: payload.chatId,
        senderId: payload.senderId,
        type: 'chat_message'
      }
    };
  }

  const options = {
    body: payload.body,
    icon: payload.icon || '/logo192.png',
    badge: '/logo192.png',
    data: payload.data || { url: '/' },
    vibrate: [200, 100, 200], // Add vibration for chat messages
    timestamp: payload.timestamp,
    tag: payload.data?.type, // Group notifications by type
    requireInteraction: payload.requireInteraction || false
  };

  event.waitUntil(
    self.registration.showNotification(
      payload.title || 'New Notification',
      options
    )
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  // Handle nearby posts
  if (event.notification.data.type === 'nearby_post') {
    const postUrl = `/post/${event.notification.data.postId}`;
    
    event.waitUntil(
      clients.matchAll({
        type: 'window',
        includeUncontrolled: true
      }).then((clientList) => {
        for (const client of clientList) {
          if (client.url.includes(postUrl) && 'focus' in client) {
            return client.focus();
          }
        }
        return clients.openWindow(postUrl);
      })
    );
  } 
  // Special handling for chat messages
  if (event.notification.data.type === 'chat_message') {
    // const chatUrl = `/chat/${event.notification.data.chatId}`;
    const chatUrl = `/chatsOfUser`;
    
    event.waitUntil(
      clients.matchAll({
        type: 'window',
        includeUncontrolled: true
      }).then((clientList) => {
        // Check if chat window is already open
        for (const client of clientList) {
          if (client.url.includes(chatUrl) && 'focus' in client) {
            return client.focus();
          }
        }
        // Otherwise open new window
        return clients.openWindow(chatUrl);
      })
    );
  } else {
    // Default handling for other notifications
    event.waitUntil(
      clients.matchAll({ type: 'window' }).then((clientList) => {
        for (const client of clientList) {
          if (client.url === event.notification.data.url && 'focus' in client) {
            return client.focus();
          }
        }
        return clients.openWindow(event.notification.data.url);
      })
    );
  }
});