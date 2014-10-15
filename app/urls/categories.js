'use strict';

module.exports = {
    'categories#showig#pageSlug': {
        urls: {
            server: ':title-cat-:catId([0-9]+)-p-:page([0-9]+)-ig/?:filters?',
            client: {
                url: ':title-cat-:catId-p-:page(/)-ig(:filters)'
            }
        }
    },
    'categories#showig#pageNoSlug': {
        urls: {
            server: '-cat-:catId([0-9]+)-p-:page([0-9]+)-ig/?:filters?',
            client: {
                url: '-cat-:catId-p-:page(/)-ig(:filters)'
            }
        }
    },
    'categories#showig#page': {
        urls: {
            server: 'cat-:catId([0-9]+)-p-:page([0-9]+)-ig/?:filters?',
            client: {
                url: 'cat-:catId-p-:page(/)-ig(:filters)'
            }
        }
    },
    'categories#showig#pageSlugWithFilter': {
        urls: {
            server: ':title-cat-:catId([0-9]+)-ig/?:filters?',
            client: {
                url: ':title-cat-:catId(/)-ig(:filters)'
            }
        }
    },
    'categories#showig#pageNoSlugWithFilter': {
        urls: {
            server: '-cat-:catId([0-9]+)-ig/?:filters?',
            client: {
                url: '-cat-:catId(/)-ig(:filters)'
            }
        }
    },
    'categories#showig#pageWithFilter': {
        urls: {
            server: 'cat-:catId([0-9]+)-ig/?:filters?',
            client: {
                url: 'cat-:catId(/)-ig(:filters)'
            }
        }
    },
    'categories#showig#slug': {
        urls: {
            server: ':title-cat-:catId([0-9]+)-ig',
            client: {
                url: ':title-cat-:catId-ig'
            }
        }
    },
    'categories#showig#noSlug': {
        urls: {
            server: '-cat-:catId([0-9]+)-ig',
            client: {
                url: '-cat-:catId-ig'
            }
        }
    },
    'categories#showig': {
        urls: {
            server: 'cat-:catId([0-9]+)-ig',
            client: {
                url: 'cat-:catId-ig'
            }
        }
    },

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
