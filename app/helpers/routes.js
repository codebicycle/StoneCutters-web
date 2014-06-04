'use strict';

module.exports = {
    'home#index': {
        url: '',
        google: 'home',
        ati: {
            process: false,
            params: {
                page_name: 'home_page',
                category: 'home'
            }
        }
    },
    'items#search#filters': {
        urls: {
            server: 'search/:search/-p-:page/:filters?',
            client: {
                url: 'search/:search/-p-:page(/)(:filters)'
            }
        },
        google: '[category-name]/[subcategory-id]/search/[filter_name_value]',
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
    'items#search': {
        urls: {
            server: 'search/:search?',
            client: {
                url: 'search(/)(:search)'
            }
        },
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
    'items#search#nfFilters': {
        urls: {
            server: 'nf/search/:search/-p-:page/:filters?',
            client: {
                url: 'nf/search/:search/-p-:page(/)(:filters)'
            }
        },
        google: '[category-name]/[subcategory-id]/search/[filter_name_value]',
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
    'items#search#nf': {
        urls: {
            server: 'nf/search/:search?',
            client: {
                url: 'nf/search(/)(:search)'
            }
        },
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
    'user#registration': {
        url: 'register',
        google: 'register',
        ati: {
            process: false,
            params: {
                page_name: 'register_form',
                category: 'account'
            }
        }
    },
    'user#login': {
        url: 'login',
        google: 'login',
        ati: {
            process: false,
            params: {
                page_name: 'login',
                category: 'account'
            }
        }
    },
    'user#logout': {
        url: 'logout'
    },
    'user#myolx': {
        url: 'myolx',
        google: 'myolx',
        ati: {
            process: false,
            params: {
                page_name: 'my_account',
                category: 'account'
            }
        }
    },
    'user#my-ads': {
        url: 'myolx/myadslisting',
        google: 'myadslisting',
        ati: {
            process: false,
            params: {
                page_name: 'ads_listings',
                category: 'account'
            }
        }
    },
    'user#favorites': {
        url: 'myolx/favoritelisting',
        google: 'favoritelisting',
        ati: {
            process: false,
            params: {
                page_name: 'favorite_listings',
                category: 'account'
            }
        }
    },
    'location#index': {
        url: 'location',
        google: 'post_location/[rendering]',
        ati: {
            process: false,
            params: {
                page_name: 'posting_step1',
                category: 'posting',
                funnel_page: 'posting_step1'
            }
        }
    },
    'post#success': {
        url: 'posting/success/:itemId',
        google: '[category-name]/[subcategory-id]/post_success/[rendering]',
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
    'post#form': {
        url: 'posting/:categoryId/:subcategoryId',
        google: '[category-name]/[subcategory-id]/post_form/[rendering]',
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
    'post#subcat': {
        url: 'posting/:categoryId',
        google: 'post_subcategorylist/[rendering]',
        ati: {
            process: false,
            params: {
                page_name: 'posting_step3',
                category: 'posting',
                funnel_page: 'posting_step3'
            }
        }
    },
    'post#index': {
        url :'posting',
        google: 'post_categorylist/[rendering]',
        ati: {
            process: false,
            params: {
                page_name: 'posting_step2',
                category: 'posting',
                funnel_page: 'posting_step2'
            }
        }
    },
    'post#edit': {
        url: 'myolx/edititem/:itemId',
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
    posting_edit_success: {
        url: 'myolx/edititem/success',
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
    'pages#terms': {
        url: 'terms',
        google: 'terms',
        ati: {
            process: false,
            params: {
                page_name: 'terms_and_conditions',
                category: 'static'
            }
        }
    },
    'pages#help': {
        url: 'help',
        google: 'help',
        ati: {
            process: false,
            params: {
                page_name: 'help_page',
                category: 'static'
            }
        }
    },
    'pages#interstitial': {
        url: 'interstitial',
        google: 'interstitial',
        ati: {
            process: false,
            params: {
                page_name: 'interstitial_page',
                category: 'interstitial'
            }
        }
    },
    'items#success': {
        urls: {
            server: 'iid-:itemId([0-9]+)/reply/success',
            client: {
                url: 'iid-:itemId/reply/success'
            }
        },
        google: '[category-name]/[subcategory-id]/reply_success/[item_attributes]',
        ati: {
            process: true,
            params: {
                page_name: 'contact_seller_done',
                category: 'reply',
                ad_category: '',
                ad_subcategory: '',
                ad_id: '',
                ad_photo: 0,
                poster_id: '0',
                poster_type: 'registered_no',
                posting_to_action: '',
                action_type: 'message_sent'
            }
        }
    },
    'items#reply': {
        urls: {
            server: 'iid-:itemId([0-9]+)/reply',
            client: {
                url: 'iid-:itemId/reply'
            }
        },
        google: '[category-name]/[subcategory-id]/reply/[item_attributes]',
        ati: {
            process: true,
            params: {
                page_name: 'contact_seller_form',
                category: 'reply',
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
    'items#show': {
        urls: {
            server: ':title-iid-:itemId([0-9]+)',
            client: {
                url: ':title-iid-:itemId'
            }
        },
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
    'items#galery': {
        urls: {
            server: ':title-iid-:itemId([0-9]+)/galery',
            client: {
                url: ':title-iid-:itemId/galery'
            }
        },
        google: '[category-name]/[subcategory-id]/item/[item_attributes]/galery',
        ati: {
            process: true,
            params: {
                page_name: 'detail_page_galery',
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
    'items#index#filters': {
        urls: {
            server: ':title-cat-:catId([0-9]+)-p-:page([0-9]+)/:filters?',
            client: {
                url: ':title-cat-:catId-p-:page(/)(:filters)'
            }
        },
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
    'items#index#pages': {
        urls: {
            server: ':title-cat-:catId([0-9]+)-p-:page([0-9]+)',
            client: {
                url: ':title-cat-:catId-p-:page'
            }
        },
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
    'categories#show': {
        urls: {
            server: ':title-cat-:catId([0-9]+)',
            client: {
                url: ':title-cat-:catId'
            }
        },
        google: '[category-name]/subcategory_list',
        ati: {
            process: true,
            params: {
                page_name: 'expired_category',
                category: 'expired_category',
                subcategory: 'expired_subCategory'
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
        },
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
