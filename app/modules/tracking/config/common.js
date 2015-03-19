'use strict';

module.exports = {
    pages: {
        'categories#list': '/home/',
        'categories#show#listing': '/[category-name]/[subcategory-id]/listing/[page]/[filter_name_value]/',
        'categories#showig#listing': '/[category-name]/[subcategory-id]/listing/[page]/[filter_name_value]/',
        'categories#show': '[category-name]/subcategory_list',
        'items#success': '[category-name]/[subcategory-id]/reply/[item_attributes]',
        'items#reply': '[category-name]/[subcategory-id]/contact_form/[item_attributes]',
        'items#safetytips#email': '[category-name]/[subcategory-id]/tap_email/[item_attributes]',
        'items#safetytips#call': '[category-name]/[subcategory-id]/tap_call/[item_attributes]',
        'items#safetytips#sms': '[category-name]/[subcategory-id]/tap_sms/[item_attributes]',
        'items#map': 'item/locate_in_map/[item_attributes]',
        'items#show': '[category-name]/[subcategory-id]/item/[item_attributes]',
        'items#gallery': '[category-name]/[subcategory-id]/item/[item_attributes]/gallery',
        'searches#search': '[category-name]/[subcategory-id]/search/[page]?searchbox=[keyword]&section=[section]',
        'searches#searchig': '[category-name]/[subcategory-id]/search/[page]?searchbox=[keyword]&section=[section]',
        'searches#filter': '[category-name]/[subcategory-id]/search/[page]?searchbox=[keyword]&section=[section]',
        'searches#filterig': '[category-name]/[subcategory-id]/search/[page]?searchbox=[keyword]&section=[section]',
        'searches#statics': '[category-name]/[subcategory-id]/staticsearch/statickw_[keyword]',
        'searches#allresults': '/nocat/listing/',
        'searches#allresultsig': '/nocat/listing/',
        'locations#list': 'select_location',
        'post#location': 'post_location/[rendering]',
        'post#flow': 'not_set/post_form/[rendering]',
        'post#flow#categories': 'post_categorylist/[rendering]',
        'post#flow#desktop_step1': 'posting_step1',
        'post#flow#desktop_step2': 'posting_step2',
        'post#subcategories': 'post_subcategorylist/[rendering]',
        'post#form': '[category-name]/[subcategory-id]/post_form/[rendering]',
        'post#success': 'posting_success',
        'post#edit': 'edititem',
        'post#editsuccess': 'edititem_success',
        'users#register': 'register',
        'users#login': 'login',
        'users#myads': 'myolx/myolx',
        'users#favorites': 'myolx/favoritelisting',
        'users#messages': 'myolx/myolxmessages',
        'users#lostpassword': 'lostpassword',
        'pages#terms': 'static/terms',
        'pages#help': 'static/help',
        'pages#interstitial': 'interstitial',
        'pages#error': 'error',
        'pages#allstates': 'sitemap',
        'pages#sitemap': 'sitemapcalendar',
        'pages#about': 'static/about',
        'users#conversation': 'myolx/conversation',
        'users#conversations': 'myolx/conversations'
    }
};
