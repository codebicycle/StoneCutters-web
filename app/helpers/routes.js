'use strict';

module.exports = {
    'home#index': {
        url: ''
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
    'user#registration': {
        url: 'register'
    },
    'user#login': {
        url: 'login'
    },
    'user#logout': {
        url: 'logout'
    },
    'user#myolx': {
        url: 'myolx'
    },
    'user#my-ads': {
        url: 'myolx/myadslisting'
    },
    'user#favorites': {
        url: 'myolx/favoritelisting'
    },
    'location#index': {
        url: 'location'
    },
    'post#success': {
        url: 'posting/success/:itemId'
    },
    'post#form': {
        url: 'posting/:categoryId/:subcategoryId'
    },
    'post#subcat': {
        url: 'posting/:categoryId'
    },
    'post#index': {
        url :'posting'
    },
    'post#edit': {
        url: 'myolx/edititem/:itemId'
    },
    /*
    'post#editsuccess': {
        url: 'myolx/edititem/success'
    },
    */
    'pages#terms': {
        url: 'terms'
    },
    'pages#help': {
        url: 'help'
    },
    'pages#interstitial': {
        url: 'interstitial'
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
    'items#show': {
        urls: {
            server: ':title-iid-:itemId([0-9]+)',
            client: {
                url: ':title-iid-:itemId'
            }
        }
    },
    'items#galery': {
        urls: {
            server: ':title-iid-:itemId([0-9]+)/galery',
            client: {
                url: ':title-iid-:itemId/galery'
            }
        }
    },
    'categories#show#listing': {
        urls: {
            server: ':title-cat-:catId([0-9]+)-p-:page([0-9]+)/?:filters?',
            client: {
                url: ':title-cat-:catId-p-:page(/)(:filters)'
            }
        }
    },
    'categories#show': {
        urls: {
            server: ':title-cat-:catId([0-9]+)',
            client: {
                url: ':title-cat-:catId'
            }
        }
    },
    'pages#error': {
        urls: {
            server: ':errorCode([0-9]{3})',
            client: {
                url: /([0-9]{3})/,
                params: ['errorCode']
            }
        }
    }
};
