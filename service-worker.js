// Set a name for the current cache
var cacheName = 'amur-offline-v1';

// Default files to always cache
var cacheFiles = [
  './',
  './css/styles.css',
  './images/amur_logo.png',
  './images/dash_board.png',
  './images/icon_settings.png',
  './images/loader.gif',
  './index.html',
  './confirmation.html',
  './dashboard.html',
  './finance_calculator.html',
  './partner.html',
  './register.html',
  './partner.html',
  './js/angular.min.js',
  './js/angular-route.min.js',
  './js/angular-messages.min.js',
  './js/app.js',
  './js/helper.js',
  './js/custom.js',
  './service-worker.js'
]


self.addEventListener('install', function(e) {

    // e.waitUntil Delays the event until the Promise is resolved
    e.waitUntil(
      // Open the cache
      caches.open(cacheName).then(function(cache) {
        // Add all the default files to the cache
      return cache.addAll(cacheFiles);
      })
  ); // end e.waitUntil
});


self.addEventListener('activate', function(e) {

    e.waitUntil(

      // Get all the cache keys (cacheName)
    caches.keys().then(function(cacheNames) {
      return Promise.all(cacheNames.map(function(thisCacheName) {

        // If a cached item is saved under a previous cacheName
        if (thisCacheName !== cacheName) {

          // Delete that cached file
          return caches.delete(thisCacheName);
        }
      }));
    })
  ); // end e.waitUntil

});


self.addEventListener('fetch', function(e) {

  var request_url = e.request.url;
  if (request_url.indexOf("offline_app/save/partner/data") !== -1) return;

  // e.respondWidth Responds to the fetch event
  e.respondWith(

    // Check in cache for the request being made
    caches.match(e.request)


      .then(function(response) {

        // If the request is in the cache
        if ( response ) {
          // Return the cached version
          return response;
        }

        // If the request is NOT in the cache, fetch and cache

        var requestClone = e.request.clone();
        fetch(requestClone)
          .then(function(response) {

            if ( !response ) {
              return response;
            }

            var responseClone = response.clone();

            //  Open the cache
            caches.open(cacheName).then(function(cache) {

              // Put the fetched response in the cache

               cache.put(e.request, responseClone);
/*
              if( e.request.url != 'https://offlinesite-amur.pantheonsite.io/offline_app/save/partner/data' ){
                console.log('[ServiceWorker] New Data Cached', e.request.url);
              }*/


              // Return the response
              return response;

                }); // end caches.open

          })
          .catch(function(err) {

          });


      }) // end caches.match(e.request)
  ); // end e.respondWith
});
