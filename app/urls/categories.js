'use strict';

module.exports = {
    'categories#show#pageSlug': {
        url: ':title-cat-:catId([0-9]+)-p-:page([0-9]+)/?:filters?'
    },
    'categories#show#pageNoSlug': {
        url: '-cat-:catId([0-9]+)-p-:page([0-9]+)/?:filters?'
    },
    'categories#show#page': {
        url: 'cat-:catId([0-9]+)-p-:page([0-9]+)/?:filters?'
    },
    'categories#show#pageSlugWithFilter': {
        url: ':title-cat-:catId([0-9]+)/?:filters?'
    },
    'categories#show#pageNoSlugWithFilter': {
        url: '-cat-:catId([0-9]+)/?:filters?'
    },
    'categories#show#pageWithFilter': {
        url: 'cat-:catId([0-9]+)/?:filters?'
    },
    'categories#show#slug': {
        url: ':title-cat-:catId([0-9]+)'
    },
    'categories#show#noSlug': {
        url: '-cat-:catId([0-9]+)'
    },
    'categories#show': {
        url: 'cat-:catId([0-9]+)'
    }
};
