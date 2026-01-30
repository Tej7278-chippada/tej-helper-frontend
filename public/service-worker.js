// public/service-worker.js
const CACHE_VERSION = '2025-12-30';
const CACHE_NAME = `helper-cache-${CACHE_VERSION}`;
const OFFLINE_URL = '/offline.html';

// Install
self.addEventListener('install', (event) => {
  self.skipWaiting();
});

// Activate – delete old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      )
    ).then(() => self.clients.claim())
  );
});

// Fetch – NETWORK FIRST (BEST for TWA)
self.addEventListener('fetch', (event) => {
  if (!event.request.url.startsWith(self.location.origin)) return;

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        const clone = response.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, clone);
        });
        return response;
      })
      .catch(() => {
        return caches.match(event.request).then((cached) => {
          return cached || caches.match(OFFLINE_URL);
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

  // Custom handling for blood requests
  if (payload.data?.type === 'blood_request') {
    payload = {
      title: payload.title || '🩸 Blood Donation Request',
      body: payload.body || 'Someone needs your help!',
      icon: '/logo192.png',
      badge: '/logo192.png',
      data: {
        url: payload.data.url || '/',
        type: 'blood_request',
        requesterId: payload.data.requesterId,
        donorId: payload.data.donorId
      },
      vibrate: [300, 100, 300],
      timestamp: Date.now(),
      actions: [
        {
          action: 'accept',
          title: '✅ Accept',
          icon: '/accept-icon.png'
        },
        {
          action: 'reject',
          title: '❌ Reject',
          icon: '/reject-icon.png'
        },
        {
          action: 'view',
          title: '👁️ View',
          icon: '/view-icon.png'
        }
      ]
    };
  }

  // Custom handling for blood request updates
  if (payload.data?.type === 'blood_request_update') {
    payload = {
      title: payload.title || 'Blood Request Update',
      body: payload.body || 'Update on your blood request',
      icon: payload.data.status === 'accepted' ? '/accepted-icon.png' : '/logo192.png',
      badge: '/logo192.png',
      data: {
        url: payload.data.url || '/',
        type: 'blood_request_update',
        donorId: payload.data.donorId,
        status: payload.data.status
      },
      vibrate: [200, 100, 200],
      timestamp: Date.now()
    };
  }

  const options = {
    body: payload.body,
    icon: payload.icon || '/logo192.png',
    badge: '/logo192.png',
    data: payload.data || { url: '/' },
    vibrate: payload.vibrate || [200, 100, 200], // Add vibration for chat messages
    timestamp: payload.timestamp,
    tag: payload.data?.type, // Group notifications by type
    requireInteraction: payload.requireInteraction || false,
    actions: payload.actions || []
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

  const notificationData = event.notification.data;
  const action = event.action;

  // Handle blood request notifications with actions
  if (notificationData.type === 'blood_request') {
    if (action === 'accept') {
      // Send accept request to backend
      event.waitUntil(
        clients.matchAll().then((clientList) => {
          const url = `${self.origin}/api/auth/update-blood-request/${notificationData.requesterId}`;
          
          for (const client of clientList) {
            if (client.url.includes('/user/') && 'focus' in client) {
              // Send message to client to update status
              client.postMessage({
                type: 'blood_request_action',
                action: 'accept',
                requesterId: notificationData.requesterId,
                donorId: notificationData.donorId
              });
              return client.focus();
            }
          }
          return clients.openWindow(`/user/${notificationData.donorId}`);
        })
      );
    } else if (action === 'reject') {
      // Send reject request to backend
      event.waitUntil(
        clients.matchAll().then((clientList) => {
          for (const client of clientList) {
            if (client.url.includes('/user/') && 'focus' in client) {
              client.postMessage({
                type: 'blood_request_action',
                action: 'reject',
                requesterId: notificationData.requesterId,
                donorId: notificationData.donorId
              });
              return client.focus();
            }
          }
          return clients.openWindow(`/user/${notificationData.donorId}`);
        })
      );
    } else if (action === 'view' || !action) {
      // Default action: view the user profile
      event.waitUntil(
        clients.matchAll({
          type: 'window',
          includeUncontrolled: true
        }).then((clientList) => {
          const userUrl = `/user/${notificationData.donorId}`;
          
          for (const client of clientList) {
            if (client.url.includes(userUrl) && 'focus' in client) {
              return client.focus();
            }
          }
          return clients.openWindow(userUrl);
        })
      );
    }
  } 
  // Handle blood request update notifications
  else if (notificationData.type === 'blood_request_update') {
    const userUrl = notificationData.status === 'accepted' 
      ? `/user/${notificationData.donorId}` 
      : '/blood-donors';
    
    event.waitUntil(
      clients.matchAll({
        type: 'window',
        includeUncontrolled: true
      }).then((clientList) => {
        for (const client of clientList) {
          if (client.url.includes(userUrl) && 'focus' in client) {
            return client.focus();
          }
        }
        return clients.openWindow(userUrl);
      })
    );
  }

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