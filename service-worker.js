// service-worker.js

// A service worker file to enables progressive web app functionality
// and allows the app to be installed on devices.

// Skip waiting and activate the new service worker as soon as it's installed
// to ensure the app is always controlled by the latest version.

self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (e) => e.waitUntil(self.clients.claim()));
