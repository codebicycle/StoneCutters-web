'use strict';

var utils = require('../../shared/utils');

module.exports = {
    sixpack: {
        enabled: true,
        host: 'http://sixpack-staging.olx.com',
        timeout: utils.SECOND * 5,
        experiments: require('./experiments/staging')
    },
    optimizely: {
        html5: {
            id: 2529260866
        },
        desktop: {
            id: 2487590435
        }
    },
    smaug: {
        protocol: 'http',
        host: 'api-v2.olx.com',
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
    categorySuggestion: {
        api: 'http://categorysuggestiontool-612498389.us-east-1.elb.amazonaws.com/rest/suggest/',
        timeout: 1500
    },
    mario: {
        protocol: 'http',
        host: 'mario-LB-69977862.us-east-1.elb.amazonaws.com',
    },
    staticAccept: ['css', 'js', 'apk', 'zip'],
    imageAccept: ['jpg', 'jpeg', 'png', 'gif', 'ico'],
    environment: {
        type: 'staging',
        staticPath: 'http://static01.olx-st.com/mobile-webapp',
        imagePath: 'http://images01.olx-st.com/mobile-webapp',
        staticPathIris: 'http://static01.olx-st.ir/mobile-webapp',
        imagePathIris: 'http://images01.olx-st.ir/mobile-webapp'
    },
    localization: {
        wap: ['www.olx.co.za', 'www.olx.ir', 'www.olx.hn'],
        html4: ['www.olx.co.za', 'www.olx.ir', 'www.olx.hn'],
        html5: ['www.olx.ir', 'www.olx.hn'],
        desktop: ['www.olx.co.za', 'www.olx.com.bo', 'www.olx.com.ar']
    },
    icons: {
        wap: ['www.olx.com.ar', 'www.olx.com.bd', 'www.olx.cm', 'www.olx.com.co', 'www.olx.com.ec', 'www.olx.com.sv', 'www.olx.com.gh', 'www.olx.com.gt', 'www.olx.in', 'www.olx.co.ke', 'www.olx.com.ng', 'www.olx.com.pe', 'www.olx.sn', 'www.olx.co.za', 'www.olx.com.ve', 'www.olx.com.pk', 'www.olx.co.ug', 'www.olx.com.uy', 'www.olx.ir', 'www.olx.com.pa'],
        html4: ['www.olx.com.ar', 'www.olx.com.bd', 'www.olx.cm', 'www.olx.com.co', 'www.olx.com.ec', 'www.olx.com.sv', 'www.olx.com.gh', 'www.olx.com.gt', 'www.olx.in', 'www.olx.co.ke', 'www.olx.com.ng', 'www.olx.com.pe', 'www.olx.sn', 'www.olx.co.za', 'www.olx.com.ve', 'www.olx.com.pk', 'www.olx.co.ug', 'www.olx.com.uy', 'www.olx.ir', 'www.olx.com.pa'],
        html5: ['www.olx.com.ar', 'www.olx.com.bd', 'www.olx.cm', 'www.olx.com.co', 'www.olx.com.ec', 'www.olx.com.sv', 'www.olx.com.gh', 'www.olx.com.gt', 'www.olx.in', 'www.olx.co.ke', 'www.olx.com.ng', 'www.olx.com.pe', 'www.olx.sn', 'www.olx.co.za', 'www.olx.com.ve', 'www.olx.com.pk', 'www.olx.co.ug', 'www.olx.com.uy', 'www.olx.ir', 'www.olx.com.pa']
    },
    terms: {
        wap: ['www.jaovat.com', 'www.olx.fr', 'www.olx.es', 'www.olx.ir', 'www.olx.cl', 'www.olx.com.uy', 'www.olx.com.py', 'www.olx.com.pe', 'www.olx.com.ve', 'www.olx.com.co', 'www.olx.com.ec', 'www.olx.com.pa', 'www.olx.co.cr', 'www.olx.com.ni', 'www.olx.hn', 'www.olx.com.sv', 'www.olx.com.gt', 'www.olx.com.mx', 'www.olx.com.bo', 'www.olx.com.ar'],
        html4: ['www.jaovat.com', 'www.olx.fr', 'www.olx.es', 'www.olx.ir', 'www.olx.cl', 'www.olx.com.uy', 'www.olx.com.py', 'www.olx.com.pe', 'www.olx.com.ve', 'www.olx.com.co', 'www.olx.com.ec', 'www.olx.com.pa', 'www.olx.co.cr', 'www.olx.com.ni', 'www.olx.hn', 'www.olx.com.sv', 'www.olx.com.gt', 'www.olx.com.mx', 'www.olx.com.bo', 'www.olx.com.ar'],
        html5: ['www.jaovat.com', 'www.olx.fr', 'www.olx.es', 'www.olx.ir', 'www.olx.cl', 'www.olx.com.uy', 'www.olx.com.py', 'www.olx.com.pe', 'www.olx.com.ve', 'www.olx.com.co', 'www.olx.com.ec', 'www.olx.com.pa', 'www.olx.co.cr', 'www.olx.com.ni', 'www.olx.hn', 'www.olx.com.sv', 'www.olx.com.gt', 'www.olx.com.mx', 'www.olx.com.bo', 'www.olx.com.ar'],
        desktop: ['www.jaovat.com', 'www.olx.com.ar', 'www.olx.com.bo', 'www.olx.cl', 'www.olx.com.uy', 'www.olx.com.py', 'www.olx.com.pe', 'www.olx.com.ve', 'www.olx.com.co', 'www.olx.com.ec', 'www.olx.com.pa', 'www.olx.co.cr', 'www.olx.com.ni', 'www.olx.hn', 'www.olx.com.sv', 'www.olx.com.gt', 'www.olx.com.mx', 'www.olx.com.bo', 'www.olx.es']
    },
    disablePostingButton: {
        wap: ['home', 'post', 'location'],
        html4: ['post', 'location'],
        html5: ['post', 'location']
    },
    interstitial: {
        enabled: true,
        clicks: 0,
        time: 432000000,
        ignorePath: ['/closed', '/login', '/interstitial', '/500', '/esi', '/posting', '/posting/success', /^\/health(\/.*)?$/, /^\/force(\/.*)?$/, /^\/stats(\/.*)?$/, /^\/tracking(\/.*)?$/, /^\/posting(\/\d+)?(\/\d+)?$/],
        ignorePlatform: ['wap', 'desktop'],
        ignoreLocation: ['www.olx.co.za', 'www.olx.ir', 'www.olx.com.bd', 'www.olx.com.mx', 'www.olx.cl']
    },
    cache: {
        enabled: true,
        headers: {
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
            searches: {
                search: {
                    'Cache-Control': 'no-cache=Set-Cookie,max-age=600,s-maxage=600',
                    'Edge-Control': '!no-store,max-age=600s'
                }
            },
            items: {
                show: {
                    'Cache-Control': 'no-cache=Set-Cookie,max-age=600,s-maxage=600',
                    'Edge-Control': '!no-store,max-age=600s'
                }
            },
            'default': {
                'Cache-Control': 'no-cache, max-age=0, s-maxage=0, no-store'
            }
        }
    },
    features: {
        html5: {
            postingFlow: {
                worldwide: true,
                countries: []
            },
            listingFilters: {
                worldwide: true,
                countries: ['www.olx.ir']
            },
            interstitialByADX: {
                worldwide: true,
                countries: ['www.olx.ir']
            },
            autoLocation: {
                worldwide: true,
                countries: ['www.olx.com.bd','www.olx.com.bo','www.olx.co.cr','www.olx.ba','www.olx.cz','www.olx.com.ec','www.olx.com.eg','www.olx.com.sv','www.olx.fr','www.olx.gr','www.olx.hn','www.olx.jp','www.olx.is','www.olx.com.mt','www.olx.com.mx','www.olx.md','www.olx.no','www.olx.com.pa','www.olx.com.py','www.olx.com.pe','www.olx.ph','www.olx.com.pr','www.olx.lk','www.olx.com.uy', 'www.olx.ir']
            },
            smartBanner: {
                worldwide: false,
                countries: []
            },
            hermes: {
                worldwide: true,
                countries: ['www.olx.es', 'www.olx.ae', 'www.olx.it', 'www.olx.com', 'www.olx.fr', 'www.olx.ir']
            },
            newItemPage: {
                worldwide: true,
                countries: []
            },
            optimizely: {
                worldwide: false,
                countries: ['www.olx.com.gh']
            },
            landingThanks: {
                worldwide: false,
                countries: ['www.olx.com.ar', 'www.olx.com.co', 'www.olx.co.za', 'www.olx.com.pe', 'www.olx.com.ec', 'www.olx.com.ve', 'www.olx.com.gt', 'www.olx.com.ni', 'www.olx.com.sv', 'www.olx.com.pa', 'www.olx.com.uy']
            }
        },
        html4: {
            interstitialByADX: {
                worldwide: true,
                countries: ['www.olx.ir']
            },
            hermes: {
                worldwide: true,
                countries: ['www.olx.es', 'www.olx.ae', 'www.olx.it', 'www.olx.com', 'www.olx.fr', 'www.olx.ir']
            },
            sellerProfile: {
                worldwide: false,
                countries: ['www.olx.com.ng']
            }
        },
        desktop: {
            hermes: {
                worldwide: true,
                countries: ['www.olx.es', 'www.olx.ae', 'www.olx.it', 'www.olx.com', 'www.olx.fr', 'www.olx.ir']
            },
            contactForm: {
                worldwide: false,
                countries: ['www.olx.co.cr', 'www.olx.com.uy', 'www.olx.com.pa', 'www.olx.co.ug', 'www.olx.co.tz', 'www.olx.com.pe', 'www.olx.com.sv', 'www.olx.com.ec', 'www.olx.com.ve', 'www.olx.com.uy', 'www.olx.com.ar', 'www.olx.com.co', 'www.olx.com.gt', 'www.olx.sn', 'www.olx.cm', 'www.olx.com.gh', 'www.olx.it', 'www.olx.ae', 'www.olx.fr', 'www.olx.es', 'www.olx.com', 'www.olx.com.bo', 'www.olx.com.py', 'www.olx.com.ni', 'www.olx.hn', 'www.olx.co.za', 'www.olx.co.ke', 'www.olx.com.ng']
            },
            optimizely: {
                worldwide: false,
                countries: ['www.olx.com.gh']
            },
            landingThanks: {
                worldwide: false,
                countries: ['www.olx.com.ar', 'www.olx.com.co', 'www.olx.co.za', 'www.olx.com.pe', 'www.olx.com.ec', 'www.olx.com.ve', 'www.olx.com.gt', 'www.olx.com.ni', 'www.olx.com.sv', 'www.olx.com.pa', 'www.olx.com.uy']
            },
            visitedItems: {
                worldwide: false,
                countries: ['www.olx.com.ec', 'www.olx.com.sv', 'www.olx.com.gt', 'www.olx.com.pa', 'www.olx.com.pe']
            },
            safetyTipsLanding: {
                worldwide: false,
                countries: ['www.olx.com.co', 'www.olx.com.uy', 'www.olx.com.py', 'www.olx.com.bo', 'www.olx.com.pe', 'www.olx.com.ec', 'www.olx.com.co', 'www.olx.com.ve', 'www.olx.com.pa', 'www.olx.hn', 'www.olx.com.cr', 'www.olx.com.ni', 'www.olx.com.sv', 'www.olx.com.gt', 'www.olx.com.ar']
            }
        }
    },
    seo: {
        wmtools: {
            'www.olx.com.py': 'wZQiDDga0qV3b77xrK_HOc56dEgl9H00BfKwXVXXjeo',
            'www.olx.com.bo': '_3dWQgd7S7XLeekqcv7n-A7exgaeZitXSo7mtI5K7ng',
            'www.olx.com.ec': 'nZ4_aLo9SMrcvU0HxEc_gGol5g9QlRoHKoQEhRYaE7Q',
            'www.olx.com.pe': 'GceKe59dW4b_OWmDFmNgJvrAi5Jve9zov4uy5ItklAY',
            'www.olx.com.ve': 'ElLjb-uA1Oel1D9y3P4-WbbvrHB4NO2UOtkcLomsFkg',
            'www.olxalgerie.com': 'f-wMyLGF7ldHathYIkr39a1YLRh6dO0k3giWn14IzzE',
            'www.olx.aw': 'Cign3ocqpnTWNexXaRFLk4PpUQO0wh16D_Jn7vRS7Tc',
            'www.olx.com.au': 'DsyHAd46E08Y6qbPYXmSu1jRDxhBP-hTbTYT55GYu7o',
            'www.olx.at': 'RVzuowjeAaSKpkqe9oIlexjba5tljLRWF-b6-3BryJg',
            'www.olx.bs': 'zG8JhpnTDfih-xXJXxxWzPq-KzSPkJJ5mgLdfEJPtFI',
            'www.olx.be': 'y-FVULQVL3Sikd9t8-yb1BLgD8EA32K8snld4TqdB20',
            'www.olx.bz': 'zfSHsAz_6JI_Cx7aULDJWQ7hdHnA2nkeu3b5EugYiBI',
            'www.olx.ba': 'W9iSTjt7RDDXVySndxFbwIwakzEpMOA3ymyHK0l9Uzo',
            'www.olx.co.bw': 'FWLVhnLjrDCUVsFCk0mW_D65HWs2t6VRTyxlwE8aJSA',
            'www.olx.cm': 'O9zROrMrsl2-jKVjDbMyWRe7-o-DGs44oE1KUtRvEyc',
            'www.olx.ca': 'UifGgtab8-PlcgL5yPfgwhXy1rFgzrXxIrw4HVIXRPs',
            'www.olx.cl': 'vdNSgYrxzN7H9lU40d1WdEDFj_ht4YM6rcEROHhVT0s',
            'www.olx.co.cr': 'W7uXEBnzpMcW01xjHc7TO2N2qffwrRxTsylf1Uo3UFY',
            'www.olx.com.hr': 'qtgBjniwWG4uxHPEiwvR0rVmxciAh45Vz5seihRWH_U',
            'www.olx.com.cy': 'OSQhwMmxKhYwhPBoHaSbtPzPd4rkcTXUmpyCTgxOe7g',
            'www.olx.cz': 't68WI-eTlTsygLvJq5Kjfbgf82LOqd-CznzS-Iby-qk',
            'www.olx.dk': 'DGkZEbTdC-CJ2kKkw9GtZuk4bqW3nb9RXn8rxfjKThQ',
            'www.olx.dm': 'vnG4HHkfvP1iop1vaugEyxzzlbd3lYGeNnn5vu5Jtr0',
            'www.olx.com.do': 'xK5E2Z4Ts7qPNxn90tlKM35KDbnXJF1wr9s9QShytLg',
            'www.olx.com.eg': 'hhy33Em5o3oJZlSyezLaPFUVNuB3zKdsXy8MewUsan4',
            'www.olx.com.sv': '15Yide2kbOoYxgjrxO2P3T6bjR1Qr5K0Cz4u5l1SCX8',
            'www.olx.ee': 'M-2k4gAcSh-F8EJGmiCj6QbJVYRnwJTzIvnxU-kaAv4',
            'www.olx.fi': 'o8-5eaYcQB87jX8368tP2s8iu897CbQw7pT0rMRl3x8',
            'www.olx.fr': '-LCtFqA7znSU1JLNAPwezO4X2-Mt3Jvwqvn136RwvWk',
            'www.olx.de': 'gYyYQcZmQf--rDNl-2KUvxW1Keat7nrSqyeBL0MeCvk',
            'www.olx.com.gh': 'q0jlUs3jNojd_ba3XRDys1GOBHbrgFjjNmw2HIWPZeE',
            'www.olx.gr': 'EUGqkpvcfByyU90uTdKIpSEb2hT2nU34CHVbrvGYEro',
            'www.olx.gd': '05v6Lftcur0VjxfVCQ61QdnPrIQ36CBUBp6mPemcecY',
            'www.olx.com.gt': 'DYnpEcxJoXpTM2xQr6RI-58SthG0fz1JRVzvFRl-o-I',
            'www.olx.ht': 'rwTgGoNLdz1u0-w2eiMpCwJ9tvsea66Wba65yKYMVW4',
            'www.olx.hn': 'sd675dmDtP-XecVrAsFEYXKELpyePmqjN7iEpQo7oQ4',
            'www.haibao.hk': 'ZhhcoAGtzMqT9GlqgyLqNc0ma33zpZ-H6qPj8t0JplI',
            'www.olx.is': 'jHjrRRW6C7O7gC2-QEewUGYmQH-xZxjyp7beAdnhqvE',
            'www.olx.ie': 'tCUovgvQdxGAUSshiQiAwEZyTVZ-OmeLGwQuoaOjnAo',
            'www.olx.co.il': '-niIeyHfOvsUsNQjomduMo1U0FV6rukd29fw--diGlw',
            'www.olx.it': 'H3zqfuwH4YO98KHf0ZGkCw3XCT4H6zwzvvmKtsyj_n4',
            'www.olx.com.jm': 'X9Pcbc7LTgbS8YfO1-xxZ59o6X3C6aisBwCpZsIvvlA',
            'www.olx.jp': 'EfPbKk_9L2QgAF4TxhUeO7HzmsnTmi_wKwO3k_WR0vI',
            'www.olx.jo': 'B4rDQGEWWXWiWh1B4b8a8Kx6wSGVd1qgeHiGNxFs63k',
            'www.olx.lv': '11ZOP6-EE1CJL482ZLv0zRf2spt9kAnbBp_5YGC0h4E',
            'www.olx.li': 'jjPm6rIPEyujlHfvswXORVW1tr6RFwQ7Gg3JKbZGrxM',
            'www.olx.lt': 'zZoMpDENLJ6PMZ9V8DFYOZNxRVjGzrf_6yo42RqE23Y',
            'www.olx.lu': 'HsN68l_V8nNQCH2149L3f83m7rdNchRPtsW-9jsocU4',
            'www.olx.com.mt': 'NNXuQqN0E7owmAa2KcJMVPeeymaroTraXZiy3GMAz8s',
            'www.olx.mu': 'E0VfeOa4ayyMnfT23RC4eYmBBFy2R26PlVpw18lb188',
            'www.olx.md': 'bRYhfwLTXENcY8UByVuRL5e5bMzG7bxmxyn0wHUwljE',
            'www.olxmonaco.com': '4PD7M9k5zLZlrK05gfTAa4DclmXVY0cz1cTlG_SHOb0',
            'www.olx.ma': 'I83pGvIDrtnjQgu30D-Zw3Ye9yJFhI50kmA2IHJ1Jbk',
            'www.olx-nederland.com': 'sSUxJwYqOHL1Z1IGTcC7cDRXeW6pMYmxUGtJNwT1SG0',
            'www.olx.co.nz': 'swX65ewdcSda5--SQU9Y_c74slNwJBLsKVfrSKamWww',
            'www.olx.com.ni': '3Z7btQKRcK6jMPKFSe6TkdhaMoaz8n_jauJxcN1LydM',
            'www.olx.no': 'U4IAnoS7BjjVc8MEMv8k57I2fPq8szZeD1ibh5eloWA',
            'www.olx.com.pa': 'Wn-1tMjU-XTcWeXqFR4_7PMTDCnBulZRZp_DMpe4izU',
            'www.olx.com.pr': 'qPXLrI8nTmyqcN2yhLXtiC7pHYo6yjxzggBTnveBWNc',
            'www.olx.sn': '47TvYDe_9O0lYXPkqGDTYeQAlsJ9BZMUlyOygaIJ6Gg',
            'www.olx.rs': 'WwzFaCaKK8yhnL7hrJBYF9KCt9OSyymVNR0HdID9nxA',
            'www.olx.sk': '8Xgu2pJDAhGggxOJ225rAvWe7wE5wlg34EiGSimcEnE',
            'www.olx.si': '-aVcwXEG0g9hg3Dvxi-1n4IYC0dYFYuoZbU_OixX4KM',
            'www.olx.co.kr': 'MGqrmc7gYdrsWIwN9HV87tbWDX3iQyvnWtni7EBcGl0',
            'www.olx.es': 'Akwv_gBan9Km9yl9W9uoSz9xIb-x1CsMN8Rxr8fmpWs',
            'www.olx.lk': '56SxTjFxyyNHdDppFjxvTqXYboC7NByPqc0gs8eIdDs',
            'www.olx.se': 'QASpr6Z3odlsAveYHrwlsGaqHmN8DBlb1hM6TxOUMR0',
            'www.haibao.com.tw': 'mk8BbHBiDdukmpOJUjDjywiv1U4cD5r1Hw7htlJIipA',
            'www.olx.co.tz': '8CGVGURuGi5mAYgrdDy-UgE7LfK-MUfCNqjLTahj0wE',
            'www.olx.com.tt': 'QIig_XH0Mz27JZkSWkbNI0-nKoJKKnQn1W6UfmwWDaI',
            'www.olxtunisie.com': 'ZLeVhxtSGRTW3pxPzMJxFyNHEBcJ6UVS-X6mcR1AaZ0',
            'www.olx.com.tr': 'U49ul9aRySszcKpVMKpXGI7lIPxu1LVUxJc24JsHE2o',
            'www.olx.tc': 'Dm8B744P_W0iWrk54NkvgUZryLzSik5gIbPdptwLaQY',
            'www.olx.co.ug': '4ifuWjUqZS4JMgE1AZyj2j9S84HZuODxPW7fMMTWVWk',
            'www.olx.com.ua': '8FUF8Yx0AyitUuAbx_jebgbkzXwXhXjWAbZv7K33_BY',
            'www.olx.ae': 'VHz0vjQ6yuLD20TIHU8z9X8TJhyVJZyWZVUFZszUAG8',
            'www.olx.co.uk': '3avqcjFDvQyE7sGOGGNH1HbN1VWV5D5THYJKu35BbZY',
            'www.olx.com.uy': 'VJzbp5sqpyhHSKP6ClyJyoZg-bGxBZG2kcxmmxIvI7k'
        }
    },
    mails: {
        domain: {
            'www.olx.com.ng': 'olx.com',
            'www.olx.com.ke': 'olx.com',
            'www.olx.it': 'olx.com',
            'www.olx.fr': 'olx.com',
            'www.olx.es': 'olx.com',
            'www.olx.cl': 'olx.com',
            'www.olx.com.mx': 'olx.com',
            'www.olx.com.bo': 'olx.com',
            'www.olx.com.py': 'olx.com'
        },
        support: {
            'default': 'support',
            'www.olx.com.ar': 'soporte',
            'www.olx.com.co': 'soporte',
            'www.olx.co.cr': 'soporte',
            'www.olx.com.ec': 'soporte',
            'www.olx.com.sv': 'soporte',
            'www.olx.com.gt': 'soporte',
            'www.olx.hn': 'soporte',
            'www.olx.co.ke': 'support-ke',
            'www.olx.com.ni': 'soporte',
            'www.olx.com.ng': 'support-ng',
            'www.olx.com.pa': 'soporte',
            'www.olx.com.pe': 'soporte',
            'www.olx.com.uy': 'soporte',
            'www.olx.com.ve': 'soporte'
        },
        legal: {
            'default':'legal',
            'www.olx.com.ng': 'support-ng',
            'www.olx.co.ke': 'support-ke'
        },
        zendesk: {
            'default': {
                subdomain: 'olxla',
                brand_id: 195655
            },
            'www.olx.co.cr': {
                subdomain: 'olxcr',
                brand_id: 300699
            },
            'www.olx.it': {
                subdomain: 'olxmilk',
                brand_id: 304905
            },
            'www.olx.ae': {
                subdomain: 'olxmilk',
                brand_id: 304905
            },
            'www.olx.fr': {
                subdomain: 'olxmilk',
                brand_id: 304905
            },
            'www.olx.es': {
                subdomain: 'olxmilk',
                brand_id: 304905
            },
            'www.olx.cl': {
                subdomain: 'olxmilk',
                brand_id: 304905
            },
            'www.olx.com': {
                subdomain: 'olxmilk',
                brand_id: 304905
            },
            'www.olx.com.mx': {
                subdomain: 'olxmilk',
                brand_id: 304905
            },
            'www.olx.com.eg': {
                subdomain: 'olxmilk',
                brand_id: 304905
            },
            'www.olxtunisie.com': {
                subdomain: 'olxmilk',
                brand_id: 304905
            },
            'www.jaovat.com': {
                subdomain: 'olxmilk',
                brand_id: 304905
            },
            'www.olx.com.bo': {
                subdomain: 'olxmilk',
                brand_id: 304905
            },
            'www.olx.com.py': {
                subdomain: 'olxmilk',
                brand_id: 304905
            },
            'www.olx.com.ar': {
                subdomain: 'olxar',
                brand_id: 304755
            },
            'www.olx.com.co': {
                subdomain: 'olxco',
                brand_id: 304915
            },
            'www.olx.com.ec': {
                subdomain: 'olxec',
                brand_id: 304925
            },
            'www.olx.com.gt': {
                subdomain: 'olxgt',
                brand_id: 304935
            },
            'www.olx.com.ni': {
                subdomain: 'olxmilk',
                brand_id: 304905
            },
            'www.olx.com.pa': {
                subdomain: 'olxpa',
                brand_id: 304945
            },
            'www.olx.com.pe': {
                subdomain: 'olxpe',
                brand_id: 304955
            },
            'www.olx.com.sv': {
                subdomain: 'olxsv',
                brand_id: 304965
            },
            'www.olx.com.uy': {
                subdomain: 'olxuy',
                brand_id: 300729
            },
            'www.olx.com.ve': {
                subdomain: 'olxve',
                brand_id: 300739
            },
            'www.olx.hn': {
                subdomain: 'olxmilk',
                brand_id: 304905
            },
            'www.olx.co.ke': {
                subdomain: 'olxke',
                brand_id: 288292
            },
            'www.olx.co.ug': {
                subdomain: 'olxug',
                brand_id: 483591
            },
            'www.olx.co.tz': {
                subdomain: 'olxtz',
                brand_id: 483601
            },
            'www.olx.com.gh': {
                subdomain: 'olxgh',
                brand_id: 485691
            },
            'www.olx.sn': {
                subdomain: 'olxsn',
                brand_id: 295132
            },
            'www.olx.cm': {
                subdomain: 'olxcm',
                brand_id: 485671
            },
            'www.olx.co.za': {
                subdomain: 'olxsa'
            },
            'www.olx.com.ng': {
                subdomain: 'olxng',
                brand_id: 480141
            }
        }
    },
    migration: {
        /*
            Stages:
                1: "Inform"     -> Initial process. Inform about the upcoming actions
                2. "Transfer"   -> Stop adding new content. Transfer user actions to new site
                3. "Close"      -> Close site. Redirect all traffic to new site
        */
        'www.olx.com.mx': {
            stage: 1,
            banner: true
        },
        'www.olx.cl': {
            stage: 1,
            banner: true
        },
        'www.olx.com.bd': {
            stage: 1,
            banner: true
        }
    },
    iris: {
        direct: {
            enabled: true
        }
    },
    schibsted: require('./schibsted'),
    amazonExperiment: {
        'www.olx.com.co': {
            categories: [362, 830, 800, 1016, 1022]
        },
        'www.olx.co.za': {
            categories: [806, 881, 16, 811, 815]
        }
    },
    googleExperiment: {
        'www.olx.com.co': {
            statesOrder: ['bogota', 'antioquia', 'valledelcauca', 'atlantico', 'bolivar', 'nortedesantander', 'tolima', 'santander', 'cundinamarca', 'meta']
        },
        'www.olx.co.za': {
            statesOrder: ['gauteng', 'westerncape', 'kwazulunatal', 'freestate', 'easterncape', 'northwest', 'mpumalanga', 'limpopo', 'northerncape']
        }
    }
};
