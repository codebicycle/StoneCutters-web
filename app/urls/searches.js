'use strict';

module.exports = {
    'searches#statics': {
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
    'searches#allresultsig': {
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
    'searches#allresults': {
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
    'searches#searchig': {
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
    'searches#search': {
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
    'searches#filterig': {
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
    'searches#filter': {
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
    }
};
