module.exports = {
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
    staticAccept: ['css', 'js'],
    imageAccept: ['jpg', 'jpeg', 'png', 'gif', 'ico'],
    environment: {
        type: 'testing',
        staticPath: 'http://static01.olx-st.com/mobile-webapp',
        imagePath: 'http://images01.olx-st.com/mobile-webapp'
    },
    localization: {
        wap: ['www.olx.com.br', 'www.olx.fr', 'www.olx.es', 'www.olx.in', 'www.olx.co.za', 'www.olx.ir', 'www.jaovat.com'],
        html4: ['www.olx.com.br', 'www.olx.fr', 'www.olx.es', 'www.olx.in', 'www.olx.co.za', 'www.olx.ir', 'www.jaovat.com'],
        html5: ['www.olx.com.br', 'www.olx.fr', 'www.olx.es', 'www.olx.in', 'www.olx.co.za', 'www.olx.ir', 'www.jaovat.com'],
        desktop: ['www.olx.com.bo', 'www.jaovat.com', 'www.olx.co.cr']
    },
    icons: {
        wap: ['www.olx.com.ar', 'www.olx.com.bd', 'www.olx.com.br', 'www.olx.cm', 'www.olx.com.co', 'www.olx.com.ec', 'www.olx.com.sv', 'www.olx.com.gh', 'www.olx.com.gt', 'www.olx.in', 'www.olx.co.ke', 'www.olx.com.ng', 'www.olx.com.pe', 'www.olx.sn', 'www.olx.co.za', 'www.olx.com.ve', 'www.olx.com.pk', 'www.olx.co.ug', 'www.olx.com.uy', 'www.olx.ir'],
        html4: ['www.olx.com.ar', 'www.olx.com.bd', 'www.olx.com.br', 'www.olx.cm', 'www.olx.com.co', 'www.olx.com.ec', 'www.olx.com.sv', 'www.olx.com.gh', 'www.olx.com.gt', 'www.olx.in', 'www.olx.co.ke', 'www.olx.com.ng', 'www.olx.com.pe', 'www.olx.sn', 'www.olx.co.za', 'www.olx.com.ve', 'www.olx.com.pk', 'www.olx.co.ug', 'www.olx.com.uy', 'www.olx.ir'],
        html5: ['www.olx.com.ar', 'www.olx.com.bd', 'www.olx.com.br', 'www.olx.cm', 'www.olx.com.co', 'www.olx.com.ec', 'www.olx.com.sv', 'www.olx.com.gh', 'www.olx.com.gt', 'www.olx.in', 'www.olx.co.ke', 'www.olx.com.ng', 'www.olx.com.pe', 'www.olx.sn', 'www.olx.co.za', 'www.olx.com.ve', 'www.olx.com.pk', 'www.olx.co.ug', 'www.olx.com.uy', 'www.olx.ir']
    },
    categoryTree: {
        'www.olx.com.bo': {
            order: [185, 186, 362, 187, 16, 191, 190]
        },
        'www.olx.it': {
            order: [185, 186, 362, 187, 16, 191, 190]
        },
        'www.olx.com': {
            order: [185, 186, 362, 187, 16, 191, 190]
        },
        'www.olx.es': {
            order: [185, 186, 362, 187, 16, 191, 190]
        },
        'www.olx.com.mx': {
            order: [185, 186, 362, 187, 16, 191, 190]
        },
        'www.olx.fr': {
            order: [185, 186, 362, 187, 16, 191, 190]
        },
        'www.olx.com.py': {
            order: [185, 186, 362, 187, 16, 191, 190]
        },
        'www.olx.com.ni': {
            order: [185, 186, 362, 187, 16, 191, 190]
        },
        'www.olx.hn': {
            order: [185, 186, 362, 187, 16, 191, 190]
        },
        'www.olx.co.cr': {
            order: [185, 186, 362, 187, 16, 191, 190]
        },
        'www.olx.com.pa': {
            order: [185, 186, 362, 187, 16, 191, 190]
        },
        'www.olx.com.sv': {
            order: [830, 800, 362, 806, 859, 16, 187, 815, 191, 186, 811, 190],
            columns: [4, 3, 3]
        },
        'www.olx.com.gt': {
            order: [830, 800, 362, 806, 859, 16, 187, 815, 191, 186, 811, 190],
            columns: [4, 3, 3]
        },
        'www.olx.co.tz': {
            order: [185, 186, 187, 362, 16, 191, 190],
            columns: [1, 3, 2],
        },
        'www.olx.co.ug': {
            order: [830, 800, 811, 806, 362, 815, 859, 16, 821],
            columns: [3, 2, 2],
        },
        'www.olx.com.gh': {
            order: [830, 800, 811, 806, 362, 815, 859, 16, 821],
            columns: [3, 2, 2],
        },
        'www.olx.sn': {
            columns: [2, 2, 2],
        },
        'www.olx.com.uy': {
            order: [830, 800, 811, 815, 853, 362, 859, 806, 821 ,16],
            columns: [3, 3, 2],
        },
        'www.olx.cm': {
            order: [800, 806, 815, 859, 600, 362, 16, 821],
            columns: [2, 2, 2],
        }
    },
    testimonials: {
        'www.olx.com.bo': [
            {
                name: 'María de Santa Cruz',
                testimonial: 'Vendí una bicicleta que ya no usaba, ¡lo mejor fue que no pagué comisión!',
                image: '/images/desktop/maria.jpg',
            },
            {
                name: 'Raúl de La Paz',
                testimonial: '¡Publiqué un celular a la mañana y al día siguiente ya lo había vendido!',
                image: '/images/desktop/raul.jpg',
            }
        ]
    },
    socials: {
        'www.olx.com.co': [
            {
                name: 'facebook',
                link: 'https://www.facebook.com/OLXcolombia'
            },
            {
                name: 'twitter',
                link: 'https://twitter.com/olx_colombia'
            },
            {
                name: 'youtube',
                link: 'https://www.youtube.com/user/OLXcolombia'
            }
        ],
        'www.olx.co.cr': [
            {
                name: 'facebook',
                link: 'https://www.facebook.com/OLXCostaRica'
            },
            {
                name: 'twitter',
                link: 'https://twitter.com/olx_costarica'
            },
            {
                name: 'youtube',
                link: 'https://www.youtube.com/user/OLXcostarica'
            }
        ],
        'www.olx.com.ec': [
            {
                name: 'facebook',
                link: 'https://www.facebook.com/OLXEcuador'
            },
            {
                name: 'twitter',
                link: 'https://twitter.com/OLX_Ecuador'
            },
            {
                name: 'youtube',
                link: 'https://www.youtube.com/user/OLXecuador'
            }
        ],
        'www.olx.com.sv': [
            {
                name: 'facebook',
                link: 'https://www.facebook.com/OLXElSalvador'
            },
            {
                name: 'twitter',
                link: 'https://twitter.com/OLX_ElSalvador'
            },
            {
                name: 'youtube',
                link: 'https://www.youtube.com/user/OLXelsalvador'
            }
        ],
        'www.olx.com.gt': [
            {
                name: 'facebook',
                link: 'https://www.facebook.com/OLXGuatemala'
            },
            {
                name: 'twitter',
                link: 'https://twitter.com/OLX_Guatemala'
            },
            {
                name: 'youtube',
                link: 'https://www.youtube.com/user/OLXguatemala'
            }
        ],
        'www.olx.com.pa': [
            {
                name: 'facebook',
                link: 'https://www.facebook.com/pages/OLX-Panama/209969112487961'
            },
            {
                name: 'youtube',
                link: 'https://www.youtube.com/user/OLXpanama'
            }
        ],
        'www.olx.com.pe': [
            {
                name: 'facebook',
                link: 'https://www.facebook.com/OLXperu'
            },
            {
                name: 'twitter',
                link: 'https://twitter.com/OLX_Peru'
            },
            {
                name: 'youtube',
                link: 'https://www.youtube.com/user/OLXperu'
            }
        ],
        'www.olx.com.ve': [
            {
                name: 'facebook',
                link: 'https://www.facebook.com/OLXvenezuela'
            },
            {
                name: 'twitter',
                link: 'https://twitter.com/OLX_Venezuela'
            },
            {
                name: 'youtube',
                link: 'https://www.youtube.com/user/OLXvenezuela'
            }
        ]
    },
    countryMapStyle: {
        special: ['www.olx.com.pa', 'www.olx.hn', 'www.olx.com.mx'],
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
                worldwide: true,
                countries: ['www.olx.ir']
            },
            interstitialByADX: {
                worldwide: false,
                countries: ['www.olx.com.py']
            },
            autoLocation: {
                worldwide: true,
                countries: ['www.olx.com.bd','www.olx.com.bo','www.olx.co.cr','www.olx.ba','www.olx.cz','www.olx.com.ec','www.olx.com.eg','www.olx.com.sv','www.olx.fr','www.olx.gr','www.olx.hn','www.olx.jp','www.olx.is','www.olx.com.mt','www.olx.com.mx','www.olx.md','www.olx.no','www.olx.com.pa','www.olx.com.py','www.olx.com.pe','www.olx.ph','www.olx.com.pr','www.olx.lk','www.olx.com.uy', 'www.olx.ir']
            },
            smartBanner: {
                worldwide: false,
                countries: []
            }
        },
        html4: {
            interstitialByADX: {
                worldwide: false,
                countries: ['www.olx.com.py']
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
            'www.olx.com.mx': 'olx.com'
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

    }
};
