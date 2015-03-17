'use strict';

var utils = require('../../shared/utils');

module.exports = {
    sixpack: {
        enabled: true,
        host: 'http://sixpack-testing.olx.com',
        timeout: utils.SECOND * 10,
        experiments: require('./experiments/testing')
    },
    optimizely: {
        html5: {
            id: 2515510557
        },
        desktop: {
            id: 2515040242
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
    staticAccept: ['css', 'js', 'apk', 'zip'],
    imageAccept: ['jpg', 'jpeg', 'png', 'gif', 'ico'],
    environment: {
        type: 'testing',
        staticPath: 'http://static01.olx-st.com/mobile-webapp',
        imagePath: 'http://images01.olx-st.com/mobile-webapp',
        staticPathIris: 'http://static01.olx-st.ir/mobile-webapp',
        imagePathIris: 'http://images01.olx-st.ir/mobile-webapp'
    },
    localization: {
        wap: ['www.olx.co.za', 'www.olx.ir', 'www.olx.hn'],
        html4: ['www.olx.co.za', 'www.olx.ir', 'www.olx.hn'],
        html5: ['www.olx.ir', 'www.olx.hn'],
        desktop: ['www.olx.co.za', 'www.olx.com.bo']
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
                countries: []
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
                countries: ['www.olx.ir']
            },
            optimizely: {
                worldwide: false,
                countries: ['www.olx.com.gh']
            },
            landingThanks: {
                worldwide: false,
                countries: ['www.olx.com.ar', 'www.olx.com.co','www.olx.co.za']
            }
        },
        html4: {
            interstitialByADX: {
                worldwide: true,
                countries: []
            },
            hermes: {
                worldwide: true,
                countries: ['www.olx.es', 'www.olx.ae', 'www.olx.it', 'www.olx.com', 'www.olx.fr', 'www.olx.ir']
            }
        },
        desktop: {
            hermes: {
                worldwide: true,
                countries: ['www.olx.es', 'www.olx.ae', 'www.olx.it', 'www.olx.com', 'www.olx.fr', 'www.olx.ir']
            },
            contactForm: {
                worldwide: false,
                countries: ['www.olx.co.cr', 'www.olx.com.uy', 'www.olx.com.pa', 'www.olx.co.ug', 'www.olx.co.tz', 'www.olx.com.pe', 'www.olx.com.sv', 'www.olx.com.ec', 'www.olx.com.ve', 'www.olx.com.uy', 'www.olx.com.ar', 'www.olx.com.co', 'www.olx.com.gt', 'www.olx.sn', 'www.olx.cm', 'www.olx.com.gh', 'www.olx.it', 'www.olx.ae', 'www.olx.fr', 'www.olx.es', 'www.olx.com', 'www.olx.com.bo', 'www.olx.com.py', 'www.olx.com.ni', 'www.olx.hn', 'www.olx.co.za', 'www.olx.co.ke']
            },
            optimizely: {
                worldwide: false,
                countries: ['www.olx.com.gh']
            },
            landingThanks: {
                worldwide: false,
                countries: ['www.olx.com.ar', 'www.olx.com.co','www.olx.co.za']
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
            'www.olx.co.ke': 'olx.com',
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
            }
        }
    },
    newrelic: {
        enabled: true,
        licenseKey: 'ee506f8b9b',
        applicationId: '3915768'
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
    schibsted: {
        '.buenacuerdo.com.ar': {
            to: '.olx.com.ar',
            regions: {
                'argentina': 'www',
                'buenos_aires': 'buenosaires',
                'capital_federal_y_gba': 'capitalfederal-gba',
                'catamarca': 'catamarca',
                'chaco': 'chaco',
                'chubut': 'chubut',
                'córdoba': 'cordoba',
                'corrientes': 'corrientes',
                'entre_ríos': 'entrerios',
                'formosa': 'formosa',
                'jujuy': 'jujuy',
                'la_pampa': 'lapampa',
                'la_rioja': 'larioja',
                'mendoza': 'mendoza',
                'misiones': 'misiones',
                'neuquén': 'neuquen',
                'río_negro': 'rionegro',
                'salta': 'salta',
                'san_juan': 'sanjuan',
                'san_luis': 'sanluis',
                'santa_cruz': 'santacruz',
                'santa_fe': 'santafe',
                'santiago_del_estero': 'santiagodelestero',
                'tierra_del_fuego': 'tierradelfuego',
                'tucumán': 'tucuman'
            },
            areas: {
                'capital_federal': 'capitalfederal',
                'gba_norte': 'capitalfederal-gba',
                'gba_oeste': 'capitalfederal-gba',
                'gba_sur': 'capitalfederal-gba',
                'azul': 'azul',
                'bahía_blanca': 'bahiablanca',
                'balcarce': 'balcarce',
                'banfield': 'banfield',
                'bernal': 'bernal',
                'campana': 'campana',
                'castelar': 'castelar',
                'gonzález_catán': 'gonzalezcatan',
                'gregorio_de_laferrère': 'laferrere',
                'isidro_casanova': 'isidrocasanova',
                'josé_c._paz': 'josecpaz',
                'junin': 'junin',
                'la_plata': 'laplata',
                'libertad': 'moron',
                'luján': 'lujan',
                'mar_del_plata': 'mardelplata',
                'mercedes': 'mercedes',
                'monte_grande': 'montegrande',
                'pinamar': 'pinamar',
                'rafael_castillo': 'rafaelcastillo',
                'san_andrés_de_giles': 'sanandresdegiles',
                'san_justo': 'sanjusto',
                'san_nicolás_de_los_arroyos': 'sannicolas',
                'tandil': 'tandil',
                'temperley': 'temperley',
                'villa_gesell': 'villagesell',
                'zárate': 'zarate',
                'catamarca': 'catamarcacapital',
                'santa_maría': 'santamaria',
                'resistencia': 'resistencia',
                'roque_sáenz_peña': 'roquesaenzpeña',
                'villa_ángela': 'villaangela',
                'comodoro_rivadavia': 'comodororivadavia',
                'esquel': 'esquel',
                'puerto_madryn': 'puertomadryn',
                'rawson': 'rawson',
                'sarmiento': 'sarmiento',
                'trelew': 'trelew',
                'alta_gracia': 'altagracia',
                'bell_ville': 'bellville',
                'córdoba': 'cordobacapital',
                'río_cuarto': 'riocuarto',
                'río_tercero': 'riotercero',
                'villa_carlos_paz': 'villacarlospaz',
                'villa_maría': 'villamaria',
                'bella_vista': 'bellavista',
                'corrientes': 'corrientescapital',
                'curuzú_cuatiá': 'curuzucuatia',
                'goya': 'goya',
                'monte_caseros': 'montecaseros',
                'paso_de_los_libres': 'pasodeloslibres',
                'santo_tomé': 'santotome',
                'concepción_del_uruguay': 'concepciondeluruguay',
                'concordia': 'concordia',
                'gualeguay': 'gualeguay',
                'gualeguaychú': 'gualeguaychu',
                'paraná': 'parana',
                'villaguay': 'villaguay',
                'clorinda': 'clorinda',
                'formosa': 'formosacapital',
                'general_san_martín': 'generalsanmartin',
                'perico': 'perico',
                'san_pedro_de_jujuy': 'sanpedrodejujuy',
                'san_salvador_de_jujuy': 'sansalvadordejujuy',
                'general_acha': 'generalacha',
                'general_pico': 'generalpico',
                'intendente_alvear': 'intendentealvear',
                'santa_rosa': 'santarosa',
                'chilecito': 'chilecito',
                'la_rioja': 'lariojacapital',
                'general_alvear': 'generalalvear',
                'las_heras': 'lasheras',
                'lujan_de_cuyo': 'lujandecuyo',
                'maipu': 'maipu',
                'mendoza': 'mendozacapital',
                'palmira': 'palmira',
                'rivadavia': 'rivadavia',
                'san_rafael': 'sanrafael',
                'eldorado': 'eldorado',
                'oberá': 'obera',
                'posadas': 'posadas',
                'puerto_iguazú': 'puertoiguazu',
                'cutral_có': 'cutralco',
                'junin_de_los_andes': 'junindelosandes',
                'neuquén': 'neuquencapital',
                'san_martín_de_los_andes': 'sanmartindelosandes',
                'villa_la_angostura': 'villalaangostura',
                'zapala': 'zapala',
                'bariloche': 'bariloche',
                'cipolletti': 'cipolletti',
                'general_roca': 'generalroca',
                'san_antonio': 'sanantonio',
                'viedma': 'viedma',
                'cafayate': 'cafayate',
                'salta': 'saltacapital',
                'san_ramón_de_la_nueva_orán': 'sanramondelanuevaoran',
                'tartagal': 'tartagal',
                'san_juan': 'sanjuancapital',
                'san_martín': 'sanmartin',
                'merlo': 'merlo',
                'quines': 'quines',
                'san_francisco': 'sanfrancisco',
                'san_luis': 'sanluiscapital',
                'villa_mercedes': 'villamercedes',
                'caleta_olivia': 'caletaolivia',
                'rio_gallegos': 'riogallegos',
                'alvear': 'alvear',
                'arroyo_seco': 'arroyoseco',
                'casilda': 'casilda',
                'coronda': 'coronda',
                'esperanza': 'esperanza',
                'rafaela': 'rafaela',
                'reconquista': 'reconquista',
                'rosario': 'rosario',
                'san_lorenzo': 'sanlorenzo',
                'santa_fe': 'santafecapital',
                'venado_tuerto': 'venadotuerto',
                'villa_constitución': 'villaconstitucion',
                'añatuya': 'añatuya',
                'frías': 'frias',
                'la_banda': 'labanda',
                'santiago_del_estero': 'santiagodelesterocapital',
                'termas_de_río_hondo': 'termasderiohondo',
                'río_grande': 'riogrande',
                'ushuaia': 'ushuaia',
                'aguilares': 'aguilares',
                'banda_del_río_talí': 'bandadelriotali',
                'concepción': 'concepcion',
                'tafí_viejo': 'tafiviejo',
                'tucumán': 'tucumancapital'
            },
            categories: {
                'propiedades': 'inmuebles-y-propiedades-cat-16',
                'departamentos': 'inmuebles-y-propiedades-cat-16',
                'casas': 'inmuebles-y-propiedades-cat-16',
                'campos_y_chacras': 'inmuebles-y-propiedades-cat-16',
                'countries_y_barrios_cerrados': 'inmuebles-y-propiedades-cat-16',
                'oficinas': 'oficinas-locales-cat-368',
                'locales_comerciales': 'oficinas-locales-cat-368',
                'terrenos': 'terrenos-cat-410',
                'otras_propiedades': 'inmuebles-y-propiedades-cat-16',
                'vehículos': 'autos-motos-y-barcos-cat-362',
                'autos': 'autos-cat-378',
                'motos': 'motocicletas-scooters-cat-379',
                'respuestos_y_accesorios': 'accesorios-autos-cat-377',
                'náutica': 'otros-vehiculos-cat-380',
                'camionetas_y_utilitarios': 'camiones-vehiculos-comerciales-cat-416',
                'otros_vehículos': 'autos-motos-y-barcos-cat-362',
                'hogar_y_personal': 'casa-muebles-jardin-cat-806',
                'electrodomésticos': 'electrodomesticos-cat-808',
                'hogar_y_muebles': 'muebles-cat-807',
                'juegos_y_ropa_para_niños': 'bebes-ninos-cat-853',
                'jardín_y_exterior': 'decoracion-jardin-accesorios-cat-867',
                'ropa_y_accesorios': 'ropa-calzado-cat-817',
                'deportes_y_tiempo_libre': 'deportes-bicicletas-cat-864',
                'hobbies': 'hobbies-arte-deportes-cat-859',
                'deportes_y_fitness': 'deportes-bicicletas-cat-864',
                'animales_y_mascotas': 'animales-mascotas-cat-811',
                'películas_y_libros': 'libros-cd-dvd-cat-860',
                'objetos_arte_y_coleccionables': 'arte-antiguedades-cat-862',
                'música_e_instrumentos_musicales': 'instrumentos-musicales-cat-861',
                'salud_y_belleza': 'salud-belleza-cat-816',
                'electrónica': 'electronica-video-cat-800',
                'celulares_y_telefonía': 'telefonos-tablets-cat-830',
                'electrónica_audio_video': 'electronica-video-cat-800',
                'computación_y_accesorios': 'computadoras-notebooks-cat-803',
                'consolas_y_videojuegos': 'video-juegos-consolas-cat-802',
                'negocios_y_empleos': 'empleos-servicios-cat-821',
                'trabajo': 'ofertas-trabajo-ofrecido-cat-822',
                'busca_trabajo': 'busqueda-trabajo-cvs-cat-823',
                'servicios_varios': 'servicios-cat-824',
                'educación_y_capacitación': 'empleos-servicios-cat-821',
                'construcción_y_servicios_relacionados': 'empleos-servicios-cat-821',
                'tiendas_y_negocios': 'empleos-servicios-cat-821',
                'artículos_y_materiales_para_negocios': 'empleos-servicios-cat-821'
            }
        },
        '.roloeganga.com.ve': {
            to: '.olx.com.ve',
            regions: {
                'amazonas': 'amazonas',
                'anzoategui': 'anzoategui',
                'apure': 'apure',
                'aragua': 'aragua',
                'barinas': 'barinas',
                'bolivar': 'bolivar',
                'carabobo': 'carabobo',
                'cojedes': 'cojedes',
                'delta_amacuro': 'deltaamacuro',
                'caracas_distrito_capital': 'distritocapital',
                'falcon': 'falcon',
                'guarico': 'guarico',
                'lara': 'lara',
                'merida': 'merida',
                'miranda': 'miranda',
                'monagas': 'monagas',
                'nueva_esparta': 'nuevaesparta',
                'portuguesa': 'portuguesa',
                'sucre': 'sucre',
                'tachira': 'tachira',
                'trujillo': 'trujillo',
                'vargas': 'vargas',
                'yaracuy': 'yaracuy',
                'zulia': 'zulia',
                'venezuela': 'www'
            },
            areas: {
                'bolívar': 'bolivar-aragua',
                'camatagua': 'camatagua',
                'francisco_linares_alcántara': 'franciscolinaresalcantara',
                'girardot': 'girardot',
                'josé_angel_lamas': 'joseangellamas',
                'josé_félix_ribas': 'josefelixribas',
                'josé_rafael_revenga': 'joserafaelrevenga',
                'libertador': 'libertador',
                'mario_briceño_iragorry': 'mariobricenoiragorry',
                'ocumare_de_la_costa_de_oro': 'ocumaredelacostadeoro',
                'san_casimiro': 'sancasimiro',
                'san_sebastián': 'sansebastian',
                'santiago_mariño': 'santiagomarino',
                'santos_michelena': 'santosmichelena',
                'tovar': 'tovar',
                'urdaneta': 'urdaneta',
                'zamora': 'zamora',
                'bejuma': 'bejuma',
                'carlos_arvelo': 'carlosarvelo',
                'diego_ibarra': 'diegoibarra',
                'guacara': 'guacara',
                'juan_josé_mora': 'juanjosemora',
                'los_guayos': 'losguayos',
                'miranda': 'miranda-carabobo',
                'montalbán': 'montalban',
                'naguanagua': 'naguanagua',
                'puerto_cabello': 'puertocabello',
                'san_diego': 'sandiego',
                'san_joaquín': 'sanjoaquin',
                'valencia': 'valencia',
                'el_valle': 'distritocapital',
                'coche': 'distritocapital',
                'caricuao': 'distritocapital',
                'macarao': 'distritocapital',
                'antímano': 'distritocapital',
                'la_vega': 'distritocapital',
                'el_paraíso': 'distritocapital',
                'el_junquito': 'distritocapital',
                'sucre_catia': 'distritocapital',
                'san_juan': 'distritocapital',
                'santa_teresa': 'distritocapital',
                '23_de_enero': 'distritocapital',
                'la_pastora': 'distritocapital',
                'altagracia': 'distritocapital',
                'san_josé': 'distritocapital',
                'san_bernardino': 'distritocapital',
                'catedral': 'distritocapital',
                'candelaria': 'distritocapital',
                'san_agustín': 'distritocapital',
                'el_recreo': 'distritocapital',
                'san_pedro': 'distritocapital',
                'andrés_eloy_blanco': 'andreseloyblanco',
                'crespo': 'crespo',
                'iribarren': 'iribarren',
                'jiménez': 'jimenez',
                'morán': 'moran',
                'palavecino': 'palavecino',
                'simón_planas': 'simonplanas',
                'torres': 'torres',
                'vargas': 'vargas',
                'almirante_padilla': 'almirantepadilla',
                'baralt': 'baralt',
                'cabimas': 'cabimas',
                'catatumbo': 'catatumbo',
                'colón': 'colon',
                'francisco_javier_pulgar': 'franciscojavierpulgar',
                'guajira': 'zulia',
                'jesús_enrique_losada': 'jesusenriquelosada',
                'jesús_maría_semprún': 'jesusmariasemprun',
                'la_cañada_de_urdaneta': 'lacanadadeurdaneta',
                'lagunillas': 'lagunillas',
                'machiques_de_perijá': 'machiques',
                'mara': 'mara',
                'maracaibo': 'maracaibo',
                'rosario_de_perijá': 'rosariodeperija',
                'san_francisco': 'sanfrancisco-zulia',
                'santa_rita': 'santarita',
                'simón_bolívar': 'simonbolivar-zulia',
                'valmore_rodríguez': 'valmorerodriguez'
            },
            categories: {
                'inmuebles': '/inmuebles-y-propiedades-cat-16',
                'casas': '/inmuebles-y-propiedades-cat-16',
                'apartamentos': '/inmuebles-y-propiedades-cat-16',
                'oficinas': '/oficinas-locales-cat-368',
                'propiedades_commercial': '/oficinas-locales-cat-368',
                'terrenos': '/terrenos-cat-410',
                'otras_propiedades': '/inmuebles-y-propiedades-cat-16',
                'vehiculos': '/carros-motos-y-barcos-cat-362',
                'carros': '/carros-cat-378',
                'camionetas': '/camiones-vehiculos-comerciales-cat-416',
                'motos': '/motocicletas-scooters-cat-379',
                'repuestos': '/carros-motos-y-barcos-cat-362',
                'barcos': '/otros-vehiculos-cat-380',
                'otros_vehiculos': '/otros-vehiculos-cat-380',
                'camiones': '/camiones-vehiculos-comerciales-cat-416',
                'acoplados_y_casas_rodantes': '/otros-vehiculos-cat-380',
                'tractores': '/otros-vehiculos-cat-380',
                'furgones_y_buses': '/otros-vehiculos-cat-380',
                'ciclomotores_y_escuteres': '/otros-vehiculos-cat-380',
                'hogar_y_personal': '/casa-muebles-jardin-cat-806',
                'electrodomesticos': '/electrodomesticos-cat-808',
                'articulos_de_interior': '/casa-muebles-jardin-cat-806',
                'para_ninos': '/casa-muebles-jardin-cat-806',
                'jardin': '/decoracion-jardin-accesorios-cat-867',
                'ropa_accesorios': '/moda-belleza-cat-815',
                'deportes_pasatiempos': '/hobbies-arte-deportes-cat-859',
                'hobby': '/hobbies-arte-deportes-cat-859',
                'deportes_bicicletas': '/deportes-bicicletas-cat-864',
                'peliculas_libros': '/libros-cd-dvd-cat-860',
                'animales_mascotas': '/animales-mascotas-cat-811',
                'entradas_viajes': '/',
                'arte': '/arte-antiguedades-cat-862',
                'musica_instrumentos': '/instrumentos-musicales-cat-861',
                'salud_belleza': '/salud-belleza-cat-816',
                'electronica': '/electronicos-video-cat-800',
                'celulares': '/telefonos-celulares-cat-831',
                'television_camaras': '/tv-audio-video-cat-805',
                'computadores': '/computadoras-laptops-cat-803',
                'consolas_videojuegos': '/video-juegos-consolas-cat-802',
                'negocios_empleos': '/empleos-servicios-cat-821',
                'trabajo': '/busqueda-trabajo-cvs-cat-823'
            }
        }
    }
};
