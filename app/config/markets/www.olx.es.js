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
                    location: 'Top'
                },
                side: {
                    service: 'ADX',
                    format: 'WideSkyscraper',
                    location: 'Side'
                }
            },
            item: {
                side: {
                    service: 'ADX',
                    format: 'MediumRectangle',
                    location: 'Side'
                }
            }
        }
    },
    featured: {
        enabled: true
    }
};
