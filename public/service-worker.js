// public/service-worker.js
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

  const options = {
    body: payload.body,
    icon: payload.icon || '/logo192.png',
    badge: '/logo192.png',
    data: payload.data || { url: '/' }
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
});