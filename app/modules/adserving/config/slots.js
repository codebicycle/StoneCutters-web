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
    }
};
