'use strict';

module.exports = {
    'items#staticSearch': {
        url: 'q/:search/c-:catId'
    },
    'items#staticSearch#nocat': {
        url: 'q/:search'
    },
    'items#staticSearch#page': {
        url: 'q/:search/p-:page'
    },
    'items#search#filters': {
        urls: {
            server: 'search/:search/-p-:page/:filters?',
            client: {
                url: 'search/:search/-p-:page(/)(:filters)'
            }
        }
    },
    'items#search': {
        urls: {
            server: 'search/:search?',
            client: {
                url: 'search(/)(:search)'
            }
        }
    },
    'items#search#nfFilters': {
        urls: {
            server: 'nf/search/:search/-p-:page/:filters?',
            client: {
                url: 'nf/search/:search/-p-:page(/)(:filters)'
            }
        }
    },
    'items#search#nf': {
        urls: {
            server: 'nf/search/:search?',
            client: {
                url: 'nf/search(/)(:search)'
            }
        }
    },
    'items#allresults#page': {
        urls: {
            server: 'nf/all-results/-p-:page/:filters?',
            client: {
                url: 'nf/all-results/-p-:page(/)(:filters)'
            }
        }
    },
    'items#allresults': {
        urls: {
            server: 'nf/all-results/:filters?',
            client: {
                url: 'nf/all-results(/)(:filters)'
            }
        }
    },
    'items#delete': {
        url: 'myolx/deleteitem/:itemId'
    },
    'items#success': {
        urls: {
            server: 'iid-:itemId([0-9]+)/reply/success',
            client: {
                url: 'iid-:itemId/reply/success'
            }
        }
    },
    'items#reply': {
        urls: {
            server: 'iid-:itemId([0-9]+)/reply',
            client: {
                url: 'iid-:itemId/reply'
            }
        }
    },
    'items#gallery': {
        urls: {
            server: ':title-iid-:itemId([0-9]+)/gallery',
            client: {
                url: ':title-iid-:itemId/gallery'
            }
        }
    },
    'items#map': {
        urls: {
            server: ':title-iid-:itemId([0-9]+)/map',
            client: {
                url: ':title-iid-:itemId/map'
            }
        }
    },
    'items#show#slug': {
        urls: {
            server: ':title-iid-:itemId([0-9]+)',
            client: {
                url: ':title-iid-:itemId'
            }
        }
    },
    'items#show#noSlug': {
        urls: {
            server: '-iid-:itemId([0-9]+)',
            client: {
                url: '-iid-:itemId'
            }
        }
    },
    'items#show': {
        urls: {
            server: 'iid-:itemId([0-9]+)',
            client: {
                url: 'iid-:itemId'
            }
        }
    },
    'items#favorite': {
        urls: {
            server: 'items/:itemId/favorite/?:intent?',
            client: {
                url: 'items/:itemId/favorite(/:intent)'
            }
        }
    }
};
