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
            myConv: 300,
            myConvHtml4: 10
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
        altImages: true,
        prevItem: true,
        nextItem: true,
        metaTitleLength: 110,
        metaDescriptionLength: 160,
        maxResultToIndexFollow: 0
    },
    adserving: {
        enabled: true,
        slots: {
            listing: {
                topgallery: {
                    service: 'CSA',
                    format: 'default',
                    location: 'Top',
                    params: {
                        number: 2
                    }
                },
                top: {
                    service: 'CSA',
                    format: 'custom',
                    location: 'Top',
                    params: {
                        number: 2
                    }
                },
                mobiletop: {
                    service: 'AFC',
                    format: 'TextMobile',
                    location: 'Top',
                    params: {
                        number: 2
                    }
                },
                side: {
                    service: 'AFC',
                    format: 'WideSkyscraper',
                    location: 'Side'
                },
                bottom: {
                    service: 'CSA',
                    format: 'custom',
                    location: 'Bottom'
                },
                mobilebottom: {
                    service: 'AFC',
                    format: 'TextMobile',
                    location: 'Bottom'
                },
                noresult: {
                    service: 'CSA',
                    format: 'custom',
                    location: 'Top',
                    params: {
                        number: 10
                    }
                },
                mobilenoresult: {
                    service: 'AFC',
                    format: 'TextMobile',
                    location: 'Top',
                    params: {
                        number: 10
                    }
                }
            },
            item: {
                top: {
                    service: 'AFC',
                    format: 'TextTop',
                    location: 'Top'
                },
                side: {
                    service: 'AFC',
                    format: 'MediumRectangle',
                    location: 'Side'
                },
                bottom: {
                    service: 'AFC',
                    format: 'TextBottom',
                    location: 'Bottom'
                }
            }
        }
    },
    socials: {
        facebookLogin: true
    },
    tracking: {
        enabled: true,
        trackers: {
            serverSide: {
                enabled: true
            },
            ati: {
                enabled: true,
                platforms: ['html5', 'html4', 'wap'],
                server: {
                    enabled: true,
                    platforms: ['html5', 'html4', 'wap'],
                    event: true
                },
                client: {
                    enabled: true,
                    platforms: ['html5']
                }
            },
            analytics: {
                enabled: true,
                platforms: ['html5', 'html4', 'wap'],
                server: {
                    enabled: true,
                    platforms: ['html5', 'html4', 'wap'],
                    event: true
                },
                client: {
                    enabled: true,
                    platforms: ['html5']
                }
            },
            hydra: {
                enabled: false,
                platforms: ['desktop']
            },
            tagmanager: {
                enabled: false,
                platforms: ['desktop']
            },
            allpages: {
                enabled: false,
                platforms: ['html4', 'html5']
            },
            keyade: {
                enabled: true
            },
            ninja: {
                enabled: true,
                platforms: ['wap', 'html4', 'html5', 'desktop'],
                noscript: {
                    platforms: ['wap', 'html4', 'html5', 'desktop']
                },
                trackers: {
                    others: {
                        enabled: true,
                        platforms: ['desktop']
                    },
                    hydra: {
                        enabled: true
                    }
                }
            },
            adroll: {
                enabled: false,
                platforms: ['desktop']
            },
            floodlight: {
                enabled: false,
                platforms: ['desktop']
            },
            mixpanel: {
                enabled: true,
                platforms: ['desktop', 'html5']
            }            
        }
    },
    featured: {
        enabled: false,
        platforms: ['desktop'],
        quantity: {
            total: 6,
            top: 3,
            bottom: 3
        },
        params: {
            'f.featured': '3+OR+5',
            featuredAds: true,
            offset: 0
        },
        sections: {
            all: false,
            'categories#list': {
                quantity: {
                    total: 6
                },
                params: {
                    'f.featured': '4+OR+5'
                }
            }
        }
    },
    chat: {
        enabled: false,
        sections: {
            'categories#list': {
                enabled: false
            },
            'post#flow': {
                enabled: false
            }
        }
    },
    relatedAds: {
        desktop: {
            enabled: false,
            group: 2,
            quantity: 3,
            module: 'suggestion',
            layout: 'default',
            link: 'http://samurai.onap.io/samurai.js'
        },
        html5: {
            enabled: false,
            group: 2,
            quantity: 3,
            module: 'suggestion',
            layout: 'default',
            link: 'http://samurai.onap.io/samurai.js'
        }
    },
    help: {
        linkblog: {
            href: 'http://blog.olx.com',
            target: '_blank'
        }
    },
    abundance: {
        enabled: false
    },
    validator: {
        email: {
            enabled: false,
            platforms: ['html5', 'desktop'],
            key: 'pubkey-6f6d5eea08926fa815f65250086dfbbb'
        },
        phone: {
            enabled: false
        }
    },
    flagItem: {
        enabled: false
    },
    userzoom: {
        enabled: false
    },
    hints: {
        desktop: {
            email: {
                enabled: false,
                hint: '',
                icon: ''
            }
        },
        html5: {
            email: {
                enabled: false,
                hint: '',
                icon: ''
            }
        },
        html4: {
            email: {
                enabled: false,
                hint: '',
                icon: ''
            }
        },
        wap: {
            email: {
                enabled: false,
                hint: '',
                icon: ''
            }
        }
    },
    notifications: {
        desktop: {
            enabled: false
        },
        html5: {
            enabled: false
        }
    }
};
