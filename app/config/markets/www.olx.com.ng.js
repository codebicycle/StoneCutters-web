module.exports = {
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
    tracking: {
        trackers: {
            allpages: {
                enabled: true
            }
        }
    }
};
