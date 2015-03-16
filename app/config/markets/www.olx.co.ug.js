module.exports = {
    categoryTree: {
        'default': {
            order: [830, 800, 811, 806, 362, 815, 859, 16, 821],
            columns: [3, 2, 2]
        }
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
                enabled: true,
                platforms: ['desktop', 'html5', 'html4', 'wap']
            }
        },
    },
    adserving: {
        enabled: false
    },
    marketing: {
        post_banner: {
            image: 'post-africa'
        }
    },
    successPage: {
        keepPosting: [
            {
                category: '806',
                subcategory: '807',
                icon: '806',
                name: 'Furniture'
            },
            {
                category: '815',
                subcategory: '817',
                icon: '815',
                name: 'Fashion'
            },
            {
                category: '830',
                subcategory: '831',
                icon: '830',
                name: 'Phones'
            }
        ]
    }
};
