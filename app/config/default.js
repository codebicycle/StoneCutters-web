module.exports = {
    smaug: {
        wap: {
            maxPageSize: 25
        },
        html4: {
            maxPageSize: 25
        },
        html5: {
            maxPageSize: 26
        }
    },
    staticAccept: ['css', 'js'],
    imageAccept: ['jpg', 'jpeg', 'png', 'gif', 'ico'],
    environment: {
        type: 'development'
    },
    localization: {
        wap: ['www.olx.de','www.olx.fr','www.olx.es'],
        html4: ['www.olx.de','www.olx.fr','www.olx.es'],
        html5: ['www.olx.de','www.olx.fr','www.olx.es'],
        desktop: ['']
    },
    icons: {
        wap: ['www.olx.com.ar', 'www.olx.com.bd', 'www.olx.com.br', 'www.olx.cm', 'www.olx.com.co', 'www.olx.com.ec', 'www.olx.com.sv', 'www.olx.com.gt', 'www.olx.in', 'www.olx.co.ke', 'www.olx.com.ng', 'www.olx.com.pe', 'www.olx.sn', 'www.olx.co.za', 'www.olx.com.ve', 'www.olx.com.pk'],
        html4: ['www.olx.com.ar', 'www.olx.com.bd', 'www.olx.com.br', 'www.olx.cm', 'www.olx.com.co', 'www.olx.com.ec', 'www.olx.com.sv', 'www.olx.com.gt', 'www.olx.in', 'www.olx.co.ke', 'www.olx.com.ng', 'www.olx.com.pe', 'www.olx.sn', 'www.olx.co.za', 'www.olx.com.ve', 'www.olx.com.pk'],
        html5: ['www.olx.com.ar', 'www.olx.com.bd', 'www.olx.com.br', 'www.olx.cm', 'www.olx.com.co', 'www.olx.com.ec', 'www.olx.com.sv', 'www.olx.com.gt', 'www.olx.in', 'www.olx.co.ke', 'www.olx.com.ng', 'www.olx.com.pe', 'www.olx.sn', 'www.olx.co.za', 'www.olx.com.ve', 'www.olx.com.pk']
    },
    sixpack: {
        enabled: false,
        url: 'http://localhost:5000',
        'post-button': {
            enabled: false
        }
    },
    disablePostingButton: {
        wap: ['home', 'post', 'location'],
        html4: ['post', 'location'],
        html5: ['post', 'location']
    },
    infiniteScroll: false,
    interstitial: {
        enabled: false,
        clicks: 1,
        time: 432000000,
        ignorePath: ['/health', '/login', '/interstitial', '/404', '/500', /^\/force(\/.*)?$/, /^\/stats(\/.*)?$/, /^\/analytics(\/.*)?$/, /^\/posting(\/\d+)?(\/\d+)?$/],
        ignorePlatform: ['wap', 'desktop']
    },
    cache: {
        enabled: false,
        headers: {
            locations: {
                list: {
                    'Cache-Control': 'no-cache=Set-Cookie,max-age=600,s-maxage=600',
                    'Edge-Control': '!no-store,max-age=600s'
                }
            },
            categories: {
                list: {
                    'Cache-Control': 'no-cache=Set-Cookie,max-age=600,s-maxage=600',
                    'Edge-Control': '!no-store,max-age=600s'
                },
                subcategories: {
                    'Cache-Control': 'no-cache=Set-Cookie,max-age=600,s-maxage=600',
                    'Edge-Control': '!no-store,max-age=600s'
                },
                items: {
                    'Cache-Control': 'no-cache=Set-Cookie,max-age=600,s-maxage=600',
                    'Edge-Control': '!no-store,max-age=600s'
                }
            },
            items: {
                search: {
                    'Cache-Control': 'no-cache=Set-Cookie,max-age=600,s-maxage=600',
                    'Edge-Control': '!no-store,max-age=600s'
                },
                show: {
                    'Cache-Control': 'no-cache=Set-Cookie,max-age=600,s-maxage=600',
                    'Edge-Control': '!no-store,max-age=600s'
                }
            },
            post: {
                categories: {
                    'Cache-Control': 'no-cache=Set-Cookie,max-age=600,s-maxage=600',
                    'Edge-Control': '!no-store,max-age=600s'
                },
                subcategories: {
                    'Cache-Control': 'no-cache=Set-Cookie,max-age=600,s-maxage=600',
                    'Edge-Control': '!no-store,max-age=600s'
                }
            },
            'default': {
                'Cache-Control': 'no-cache, max-age=0, s-maxage=0, no-store'
            }
        }
    },
    seo: {
        wmtools: {
            'www.olx.com.py': {
                wap:   'wZQiDDga0qV3b77xrK_HOc56dEgl9H00BfKwXVXXjeo',
                html4: 'wZQiDDga0qV3b77xrK_HOc56dEgl9H00BfKwXVXXjeo',
                html5: 'wZQiDDga0qV3b77xrK_HOc56dEgl9H00BfKwXVXXjeo'
            }
        }
    }
};
