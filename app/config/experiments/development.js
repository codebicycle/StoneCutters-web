'use strict';

module.exports = {
    html5HeaderPostButton: {
        enabled: true,
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
            AD_LIKE_STORE: 'adlikestore',
            CALL_TO_ACTION: 'calltoactions',
            ITEMS: 'items'
        },
        force: false
    }    
};
