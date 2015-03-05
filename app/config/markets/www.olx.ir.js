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
        enabled: false,
        slots: {
            listing: {
                mobiletop: {
                    service: 'none'
                },
                mobilebottom: {
                    service: 'none'
                },
                mobilenoresult: {
                    service: 'none'
                }
            }
        }
    },
    tracking: {
        enabled: true,
        trackers: {
            analytics: {
                enabled: false,
                server: {
                    enabled: false,
                    event: false
                },
                client: {
                    enabled: false
                }
            },
            keyade: {
                enabled: false
            },
            ninja: {
                enabled: false
            }
        }
    }
};
