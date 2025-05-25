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
    vibrate: [200, 100, 200] // Add vibration for chat messages
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