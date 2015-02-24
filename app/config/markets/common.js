module.exports = {
    ads: {
        quantity: {
            listing: 27,
            'static': 50,
            gallery: 27,
            related: 30,
            myAds: 15,
            myFavs: 15,
            myMsgs: 15,
            myConvs: 15,
            myConv: 50,
            myConvHtml5: 300
        },
        renew: {
            enabled: true,
            daysToRenew: 15
        },
        rebump: {
            enabled: false
        },
        maxPage: {
            allResults: 500
        }
    },
    seo: {
        enabled: true,
        levelPath: true,
        popularSearches: true,
        topSearches: true,
        relatedListings: true,
        topTitle: true,
        references: true,
        wikititles: true,
        prevItem: true,
        nextItem: true,
        metaTitleLength: 110,
        metaDescriptionLength: 160,
        maxResultToIndexFollow: 0
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
