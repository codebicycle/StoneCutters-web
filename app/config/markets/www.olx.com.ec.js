module.exports = {
    categoryTree: {
        order: [830, 800, 811, 806, 362, 815, 859, 16, 821],
        columns: [3, 2, 2]
    },
    celebrities: {
        home: {
            enabled: true
        }
    },
    socials: {
        facebookLogin: false,
        links: [
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
        ]
    },
    videos: [
        {
            title: 'OLX Ecuador - Consola',
            id: '-VDOdJUePhI'
        },
        {
            title: 'OLX Ecuador - Garaje',
            id: 'BpwjQm6Atcc'
        },
        {
            title: 'OLX Ecuador - Comercial Sofá Cama - Vender es fácil',
            id: 'XlLozB_JfRk'
        },
        {
            title: 'En OLX todos pueden vender',
            id: 'HYFEkS-fhRA'
        },
        {
            title: 'OLX Ecuador - Comercial Smartphone - Vender es fácil',
            id: 'Ui3-Mows0KM'
        }
    ],
    successPage: {
        keepPosting: [
            {
                category: '806',
                subcategory: '807',
                icon: '806',
                name: 'Muebles'
            },
            {
                category: '815',
                subcategory: '817',
                icon: '815',
                name: 'Moda'
            },
            {
                category: '830',
                subcategory: '831',
                icon: '830',
                name: 'Teléfonos'
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
    }
};
