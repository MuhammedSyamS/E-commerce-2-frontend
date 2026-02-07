// SERVICE WORKER FOR PUSH NOTIFICATIONS

self.addEventListener('push', e => {
    const data = e.data.json();
    console.log('Push Received:', data);

    self.registration.showNotification(data.title, {
        body: data.body,
        icon: 'https://cdn-icons-png.flaticon.com/512/3119/3119338.png', // Generic Notification Icon
        // badge: '/badge.png' 
    });
});

self.addEventListener('notificationclick', function (event) {
    event.notification.close();
    event.waitUntil(
        clients.openWindow('http://localhost:5173/account/notifications') // Open notifications page
    );
});
