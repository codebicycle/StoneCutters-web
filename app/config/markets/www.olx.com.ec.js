module.exports = {
    socials: [
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
    videos: [
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
