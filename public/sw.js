// SERVICE WORKER FOR PUSH NOTIFICATIONS

self.addEventListener('push', e => {
    const data = e.data.json();
    console.log('Push Received:', data);

    const options = {
        body: data.body,
        icon: data.icon || 'https://cdn-icons-png.flaticon.com/512/3119/3119338.png',
        image: data.image, // RICH MEDIA IMAGE
        badge: 'https://cdn-icons-png.flaticon.com/512/3119/3119338.png',
        data: {
            url: data.url || '/account/notifications'
        },
        actions: [
            { action: 'view', title: 'View' }
        ]
    };

    e.waitUntil(
        self.registration.showNotification(data.title, options)
    );
});

self.addEventListener('notificationclick', function (event) {
    event.notification.close();

    // Get URL from data or default
    let urlToOpen = event.notification.data?.url || '/account/notifications';

    // FIX COLD DATA: If backend sent wrong URL structure, fix it here
    if (urlToOpen.includes('/account/orders/')) {
        urlToOpen = urlToOpen.replace('/account/orders/', '/order/');
    }

    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then(windowClients => {
            // Check if there is already a window/tab open with the target URL
            for (let i = 0; i < windowClients.length; i++) {
                const client = windowClients[i];
                if (client.url === urlToOpen && 'focus' in client) {
                    return client.focus();
                }
            }
            // If not, open a new window
            if (clients.openWindow) {
                return clients.openWindow(urlToOpen);
            }
        })
    );
});
