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
    'redirections#categoryExpired': {
        url: ':title-cat-:categoryId-e'
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
    }
};
