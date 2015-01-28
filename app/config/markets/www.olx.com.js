module.exports = {
    categoryTree: {
        order: [185, 186, 362, 187, 16, 191, 190]
    },
    adserving: {
        enabled: true,
        slots: {
            listing : {
                topgallery: {
                    location: 'Top',
                    service: 'CSA',
                    format: 'default'
                },
                top: {
                    location: 'Top',
                    service: 'CSA',
                    format: 'custom'
                },
                side: {
                    location: 'Side',
                    service: 'ADX',
                    format: 'WideSkyscraper',
                    params: {
                        slotId: '3997611586'
                    }
                },
                bottom: {
                    location: 'Bottom',
                    service: 'CSA',
                    format: 'custom'
                },
                noresult: {
                    seo: 10,
                    location: 'Top',
                    service: 'CSA',
                    format: 'custom',
                    params: {
                        number: 10
                    }
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
    },
    featured: {
        enabled: true,
        quantity: {
            total: 2,
            top: 1,
            bottom: 1
        }
    }
};
