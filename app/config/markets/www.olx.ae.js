module.exports = {
    categoryTree: {
        'default': {
            order: [405, 185, 362, 187, 186, 16, 191, 190],
            columns: [2, 3, 2]
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
    tracking: {
        trackers: {
            ati: {
                enabled: false
            },
            analytics: {
                enabled: false
            },
            ninja: {
                trackers: {
                    others: {
                        enabled: true,
                        platforms: ['wap', 'html4', 'html5', 'desktop']
                    }
                }
            }
        }
    }
};
