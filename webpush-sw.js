'use strict';

const applicationServerPublicKey = 'BIuEc1QhsJnVWHBdDRSbWCqtbxPCYuaLh4cyL-6MQvM7x4N7ksUOWHIbg0qXPGChZtyUsBO7xXrU-iCtRfvW0RI';

function urlB64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

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

      //event.waitUntil(new Promise(function () {}));
      event.waitUntil(self.registration.showNotification(title, options));

      self.clients.matchAll().then(function(clients) {
        clients.forEach(function(client) {
            client.postMessage(self.pushData);
        })
      })
  }
});

self.addEventListener('notificationclick', function(event) {
  console.log('[Service Worker] Notification click Received.');

  event.notification.close();

  event.waitUntil(
    clients.openWindow('https://github.com/deleolajide/webpush-test/image.png')
  );
});

self.addEventListener('pushsubscriptionchange', function(event) {
  console.log('[Service Worker]: \'pushsubscriptionchange\' event fired.');
  const applicationServerKey = urlB64ToUint8Array(applicationServerPublicKey);
  event.waitUntil(
    self.registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: applicationServerKey
    })
    .then(function(newSubscription) {
      // TODO: Send to application server
      console.log('[Service Worker] New subscription: ', newSubscription);
    })
  );
});
