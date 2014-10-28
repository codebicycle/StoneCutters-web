'use strict';

module.exports = {
    'items#staticSearch': {
        urls: [
            'q/:search/c-:catId',
            'q/:search/p-:page',
            'q/:search'
        ]
    },
    'items#allresultsig': {
        urls: [
            'nf/all-results-ig-p-:page/:filters?',
            'nf/all-results-ig/:filters?'
        ]
    },
    'items#allresults': {
        urls: [
            'nf/all-results-p-:page/:filters?',
            'nf/all-results/:filters?'
        ]
    },
    'items#filter': {
        urls: [
            'nf/search/:search/-p-:page/:filters/filter',
            'nf/search/:search/-p-:page/filter',
            'nf/search/:search/:filters/filter',
            'nf/search/:search/filter',
        ]
    },
    'items#sort': {
        urls: [
            'nf/search/:search/-p-:page/:filters/sort',
            'nf/search/:search/-p-:page/sort',
            'nf/search/:search/:filters/sort',
            'nf/search/:search/sort',
        ]
    },
    'items#searchig': {
        urls: [
            'search/:search/-p-:page-ig/:filters?',
            'search/:search?/-ig',
            'nf/search/:search/-p-:page-ig/:filters?',
            'nf/search/:search?/-ig'
        ]
    },
    'items#search': {
        urls: [
            'search/:search/-p-:page/:filters?',
            'search/:search?',
            'nf/search/:search/-p-:page/:filters?',
            'nf/search/:search?'
        ]
    },
    'items#searchfilterig': {
        urls: [
            'nf/:title-cat-:catId([0-9]+)-p-:page([0-9]+)-ig/?:search?',
            'nf/-cat-:catId([0-9]+)-p-:page([0-9]+)-ig/?:search?',
            'nf/cat-:catId([0-9]+)-p-:page([0-9]+)-ig/?:search?',
            'nf/:title-cat-:catId([0-9]+)-ig/?:search?',
            'nf/-cat-:catId([0-9]+)-ig/?:search?',
            'nf/cat-:catId([0-9]+)-ig/?:search?'
        ]
    },
    'items#searchfilter': {
        urls: [
            'nf/:title-cat-:catId([0-9]+)-p-:page([0-9]+)/?:search?',
            'nf/-cat-:catId([0-9]+)-p-:page([0-9]+)/?:search?',
            'nf/cat-:catId([0-9]+)-p-:page([0-9]+)/?:search?',
            'nf/:title-cat-:catId([0-9]+)/?:search?',
            'nf/-cat-:catId([0-9]+)/?:search?',
            'nf/cat-:catId([0-9]+)/?:search?'
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
