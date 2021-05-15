// Hard-coded, replace with your public key
const publicVapidKey = 'BFjeO4z8e7YM-wYA0FwCagfOfISYM9hUcd6PO8YKF9FzcOQU55_FNFeKJyVZHZp2uY3Pl3ZA_eUHNcaEWdLZk2Y';

// if ('serviceWorker' in navigator) {
//   console.log('Registering service worker');

//   run('646_45').catch(error => console.error(error));
// }

function registerForPush(jobId) {
  if ('serviceWorker' in navigator) {
    console.log('Registering service worker for job Id after click by user: ', jobId);
  
    run(jobId).catch(error => console.error(error));
  }
}
function urlBase64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/');
   
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
   
    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
}

async function run(jobId) {
    console.log('Registering service worker');
    const registration = await navigator.serviceWorker.
        register('/src/client/worker.js', {scope: '/src/client/'});
    console.log('Registered service worker');

    console.log('Registering push');
    const subscription = await registration.pushManager.
    subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(publicVapidKey)
    });
    console.log('Registered push');

    console.log('Sending push');
    await fetch(`/subscribe?id=${jobId}`, {
        method: 'POST',
        body: JSON.stringify(subscription),
        headers: {
        'content-type': 'application/json'
        }
    });
    console.log('Sent push');
}