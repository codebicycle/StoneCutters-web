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
        type: 'testing',
        staticPath: 'http://static01.olx-st.com/mobile-webapp',
        imagePath: 'http://images01.olx-st.com/mobile-webapp'
    },
    tracking: {
        enabled: true
    },
    localization: {
        wap: ['www.olx.fr', 'www.olx.es', 'www.olx.co.za'],
        html4: ['www.olx.com.br', 'www.olx.fr', 'www.olx.es', 'www.olx.in', 'www.olx.co.za'],
        html5: ['www.olx.com.br', 'www.olx.fr', 'www.olx.es', 'www.olx.in', 'www.olx.co.za'],
        desktop: []
    },
    icons: {
        wap: ['www.olx.com.ar', 'www.olx.com.bd', 'www.olx.com.br', 'www.olx.cm', 'www.olx.com.co', 'www.olx.com.ec', 'www.olx.com.sv', 'www.olx.com.gh', 'www.olx.com.gt', 'www.olx.in', 'www.olx.co.ke', 'www.olx.com.ng', 'www.olx.com.pe', 'www.olx.sn', 'www.olx.co.za', 'www.olx.com.ve', 'www.olx.com.pk', 'www.olx.co.ug', 'www.olx.com.uy'],
        html4: ['www.olx.com.ar', 'www.olx.com.bd', 'www.olx.com.br', 'www.olx.cm', 'www.olx.com.co', 'www.olx.com.ec', 'www.olx.com.sv', 'www.olx.com.gh', 'www.olx.com.gt', 'www.olx.in', 'www.olx.co.ke', 'www.olx.com.ng', 'www.olx.com.pe', 'www.olx.sn', 'www.olx.co.za', 'www.olx.com.ve', 'www.olx.com.pk', 'www.olx.co.ug', 'www.olx.com.uy'],
        html5: ['www.olx.com.ar', 'www.olx.com.bd', 'www.olx.com.br', 'www.olx.cm', 'www.olx.com.co', 'www.olx.com.ec', 'www.olx.com.sv', 'www.olx.com.gh', 'www.olx.com.gt', 'www.olx.in', 'www.olx.co.ke', 'www.olx.com.ng', 'www.olx.com.pe', 'www.olx.sn', 'www.olx.co.za', 'www.olx.com.ve', 'www.olx.com.pk', 'www.olx.co.ug', 'www.olx.com.uy']
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
                worldwide: false,
                countries: []
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
    }
};
