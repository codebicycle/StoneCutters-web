module.exports = {
    ads: {
        quantity: {
            listing: 27,
            'static': 50,
            gallery: 27,
            related: 30,
            myAds: 15,
            myFavs: 15,
            myMsgs: 15
        }
    },
    adserving: {
        enabled: true
    },
    seo: {
        enabled: true,
        levelPath: true,
        popularSearches: true,
        relatedListings: true,
        topTitle: true,
        references: true,
        wikititles: true,
        altImages: true
    },
    tracking: {
        enabled: true,
        trackers: {
            serverSide: {
                enabled: true
            },
            ati: {
                enabled: true,
                server: {
                    enabled: true,
                    platforms: ['html5', 'html4', 'wap'],
                    event: true
                },
                client: {
                    enabled: true,
                    platforms: ['desktop', 'html5']
                }
            },
            analytics: {
                enabled: true,
                server: {
                    enabled: true,
                    platforms: ['html5', 'html4', 'wap'],
                    event: true
                },
                client: {
                    enabled: true,
                    platforms: ['desktop', 'html5']
                }
            },
            hydra: {
                enabled: true,
                platforms: ['desktop']
            },
            tagmanager: {
                enabled: false,
                platforms: ['desktop']
            },
            facebook: {
                enabled: false,
                platforms: ['html4', 'html5']
            },
            allpages: {
                enabled: false,
                platforms: ['html4', 'html5']
            },
            keyade: {
                enabled: true,
                platforms: ['wap', 'html4', 'html5', 'desktop']
            }
        }
    },
    featured: {
        enabled: false,
        quantity: {
            total: 6,
            top: 3,
            bottom: 3
        },
        section: {
            'categories#list': {
                enabled: false
            }
        }
    }
};
