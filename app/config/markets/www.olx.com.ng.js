module.exports = {
    post_customer_contact: {
        phone: '0700-CALL-OLX',
        phone_wodrs: '(2255-659)',
        contact_photo: '/images/desktop/posting_customer/ng.jpg',
        horary: 'Call us Monday to Friday from 9am to 4pm',
        name: 'Abiola',
        work: 'Customer Support Manager',
        phrase: '"Our team is here to help!"'
    },
    categoryTree: {
        order: [830, 800, 811, 806, 362, 815, 859, 16, 821],
        columns: [3, 2, 2]
    },
    videos: [
        {
            title: 'OLX Makes Sam Okpale Happy!!!',
            id: 'bBRVITNlSSo'
        },
        {
            title: 'Uba Dominic\'s Success Story',
            id: 'dvmRBOEb18c'
        },
        {
            title: 'OLX Sell IT show Season 1 -Episode 8',
            id: 'W-Db15447es'
        },
        {
            title: 'Download the OLX app on your phone Now!!!',
            id: 'Hsco1LXyJcM'
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
            },
            adroll: {
                enabled: true
            }
        }
    }
};
