'use strict';

module.exports = {
    'items#filter': {
        urls: [
            'all-results-p-:page([0-9]+)/-:filters([a-zA-Z0-9_\\-\\.]+)/filter',
            'all-results-p-:page([0-9]+)/filter',
            'all-results/-:filters([a-zA-Z0-9_\\-\\.]+)/filter',
            'all-results/filter',
            'nf/all-results-p-:page([0-9]+)/-:filters([a-zA-Z0-9_\\-\\.]+)/filter',
            'nf/all-results-p-:page([0-9]+)/filter',
            'nf/all-results/-:filters([a-zA-Z0-9_\\-\\.]+)/filter',
            'nf/all-results/filter',
            'q/:search/c-:catId([0-9]+)/-p-:page([0-9]+)/-:filters([a-zA-Z0-9_\\-\\.]+)/filter',
            'q/:search/c-:catId([0-9]+)/-p-:page([0-9]+)/filter',
            'q/:search/c-:catId([0-9]+)/-:filters([a-zA-Z0-9_\\-\\.]+)/filter',
            'q/:search/c-:catId([0-9]+)/filter',
            'q/:search/-p-:page([0-9]+)/-:filters([a-zA-Z0-9_\\-\\.]+)/filter',
            'q/:search/-p-:page([0-9]+)/filter',
            'q/:search/-:filters([a-zA-Z0-9_\\-\\.]+)/filter',
            'q/:search/filter',
            'nf/search/:search/-p-:page([0-9]+)/-:filters([a-zA-Z0-9_\\-\\.]+)/filter',
            'nf/search/:search/-p-:page([0-9]+)/filter',
            'nf/search/:search/-:filters([a-zA-Z0-9_\\-\\.]+)/filter',
            'nf/search/:search/filter',
            'nf/:title-cat-:catId([0-9]+)-p-:page([0-9]+)/-:filters([a-zA-Z0-9_\\-\\.]+)/filter',
            'nf/:title-cat-:catId([0-9]+)-p-:page([0-9]+)/filter',
            'nf/:title-cat-:catId([0-9]+)/-:filters([a-zA-Z0-9_\\-\\.]+)/filter',
            'nf/:title-cat-:catId([0-9]+)/filter',
            'nf/-cat-:catId([0-9]+)-p-:page([0-9]+)/-:filters([a-zA-Z0-9_\\-\\.]+)/filter',
            'nf/-cat-:catId([0-9]+)-p-:page([0-9]+)/filter',
            'nf/-cat-:catId([0-9]+)/-:filters([a-zA-Z0-9_\\-\\.]+)/filter',
            'nf/-cat-:catId([0-9]+)/filter',
            'nf/cat-:catId([0-9]+)-p-:page([0-9]+)/-:filters([a-zA-Z0-9_\\-\\.]+)/filter',
            'nf/cat-:catId([0-9]+)-p-:page([0-9]+)/filter',
            'nf/cat-:catId([0-9]+)/-:filters([a-zA-Z0-9_\\-\\.]+)/filter',
            'nf/cat-:catId([0-9]+)/filter',
            'nf/:title-cat-:catId([0-9]+)/:search/-p-:page([0-9]+)/-:filters([a-zA-Z0-9_\\-\\.]+)/filter',
            'nf/:title-cat-:catId([0-9]+)/:search/-p-:page([0-9]+)/filter',
            'nf/:title-cat-:catId([0-9]+)/:search/-:filters([a-zA-Z0-9_\\-\\.]+)/filter',
            'nf/:title-cat-:catId([0-9]+)/:search/filter',
            ':title-cat-:catId([0-9]+)-p-:page([0-9]+)/filter',
            ':title-cat-:catId([0-9]+)/filter',
            '-cat-:catId([0-9]+)-p-:page([0-9]+)/filter',
            '-cat-:catId([0-9]+)/filter',
            'cat-:catId([0-9]+)-p-:page([0-9]+)/filter',
            'cat-:catId([0-9]+)/filter',
            ':title-cat-:catId([0-9]+)-p-:page([0-9]+)/-:filters([a-zA-Z0-9_\\-\\.]+)/filter',
            ':title-cat-:catId([0-9]+)/-:filters([a-zA-Z0-9_\\-\\.]+)/filter',
            '-cat-:catId([0-9]+)-p-:page([0-9]+)/-:filters([a-zA-Z0-9_\\-\\.]+)/filter',
            '-cat-:catId([0-9]+)/-:filters([a-zA-Z0-9_\\-\\.]+)/filter',
            'cat-:catId([0-9]+)-p-:page([0-9]+)/-:filters([a-zA-Z0-9_\\-\\.]+)/filter',
            'cat-:catId([0-9]+)/-:filters([a-zA-Z0-9_\\-\\.]+)/filter'
        ]
    },
    'items#sort': {
        urls: [
            'all-results-p-:page([0-9]+)/-:filters([a-zA-Z0-9_\\-\\.]+)/sort',
            'all-results-p-:page([0-9]+)/sort',
            'all-results/-:filters([a-zA-Z0-9_\\-\\.]+)/sort',
            'all-results/sort',
            'nf/all-results-p-:page([0-9]+)/-:filters([a-zA-Z0-9_\\-\\.]+)/sort',
            'nf/all-results-p-:page([0-9]+)/sort',
            'nf/all-results/-:filters([a-zA-Z0-9_\\-\\.]+)/sort',
            'nf/all-results/sort',
            'q/:search/c-:catId([0-9]+)/-p-:page([0-9]+)/-:filters([a-zA-Z0-9_\\-\\.]+)/sort',
            'q/:search/c-:catId([0-9]+)/-p-:page([0-9]+)/sort',
            'q/:search/c-:catId([0-9]+)/-:filters([a-zA-Z0-9_\\-\\.]+)/sort',
            'q/:search/c-:catId([0-9]+)/sort',
            'q/:search/-p-:page([0-9]+)/-:filters([a-zA-Z0-9_\\-\\.]+)/sort',
            'q/:search/-p-:page([0-9]+)/sort',
            'q/:search/-:filters([a-zA-Z0-9_\\-\\.]+)/sort',
            'q/:search/sort',
            'nf/search/:search/-p-:page([0-9]+)/-:filters([a-zA-Z0-9_\\-\\.]+)/sort',
            'nf/search/:search/-p-:page([0-9]+)/sort',
            'nf/search/:search/-:filters([a-zA-Z0-9_\\-\\.]+)/sort',
            'nf/search/:search/sort',
            'nf/:title-cat-:catId([0-9]+)-p-:page([0-9]+)/-:filters([a-zA-Z0-9_\\-\\.]+)/sort',
            'nf/:title-cat-:catId([0-9]+)-p-:page([0-9]+)/sort',
            'nf/:title-cat-:catId([0-9]+)/-:filters([a-zA-Z0-9_\\-\\.]+)/sort',
            'nf/:title-cat-:catId([0-9]+)/sort',
            'nf/-cat-:catId([0-9]+)-p-:page([0-9]+)/-:filters([a-zA-Z0-9_\\-\\.]+)/sort',
            'nf/-cat-:catId([0-9]+)-p-:page([0-9]+)/sort',
            'nf/-cat-:catId([0-9]+)/-:filters([a-zA-Z0-9_\\-\\.]+)/sort',
            'nf/-cat-:catId([0-9]+)/sort',
            'nf/cat-:catId([0-9]+)-p-:page([0-9]+)/-:filters([a-zA-Z0-9_\\-\\.]+)/sort',
            'nf/cat-:catId([0-9]+)-p-:page([0-9]+)/sort',
            'nf/cat-:catId([0-9]+)/-:filters([a-zA-Z0-9_\\-\\.]+)/sort',
            'nf/cat-:catId([0-9]+)/sort',
            'nf/:title-cat-:catId([0-9]+)/:search/-p-:page([0-9]+)/-:filters([a-zA-Z0-9_\\-\\.]+)/sort',
            'nf/:title-cat-:catId([0-9]+)/:search/-p-:page([0-9]+)/sort',
            'nf/:title-cat-:catId([0-9]+)/:search/-:filters([a-zA-Z0-9_\\-\\.]+)/sort',
            'nf/:title-cat-:catId([0-9]+)/:search/sort',
            ':title-cat-:catId([0-9]+)-p-:page([0-9]+)/sort',
            ':title-cat-:catId([0-9]+)/sort',
            '-cat-:catId([0-9]+)-p-:page([0-9]+)/sort',
            '-cat-:catId([0-9]+)/sort',
            'cat-:catId([0-9]+)-p-:page([0-9]+)/sort',
            'cat-:catId([0-9]+)-p-:page([0-9]+)/sort',
            'cat-:catId([0-9]+)/sort',
            ':title-cat-:catId([0-9]+)-p-:page([0-9]+)/-:filters([a-zA-Z0-9_\\-\\.]+)/sort',
            ':title-cat-:catId([0-9]+)/-:filters([a-zA-Z0-9_\\-\\.]+)/sort',
            '-cat-:catId([0-9]+)-p-:page([0-9]+)/-:filters([a-zA-Z0-9_\\-\\.]+)/sort',
            '-cat-:catId([0-9]+)/-:filters([a-zA-Z0-9_\\-\\.]+)/sort',
            'cat-:catId([0-9]+)-p-:page([0-9]+)/-:filters([a-zA-Z0-9_\\-\\.]+)/sort',
            'cat-:catId([0-9]+)/-:filters([a-zA-Z0-9_\\-\\.]+)/sort'
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
