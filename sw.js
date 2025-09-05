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

// اعتراض الطلبات
self.addEventListener('fetch', function(event) {
  event.respondWith(
    caches.match(event.request)
      .then(function(response) {
        // إرجاع الملف من الكاش إذا كان موجوداً
        if (response) {
          return response;
        }
        
        // إذا لم يكن موجوداً، جلب من الشبكة
        return fetch(event.request).then(function(response) {
          // التحقق من صحة الاستجابة
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }
          
          // نسخ الاستجابة للكاش
          var responseToCache = response.clone();
          caches.open(CACHE_NAME)
            .then(function(cache) {
              cache.put(event.request, responseToCache);
            });
          
          return response;
        });
      })
  );
});
