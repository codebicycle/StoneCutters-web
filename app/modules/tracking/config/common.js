'use strict';

module.exports = {
    pages: {
        'categories#list': 'home',
        'categories#show#listing': '[category-name]/[subcategory-id]/listing/[page]/[filter_name_value]',
        'categories#showig#listing': '[category-name]/[subcategory-id]/listing/[page]/[filter_name_value]',
        'categories#show': '[category-name]/subcategory_list',
        'items#success': '[category-name]/[subcategory-id]/reply/[item_attributes]',
        'items#reply': '[category-name]/[subcategory-id]/contact_form/[item_attributes]',
        'items#map': 'item/locate_in_map/[item_attributes]',
        'items#show': '[category-name]/[subcategory-id]/item/[item_attributes]',
        'items#gallery': '[category-name]/[subcategory-id]/item/[item_attributes]/gallery',
        'items#search': '[category-name]/[subcategory-id]/search/[filter_name_value]',
        'items#searchig': '[category-name]/[subcategory-id]/search/[filter_name_value]',
        'items#searchfilter': '[category-name]/[subcategory-id]/search/[filter_name_value]',
        'items#searchfilterig': '[category-name]/[subcategory-id]/search/[filter_name_value]',
        'items#allresults': 'nocat/listing',
        'items#allresultsig': 'nocat/listing',
        'locations#list': 'select_location',
        'post#location': 'post_location/[rendering]',
        'post#flow': 'not_set/post_form/[rendering]',
        'post#flow#categories': 'post_categorylist/[rendering]',
        'post#flow#desktop_steb1': 'posting_step1',
        'post#flow#desktop_steb2': 'posting_step2',
        'post#subcategories': 'post_subcategorylist/[rendering]',
        'post#form': '[category-name]/[subcategory-id]/post_form/[rendering]',
        'post#success': '[category-name]/[subcategory-id]/post_success/[rendering]',
        'post#edit': 'edititem',
        'users#register': 'register',
        'users#login': 'login',
        'pages#terms': 'static/terms',
        'pages#help': 'static/help',
        'pages#interstitial': 'interstitial',
        'pages#error': 'error'
    }
};
