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
        type: 'staging',
        staticPath: 'http://static01.olx-st.com/mobile-webapp',
        imagePath: 'http://images01.olx-st.com/mobile-webapp'
    },
    localization: {
        wap: ['www.olx.fr', 'www.olx.es', 'www.olx.in', 'www.olx.co.za', 'www.olx.ir', 'www.jaovat.com'],
        html4: ['www.olx.com.br', 'www.olx.fr', 'www.olx.es', 'www.olx.in', 'www.olx.co.za', 'www.olx.ir', 'www.jaovat.com'],
        html5: ['www.olx.com.br', 'www.olx.fr', 'www.olx.es', 'www.olx.in', 'www.olx.co.za', 'www.olx.ir', 'www.jaovat.com'],
        desktop: ['www.olx.com.bo', 'www.olx.com.py', 'www.jaovat.com']
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
        'www.olx.co.tz': {
            order: [185, 187, 186, 191, 16, 362, 190],
            columns: [2, 2, 2],
        },
        'www.olx.co.ug': {
            order: [830, 800, 811, 806, 362, 815, 859, 16, 821],
            columns: [3, 2, 2],
        },
        'www.olx.com.gh': {
            order: [830, 800, 811, 806, 815, 362, 859, 16, 821],
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
    countryMapStyle: {
        special: ['www.olx.com.pa', 'www.olx.hn'],
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
                countries: ['www.olx.in', 'www.olx.ir']
            },
            listingFilters: {
                worldwide: false,
                countries: []
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
    }
};
