module.exports = {
    categoryTree: {
        order: [185, 186, 362, 187, 16, 191, 190]
    },
    celebrities: {
        home: {
            enabled: true
        }
    },
    socials: {
        facebookLogin: true,
        links: [
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
        ]
    },
    videos: [
        {
            title: 'OLX Costa Rica - Consola',
            id: 'dSavGD707o4'
        },
        {
            title: 'OLX Costa Rica - Mauricio "El Chunche" Montero - Garaje',
            id: '1sR75hvjlRI'
        },
        {
            title: 'OLX Costa Rica - Bicicleta - Vender es fácil',
            id: 'iYUX408RQq4'
        },
        {
            title: 'OLX Costa Rica - Anteojos - Vender es fácil',
            id: 'Mrfetr0kAoI'
        },
        {
            title: 'OLX Costa Rica - Poker - Vender es fácil',
            id: 'Yf5i1HOwd70'
        }
    ],
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
    tracking: {
        trackers: {
            hydra: {
                enabled: false
            },
            tagmanager: {
                enabled: true
            }
        }
    }
};
