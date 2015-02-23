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
    adserving: {
        enabled: true,
        slots: {
            listing: {
                mobiletop: {
                    service: 'CSA',
                    format: 'mobileweb',
                    location: 'Top'
                },
                mobilebottom: {
                    service: 'CSA',
                    format: 'mobileweb',
                    location: 'Bottom'
                },
                mobilenoresult: {
                    service: 'CSA',
                    format: 'mobilenoresult',
                    location: 'Top'
                }
            }
        }
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
