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
            AD_LIKE_STORE: 'adlikestore',
            CALL_TO_ACTION: 'calltoactions',
            AD_LIKE_STORE_MAP: 'adlikestore_map',
            CALL_TO_ACTION_MAP: 'calltoactions_map'
        },
        firstClick: true
    },
    desktopTest: {
        enabled: true,
        platforms: ['desktop'],
        markets: ['co'],
        name: 'test',
        alternatives: {
            TEST1: 'test1',
            TEST2: 'test2'
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
    desktopDGD23ShowSimplifiedReplyForm: {
        enabled: true,
        platforms: ['desktop'],
        markets: ['ar', 'pe', 'co', 've', 'uy', 'ni', 'gt', 'za', 'ke', 'ng', 'ug', 'py', 'ec', 'bo', 'sn', 'es', 'cm', 'tz', 'hn', 'cr', 'pa', 'gh', 'sv'],
        name: 'desktop-dgd23-show-simplified-reply-form',
        alternatives: {
            CONTROL: 'control',
            SHOW_SIMPLIFIED_REPLY_FORM: 'show-simplified-reply-form'
        }
    }
};
