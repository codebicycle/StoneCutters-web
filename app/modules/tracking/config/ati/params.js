'use strict';

module.exports = {
    'categories#list': {
        process: false,
        names: {
            page_name: 'home_page',
            category: 'home'
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
    'categories#showig#listing': {
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
    'searches#search': {
        process: true,
        names: {
            page_name: 'listing_all',
            category: 'listing',
            keyword: '',
            page_nb: 0
        }
    },
    'searches#searchig': {
        process: true,
        names: {
            page_name: 'listing_all',
            category: 'listing',
            keyword: '',
            page_nb: 0
        }
    },
    'searches#filter': {
        process: true,
        names: {
            page_name: 'listing_all',
            category: 'listing',
            keyword: '',
            page_nb: 0
        }
    },
    'searches#filterig': {
        process: true,
        names: {
            page_name: 'listing_all',
            category: 'listing',
            keyword: '',
            page_nb: 0
        }
    },
    'searches#statics': {
        process: true,
        names: {
            page_name: 'staticsearch_keyword',
            category: 'listing',
            subcategory: 'expired_subCategory',
            page_nb: 0
        }
    },
    'searches#allresults': {
        process: true,
        names: {
            page_name: 'listing_all',
            category: 'listing'
        }
    },
    'searches#allresultsig': {
        process: true,
        names: {
            page_name: 'listing_all',
            category: 'listing'
        }
    },
    'items#success': {
        process: true,
        names: {
            page_name: 'contact_seller_done',
            ad_category: '',
            ad_subcategory: '',
            ad_id: '',
            ad_photo: 0,
            poster_id: '0',
            poster_type: 'registered_no',
            posting_to_action: '',
            action_type: 'message_sent',
            geo1: '',
            geo2: ''
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
    'items#safetytips#email': {
        process: true,
        names: {
            page_name: 'tap_email',
            category: '',
            ad_category: '',
            ad_subcategory: '',
            ad_id: '',
            ad_photo: 0,
            poster_id: '0',
            poster_type: 'registered_no',
            posting_to_action: '',
            action_type: 'tap_email',
            geo1: '',
            geo2: ''
        }
    },
    'items#safetytips#sms': {
        process: true,
        names: {
            page_name: 'tap_sms',
            category: '',
            ad_category: '',
            ad_subcategory: '',
            ad_id: '',
            ad_photo: 0,
            poster_id: '0',
            poster_type: 'registered_no',
            posting_to_action: '',
            action_type: 'tap_sms',
            geo1: '',
            geo2: ''
        }
    },
    'items#safetytips#call': {
        process: true,
        names: {
            page_name: 'tap_call',
            category: '',
            ad_category: '',
            ad_subcategory: '',
            ad_id: '',
            ad_photo: 0,
            poster_id: '0',
            poster_type: 'registered_no',
            posting_to_action: '',
            action_type: 'tap_call',
            geo1: '',
            geo2: ''
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
    'post#flow#desktop_step1': {
        process: true,
        names: {
            page_name: 'posting_step1',
            category: 'posting',
            funnel_page: 'posting_step1',
            ad_category: '',
            ad_subcategory: '',
            funnel_category: '',
            funnel_subcategory: ''
        }
    },
    'post#flow#desktop_step2': {
        process: true,
        names: {
            page_name: 'posting_step2',
            category: 'posting',
            funnel_page: 'posting_step2',
            ad_category: '',
            ad_subcategory: '',
            funnel_category: '',
            funnel_subcategory: ''
        }
    },
    'post#flow#categories': {
        process: false,
        names: {
            page_name: 'posting_step2',
            category: 'posting',
            funnel_page: 'posting_step2'
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
    'post#success': {
        process: true,
        names: {
            page_name: 'posting_success',
            ad_category: '',
            ad_subcategory: '',
            ad_id: '',
            ad_photo: 0,
            action_type: 'posted',
            poster_id: '0',
            poster_type: 'registered_no',
            funnel_page: 'posting_success',
            funnel_category: '',
            funnel_subcategory: '',
            geo1: '',
            geo2: ''
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
    'users#register': {
        process: false,
        names: {
            page_name: 'register_mail',
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
    'users#myads': {
        process: false,
        names: {
            page_name: 'my_account',
            category: 'account'
        }
    },
    'users#favorites': {
        process: false,
        names: {
            page_name: 'my_account',
            category: 'account'
        }
    },
    'users#messages': {
        process: false,
        names: {
            page_name: 'myolx/myolxmessages',
            category: 'static_pages'
        }
    },
    'users#lostpassword': {
        process: false,
        names: {
            page_name: 'lostpassword',
            category: 'static_pages'
        }
    },
    'pages#terms': {
        process: false,
        names: {
            page_name: 'static/terms',
            category: 'static'
        }
    },
    'pages#help': {
        process: false,
        names: {
            page_name: 'static/help',
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
    'pages#error': {
        process: true,
        names: {
            page_name: 'not_found',
            category: 'error'
        }
    },
    'pages#allstates': {
        process: false,
        names: {
            page_name: 'sitemap',
            category: 'static_pages'
        }
    },
    'pages#sitemap': {
        process: false,
        names: {
            page_name: 'sitemapcalendar',
            category: 'static_pages'
        }
    },
    'pages#about': {
        process: false,
        names: {
            page_name: 'static/about',
            category: 'static_pages'
        }
    }

};
