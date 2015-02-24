'use strict';

var utils = require('../../shared/utils');

module.exports = {
    sixpack: {
        enabled: true,
        host: 'http://sixpack-testing.olx.com',
        timeout: utils.SECOND * 10,
        experiments: require('./experiments/development')
    },
    optimizely: {
        html5: {
            id: 2523560202
        },
        desktop: {
            id: 2492030585
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
            maxPageSize: 30
        },
        desktop: {
            maxPageSize: 27
        }
    },
    staticAccept: ['css', 'js', 'apk'],
    imageAccept: ['jpg', 'jpeg', 'png', 'gif', 'ico'],
    environment: {
        type: 'development'
    },
    localization: {
        wap: ['www.olx.co.za', 'www.olx.ir', 'www.olx.hn'],
        html4: ['www.olx.co.za', 'www.olx.ir', 'www.olx.hn'],
        html5: ['www.olx.ir', 'www.olx.hn'],
        desktop: ['www.olx.com.bo']
    },
    icons: {
        wap: [],
        html4: [],
        html5: []
    },
    terms: {
        wap: ['www.jaovat.com', 'www.olx.fr', 'www.olx.es', 'www.olx.ir', 'www.olx.cl', 'www.olx.com.uy', 'www.olx.com.py', 'www.olx.com.pe', 'www.olx.com.ve', 'www.olx.com.co', 'www.olx.com.ec', 'www.olx.com.pa', 'www.olx.co.cr', 'www.olx.com.ni', 'www.olx.hn', 'www.olx.com.sv', 'www.olx.com.gt', 'www.olx.com.mx', 'www.olx.com.bo', 'www.olx.com.ar'],
        html4: ['www.jaovat.com', 'www.olx.fr', 'www.olx.es', 'www.olx.ir', 'www.olx.cl', 'www.olx.com.uy', 'www.olx.com.py', 'www.olx.com.pe', 'www.olx.com.ve', 'www.olx.com.co', 'www.olx.com.ec', 'www.olx.com.pa', 'www.olx.co.cr', 'www.olx.com.ni', 'www.olx.hn', 'www.olx.com.sv', 'www.olx.com.gt', 'www.olx.com.mx', 'www.olx.com.bo', 'www.olx.com.ar'],
        html5: ['www.jaovat.com', 'www.olx.fr', 'www.olx.es', 'www.olx.ir', 'www.olx.cl', 'www.olx.com.uy', 'www.olx.com.py', 'www.olx.com.pe', 'www.olx.com.ve', 'www.olx.com.co', 'www.olx.com.ec', 'www.olx.com.pa', 'www.olx.co.cr', 'www.olx.com.ni', 'www.olx.hn', 'www.olx.com.sv', 'www.olx.com.gt', 'www.olx.com.mx', 'www.olx.com.bo', 'www.olx.com.ar'],
        desktop: ['www.jaovat.com', 'www.olx.com.bo', 'www.olx.cl', 'www.olx.com.uy', 'www.olx.com.py', 'www.olx.com.pe', 'www.olx.com.ve', 'www.olx.com.co', 'www.olx.com.ec', 'www.olx.com.pa', 'www.olx.co.cr', 'www.olx.com.ni', 'www.olx.hn', 'www.olx.com.sv', 'www.olx.com.gt', 'www.olx.com.mx', 'www.olx.com.bo']
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
        ignorePath: ['/closed', '/login', '/interstitial', '/500', '/esi','/posting' ,'/posting/success' , /^\/health(\/.*)?$/, /^\/force(\/.*)?$/, /^\/stats(\/.*)?$/, /^\/tracking(\/.*)?$/, /^\/posting(\/\d+)?(\/\d+)?$/],
        ignorePlatform: ['wap', 'desktop']
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
                countries: []
            },
            autoLocation: {
                worldwide: true,
                countries: ['www.olx.com.bd','www.olx.com.bo','www.olx.co.cr','www.olx.ba','www.olx.cz','www.olx.com.ec','www.olx.com.eg','www.olx.com.sv','www.olx.fr','www.olx.gr','www.olx.hn','www.olx.jp','www.olx.is','www.olx.com.mt','www.olx.com.mx','www.olx.md','www.olx.no','www.olx.com.pa','www.olx.com.py','www.olx.com.pe','www.olx.ph','www.olx.com.pr','www.olx.lk','www.olx.com.uy']
            },
            smartBanner: {
                worldwide: false,
                countries: []
            },
            hermes: {
                worldwide: false,
                countries: ['www.olx.cl', 'www.olx.com.mx', 'www.olx.com.ve', 'www.olx.com.gt', 'www.olx.com.pe', 'www.olx.com.sv', 'www.olx.com.ec', 'www.olx.com.co', 'www.olx.co.za', 'www.olx.com.ar', 'www.olx.com.uy']
            },
            newItemPage: {
                worldwide: false,
                countries: ['www.olx.com.bo', 'www.olx.cl', 'www.olx.com.mx', 'www.olx.com.ve', 'www.olx.com.gt', 'www.olx.com.pe', 'www.olx.com.sv', 'www.olx.com.ec', 'www.olx.com.co', 'www.olx.co.za', 'www.olx.com.ar', 'www.olx.com.uy']
            },
            optimizely: {
                worldwide: false,
                countries: ['www.olx.com.gh']
            }
        },
        html4: {
            interstitialByADX: {
                worldwide: true,
                countries: []
            }
        },
        desktop: {
            hermes: {
                worldwide: false,
                countries: ['www.olx.com.uy', 'www.olx.cl', 'www.olx.com.ar']
            },
            contactForm: {
                worldwide: false,
                countries: ['www.olx.co.cr', 'www.olx.com.uy', 'www.olx.com.pa', 'www.olx.co.ug', 'www.olx.co.tz']
            },
            optimizely: {
                worldwide: false,
                countries: ['www.olx.com.gh']
            }
        }
    },
    seo: {
        wmtools: {
            'www.olx.com.ar': '-Mh4o4nWHlFT1OIMSCORkx2Yy7eNrGGip5DjsYW-DuY',
            'www.olx.com.bd': 'KbLg_H7mMeu04a2uedeQsZRccO5NT3zsCtYiOo1uRbU',
            'www.olx.com.bo': '_3dWQgd7S7XLeekqcv7n-A7exgaeZitXSo7mtI5K7ng',
            'www.olx.com.br': 'BrFeRG5L0V_Q1owMI4CMgqjngTO1eFvR2DHcajJ4gHs',
            'www.olx.cm': 'O9zROrMrsl2-jKVjDbMyWRe7-o-DGs44oE1KUtRvEyc',
            'www.olx.com.co': 'yzHyXm1cJQd0fR4oZKD96LDCQ4AX8c4yRsLsFKD2qi4',
            'www.olx.co.cr': 'W7uXEBnzpMcW01xjHc7TO2N2qffwrRxTsylf1Uo3UFY',
            'www.olx.cl': 'vdNSgYrxzN7H9lU40d1WdEDFj_ht4YM6rcEROHhVT0s',
            'www.olx.com.ec': 'nZ4_aLo9SMrcvU0HxEc_gGol5g9QlRoHKoQEhRYaE7Q',
            'www.olx.com.sv': '15Yide2kbOoYxgjrxO2P3T6bjR1Qr5K0Cz4u5l1SCX8',
            'www.olx.fr': '-LCtFqA7znSU1JLNAPwezO4X2-Mt3Jvwqvn136RwvWk',
            'www.olx.com.gh': 'q0jlUs3jNojd_ba3XRDys1GOBHbrgFjjNmw2HIWPZeE',
            'www.olx.com.gt': 'DYnpEcxJoXpTM2xQr6RI-58SthG0fz1JRVzvFRl-o-I',
            'www.olx.hn': 'sd675dmDtP-XecVrAsFEYXKELpyePmqjN7iEpQo7oQ4',
            'www.olx.in': 'EGrIIwgs5kEfJb_MwXR_3A9XGSrQdUbyfQK7Vv80-d8',
            'www.olx.it': 'H3zqfuwH4YO98KHf0ZGkCw3XCT4H6zwzvvmKtsyj_n4',
            'www.olx.co.ke': 'hiKoV4QKNyOBeRZHLvbkn0_eTadtFb5BPjQ0TIsSekQ',
            'www.olx.com.mx': 'NYmbUbWCvkxL9ADmytt25vu68NpFeyy3CkWCu3ZTppM',
            'www.olx.com.ni': '3Z7btQKRcK6jMPKFSe6TkdhaMoaz8n_jauJxcN1LydM',
            'www.olx.com.ng': 'WC6BpUC618D1JVWZe9sgkaW7wb7VjteekIXzUzfVBzo',
            'www.olx.pk': 'azuoda6nc2ZBUwBkvk3pAGpuKvdgNldeWYgvAKr71uo',
            'www.olx.com.pa': 'Wn-1tMjU-XTcWeXqFR4_7PMTDCnBulZRZp_DMpe4izU',
            'www.olx.com.py': 'wZQiDDga0qV3b77xrK_HOc56dEgl9H00BfKwXVXXjeo',
            'www.olx.com.pe': 'GceKe59dW4b_OWmDFmNgJvrAi5Jve9zov4uy5ItklAY',
            'www.olx.sn': '47TvYDe_9O0lYXPkqGDTYeQAlsJ9BZMUlyOygaIJ6Gg',
            'www.olx.co.za': 'stcLu0f44KxphROMdBcTBaAUQN4XO-A_TfYirQvl7Ys',
            'www.olx.es': 'Akwv_gBan9Km9yl9W9uoSz9xIb-x1CsMN8Rxr8fmpWs',
            'www.olx.co.tz': '8CGVGURuGi5mAYgrdDy-UgE7LfK-MUfCNqjLTahj0wE',
            'www.olx.co.ug': '4ifuWjUqZS4JMgE1AZyj2j9S84HZuODxPW7fMMTWVWk',
            'www.olx.com': 'JwT4VZIdr9x8Ctn4jWX3pA1qaewK3uMlnFS4iVoM4Zs',
            'www.olx.com.uy': 'VJzbp5sqpyhHSKP6ClyJyoZg-bGxBZG2kcxmmxIvI7k',
            'www.olx.com.ve': 'ElLjb-uA1Oel1D9y3P4-WbbvrHB4NO2UOtkcLomsFkg',
            'www.jaovat.com': 'q0p5TRgd4gq-TbLCJZL38tpTimpocaWMN5e_ef4iAtg'
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
            'www.olx.com.ke': 'support-ke'
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
    }
};
