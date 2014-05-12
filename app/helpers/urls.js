'use strict';

module.exports = {
    '?*params': {
        view: 'home#index',
        isServer: false,
        google: '',
        ati: {
            process: false,
            params: {
                page_name: 'home_page',
                category: 'home'
            }
        }
    },
    '': {
        view: 'home#index',
        isServer: false,
        google: '',
        ati: {
            process: false,
            params: {
                page_name: 'home_page',
                category: 'home'
            }
        }
    },
    'search/:search/-p-:page/:filters?': {
        view: 'items#search',
        isServer: false,
        google: '[category-name]/[subcategory-id]/search/to_be_completed',
        ati: {
            process: true,
            params: {
                page_name: 'listing_all',
                category: 'listing',
                keyword: '',
                page_nb: 0
            }
        }
    },
    'search/:search?': {
        view: 'items#search',
        isServer: false,
        google: '[category-name]/[subcategory-id]/search',
        ati: {
            process: true,
            params: {
                page_name: 'listing_all',
                category: 'listing',
                keyword: '',
                page_nb: 0
            }
        }
    },
    'nf/search/:search/-p-:page/:filters?': {
        view: 'items#search',
        isServer: false,
        google: '[category-name]/[subcategory-id]/staticsearch/to_be_completed',
        ati: {
            process: true,
            params: {
                page_name: 'listing_all',
                category: 'listing',
                keyword: '',
                page_nb: 0
            }
        }
    },
    'nf/search/:search?': {
        view: 'items#search',
        isServer: false,
        google: '[category-name]/[subcategory-id]/staticsearch',
        ati: {
            process: true,
            params: {
                page_name: 'listing_all',
                category: 'listing',
                keyword: '',
                page_nb: 0
            }
        }
    },
    'register': {
        view: 'user#registration',
        isServer: false,
        google: 'register',
        ati: {
            process: false,
            params: {
                page_name: 'register_form',
                category: 'account'
            }
        }
    },
    'login': {
        view: 'user#login',
        isServer: false,
        google: 'login',
        ati: {
            process: false,
            params: {
                page_name: 'login',
                category: 'account'
            }
        }
    },
    'myolx/myadslisting': {
        view: 'user#my-ads',
        isServer: false,
        google: 'myadslisting',
        ati: {
            process: false,
            params: {
                page_name: 'ads_listings',
                category: 'account'
            }
        }
    },
    'myolx/favoritelisting': {
        view: 'user#favorites',
        isServer: false,
        google: 'favoritelisting',
        ati: {
            process: false,
            params: {
                page_name: 'favorite_listings',
                category: 'account'
            }
        }
    },
    'location': {
        view: 'location#index',
        isServer: false,
        google: 'location',
        ati: {
            process: false,
            params: {
                page_name: 'posting_step1',
                category: 'posting',
                funnel_page: 'posting_step1'
            }
        }
    },
    'posting': {
        view: 'post#index',
        isServer: false,
        google: 'posting',
        ati: {
            process: false,
            params: {
                page_name: 'posting_step2',
                category: 'posting',
                funnel_page: 'posting_step2'
            }
        }
    },
    'posting/:categoryId': {
        view: 'post#subcat',
        isServer: false,
        google: 'posting',
        ati: {
            process: false,
            params: {
                page_name: 'posting_step3',
                category: 'posting',
                funnel_page: 'posting_step3'
            }
        }
    },
    'posting/:categoryId/:subcategoryId': {
        view: 'post#form',
        isServer: false,
        google: 'posting',
        ati: {
            process: true,
            params: {
                page_name: 'posting_step4',
                category: 'posting',
                funnel_page: 'posting_step4',
                ad_category: '',
                ad_subcategory: '',
                funnel_category: '',
                funnel_subcategory: ''
            }
        }
    },
    'posting/success/:itemId': {
        view: 'post#success',
        isServer: false,
        google: 'posting',
        ati: {
            process: true,
            params: {
                page_name: 'posting_success',
                category: 'posting',
                ad_category: '',
                ad_subcategory: '',
                ad_id: '',
                ad_photo: 0,
                action_type: 'posted',
                poster_id: '0',
                poster_type: 'registered_no',
                funnel_page: 'posting_success',
                funnel_category: '',
                funnel_subcategory: ''
            }
        }
    },
    'myolx/edititem/:itemId?': {
        view: 'post#edit',
        isServer: false,
        google: 'edititem',
        ati: {
            process: true,
            params: {
                page_name: 'edit_ad_form',
                category: 'expired_category',
                subcategory: 'expired_subCategory',
                ad_category: 'expired_category',
                ad_subcategory: 'expired_subCategory',
                ad_id: '',
                ad_photo: 0,
                funnel_page: 'edit_ad_form',
                funnel_category: '',
                funnel_subcategory: ''
            }
        }
    },
    /*
    'myolx/edititem/success': {
        view: 'post#success',
        isServer: false,
        google: 'edititem',
        ati: {
            process: true,
            params: {
                page_name: 'posting_edit_success',
                category: 'posting',
                action_type: 'edited',
                posting_to_action: '',
                ad_category: '',
                ad_subcategory: '',
                ad_id: '',
                ad_photo: 0,
                poster_id: '0',
                poster_type: 'registered_no',
                funnel_page: 'posting_edit_success',
                funnel_category: '',
                funnel_subcategory: ''
            }
        }
    },
    */
    'terms': {
        view: 'pages#terms',
        isServer: false,
        google: 'terms',
        ati: {
            process: false,
            params: {
                page_name: 'terms_and_conditions',
                category: 'static'
            }
        }
    },
    'help': {
        view: 'pages#help',
        isServer: false,
        google: 'help',
        ati: {
            process: false,
            params: {
                page_name: 'help_page',
                category: 'static'
            }
        }
    },
    'interstitial': {
        view: 'pages#interstitial',
        isServer: false,
        google: 'interstitial',
        ati: {
            process: false,
            params: {
                page_name: 'interstitial_page',
                category: 'interstitial'
            }
        }
    },
    ':title-iid-:itemId([0-9]+$)': {
        view: 'items#show',
        isServer: false,
        google: '[category-name]/[subcategory-id]/item/[item_attributes]',
        ati: {
            process: true,
            params: {
                page_name: 'detail_page',
                category: '',
                subcategory: '',
                ad_category: '',
                ad_subcategory: '',
                ad_id: '',
                ad_photo: 0,
                poster_id: '0',
                poster_type: 'registered_no',
                action_type: 'loaded',
                posting_to_action: '',
                geo1: '',
                geo2: ''
            }
        }
    },
    ':title-iid-:itemId([0-9]+)/reply': {
        view: 'items#reply',
        isServer: false,
        google: '[category-name]/[subcategory-id]/item/[item_attributes]',
        ati: {
            process: true,
            params: {
                page_name: 'contact_seller_form',
                category: 'reply',
                subcategory: '',
                ad_category: '',
                ad_subcategory: '',
                ad_id: '',
                ad_photo: 0,
                poster_id: '0',
                poster_type: 'registered_no',
                posting_to_action: '',
                action_type: 'message_form'
            }
        }
    },
    ':title-cat-:catId([0-9]+)-p-:page([0-9]+)/:filters?': {
        view: 'items#index',
        isServer: false,
        google: '[category-name]/[subcategory-id]/listing/[filter_name_value]',
        ati: {
            process: true,
            params: {
                page_name: 'expired_category',
                category: 'expired_category',
                subcategory: 'expired_subCategory'
            }
        }
    },
    ':title-cat-:catId([0-9]+)-p-:page([0-9]+$)': {
        view: 'items#index',
        isServer: false,
        google: '[category-name]/[subcategory-id]/listing',
        ati: {
            process: true,
            params: {
                page_name: 'expired_category',
                category: 'expired_category',
                subcategory: 'expired_subCategory'
            }
        }
    },
    ':title-cat-:catId([0-9]+$)': {
        view: 'categories#show',
        isServer: false,
        google: '[category-name]/[subcategory-id]/listing',
        ati: {
            process: true,
            params: {
                page_name: 'expired_category',
                category: 'expired_category'
            }
        }
    },
    ':errorCode([0-9]{3})': {
        view: 'pages#error',
        isServer: false,
        google: 'error',
        ati: {
            process: false,
            params: {
                page_name: 'not_found',
                category: 'static'
            }
        }
    }
};
