'use strict';

module.exports = {
    slot_top_listing_gallery: {
        enabled: true,
        defaultType: 'CSA',
        location: 'Top',
        types: {
            CSA: {
                seo: 1,
                params: {
                    number: 3
                },
                excludedCategories: []
            }
        }
    },
    slot_top_listing: {
        enabled: true,
        defaultType: 'CSA',
        location: 'Top',
        types: {
            CSA: {
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
                    adIconUrl: 'http://afs.googleusercontent.com/olx/olx_pt.png'
                },
                excludedCategories: []
            }
        }
    },
    slot_bottom_listing: {
        enabled: true,
        defaultType: 'CSA',
        location: 'Bottom',
        types: {
            CSA: {
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
                    adIconUrl: 'http://afs.googleusercontent.com/olx/olx_pt.png'
                },
                excludedCategories: []
            }
        }
    },
    slot_side_listing: {
        enabled: true,
        defaultType: 'ADX',
        location: 'Side',
        types: {
            ADX: {
                params: {
                    slotId: 3997611586,
                    width: '160',
                    height: '600'
                },
                excludedCategories: []
            }
        }
    },
    /*slot_top_item: {
        enabled: true,
        defaultType: 'ADX',
        location: 'Top',
        types: {
            ADX: {
                params: {
                    width: '728',
                    height: '90'
                },
                excludedCategories: []
            }
        }
    }*/
    slot_top_item: {
        enabled: true,
        defaultType: 'AFC',
        location: 'Top',
        types: {
            AFC: {
                params: {
                    hints: 'casa',
                    number: 3,
                    media: 'image',
                    width: '728',
                    height: '90'
                },
                excludedCategories: []
            }
        }
    },
    slot_side_item: {
        enabled: true,
        defaultType: 'ADX',
        location: 'Side',
        types: {
            ADX: {
                params: {
                    width: '300',
                    height: '250'
                },
                excludedCategories: []
            }
        }
    },
    slot_bottom_item: {
        enabled: true,
        defaultType: 'ADX',
        location: 'Bottom',
        types: {
            ADX: {
                params: {
                    width: '728',
                    height: '90'
                },
                excludedCategories: []
            }
        }
    }
};
