window.addEventListener("load", function()
{
    Notification.requestPermission().then(function(result)
    {
      console.log("Notification.requestPermission", result);
    });

});

// request WebPushLib form `window` object
const webpush =  window.WebPushLib;
/* generate VAPID keys
 * const vapidKeys = webpush.generateVAPIDKeys();
 * console.log(JSON.stringify(vapidKeys, null, 4));
 */

// from `webpush.generateVAPIDKeys()`
const ServerKeys = {
    pubkey:  "BIuEc1QhsJnVWHBdDRSbWCqtbxPCYuaLh4cyL-6MQvM7x4N7ksUOWHIbg0qXPGChZtyUsBO7xXrU-iCtRfvW0RI",
    privkey: "qON0RY7otTgJ1vhCQSiCbeBN6q82Aak6cQBcnCktmCA"
}

'use strict';

const applicationServerPublicKey = 'BIuEc1QhsJnVWHBdDRSbWCqtbxPCYuaLh4cyL-6MQvM7x4N7ksUOWHIbg0qXPGChZtyUsBO7xXrU-iCtRfvW0RI';

let isSubscribed = false;
let swRegistration = null;

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

function updateBtn() {
  if (Notification.permission === 'denied') {
    console.log('Push Messaging Blocked.');
    return;
  }

  if (isSubscribed) {
    console.log('Disable Push Messaging');
  } else {
    console.log('Enable Push Messaging');
  }
}

function updateSubscriptionOnServer(subscription) {
    // note: after subscriptio, this demo reload launch new notification
    if ( subscription ) {
        // set VAPID details
        webpush.setVapidDetails(
           'mailto:yourmail@example.com',
           'BIuEc1QhsJnVWHBdDRSbWCqtbxPCYuaLh4cyL-6MQvM7x4N7ksUOWHIbg0qXPGChZtyUsBO7xXrU-iCtRfvW0RI',
           'qON0RY7otTgJ1vhCQSiCbeBN6q82Aak6cQBcnCktmCA'
        );
        // get substantial info from subscription data - {Object}
        const rawSubscription = JSON.parse(JSON.stringify(subscription))

        let payload = JSON.stringify({
            title: 'Subversivo58 Bot',
            body: 'Thank you for enabling Push Notifications',
            icon: './assets/img/wp-success.png' // bot icon
        })
        // define options [in seconds]
        let options = {
            TTL: 60 // 1 minute
        }
        // send notification
        webpush.sendNotification(rawSubscription, payload, options).then(response => {
            console.log("Web Push Notification is sended 🚀 !")
        }).catch(e => {
            console.error(e)
        })
   }
}

function subscribeUser() {
  const applicationServerKey = urlB64ToUint8Array(applicationServerPublicKey);

  swRegistration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: applicationServerKey
  }).then(function(subscription) {
    console.log('User is subscribed.');

    updateSubscriptionOnServer(subscription);

    isSubscribed = true;

    updateBtn();

    if (navigator.credentials)
    {
        const webpush = {pubkey: "BIuEc1QhsJnVWHBdDRSbWCqtbxPCYuaLh4cyL-6MQvM7x4N7ksUOWHIbg0qXPGChZtyUsBO7xXrU-iCtRfvW0RI", privkey: "qON0RY7otTgJ1vhCQSiCbeBN6q82Aak6cQBcnCktmCA", sub: subscription}

        navigator.credentials.create({password: {id: "dele (chrome)", password: JSON.stringify(webpush)}}).then(function(credential)
        {
            navigator.credentials.store(credential).then(function()
            {
                console.log("credential management api put", credential);

            }).catch(function (err) {
                console.error("credential management api put error", err);
            });

        }).catch(function (err) {
            console.error("credential management api put error", err);
        });
    } else console.error("credential management api not available");

  }).catch(function(err) {
    console.log('Failed to subscribe the user: ', err);
    updateBtn();
  });
}

function unsubscribeUser() {
  swRegistration.pushManager.getSubscription().then(function(subscription) {
    if (subscription) {
      return subscription.unsubscribe();
    }
  }).catch(function(error) {
    console.log('Error unsubscribing', error);
  }).then(function() {
    updateSubscriptionOnServer(null);

    console.log('User is unsubscribed.');
    isSubscribed = false;

    updateBtn();
  });
}

function initializeUI() {
  // Set the initial subscription value
  swRegistration.pushManager.getSubscription().then(function(subscription) {
    isSubscribed = !(subscription === null);

    if (navigator.credentials)
    {
        navigator.credentials.get({password: true, mediation: "silent"}).then(function(credential)
        {
            console.log("credential management api get", credential);

        }).catch(function(err){
            console.error ("credential management api get error", err);
        });
    } else console.error("credential management api not available");
  });

    if (isSubscribed) {
      unsubscribeUser();
    } else {
      subscribeUser();
    }

    updateBtn();
}

if ('serviceWorker' in navigator && 'PushManager' in window) {
  console.log('Service Worker and Push is supported');

  navigator.serviceWorker.onmessage = function(event) {
    console.log("Broadcasted from SW : ", event.data);
  };

  navigator.serviceWorker.register('webpush-sw.js').then(function(swReg) {
    console.log('Service Worker is registered', swReg);

    swRegistration = swReg;
    initializeUI();
  }).catch(function(error) {
    console.error('Service Worker Error', error);
  });
} else {
  console.warn('Push messaging is not supported');
  console.log('Push Not Supported');
}
