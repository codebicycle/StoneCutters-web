'use strict';

module.exports = {
    'pages#terms': {
        url: 'terms'
    },
    'pages#about': {
        url: 'about'
    },
    'pages#help': {
        urls: [
            'help',
            'help/:active'
        ]
    },
    'pages#allstates': {
        urls: [
            'all-states',
            'all-states/:state'
        ]
    },
    /*'pages#sitemap': {
        url: 'sitemap'
    },*/
    'pages#sitemapByDate': {
        url: /^\/sitemap((\/.+)|$)/
    },
    'pages#interstitial': {
        url: 'interstitial'
    },
    'pages#comingsoon': {
        url: 'comingsoon'
    },
    'pages#thanks': {
        url: 'thanks'
    },
    'pages#shops': {
        url: 'shops'
    },
    'pages#shop': {
        url: 'shop/:shopId/:shopName'
    },
    'pages#safety': {
        urls: [
            'safety',
            'seguridad'
        ]
    }
};
