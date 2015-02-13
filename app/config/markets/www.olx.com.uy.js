module.exports = {
    categoryTree: {
        order: [830, 800, 811, 815, 853, 362, 859, 806, 821 ,16],
        columns: [3, 3, 2]
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
    videos: [
        {
            title: 'OLX Uruguay - Celular - Vender es fácil',
            id: '29QoFeoJldU'
        },
        {
            title: 'OLX Uruguay - Bicicleta - Vender es fácil',
            id: 'Z3wwfLdLgj8'
        },
        {
            title: 'OLX Uruguay - Auto - Vender es fácil',
            id: 'rhJVT5fDkWU'
        }
    ],
    socials: {
        facebookLogin: true
    },
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
    tracking: {
        trackers: {
            tagmanager: {
                enabled: true
            }
        }
    }
};
