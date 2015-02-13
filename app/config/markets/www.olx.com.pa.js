module.exports = {
    categoryTree: {
        order: [185, 186, 362, 187, 16, 191, 190]
    },
    countryMapStyle: 'special',
    socials: {
        facebookLogin: true,
        links: [
            {
                name: 'facebook',
                link: 'https://www.facebook.com/pages/OLX-Panama/209969112487961'
            },
            {
                name: 'youtube',
                link: 'https://www.youtube.com/user/OLXpanama'
            }
        ]
    },
    videos: [
        {
            title: 'OLX Panama - Bicicleta - Vender es fácil',
            id: 'rXfzHDejpRs'
        },
        {
            title: 'OLX Panama - Anteojos - Vender es fácil',
            id: 'eEyfckF_Xgs'
        },
        {
            title: 'OLX Panamá - Poker - Vender es fácil',
            id: 'm0sDSvsBEf0'
        }
    ],
    successPage: {
        keepPosting: [
            {
                category: '185',
                subcategory: '228',
                icon: '806',
                name: 'Hogar y Jardín'
            },
            {
                category: '185',
                subcategory: '366',
                icon: '800',
                name: 'Electrónica'
            },
            {
                category: '185',
                subcategory: '219',
                icon: '830',
                name: 'Móviles'
            }
        ]
    },
    adserving: {
        slots: {
            listing: {
                topgallery: {
                    service: 'CSA',
                    format: 'default',
                    location: 'Top',
                    numberPerCategoryCSA: {
                        '800': 1,
                        '806': 1,
                        '815': 1,
                        '830': 1,
                        '853': 1,
                        '859': 1,
                        '362': 2,
                        allresults: 2,
                        allresultsig: 2
                    }
                },
                top: {
                    service: 'CSA',
                    format: 'custom',
                    location: 'Top',
                    numberPerCategoryCSA: {
                        '800': 1,
                        '806': 1,
                        '815': 1,
                        '830': 1,
                        '853': 1,
                        '859': 1,
                        '362': 2,
                        allresults: 2,
                        allresultsig: 2
                    }
                },
                side: {
                    service: 'none'
                }
            },
            item: {
                top: {
                    service: 'none'
                },
                side: {
                    service: 'none'
                }
            }
        }
    },
    tracking: {
        trackers: {
            hydra: {
                enabled: false
            },
            tagmanager: {
                enabled: false
            },
            ninja: {
                enabled: true
            },
            ati: {
                enabled: true,
                server: {
                    enabled: true,
                    platforms: ['html5', 'html4', 'wap'],
                    event: true
                },
                client: {
                    enabled: true,
                    platforms: ['html5']
                }
            },
            analytics: {
                enabled: true,
                server: {
                    enabled: true,
                    platforms: ['html5', 'html4', 'wap'],
                    event: true
                },
                client: {
                    enabled: true,
                    platforms: ['html5']
                }
            }
        }
    }
};
