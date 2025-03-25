self.addEventListener("install", e => {
    e.waitUntil(
      caches.open("examen-test-cache").then(cache => {
        return cache.addAll([
          "index.html",
          "style.css",
          "script.js",
          "manifest.json",
          "icon-192.png",
          "icon-512.png",
          "archivoTxt Esp1.txt",
          "archivoTxt Esp2.txt",
          "archivoTxt Esp3.txt",
          "archivoTxt Esp4.txt",
          "archivoTxt Esp5.txt"
        ]);
      })
    );
  });
  
  self.addEventListener("fetch", e => {
    e.respondWith(
      caches.match(e.request).then(response => {
        return response || fetch(e.request);
      })
    );
  });
  