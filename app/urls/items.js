'use strict';

module.exports = {
    'items#staticSearchig': {
        urls: [
            'q/:search/c-:catId([0-9]+)/-p-:page([0-9]+)-ig/-:filters([a-zA-Z0-9_\\-\\.]+)',
            'q/:search/c-:catId([0-9]+)/-p-:page([0-9]+)-ig',
            'q/:search/c-:catId([0-9]+)/-ig/-:filters([a-zA-Z0-9_\\-\\.]+)',
            'q/:search/c-:catId([0-9]+)/-ig',
            'q/:search/-p-:page([0-9]+)-ig/-:filters([a-zA-Z0-9_\\-\\.]+)',
            'q/:search/-p-:page([0-9]+)-ig',
            'q/:search/-ig/-:filters([a-zA-Z0-9_\\-\\.]+)',
            'q/:search/-ig'
        ]
    },
    'items#staticSearch': {
        urls: [
            'q/:search/c-:catId([0-9]+)/-p-:page([0-9]+)/-:filters([a-zA-Z0-9_\\-\\.]+)',
            'q/:search/c-:catId([0-9]+)/-p-:page([0-9]+)',
            'q/:search/c-:catId([0-9]+)/-:filters([a-zA-Z0-9_\\-\\.]+)',
            'q/:search/c-:catId([0-9]+)',
            'q/:search/-p-:page([0-9]+)/-:filters([a-zA-Z0-9_\\-\\.]+)',
            'q/:search/-p-:page([0-9]+)',
            'q/:search/-:filters([a-zA-Z0-9_\\-\\.]+)',
            'q/:search'
        ]
    },
    'items#allresultsig': {
        urls: [
            'all-results-p-:page([0-9]+)-ig/-:filters([a-zA-Z0-9_\\-\\.]+)',
            'all-results-p-:page([0-9]+)-ig',
            'all-results-ig/-:filters([a-zA-Z0-9_\\-\\.]+)',
            'all-results-ig',
            'nf/all-results-p-:page([0-9]+)-ig/-:filters([a-zA-Z0-9_\\-\\.]+)',
            'nf/all-results-p-:page([0-9]+)-ig',
            'nf/all-results-ig/-:filters([a-zA-Z0-9_\\-\\.]+)',
            'nf/all-results-ig'
        ]
    },
    'items#allresults': {
        urls: [
            'all-results-p-:page([0-9]+)/-:filters([a-zA-Z0-9_\\-\\.]+)',
            'all-results-p-:page([0-9]+)',
            'all-results/-:filters([a-zA-Z0-9_\\-\\.]+)',
            'all-results',
            'nf/all-results-p-:page([0-9]+)/-:filters([a-zA-Z0-9_\\-\\.]+)',
            'nf/all-results-p-:page([0-9]+)',
            'nf/all-results/-:filters([a-zA-Z0-9_\\-\\.]+)',
            'nf/all-results'
        ]
    },
    'items#filter': {
        urls: [
            'nf/search/:search/-p-:page([0-9]+)/-:filters([a-zA-Z0-9_\\-\\.]+)/filter',
            'nf/search/:search/-p-:page([0-9]+)/filter',
            'nf/des-cat-:catId([0-9]+)/:search/-p-:page/-:filters([a-zA-Z0-9_\\-\\.]+)/filter',
            'nf/des-cat-:catId([0-9]+)/:search/-p-:page/filter',
            'nf/des-cat-:catId([0-9]+)/:search/-:filters([a-zA-Z0-9_\\-\\.]+)/filter',
            'nf/des-cat-:catId([0-9]+)/:search/filter',
            'nf/search/:search/-:filters([a-zA-Z0-9_\\-\\.]+)/filter',
            'nf/search/:search/filter',
            ':title-cat-:catId([0-9]+)-p-:page([0-9]+)/filter',
            '-cat-:catId([0-9]+)-p-:page([0-9]+)/filter',
            'cat-:catId([0-9]+)-p-:page([0-9]+)/filter',
            ':title-cat-:catId([0-9]+)/filter',
            '-cat-:catId([0-9]+)/filter',
            'cat-:catId([0-9]+)/filter',
            ':title-cat-:catId([0-9]+)-p-:page([0-9]+)/-:filters([a-zA-Z0-9_\\-\\.]+)/filter',
            '-cat-:catId([0-9]+)-p-:page([0-9]+)/-:filters([a-zA-Z0-9_\\-\\.]+)/filter',
            'cat-:catId([0-9]+)-p-:page([0-9]+)/-:filters([a-zA-Z0-9_\\-\\.]+)/filter',
            ':title-cat-:catId([0-9]+)/-:filters([a-zA-Z0-9_\\-\\.]+)/filter',
            '-cat-:catId([0-9]+)/-:filters([a-zA-Z0-9_\\-\\.]+)/filter',
            'cat-:catId([0-9]+)/-:filters([a-zA-Z0-9_\\-\\.]+)/filter'
        ]
    },
    'items#sort': {
        urls: [
            'nf/search/:search/-p-:page([0-9]+)/-:filters([a-zA-Z0-9_\\-\\.]+)/sort',
            'nf/search/:search/-p-:page([0-9]+)/sort',
            'nf/search/:search/-:filters([a-zA-Z0-9_\\-\\.]+)/sort',
            'nf/search/:search/sort',
            'nf/des-cat-:catId([0-9]+)/:search/-p-:page/-:filters([a-zA-Z0-9_\\-\\.]+)/sort',
            'nf/des-cat-:catId([0-9]+)/:search/-p-:page/sort',
            'nf/des-cat-:catId([0-9]+)/:search/-:filters([a-zA-Z0-9_\\-\\.]+)/sort',
            'nf/des-cat-:catId([0-9]+)/:search/sort',
            ':title-cat-:catId([0-9]+)-p-:page([0-9]+)/sort',
            '-cat-:catId([0-9]+)-p-:page([0-9]+)/sort',
            'cat-:catId([0-9]+)-p-:page([0-9]+)/sort',
            ':title-cat-:catId([0-9]+)/sort',
            '-cat-:catId([0-9]+)/sort',
            'cat-:catId([0-9]+)/sort',
            ':title-cat-:catId([0-9]+)-p-:page([0-9]+)/-:filters([a-zA-Z0-9_\\-\\.]+)/sort',
            '-cat-:catId([0-9]+)-p-:page([0-9]+)/-:filters([a-zA-Z0-9_\\-\\.]+)/sort',
            'cat-:catId([0-9]+)-p-:page([0-9]+)/-:filters([a-zA-Z0-9_\\-\\.]+)/sort',
            ':title-cat-:catId([0-9]+)/-:filters([a-zA-Z0-9_\\-\\.]+)/sort',
            '-cat-:catId([0-9]+)/-:filters([a-zA-Z0-9_\\-\\.]+)/sort',
            'cat-:catId([0-9]+)/-:filters([a-zA-Z0-9_\\-\\.]+)/sort'
        ]
    },
    'items#searchig': {
        urls: [
            'search/:search/-p-:page([0-9]+)-ig/-:filters([a-zA-Z0-9_\\-\\.]+)',
            'search/:search/-p-:page([0-9]+)-ig',
            'search/:search/-ig/-:filters([a-zA-Z0-9_\\-\\.]+)',
            'search/:search/-ig',
            'nf/search/:search/-p-:page([0-9]+)-ig/-:filters([a-zA-Z0-9_\\-\\.]+)',
            'nf/search/:search/-p-:page([0-9]+)-ig',
            'nf/search/:search/-ig/-:filters([a-zA-Z0-9_\\-\\.]+)',
            'nf/search/:search/-ig'
        ]
    },
    'items#search': {
        urls: [
            'search/:search/-p-:page([0-9]+)/-:filters([a-zA-Z0-9_\\-\\.]+)',
            'search/:search/-p-:page([0-9]+)',
            'search/:search/-:filters([a-zA-Z0-9_\\-\\.]+)',
            'search/:search',
            'nf/search/:search/-p-:page([0-9]+)/-:filters([a-zA-Z0-9_\\-\\.]+)',
            'nf/search/:search/-p-:page([0-9]+)',
            'nf/search/:search/-:filters([a-zA-Z0-9_\\-\\.]+)',
            'nf/search/?:search?'
        ]
    },
    'items#searchfilterig': {
        urls: [
            ':title-cat-:catId([0-9]+)/:search/-p-:page([0-9]+)-ig/-:filters([a-zA-Z0-9_\\-\\.]+)',
            ':title-cat-:catId([0-9]+)/:search/-p-:page([0-9]+)-ig',
            '-cat-:catId([0-9]+)/:search/-p-:page([0-9]+)-ig/-:filters([a-zA-Z0-9_\\-\\.]+)',
            '-cat-:catId([0-9]+)/:search/-p-:page([0-9]+)-ig',
            'cat-:catId([0-9]+)/:search/-p-:page([0-9]+)-ig/-:filters([a-zA-Z0-9_\\-\\.]+)',
            'cat-:catId([0-9]+)/:search/-p-:page([0-9]+)-ig',
            ':title-cat-:catId([0-9]+)/:search/-ig/-:filters([a-zA-Z0-9_\\-\\.]+)',
            ':title-cat-:catId([0-9]+)/:search/-ig',
            '-cat-:catId([0-9]+)/:search/-ig/-:filters([a-zA-Z0-9_\\-\\.]+)',
            '-cat-:catId([0-9]+)/:search/-ig',
            'cat-:catId([0-9]+)/:search/-ig/-:filters([a-zA-Z0-9_\\-\\.]+)',
            'cat-:catId([0-9]+)/:search/-ig',
            'nf/:title-cat-:catId([0-9]+)/:search/-p-:page([0-9]+)-ig/-:filters([a-zA-Z0-9_\\-\\.]+)',
            'nf/:title-cat-:catId([0-9]+)/:search/-p-:page([0-9]+)-ig',
            'nf/-cat-:catId([0-9]+)/:search/-p-:page([0-9]+)-ig/-:filters([a-zA-Z0-9_\\-\\.]+)',
            'nf/-cat-:catId([0-9]+)/:search/-p-:page([0-9]+)-ig',
            'nf/cat-:catId([0-9]+)/:search/-p-:page([0-9]+)-ig/-:filters([a-zA-Z0-9_\\-\\.]+)',
            'nf/cat-:catId([0-9]+)/:search/-p-:page([0-9]+)-ig',
            'nf/:title-cat-:catId([0-9]+)/:search/-ig/-:filters([a-zA-Z0-9_\\-\\.]+)',
            'nf/:title-cat-:catId([0-9]+)/:search/-ig',
            'nf/-cat-:catId([0-9]+)/:search/-ig/-:filters([a-zA-Z0-9_\\-\\.]+)',
            'nf/-cat-:catId([0-9]+)/:search/-ig',
            'nf/cat-:catId([0-9]+)/:search/-ig/-:filters([a-zA-Z0-9_\\-\\.]+)',
            'nf/cat-:catId([0-9]+)/:search/-ig'
        ]
    },
    'items#searchfilter': {
        urls: [
            ':title-cat-:catId([0-9]+)/:search/-p-:page([0-9]+)/-:filters([a-zA-Z0-9_\\-\\.]+)',
            ':title-cat-:catId([0-9]+)/:search/-p-:page([0-9]+)',
            '-cat-:catId([0-9]+)/:search/-p-:page([0-9]+)/-:filters([a-zA-Z0-9_\\-\\.]+)',
            '-cat-:catId([0-9]+)/:search/-p-:page([0-9]+)',
            'cat-:catId([0-9]+)/:search/-p-:page([0-9]+)/-:filters([a-zA-Z0-9_\\-\\.]+)',
            'cat-:catId([0-9]+)/:search/-p-:page([0-9]+)',
            ':title-cat-:catId([0-9]+)/:search/-:filters([a-zA-Z0-9_\\-\\.]+)',
            ':title-cat-:catId([0-9]+)/:search',
            '-cat-:catId([0-9]+)/:search/-:filters([a-zA-Z0-9_\\-\\.]+)',
            '-cat-:catId([0-9]+)/:search',
            'cat-:catId([0-9]+)/:search/-:filters([a-zA-Z0-9_\\-\\.]+)',
            'cat-:catId([0-9]+)/:search',
            'nf/:title-cat-:catId([0-9]+)/:search/-p-:page([0-9]+)/-:filters([a-zA-Z0-9_\\-\\.]+)',
            'nf/:title-cat-:catId([0-9]+)/:search/-p-:page([0-9]+)',
            'nf/-cat-:catId([0-9]+)/:search/-p-:page([0-9]+)/-:filters([a-zA-Z0-9_\\-\\.]+)',
            'nf/-cat-:catId([0-9]+)/:search/-p-:page([0-9]+)',
            'nf/cat-:catId([0-9]+)/:search/-p-:page([0-9]+)/-:filters([a-zA-Z0-9_\\-\\.]+)',
            'nf/cat-:catId([0-9]+)/:search/-p-:page([0-9]+)',
            'nf/:title-cat-:catId([0-9]+)/:search/-:filters([a-zA-Z0-9_\\-\\.]+)',
            'nf/:title-cat-:catId([0-9]+)/:search',
            'nf/-cat-:catId([0-9]+)/:search/-:filters([a-zA-Z0-9_\\-\\.]+)',
            'nf/-cat-:catId([0-9]+)/:search',
            'nf/cat-:catId([0-9]+)/:search/-:filters([a-zA-Z0-9_\\-\\.]+)',
            'nf/cat-:catId([0-9]+)/:search'
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
