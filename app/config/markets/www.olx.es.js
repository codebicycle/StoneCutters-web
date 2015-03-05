module.exports = {
    categoryTree: {
        order: [185, 186, 362, 187, 16, 191, 190]
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
    adserving: {
        enabled: true,
        slots: {
            listing: {
                mobiletop: {
                    service: 'ADX',
                    format: 'HalfBanner',
                    language: 'es',
                    location: 'Top',
                    params: {
                        slotId: 9904443106
                    }
                },
                side: {
                    service: 'ADX',
                    format: 'WideSkyscraper',
                    language: 'es',
                    location: 'Side',
                    params: {
                        slotId: 9904443106
                    }
                }
            },
            item: {
                side: {
                    service: 'ADX',
                    format: 'MediumRectangle',
                    language: 'es',
                    location: 'Side',
                    params: {
                        slotId: 8287982506
                    }
                }
            }
        }
    },
    featured: {
        enabled: true
    }
};
