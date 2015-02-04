module.exports = {
    categoryTree: {
        order: [405, 185, 362, 187, 186, 16, 191, 190],
        columns: [2, 3, 2]
    },
    adserving: {
        slots: {
            listing : {
                topgallery: {
                    service: 'CSA',
                    format: 'default',
                    location: 'Top',
                    seo: 1
                },
                top: {
                    service: 'CSA',
                    format: 'custom',
                    location: 'Top',
                    seo: 1
                },
                side: {
                    service: 'ADX',
                    format: 'WideSkyscraper',
                    location: 'Side',
                    params: {
                        slotId: '3997611586'
                    }
                },
                bottom: {
                    service: 'CSA',
                    format: 'custom',
                    location: 'Bottom',
                    seo: 0
                },
                noresult: {
                    service: 'CSA',
                    format: 'custom',
                    location: 'Top',
                    params: {
                        number: 10
                    },
                    seo: 10
                }
            },
            item: {
                top: {
                    location: 'Top',
                    service: 'AFC',
                    format: 'TextTop'
                },
                side: {
                    location: 'Side',
                    service: 'AFC',
                    format: 'MediumRectangle'
                },
                bottom: {
                    location: 'Bottom',
                    service: 'AFC',
                    format: 'TextBottom'
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
                name: 'Home and Garden'
            },
            {
                category: '185',
                subcategory: '366',
                icon: '800',
                name: 'Electronics'
            },
            {
                category: '185',
                subcategory: '219',
                icon: '830',
                name: 'Móviles'
            }
        ]
    }
};
