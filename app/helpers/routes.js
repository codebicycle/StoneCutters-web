'use strict';

module.exports = {
    'pages#esi': {
        url: 'esi'
    },
    'redirections#category': {
        url: 'category/:categoryId/:title'
    },
    'redirections#subcategory': {
        url: 'item/:categoryId/:title/:subTitle/page/:page'
    },
    'redirections#related': {
        url: 'item/:categoryId/related-ads/page/:page'
    },
    'redirections#gallery': {
        url: 'item/gallery/:itemId'
    },
    'redirections#itemGallery': {
        url: 'item/gallery/:itemId/*'
    },
    'redirections#item': {
        url: 'item/show/:itemId'
    },
    'redirections#itemShow': {
        url: 'item/show/:itemId/*'
    },
    'redirections#reply': {
        url: 'item/reply/:itemId'
    },
    'redirections#search': {
        url: 'search/page/:page'
    },
    'redirections#login': {
        url: 'auth/login'
    },
    'redirections#register': {
        url: 'registration/index'
    },
    'redirections#location': {
        url: 'location/page/:page'
    },
    'redirections#postCategory': {
        url: 'item/post/category'
    },
    'redirections#postSubcategory': {
        url: 'item/post/subcategory/:categoryId'
    },
    'redirections#post': {
        url: 'item/post/info/:categoryId'
    },
    'redirections#myolx': {
        url: 'user/:userId/index'
    },
    'redirections#myads': {
        url: 'user/:userId/active_ads'
    },
    'redirections#favorites': {
        url: 'user/:userId/favorites'
    },
    'redirections#edit': {
        url: 'user/edit_item/:userId/:itemId'
    },
    'categories#list': {
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
    'users#register': {
        url: 'register'
    },
    'users#login': {
        url: 'login'
    },
    'users#logout': {
        url: 'logout'
    },
    'users#myolx': {
        url: 'myolx'
    },
    'users#myads': {
        url: 'myolx/myadslisting'
    },
    'users#favorites': {
        url: 'myolx/favoritelisting'
    },
    'locations#list': {
        url: 'location'
    },
    'post#success': {
        url: 'posting/success/:itemId'
    },
    'post#form': {
        url: 'posting/:categoryId/:subcategoryId'
    },
    'post#subcategories': {
        url: 'posting/:categoryId'
    },
    'post#categories': {
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
    'items#delete': {
        url: 'myolx/deleteitem/:itemId'
    },
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
    'items#show': {
        urls: {
            server: 'iid-:itemId([0-9]+)',
            client: {
                url: 'iid-:itemId'
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
    'items#favorite': {
        urls: {
            server: 'items/:itemId/favorite/?:intent?',
            client: {
                url: 'items/:itemId/favorite(/:intent)'
            }
        }
    },
    'pages#error': {
        url: /^\/(?!((health$)|(stats($|\/))|(analytics\/))).*/
    }
};
