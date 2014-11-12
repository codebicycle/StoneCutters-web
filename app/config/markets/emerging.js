module.exports = {
    ads: {
        quantity: {
            listing: 30,
            'static': 50,
            gallery: 18,
            related: 30
        }
    },
    seo: {
        enabled: true,
        levelPath: true,
        popularSearches: true,
        relatedListings: true,
        topTitle: true,
        references: true
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
