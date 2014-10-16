'use strict';

module.exports = {
    // Filter search page
    'items#filter': {
        urls: [
            'nf/search/:search/-p-:page/:filters/filter',
            'nf/search/:search/-p-:page/filter',
            'nf/search/:search/:filters/filter',
            'nf/search/:search/filter',
        ]
    },
    // Sort search page
    'items#sort': {
        urls: [
            'nf/search/:search/-p-:page/:filters/sort',
            'nf/search/:search/-p-:page/sort',
            'nf/search/:search/:filters/sort',
            'nf/search/:search/sort',
        ]
    },

    'items#search': {
        urls: [
            'search/:search/-p-:page/:filters?',
            'search/:search/:filters?',
            'search/:search?',
            'nf/search/:search/-p-:page/:filters?',
            'nf/search/:search/:filters?',
            'nf/search/:search?'
        ]
    },
    'items#allresults': {
        urls: [
            'nf/all-results/-p-:page/:filters?',
            'nf/all-results/:filters?'
        ]
    },
    'items#delete': {
        url: 'myolx/deleteitem/:itemId'
    },
    'items#success': {
        url: 'iid-:itemId([0-9]+)/reply/success'
    },
    'items#reply': {
        url: 'iid-:itemId([0-9]+)/reply'
    },
    'items#gallery': {
        url: ':title-iid-:itemId([0-9]+)/gallery'
    },
    'items#map': {
        url: ':title-iid-:itemId([0-9]+)/map'
    },
    'items#show': {
        urls: [
            ':title-iid-:itemId([0-9]+)',
            '-iid-:itemId([0-9]+)',
            'iid-:itemId([0-9]+)'
        ]
    },
    'items#favorite': {
        url: 'items/:itemId/favorite/?:intent?'
    }
};
