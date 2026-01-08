// Service Worker para notificações
self.addEventListener('push', function(event) {
  const data = event.data ? event.data.json() : {}
  const options = {
    body: data.body || 'Você foi chamado!',
    icon: '/icon-192.png',
    badge: '/icon-192.png',
    vibrate: [200, 100, 200, 100, 200],
    tag: 'queue-call',
    requireInteraction: true,
    data: {
      url: data.url || '/'
    }
  }

  event.waitUntil(
    self.registration.showNotification(data.title || 'Sua vez chegou!', options)
  )
})

self.addEventListener('notificationclick', function(event) {
  event.notification.close()
  event.waitUntil(
    clients.openWindow(event.notification.data.url)
  )
})
