module.exports = {
    ads: {
        quantity: {
            listing: 30,
            'static': 50,
            gallery: 18,
            related: 30
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
        extendedTitle: true,
        references: true
    },
    tracking: {
        enabled: true,
        trackers: {
            server: true,
            ati: {
                enabled: true,
                server: true,
                client: true
            },
            analytics: {
                enabled: true,
                server: true,
                client: true
            },
            hydra: true
        }
    }
};
