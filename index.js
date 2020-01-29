window.addEventListener("load", function()
{
    Notification.requestPermission().then(function(result)
    {
      console.log("Notification.requestPermission", result);
    });
});

window.addEventListener("unload", function()
{
    unsubscribeUser();
});

const webpush =  window.WebPushLib;
/* generate VAPID keys
 * const vapidKeys = webpush.generateVAPIDKeys();
 * console.log(JSON.stringify(vapidKeys, null, 4));
 */

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

function updateSubscriptionOnServer(subscription)
{
    webpush.setVapidDetails(
       'mailto:yourmail@example.com',
       window.vapid.pubkey,
       window.vapid.privkey
    );
    const rawSubscription = JSON.parse(JSON.stringify(subscription))

    let payload = JSON.stringify({
        title: 'webrtc-demo',
        body: 'Thank you for enabling Push Notifications',
        icon: './icon.png' // bot icon
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

function subscribeUser() {
  console.log('subscribeUser', window.vapid);
  const applicationServerKey = urlB64ToUint8Array(window.vapid.pubkey);

  swRegistration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: applicationServerKey

  }).then(function(subscription) {
    console.log('User is subscribed.');
    isSubscribed = true;

    updateSubscriptionOnServer(subscription);

  }).catch(function(err) {
    console.log('Failed to subscribe the user: ', err);
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
    console.log('User is unsubscribed.');
    isSubscribed = false;
  });
}

function initializeUI() {
  // Set the initial subscription value
  swRegistration.pushManager.getSubscription().then(function(subscription) {
    isSubscribed = !(subscription === null);

    if (navigator.credentials)
    {
        window.vapid = {pubkey: "BIuEc1QhsJnVWHBdDRSbWCqtbxPCYuaLh4cyL-6MQvM7x4N7ksUOWHIbg0qXPGChZtyUsBO7xXrU-iCtRfvW0RI", privkey: "qON0RY7otTgJ1vhCQSiCbeBN6q82Aak6cQBcnCktmCA", sub: subscription};

        navigator.credentials.get({password: true, mediation: "silent"}).then(function(credential)
        {
            console.log("credential management api get", credential);

            if (!credential)
            {
                navigator.credentials.create({password: {
                    id: "dele-webpush", name: "Dele Olajide", iconURL: "data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIj8+CjxzdmcgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB3aWR0aD0iMTI4IiBoZWlnaHQ9IjEyOCI+CiA8cmVjdCB3aWR0aD0iMTI4IiBoZWlnaHQ9IjEyOCIgZmlsbD0iIzU1NSIvPgogPGNpcmNsZSBjeD0iNjQiIGN5PSI0MSIgcj0iMjQiIGZpbGw9IiNmZmYiLz4KIDxwYXRoIGQ9Im0yOC41IDExMiB2LTEyIGMwLTEyIDEwLTI0IDI0LTI0IGgyMyBjMTQgMCAyNCAxMiAyNCAyNCB2MTIiIGZpbGw9IiNmZmYiLz4KPC9zdmc+Cg==",
                    password: JSON.stringify(window.vapid)

                }}).then(function(credential) {
                    navigator.credentials.store(credential).then(function()
                    {
                        console.log("credential management api put", credential);

                    }).catch(function (err) {
                        console.error("credential management api put error", err);
                    });

                }).catch(function (err) {
                    console.error("credential management api put error", err);
                });
            }
            else {
                 window.vapid = JSON.parse(credential.password);
            }

            if (!isSubscribed) {
              subscribeUser();
            }
            else {
              swRegistration.pushManager.getSubscription().then(function(subscription) {
                if (subscription) {
                    updateSubscriptionOnServer(subscription);
                }
              }).catch(function(error) {
                console.log('Error getting subscription', error);
              })
            }

        }).catch(function(err){
            console.error ("credential management api get error", err);
        });
    } else console.error("credential management api not available");
  });
}

if ('serviceWorker' in navigator && 'PushManager' in window) {
  console.log('Service Worker and Push is supported');

  navigator.serviceWorker.onmessage = function(event) {
    console.log("Broadcasted from SW : ", event.data);
  };

  navigator.serviceWorker.register('./webpush-sw.js').then(function(swReg) {
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
