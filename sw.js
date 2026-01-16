// Service Worker للموقع
const CACHE_NAME = 'fdjts-portfolio-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/index-en.html',
  '/projects.html',
  '/tutorials.html',
  '/tutorials-archlinux.html',
  '/tutorials-godot.html',
  '/contact.html',
  '/style.css',
  '/scripts.js',
  '/channels4_profile.jpg',
  '/141354010-removebg-preview.png',
  '/Archlinux-logo-standard-version.png',
  '/arch-script-e1560162541576.webp',
  '/ai30.webp',
  '/archinstall-1.jpg',
  '/Grub_menu.jpeg',
  '/d0pcoyyfwsk61.jpg'
];

// تثبيت Service Worker
self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(function(cache) {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

// تفعيل Service Worker
self.addEventListener('activate', function(event) {
  event.waitUntil(
    caches.keys().then(function(cacheNames) {
      return Promise.all(
        cacheNames.map(function(cacheName) {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// اعتراض الطلبات مع fallback للصفحة الرئيسية
self.addEventListener('fetch', function(event) {
  event.respondWith(
    caches.match(event.request)
      .then(function(response) {
        if (response) return response;
        return fetch(event.request).then(function(networkResponse) {
          if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
            return networkResponse;
          }
          var responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME)
            .then(function(cache) {
              cache.put(event.request, responseToCache);
            });
          return networkResponse;
        }).catch(() => {
          // fallback للصفحة الرئيسية إذا فقد الاتصال
          if (event.request.mode === 'navigate') {
            return caches.match('/index.html');
          }
        });
      })
  );
});

// تحديث الكاش تلقائياً عند نشر نسخة جديدة
self.addEventListener('message', function(event) {
  if (event.data === 'skipWaiting') {
    self.skipWaiting();
  }
});
