'use strict';

module.exports = {
    home_with_params: {
        url: '?*params',
        view: 'home#index',
        isServer: false,
        google: 'home',
        ati: {
            process: false,
            params: {
                page_name: 'home_page',
                category: 'home'
            }
        }
    },
    home: {
        url: '',
        view: 'home#index',
        isServer: false,
        google: 'home',
        ati: {
            process: false,
            params: {
                page_name: 'home_page',
                category: 'home'
            }
        }
    },
    search_with_filters: {
        url: 'search/:search/-p-:page/:filters?',
        view: 'items#search',
        isServer: false,
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
    search: {
        url: 'search/:search?',
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
    nfsearch_with_filters: {
        url: 'nf/search/:search/-p-:page/:filters?',
        view: 'items#search',
        isServer: false,
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
    nfsearch: {
        url: 'nf/search/:search?',
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
    register: {
        url: 'register',
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
    login: {
        url: 'login',
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
    myolx: {
        url: 'myolx',
        view: 'user#myolx',
        isServer: false,
        google: 'myolx',
        ati: {
            process: false,
            params: {
                page_name: 'my_account',
                category: 'account'
            }
        }
    },
    myadslisting: {
        url: 'myolx/myadslisting',
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
    favoritelisting: {
        url: 'myolx/favoritelisting',
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
    location: {
        url: 'location',
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
    posting_success: {
        url: 'posting/success/:itemId',
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
    posting_cat_subcat: {
        url: 'posting/:categoryId/:subcategoryId',
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
    posting_cat: {
        url: 'posting/:categoryId',
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
    posting: {
        url :'posting',
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
    posting_edit: {
        url: 'myolx/edititem/:itemId?',
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
    terms: {
        url: 'terms',
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
    help: {
        url: 'help',
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
    interstitial: {
        url: 'interstitial',
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
    item: {
        url: ':title-iid-:itemId([0-9]+$)',
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
    item_reply: {
        url: ':title-iid-:itemId([0-9]+)/reply',
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
    category_with_filters: {
        url: ':title-cat-:catId([0-9]+)-p-:page([0-9]+)/:filters?',
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
    category_with_page: {
        url: ':title-cat-:catId([0-9]+)-p-:page([0-9]+$)',
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
    category: {
        url: ':title-cat-:catId([0-9]+$)',
        view: 'categories#show',
        isServer: false,
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
    error: {
        url: ':errorCode([0-9]{3})',
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
