'use strict';

self.addEventListener('push', function(event) {
  console.log('[Service Worker] Push Received.');

  if (event && event.data) {
      self.pushData = event.data.json();
      console.log(`[Service Worker] Push had this data: "${event.data.text()}"`, event);

      const title = (self.pushData.title !== '') ? self.pushData.title : 'Push Codelab';
      const options = {
        body: self.pushData.body,
        icon: self.pushData.icon
      };

      self.clients.matchAll().then(function(clients) {
        clients.forEach(function(client) {
            client.postMessage(self.pushData);
        })
      })

      //event.waitUntil(new Promise(function () {}));
      event.waitUntil(self.registration.showNotification(title, options));
  }
});

self.addEventListener('notificationclick', function(event) {
  console.log('[Service Worker] Notification click Received.');

  event.notification.close();

  event.waitUntil(
    clients.openWindow('https://deleolajide.github.io/webpush-test/icon.png')
  );
});

self.addEventListener('pushsubscriptionchange', function(event) {
  console.log('[Service Worker]: \'pushsubscriptionchange\' event fired.');
});
