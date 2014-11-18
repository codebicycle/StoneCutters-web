'use strict';

module.exports = {
    'items#staticSearchig': {
        urls: [
            'q/:search/c-:catId([0-9]+)/-p-:page([0-9]+)-ig/:filters',
            'q/:search/c-:catId([0-9]+)/-p-:page([0-9]+)-ig',
            'q/:search/c-:catId([0-9]+)/-ig/?:filters?',
            'q/:search/-p-:page([0-9]+)-ig/:filters',
            'q/:search/-p-:page([0-9]+)-ig',
            'q/:search/-ig/?:filters?',
            'q/:search/-ig'
        ]
    },
    'items#staticSearch': {
        urls: [
            'q/:search/c-:catId([0-9]+)/-p-:page([0-9]+)/:filters',
            'q/:search/c-:catId([0-9]+)/-p-:page([0-9]+)',
            'q/:search/c-:catId([0-9]+)/?:filters?',
            'q/:search/-p-:page([0-9]+)/:filters',
            'q/:search/-p-:page([0-9]+)',
            'q/:search/:filters?',
            'q/:search'
        ]
    },
    'items#allresultsig': {
        urls: [
            'all-results-p-:page([0-9]+)-ig/:filters',
            'all-results-p-:page([0-9]+)-ig',
            'all-results-ig/?:filters?',
            'nf/all-results-p-:page([0-9]+)-ig/:filters',
            'nf/all-results-p-:page([0-9]+)-ig',
            'nf/all-results-ig/:filters?'
        ]
    },
    'items#allresults': {
        urls: [
            'all-results-p-:page([0-9]+)/:filters',
            'all-results-p-:page([0-9]+)',
            'all-results/:filters?',
            'nf/all-results-p-:page([0-9]+)/:filters',
            'nf/all-results-p-:page([0-9]+)',
            'nf/all-results/:filters?'
        ]
    },
    'items#filter': {
        urls: [
            'nf/search/:search/-p-:page([0-9]+)/:filters/filter',
            'nf/search/:search/-p-:page([0-9]+)/filter',
            'nf/search/:search/:filters/filter',
            'nf/search/:search/filter',
        ]
    },
    'items#sort': {
        urls: [
            'nf/search/:search/-p-:page([0-9]+)/:filters/sort',
            'nf/search/:search/-p-:page([0-9]+)/sort',
            'nf/search/:search/:filters/sort',
            'nf/search/:search/sort',
        ]
    },
    'items#searchig': {
        urls: [
            'search/:search/-p-:page([0-9]+)-ig/:filters?',
            'search/:search/-ig/:filters?',
            'search/:search?/-ig',
            'nf/search/:search/-p-:page([0-9]+)-ig/:filters?',
            'nf/search/:search/-ig/:filters?',
            'nf/search/:search?/-ig'
        ]
    },
    'items#search': {
        urls: [
            'search/:search/-p-:page([0-9]+)/:filters?',
            'search/:search/:filters?',
            'search/:search?',
            'nf/search/:search/-p-:page([0-9]+)/:filters?',
            'nf/search/:search/:filters?',
            'nf/search/:search?'
        ]
    },
    'items#searchfilterig': {
        urls: [
            'nf/:title-cat-:catId([0-9]+)/?:search?/-p-:page([0-9]+)-ig/?:filters?',
            'nf/-cat-:catId([0-9]+)/?:search?/-p-:page([0-9]+)-ig/?:filters?',
            'nf/cat-:catId([0-9]+)/?:search?/-p-:page([0-9]+)-ig/?:filters?',
            'nf/:title-cat-:catId([0-9]+)/?:search?/-ig/?:filters?',
            'nf/-cat-:catId([0-9]+)/?:search?/-ig/?:filters?',
            'nf/cat-:catId([0-9]+)/?:search?/-ig/?:filters?'
        ]
    },
    'items#searchfilter': {
        urls: [
            'nf/:title-cat-:catId([0-9]+)/?:search?/-p-:page([0-9]+)/?:filters?',
            'nf/-cat-:catId([0-9]+)/?:search?/-p-:page([0-9]+)/?:filters?',
            'nf/cat-:catId([0-9]+)/?:search?/-p-:page([0-9]+)/?:filters?',
            'nf/:title-cat-:catId([0-9]+)/?:search?/?:filters?',
            'nf/-cat-:catId([0-9]+)/?:search?/?:filters?',
            'nf/cat-:catId([0-9]+)/?:search?/?:filters?'
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
