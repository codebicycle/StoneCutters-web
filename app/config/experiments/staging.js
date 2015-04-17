'use strict';

module.exports = {
    html5HeaderPostButton: {
        enabled: false,
        platforms: ['html5'],
        markets: ['ar'],
        name: 'header-post-button',
        alternatives: {
            TEXT: 'text',
            ICON: 'icon'
        }
    },
    html5Interstitial: {
        enabled: false,
        platforms: ['html5'],
        markets: ['br'],
        name: 'interstitial',
        alternatives: {
            ON: 'on',
            OFF: 'off'
        }
    },
    html4ShowShops: {
        enabled: true,
        platforms: ['html4'],
        markets: ['ke'],
        name: 'show-shops',
        alternatives: {
            ITEMS: 'items',
            CALL_TO_ACTION: 'calltoactions',
            CALL_TO_ACTION_MAP: 'calltoactions_map'
        },
        firstClick: true
    },
    desktopDGD23ShowSimplifiedReplyForm: {
        enabled: true,
        platforms: ['desktop'],
        markets: ['ar', 'co'],
        name: 'desktop-dgd23-show-simplified-reply-form',
        alternatives: {
            CONTROL: 'control',
            SHOW_SIMPLIFIED_REPLY_FORM: 'show-simplified-reply-form'
        }
    },
    growthCategorySuggestion: {
        enabled: true,
        platforms: ['desktop'],
        markets: ['ar'],
        name: 'growth-category-suggestion',
        fraction: 0.3,
        alternatives: {
            CONTROL: 'control',
            SUGGESTED: 'suggested',
            SINGLE: 'single'
        }
    },
    dgdCategoryCars: {
        enabled: true,
        platforms: ['desktop'],
        markets: ['ar', 'co'],
        name: 'dgd-category-cars',
        alternatives: {
            CONTROL: 'control',
            GALLERY: 'gallery'
        }
    },
    dgdHidePhoneNumber: {
        enabled: true,
        platforms: ['dektop'],
        markets: ['ar', 'co', 'pa', 'pe', 'uy'],
        name: 'hide-phone-number-exp',
        alternatives: {
            CONTROL: 'control-ate',
            HIDE_PHONE_NUMBER: 'hide-phone-number'
        }
    }
};
