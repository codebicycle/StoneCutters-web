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
    'redirections#popularSearches': {
        urls: [
            'popular-searches(-cat-:categoryId)',
            'popular-searches'
        ]
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
    'redirections#editphp': {
        url: 'myolx/edititem.php'
    },
    'redirections#myadsphp': {
        url: 'myolx/index.php'
    },
    'redirections#unsubscribe': {
        url: 'myolx/conversation/unsubscribe.php'
    },
    'redirections#report': {
        url: 'myolx/conversation/report.php'
    },
    'redirections#php': {
        url: ':path.php'
    },
    'redirections#allresultsig': {
        urls: [
            'nf/all-results-ig-p-:page/-:filters([a-zA-Z0-9_\\-\\.~]+)',
            'nf/all-results-ig-p-:page'
        ]
    },
    'redirections#searchfilterig': {
        urls: [
            'nf/:title-cat-:catId([0-9]+)-p-:page([0-9]+)-ig/:search/-:filters([a-zA-Z0-9_\\-\\.~]+)',
            'nf/-cat-:catId([0-9]+)-p-:page([0-9]+)-ig/:search/-:filters([a-zA-Z0-9_\\-\\.~]+)',
            'nf/cat-:catId([0-9]+)-p-:page([0-9]+)-ig/:search/-:filters([a-zA-Z0-9_\\-\\.~]+)',
            'nf/:title-cat-:catId([0-9]+)-ig/:search/-:filters([a-zA-Z0-9_\\-\\.~]+)',
            'nf/-cat-:catId([0-9]+)-ig/:search/-:filters([a-zA-Z0-9_\\-\\.~]+)',
            'nf/cat-:catId([0-9]+)-ig/:search/-:filters([a-zA-Z0-9_\\-\\.~]+)'
        ]
    },
    'redirections#searchfilter': {
        urls: [
            'nf/:title-cat-:catId([0-9]+)-p-:page([0-9]+)/:search/-:filters([a-zA-Z0-9_\\-\\.~]+)',
            'nf/-cat-:catId([0-9]+)-p-:page([0-9]+)/:search/-:filters([a-zA-Z0-9_\\-\\.~]+)',
            'nf/cat-:catId([0-9]+)-p-:page([0-9]+)/:search/-:filters([a-zA-Z0-9_\\-\\.~]+)'
        ]
    },
    'redirections#staticSearch': {
        urls: [
            'q/:search/c-:catId([0-9]+)/p-:page([0-9]+)',
            'q/:search/p-:page([0-9]+)'
        ]
    },
    'redirections#staticSearchMobile': {
        url: /^\/s\/.*/
    },
    'redirections#pictures': {
        url: /^\/pictures\/.*/
    },
    'redirections#userlistings': {
        url: /^\/userlistings\/.*/
    }
};
