/* eslint-disable no-restricted-globals */
// Service workers have different global scope than regular web pages

// Push event listener
addEventListener('push', (event) => {
    const payload = event.data ? event.data.json() : {};
    const options = {
      body: payload.body,
      icon: payload.icon || '/logo192.png', // Default icon
      data: payload.data || { url: '/' }    // Default URL
    };
  
    event.waitUntil(
      registration.showNotification(
        payload.title || 'New Notification',
        options
      )
    );
  });
  
  // Notification click handler
  addEventListener('notificationclick', (event) => {
    event.notification.close();
    event.waitUntil(
      self.clients.openWindow(event.notification.data.url)
    );
  });