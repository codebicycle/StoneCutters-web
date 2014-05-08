'use strict';

module.exports = {
    '?*params': {
        view: 'home#index',
        isServer: false,
        google: '',
        ati: {
            page_name: 'home_page',
            category: 'home'
        }
    },
    '': {
        view: 'home#index',
        isServer: false,
        google: '',
        ati: {
            page_name: 'home_page',
            category: 'home'
        }
    },
    'search/:search/-p-:page/:filters?': {
        view: 'items#search',
        isServer: false,
        google: '[category-name]/[subcategory-id]/search/to_be_completed',
        ati: {
            page_name: 'home_page',
            category: 'home'
        }
    },
    'search/:search?': {
        view: 'items#search',
        isServer: false,
        google: '[category-name]/[subcategory-id]/search',
        ati: {
            page_name: 'home_page',
            category: 'home'
        }
    },
    'nf/search/:search/-p-:page/:filters?': {
        view: 'items#search',
        isServer: false,
        google: '[category-name]/[subcategory-id]/search/to_be_completed',
        ati: {
            page_name: 'home_page',
            category: 'home'
        }
    },
    'nf/search/:search?': {
        view: 'items#search',
        isServer: false,
        google: '[category-name]/[subcategory-id]/staticsearch',
        ati: {
            page_name: 'home_page',
            category: 'home'
        }
    },
    'location': {
        view: 'location#index',
        isServer: false,
        google: 'location',
        ati: {
            page_name: 'home_page',
            category: 'home'
        }
    },
    'register': {
        view: 'user#registration',
        isServer: false,
        google: 'register',
        ati: {
            page_name: 'register_page',
            category: 'register'
        }
    },
    'login': {
        view: 'user#login',
        isServer: false,
        google: 'login',
        ati: {
            page_name: 'login_page',
            category: 'login'
        }
    },
    'myolx/myadslisting': {
        view: 'user#my-ads',
        isServer: false,
        google: 'myadslisting',
        ati: {
            page_name: 'myadslisting_page',
            category: 'myadslisting'
        }
    },
    'myolx/favoritelisting': {
        view: 'user#favorites',
        isServer: false,
        google: 'favoritelisting',
        ati: {
            page_name: 'favoritelisting_page',
            category: 'favoritelisting'
        }
    },
    'posting': {
        view: 'post#index',
        isServer: false,
        google: 'posting',
        ati: {
            page_name: 'posting_page',
            category: 'posting'
        }
    },
    'posting/:categoryId': {
        view: 'post#subcat',
        isServer: false,
        google: 'posting',
        ati: {
            page_name: 'posting_page',
            category: 'posting'
        }
    },
    'posting/:categoryId/:subcategoryId': {
        view: 'post#form',
        isServer: false,
        google: 'posting',
        ati: {
            page_name: 'posting_page',
            category: 'posting'
        }
    },
    'myolx/edititem/:itemId?': {
        view: 'post#edit',
        isServer: false,
        google: 'edititem',
        ati: {
            page_name: 'edititem_page',
            category: 'edititem'
        }
    },
    'terms': {
        view: 'pages#terms',
        isServer: false,
        google: 'terms',
        ati: {
            page_name: 'terms_page',
            category: 'terms'
        }
    },
    'help': {
        view: 'pages#help',
        isServer: false,
        google: 'help',
        ati: {
            page_name: 'help_page',
            category: 'help'
        }
    },
    'interstitial': {
        view: 'pages#interstitial',
        isServer: false,
        google: 'interstitial',
        ati: {
            page_name: 'interstitial_page',
            category: 'interstitial'
        }
    },
    ':title-iid-:itemId([0-9]+$)': {
        view: 'items#show',
        isServer: false,
        google: '[category-name]/[subcategory-id]/item/[item_attributes]',
        ati: {
            page_name: 'item_page',
            category: 'item'
        }
    },
    ':title-iid-:itemId([0-9]+)/reply': {
        view: 'items#reply',
        isServer: false,
        google: '[category-name]/[subcategory-id]/item/[item_attributes]',
        ati: {
            page_name: 'item_page',
            category: 'item'
        }
    },
    ':title-cat-:catId([0-9]+)-p-:page([0-9]+)/:filters?': {
        view: 'items#index',
        isServer: false,
        google: '[category-name]/[subcategory-id]/listing/[filter_name_value]',
        ati: {
            page_name: 'items_page',
            category: 'items'
        }
    },
    ':title-cat-:catId([0-9]+)-p-:page([0-9]+$)': {
        view: 'items#index',
        isServer: false,
        google: '[category-name]/[subcategory-id]/listing',
        ati: {
            page_name: 'items_page',
            category: 'items'
        }
    },
    ':title-cat-:catId([0-9]+$)': {
        view: 'categories#show',
        isServer: false,
        google: '[category-name]/[subcategory-id]/listing',
        ati: {
            page_name: 'items_page',
            category: 'items'
        }
    },
    ':errorCode([0-9]{3})': {
        view: 'pages#error',
        isServer: false,
        google: 'error',
        ati: {
            page_name: 'error_page',
            category: 'error'
        }
    }
};
