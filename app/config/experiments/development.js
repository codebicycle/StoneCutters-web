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
    desktopCategorySelector: {
        enabled: true,
        platforms: ['desktop'],
        markets: ['ar'],
        name: 'category-selector',
        fraction: 0.5,
        alternatives: {
            CONTROL: 'control',
            SUGGESTED: 'suggested',
            SINGLE: 'single'
        }
    },
    fractionKPIsTest: {
        enabled: true,
        platforms: ['desktop'],
        markets: ['pe'],
        name: 'fraction-kpi-test',
        fraction: 0.5,
        alternatives: {
            TEST1: 'test1',
            TEST2: 'test2',
            TEST3: 'test3',
            TEST4: 'test4'
        }
    }
};
