'use strict';

module.exports = {
    slot_top_listing_gallery: {
        'default': {
            enabled: true,
            type: 'CSA',
            location: 'Top',
            seo: 1,
            params: {
                number: 3
            },
            excludedCategories: []
        }
    },
    slot_top_listing: {
        'default': {
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
        }
    },
    slot_bottom_listing: {
        'default': {
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
        }
    },
    slot_side_listing: {
        'default': {
            enabled: false,
            type: 'AFC',
            location: 'Side',
            seo: 1,
            params: {
                number: 1,
                media: 'flash, image',
                width: '160',
                height: '600'
            },
            excludedCategories: []
        },
        group2: {
            type: 'ADX'
        }
    },
    slot_side_item: {
        'default': {
            enabled: true,
            type: 'AFC',
            location: 'Side',
            seo: 1,
            params: {
                number: 1,
                media: 'flash, image',
                width: '300',
                height: '250'
            },
            excludedCategories: []
        },
        group2: {
            type: 'ADX'
        }
    },
    slot_top_item: {
        'default': {
            enabled: true,
            type: 'AFC',
            location: 'Top',
            seo: 1,
            params: {
                number: 3,
                media: 'text',
                width: '728',
                height: '90'
            },
            excludedCategories: []
        }
    },
    slot_bottom_item: {
        'default': {
            enabled: true,
            type: 'AFC',
            location: 'Bottom',
            seo: 1,
            params: {
                number: 5,
                media: 'text',
                width: '728',
                height: '90'
            },
            excludedCategories: []
        }
    }
};
