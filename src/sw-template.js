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
        workbox.precaching.precacheAndRoute([]);

        const cacheConfig = {
            images: [
                /\.(?:jpg|jpeg|png|gif|svg|ico)$/,
                new workbox.strategies.CacheFirst({
                    cacheName: "images",
                    plugins: [
                        new workbox.expiration.Plugin({
                            maxEntries: 600,
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
                new workbox.strategies.NetworkFirst({
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
                new workbox.strategies.NetworkFirst({
                    cacheName: 'serve-files',
                    plugins: [
                        new workbox.expiration.Plugin({
                            maxEntries: 6000,
                            maxAgeSeconds: 30 * 24 * 60 * 60, // 30 Days
                        }),
                    ],
                })
            ]
        };

        /* custom cache rules*/
        workbox.routing.registerNavigationRoute('/index.html', {
            blacklist: [/^\/_/, /\/[^\/]+\.[^\/]+$/],
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
        workbox.routing.registerRoute(...cacheConfig.htmlJsCss);
        workbox.routing.registerRoute(...cacheConfig.fonts);
        // workbox.routing.registerRoute(...cacheConfig.manifest);
        workbox.routing.registerRoute(...cacheConfig.manifest2);

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