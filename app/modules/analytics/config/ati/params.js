'use strict';

module.exports = {
    'categories#list': {
        process: false,
        names: {
            page_name: 'home_page',
            category: 'home'
        }
    },
    'items#search#filters': {
        process: true,
        names: {
            page_name: 'listing_all',
            category: 'listing',
            keyword: '',
            page_nb: 0
        }
    },
    'items#search': {
        process: true,
        names: {
            page_name: 'listing_all',
            category: 'listing',
            keyword: '',
            page_nb: 0
        }
    },
    'items#search#nfFilters': {
        process: true,
        names: {
            page_name: 'listing_all',
            category: 'listing',
            keyword: '',
            page_nb: 0
        }
    },
    'items#search#nf': {
        process: true,
        names: {
            page_name: 'listing_all',
            category: 'listing',
            keyword: '',
            page_nb: 0
        }
    },
    'users#register': {
        process: false,
        names: {
            page_name: 'register_form',
            category: 'account'
        }
    },
    'users#login': {
        process: false,
        names: {
            page_name: 'login',
            category: 'account'
        }
    },
    'locations#list': {
        process: false,
        names: {
            page_name: 'select_location',
            category: 'static'
        }
    },
    'post#location': {
        process: false,
        names: {
            page_name: 'posting_step1',
            category: 'posting',
            funnel_page: 'posting_step1'
        }
    },
    'post#success': {
        process: true,
        names: {
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
    },
    'post#form': {
        process: true,
        names: {
            page_name: 'posting_step4',
            category: 'posting',
            funnel_page: 'posting_step4',
            ad_category: '',
            ad_subcategory: '',
            funnel_category: '',
            funnel_subcategory: ''
        }
    },
    'post#subcategories': {
        process: false,
        names: {
            page_name: 'posting_step3',
            category: 'posting',
            funnel_page: 'posting_step3'
        }
    },
    'post#categories': {
        process: false,
        names: {
            page_name: 'posting_step2',
            category: 'posting',
            funnel_page: 'posting_step2'
        }
    },
    'post#edit': {
        process: true,
        names: {
            page_name: 'edit_ad_form',
            category: 'posting',
            ad_category: '',
            ad_subcategory: '',
            ad_id: '',
            ad_photo: 0,
            funnel_page: 'edit_ad_form',
            funnel_category: '',
            funnel_subcategory: ''
        }
    },
    'post#editsuccess': {
        process: true,
        names: {
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
    },
    'post#flow': {
        process: false,
        names: {
            page_name: 'posting_new',
            category: 'posting',
            ad_category: 'not_set',
            ad_subcategory: 'not_set',
            funnel_page: 'posting_new',
            funnel_category: 'not_set',
            funnel_subcategory: 'not_set'
        }
    },
    'pages#terms': {
        process: false,
        names: {
            page_name: 'terms_and_conditions',
            category: 'static'
        }
    },
    'pages#help': {
        process: false,
        names: {
            page_name: 'help_page',
            category: 'static'
        }
    },
    'pages#interstitial': {
        process: false,
        names: {
            page_name: 'interstitial_page',
            category: 'interstitial'
        }
    },
    'items#success': {
        process: true,
        names: {
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
    },
    'items#reply': {
        process: true,
        names: {
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
    },
    'items#show': {
        process: true,
        names: {
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
    },
    'items#gallery': {
        process: true,
        names: {
            page_name: 'detail_page_gallery',
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
    },
    'items#map': {
        process: true,
        names: {
            page_name: 'map_ad_detail',
            category: 'static',
            geo1: '',
            geo2: ''
        }
    },
    'categories#show#listing': {
        process: true,
        names: {
            page_name: 'expired_category',
            category: 'listing',
            subcategory: 'expired_subCategory'
        }
    },
    'categories#show': {
        process: true,
        names: {
            page_name: 'expired_category',
            category: 'static'
        }
    },
    'pages#error': {
        process: false,
        names: {
            page_name: 'not_found',
            category: 'static'
        }
    }
};
