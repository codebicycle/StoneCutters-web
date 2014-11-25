module.exports = {
    ads: {
        quantity: {
            listing: 27,
            'static': 50,
            gallery: 27,
            related: 30,
            myAds: 10,
            myFavs: 10,
            myMsgs: 10
        },
        maxPage: {
            allResults: 500
        }
    },
    seo: {
        enabled: true,
        levelPath: true,
        popularSearches: true,
        relatedListings: true,
        topTitle: true,
        references: true,
        wikititles: true
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
                    platforms: ['html5', 'html4', 'wap']
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
                    platforms: ['html5', 'html4', 'wap']
                },
                client: {
                    enabled: true,
                    platforms: ['desktop', 'html5']
                }
            },
            hydra: {
                enabled: true,
                platforms: ['desktop']
            }
        }
    }
};
