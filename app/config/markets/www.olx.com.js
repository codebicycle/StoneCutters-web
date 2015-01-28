module.exports = {
    categoryTree: {
        order: [185, 186, 362, 187, 16, 191, 190]
    },
    adserving: {
        enabled: true,
        slots: {
            listing : {
                topgallery: {
                    service: 'CSA',
                    format: 'default'
                },
                top: {
                    service: 'CSA',
                    format: 'custom'
                },
                side: {
                    service: 'ADX',
                    format: 'WideSkyscraper',
                    params: {
                        slotId: '3997611586'
                    }
                },
                bottom: {
                    service: 'CSA',
                    format: 'custom'
                }
            },
            item: {
                top: {
                    service: 'AFC',
                    format: 'TextTop'
                },
                side: {
                    service: 'AFC',
                    format: 'MediumRectangle'
                },
                bottom: {
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
