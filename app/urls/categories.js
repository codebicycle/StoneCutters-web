'use strict';

module.exports = {
    'categories#show#pageSlug': {
        urls: {
            server: ':title-cat-:catId([0-9]+)-p-:page([0-9]+)/?:filters?',
            client: {
                url: ':title-cat-:catId-p-:page(/)(:filters)'
            }
        }
    },
    'categories#show#pageNoSlug': {
        urls: {
            server: '-cat-:catId([0-9]+)-p-:page([0-9]+)/?:filters?',
            client: {
                url: '-cat-:catId-p-:page(/)(:filters)'
            }
        }
    },
    'categories#show#page': {
        urls: {
            server: 'cat-:catId([0-9]+)-p-:page([0-9]+)/?:filters?',
            client: {
                url: 'cat-:catId-p-:page(/)(:filters)'
            }
        }
    },
    'categories#show#pageSlugWithFilter': {
        urls: {
            server: ':title-cat-:catId([0-9]+)/?:filters?',
            client: {
                url: ':title-cat-:catId(/)(:filters)'
            }
        }
    },
    'categories#show#pageNoSlugWithFilter': {
        urls: {
            server: '-cat-:catId([0-9]+)/?:filters?',
            client: {
                url: '-cat-:catId(/)(:filters)'
            }
        }
    },
    'categories#show#pageWithFilter': {
        urls: {
            server: 'cat-:catId([0-9]+)/?:filters?',
            client: {
                url: 'cat-:catId(/)(:filters)'
            }
        }
    },
    'categories#show#slug': {
        urls: {
            server: ':title-cat-:catId([0-9]+)',
            client: {
                url: ':title-cat-:catId'
            }
        }
    },
    'categories#show#noSlug': {
        urls: {
            server: '-cat-:catId([0-9]+)',
            client: {
                url: '-cat-:catId'
            }
        }
    },
    'categories#show': {
        urls: {
            server: 'cat-:catId([0-9]+)',
            client: {
                url: 'cat-:catId'
            }
        }
    }
};
