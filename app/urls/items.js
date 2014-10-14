'use strict';

module.exports = {
    'items#search#filters': {
        url: 'search/:search/-p-:page/:filters?'
    },
    'items#search': {
        url: 'search/:search?'
    },
    'items#search#nfFilters': {
        url: 'nf/search/:search/-p-:page/:filters?'
    },
    'items#search#nf': {
        url: 'nf/search/:search?'
    },
    'items#allresults#page': {
        url: 'nf/all-results/-p-:page/:filters?'
    },
    'items#allresults': {
        url: 'nf/all-results/:filters?'
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
    'items#show#slug': {
        url: ':title-iid-:itemId([0-9]+)'
    },
    'items#show#noSlug': {
        url: '-iid-:itemId([0-9]+)'
    },
    'items#show': {
        url: 'iid-:itemId([0-9]+)'
    },
    'items#favorite': {
        url: 'items/:itemId/favorite/?:intent?'
    }
};
