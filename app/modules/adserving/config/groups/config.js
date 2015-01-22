'use strict';

module.exports = {
    'default': {
        CSA: {
            'default': {
                slot_top_listing_gallery: {
                    seo: 1,
                    params: {
                        number: 3
                    }
                },
                slot_top_listing: {
                    seo: 1,
                    params: {
                        number: 3,
                        fontSizeTitle: 18,
                        adIconLocation: 'ad-left',
                        adIconWidth: 143,
                        adIconHeight: 112,
                        adIconSpacingAbove: 4,
                        adIconSpacingBefore: 6,
                        adIconSpacingAfter: 15,
                        adIconUrl: 'http://afs.googleusercontent.com/olx/olx_[langcode].png'
                    }
                },
                slot_bottom_listing: {
                    seo: 0,
                    params: {
                        number: 3,
                        fontSizeTitle: 18,
                        adIconLocation: 'ad-left',
                        adIconWidth: 143,
                        adIconHeight: 112,
                        adIconSpacingAbove: 4,
                        adIconSpacingBefore: 6,
                        adIconSpacingAfter: 15,
                        adIconUrl: 'http://afs.googleusercontent.com/olx/olx_[langcode].png'
                    }
                }
            }
        },
        AFC: {
            'default': {
                slot_side_listing: {
                    seo: 1,
                    params: {
                        number: 1,
                        media: 'flash, image',
                        width: '160',
                        height: '600'
                    }
                },
                slot_side_item: {
                    seo: 1,
                    params: {
                        number: 1,
                        media: 'flash, image',
                        width: '300',
                        height: '250'
                    }
                },
                slot_top_item: {
                    seo: 1,
                    params: {
                        number: 3,
                        media: 'text',
                        width: '728',
                        height: '90'
                    }
                },
                slot_bottom_item: {
                    seo: 1,
                    params: {
                        number: 5,
                        media: 'text',
                        width: '728',
                        height: '90'
                    }
                }
            }
        }
    },
    'www.olx.com.ar': {
        CSA: {
            customs: [{
                categories: [800, 806, 815, 830, 853, 859],
                slot_top_listing: {
                    params: {
                        number: 0
                    }
                }
            },
            {
                categories: [362],
                slot_top_listing: {
                    params: {
                        number: 2
                    }
                }
            },
            {
                categories: ['allresults', 'allresultsig'],
                slot_top_listing: {
                    params: {
                        number: 2
                    }
                }
            }]
        },
        AFC: {
            'default': {
                slot_side_listing: {
                    enabled: false
                },
                slot_side_item: {
                    enabled: false
                },
                slot_top_item: {
                    enabled: false
                }
            }
        }
    },
    'www.olx.com.co': {
        CSA: {
            customs: [{
                categories: [800, 806, 815, 830, 859],
                slot_top_listing: {
                    params: {
                        number: 1
                    }
                }
            },
            {
                categories: [362],
                slot_top_listing: {
                    params: {
                        number: 2
                    }
                }
            },
            {
                categories: ['allresults', 'allresultsig'],
                slot_top_listing: {
                    params: {
                        number: 2
                    }
                }
            }]
        },
        AFC: {
            'default': {
                slot_side_listing: {
                    enabled: false
                },
                slot_side_item: {
                    enabled: false
                },
                slot_top_item: {
                    enabled: false
                }
            }
        }
    },
    'group1': {
        CSA: {
            customs: [{
                categories: [185, 800, 806, 815, 830, 853, 859],
                slot_top_listing: {
                    params: {
                        number: 1
                    }
                }
            },
            {
                categories: [362],
                slot_top_listing: {
                    params: {
                        number: 2
                    }
                }
            },
            {
                categories: ['allresults', 'allresultsig'],
                slot_top_listing: {
                    params: {
                        number: 2
                    }
                }
            }]
        },
        AFC: {
            'default': {
                slot_side_listing: {
                    enabled: false
                },
                slot_side_item: {
                    enabled: false
                },
                slot_top_item: {
                    enabled: false
                }
            }
        }
    }
};
