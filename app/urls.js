'use strict';

module.exports = {
    'redirections#category': {
        url: 'category/:categoryId/:title'
    },
    'redirections#subcategory': {
        url: 'item/:categoryId/:title/:subTitle/page/:page'
    },
    'redirections#subcategoryListWithParams': {
        url: 'item/:categoryId/:title/:subTitle/:description/page/:page'
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
    'redirections#comment': {
        url: 'item/list_comments/:itemId'
    },
    'redirections#itemComment': {
        url: 'item/list_comments/:itemId/*'
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
    'redirections#subcategoryList': {
        url: 'item/:categoryId'
    },
    'redirections#redirecttomain': {
        url: 'redirecttomain'
    },
    'categories#list': {
        url: ''
    },
    'redirections#nfsearch#filters': {
        urls: {
            server: 'search/:search/-p-:page/:filters?',
            client: {
                url: 'search/:search/-p-:page(/)(:filters)'
            }
        }
    },
    'redirections#nfsearch': {
        urls: {
            server: 'search/:search?',
            client: {
                url: 'search(/)(:search)'
            }
        }
    },
    'items#search#filters': {
        urls: {
            server: 'nf/search/:search/-p-:page/:filters?',
            client: {
                url: 'nf/search/:search/-p-:page(/)(:filters)'
            }
        }
    },
    'items#search': {
        urls: {
            server: 'nf/search/:search?',
            client: {
                url: 'nf/search(/)(:search)'
            }
        }
    },
    'items#staticSearch': {
        url: 'q/:search'
    },
    'items#staticSearch#page': {
        url: 'q/:search/p-:page'
    },
    'items#staticSearch#cat': {
        url: 'q/:search/c-:catId'
    },
    'items#staticSearch#catPage': {
        url: 'q/:search/c-:catId/p-:page'
    },
    'redirections#nfallresults#page': {
        urls: {
            server: 'all-results/-p-:page/:filters?',
            client: {
                url: 'all-results/-p-:page(/)(:filters)'
            }
        }
    },
    'redirections#nfallresults': {
        urls: {
            server: 'all-results/:filters?',
            client: {
                url: 'all-results(/)(:filters)'
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
    'post#categoriesOrFlow': {
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
        url: /^\/(?!((health$)|(force($|\/))|(esi($|\/))|(stats($|\/))|(analytics($|\/)))).*/
    }
};
