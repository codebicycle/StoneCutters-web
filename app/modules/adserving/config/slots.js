'use strict';

module.exports = {
    slot_top_listing_gallery: {
        enabled: true,
        type: 'CSA',
        location: 'Top',
        seo: 1,
        params: {
            number: 3
        },
        excludedCategories: []
    },
    slot_top_listing: {
        enabled: true,
        type: 'CSA',
        location: 'Top',
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
        },
        excludedCategories: []
    },
    slot_bottom_listing: {
        enabled: true,
        type: 'CSA',
        location: 'Bottom',
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
        },
        excludedCategories: []
    },
    slot_side_listing: {
        enabled: false,
        type: 'AFC',
        location: 'Side',
        params: {
            number: 1,
            media: "flash, image",
            width: '160',
            height: '600'
        },
        excludedCategories: [0]
    },
    slot_top_item: {
        enabled: false,
        type: 'AFC',
        location: 'Top',
        params: {
            number: 3,
            media: 'text',
            width: '728',
            height: '90'
        },
        excludedCategories: []
    },
    slot_side_item: {
        enabled: false,
        type: 'AFC',
        location: 'Side',
        params: {
            number: 1,
            media: "flash, image",
            width: '300',
            height: '250'
        },
        excludedCategories: []
    },
    slot_bottom_item: {
        enabled: false,
        type: 'AFC',
        location: 'Bottom',
        params: {
            number: 5,
            media: 'text',
            width: '728',
            height: '90'
        },
        excludedCategories: []
    }
};