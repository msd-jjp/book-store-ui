if ('function' === typeof importScripts) {
    importScripts(
        //   'https://storage.googleapis.com/workbox-cdn/releases/3.5.0/workbox-sw.js'
        // 'https://storage.googleapis.com/workbox-cdn/releases/4.3.1/workbox-sw.js'
        'static/sw-workbox/v4.3.1/workbox-sw.js'
    );
    /* global workbox */
    if (workbox) {
        console.log('Workbox is loaded, 7');

        /* injection point for manifest files.  */
        workbox.precaching.precacheAndRoute([
  {
    "url": "favicon_.png",
    "revision": "8671a9fc94c42dfffe9b2675891dea09"
  },
  {
    "url": "favicon.png",
    "revision": "f593777b928c7656e1f7e7f2c77754ba"
  },
  {
    "url": "favicon2.png",
    "revision": "452c6988b5f181dfe36a8d3ff5f70406"
  },
  {
    "url": "index.html",
    "revision": "ec0cadd174856f9991e10578906a88df"
  },
  {
    "url": "reader/reader.js",
    "revision": "4fc449b06bdc6a9ae025ab895df49024"
  },
  {
    "url": "reader/reader2 - Copy.js",
    "revision": "2aa5a947dfd0048ba4e527f4fb1c4010"
  },
  {
    "url": "reader/reader2_old.js",
    "revision": "6fb845c2077a184bab4c336dfe3dbf07"
  },
  {
    "url": "reader/reader2.js",
    "revision": "ff7cef3842cce92f25f55564b4f9d59c"
  },
  {
    "url": "static/css/2.131132a7.chunk.css",
    "revision": "fae40a2e9218afb39c3d3bc8b48f7ae4"
  },
  {
    "url": "static/css/main.c718a8c7.chunk.css",
    "revision": "6a40e3fd163c24ca51e063c721e37637"
  },
  {
    "url": "static/js/2.e6a9f8f9.chunk.js",
    "revision": "1c89574fbfd6fd6c22909bddc2b304a8"
  },
  {
    "url": "static/js/main.29823609.chunk.js",
    "revision": "cbe663f9c3d610742afaa809744dc7fc"
  },
  {
    "url": "static/js/runtime~main.e0422c1d.js",
    "revision": "7b55797589299a384c1fc8ee43431bc1"
  },
  {
    "url": "static/media/img/flag/ar.png",
    "revision": "f912729a761d79669859eb93539d2660"
  },
  {
    "url": "static/media/img/flag/ir.png",
    "revision": "a84a156345dadcab5aeda5db9462447c"
  },
  {
    "url": "static/media/img/flag/us.png",
    "revision": "2171e21640cef63bd1296158f01a70cd"
  },
  {
    "url": "static/media/img/icon/404-page.png",
    "revision": "88f6e683896bef1f75ccdebf1236c1f3"
  },
  {
    "url": "static/media/img/icon/avatar.png",
    "revision": "304918526ae81259a11031b0f8c761a0"
  },
  {
    "url": "static/media/img/icon/book-size.png",
    "revision": "4a180a2e8890197d82a6cfef0c967af5"
  },
  {
    "url": "static/media/img/icon/broken-avatar.png",
    "revision": "172db0e099ad87fb48f0b37a3f8f2449"
  },
  {
    "url": "static/media/img/icon/broken-book.png",
    "revision": "23623e5faf426c8708d0eb475391ecb2"
  },
  {
    "url": "static/media/img/icon/default-book.png",
    "revision": "0b9396f6fc226e9950391a93aaad2d37"
  },
  {
    "url": "static/sw-workbox/v4.3.1/workbox-sw.js",
    "revision": "2efc82e6909e0abea3ac318f30df1afd"
  }
]);

        const cacheConfig = {
            images: [
                /\.(?:jpg|jpeg|png|gif|svg|ico)$/,
                new workbox.strategies.CacheFirst({
                    cacheName: "images",
                    plugins: [
                        new workbox.expiration.Plugin({
                            maxEntries: 6000,
                            maxAgeSeconds: 30 * 24 * 60 * 60 // 30 Days
                        })
                    ]
                }),
                "GET"
            ],
            fonts: [
                /\.(?:eot|ttf|woff|woff2)$/,
                new workbox.strategies.CacheFirst({
                    cacheName: "fonts",
                    plugins: [
                        new workbox.cacheableResponse.Plugin({
                            statuses: [0, 200]
                        }),
                        new workbox.expiration.Plugin({
                            maxAgeSeconds: 60 * 60 * 24 * 365, // 1 year
                            maxEntries: 30
                        })
                    ]
                }),
                "GET"
            ],
            imageApi: [
                /\.\/api\/serve-files\/$/,
                new workbox.strategies.CacheFirst({
                    cacheName: "image-api",
                    plugins: [
                        new workbox.expiration.Plugin({
                            maxAgeSeconds: 30 * 24 * 60 * 60, // 30 Days
                            maxEntries: 3000
                        })
                    ]
                }),
                "GET"
            ],
            imageApi2: [
                new RegExp('/api/serve-files/'),
                new workbox.strategies.CacheFirst({
                    cacheName: 'imageApi2',
                    plugins: [
                        new workbox.cacheableResponse.Plugin({
                            statuses: [0, 200],
                        }),
                        new workbox.expiration.Plugin({
                            maxAgeSeconds: 30 * 24 * 60 * 60, // 30 Days
                            maxEntries: 3000
                        })
                    ]
                })
            ],
            imageApi3: [
                new RegExp('/api/serve-files/'),
                new workbox.strategies.StaleWhileRevalidate({
                    cacheName: 'imageApi3',
                    plugins: [
                        new workbox.cacheableResponse.Plugin({
                            statuses: [0, 200],
                        }),
                        new workbox.expiration.Plugin({
                            maxAgeSeconds: 30 * 24 * 60 * 60, // 30 Days
                            maxEntries: 3000
                        })
                    ]
                })
            ],
            imageApi4: [
                /\.\/api\/serve-files\/$/,
                new workbox.strategies.CacheFirst({
                    cacheName: 'imageApi4',
                    plugins: [
                        new workbox.cacheableResponse.Plugin({
                            statuses: [0, 200],
                        }),
                        new workbox.expiration.Plugin({
                            maxAgeSeconds: 30 * 24 * 60 * 60, // 30 Days
                            maxEntries: 3000
                        })
                    ]
                })
            ],
            imageApi5: [
                /\.\/api\/serve-files\/$/,
                new workbox.strategies.StaleWhileRevalidate({
                    cacheName: 'imageApi5',
                    plugins: [
                        new workbox.cacheableResponse.Plugin({
                            statuses: [0, 200],
                        }),
                        new workbox.expiration.Plugin({
                            maxAgeSeconds: 30 * 24 * 60 * 60, // 30 Days
                            maxEntries: 3000
                        })
                    ]
                }),
                "GET"
            ],
            jsCss: [
                /\.(?:html|js|css)$/,
                new workbox.strategies.CacheFirst({
                    cacheName: "jsCss",
                    plugins: [
                        new workbox.expiration.Plugin({
                            maxAgeSeconds: 60 * 60 * 24 * 2, // 2 days
                            maxEntries: 100
                        })
                    ]
                }),
                "GET"
            ],
            htmlJsCss: [
                /\.(?:html|js|css)$/,
                new workbox.strategies.CacheFirst({ // NetworkFirst
                    cacheName: "html-js-css",
                    plugins: [
                        new workbox.expiration.Plugin({
                            // maxAgeSeconds: 60 * 60 * 24 * 2, // 2 days
                            maxAgeSeconds: 30 * 24 * 60 * 60, // 30 Days
                            maxEntries: 100
                        })
                    ]
                }),
                "GET"
            ],
            manifest: [
                /\.manifest.json/,
                new workbox.strategies.CacheFirst({
                    cacheName: "manifest",
                    plugins: [
                        new workbox.expiration.Plugin({
                            maxAgeSeconds: 60 * 60 * 24 * 2, // 2 days
                            maxEntries: 100
                        })
                    ]
                }),
                "GET"
            ],
            manifest2: [
                new RegExp('manifest.json'),
                new workbox.strategies.CacheFirst({
                    cacheName: "manifest2",
                    plugins: [
                        new workbox.expiration.Plugin({
                            // maxAgeSeconds: 60 * 60 * 24 * 2, // 2 days
                            maxAgeSeconds: 30 * 24 * 60 * 60, // 30 Days
                            maxEntries: 1
                        })
                    ]
                }),
                "GET"
            ],
            serveFiles: [
                new RegExp('api/serve-files'),
                new workbox.strategies.CacheFirst({ // NetworkFirst
                    cacheName: 'serve-files',
                    plugins: [
                        new workbox.expiration.Plugin({
                            maxEntries: 6000,
                            maxAgeSeconds: 30 * 24 * 60 * 60, // 30 Days
                        }),
                    ],
                })
            ],
            wasmFiles: [
                new RegExp('reader.wasm'),
                new workbox.strategies.CacheFirst({
                    cacheName: "wasm-files",
                    plugins: [
                        new workbox.expiration.Plugin({
                            maxAgeSeconds: 30 * 24 * 60 * 60, // 30 Days
                            maxEntries: 5
                        })
                    ]
                }),
                "GET"
            ],
        };

        /* custom cache rules*/
        workbox.routing.registerNavigationRoute('/index.html', {
            blacklist: [
                /^\/_/, /\/[^\/]+\.[^\/]+$/,
                new RegExp('reader2\.js'),
                new RegExp('reader\.wasm'),
            ],
        });

        /* workbox.routing.registerRoute(
            /\.(?:png|gif|jpg|jpeg)$/,
            // workbox.strategies.cacheFirst({
            new workbox.strategies.CacheFirst({
                cacheName: 'images',
                plugins: [
                    new workbox.expiration.Plugin({
                        maxEntries: 60,
                        maxAgeSeconds: 30 * 24 * 60 * 60, // 30 Days
                    }),
                ],
            })
        ); */
        //api/serve-files
        /* workbox.routing.registerRoute(
            // /\.\/api\/serve-files\/$/,
            new RegExp('api/serve-files'),
            new workbox.strategies.NetworkFirst({
                cacheName: 'serve-files',
                plugins: [
                    new workbox.expiration.Plugin({
                        maxEntries: 60,
                        maxAgeSeconds: 30 * 24 * 60 * 60, // 30 Days
                    }),
                ],
            })
        ); */

        workbox.routing.registerRoute(...cacheConfig.serveFiles);
        workbox.routing.registerRoute(...cacheConfig.images);
        // workbox.routing.registerRoute(...cacheConfig.imageApi);
        // workbox.routing.registerRoute(...cacheConfig.imageApi2);
        // workbox.routing.registerRoute(...cacheConfig.imageCache);
        // workbox.routing.registerRoute(...cacheConfig.imageApi3);
        // workbox.routing.registerRoute(...cacheConfig.imageApi4);
        // workbox.routing.registerRoute(...cacheConfig.imageApi5);
        // workbox.routing.registerRoute(...cacheConfig.jsCss);
        // workbox.routing.registerRoute(...cacheConfig.htmlJsCss);
        workbox.routing.registerRoute(...cacheConfig.fonts);
        // workbox.routing.registerRoute(...cacheConfig.manifest);
        workbox.routing.registerRoute(...cacheConfig.manifest2);
        // workbox.routing.registerRoute(...cacheConfig.wasmFiles);

        //todo
        /* self.addEventListener("install", event => {
            console.log("installing new version");
            self.skipWaiting();
        }); */
        const SkipWaitingAndClaim = () => {
            workbox.core.skipWaiting();
            workbox.core.clientsClaim();
        };
        SkipWaitingAndClaim();

    } else {
        console.log('Workbox could not be loaded. No Offline support');
    }
}