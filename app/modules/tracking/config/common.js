'use strict';

module.exports = {
    pages: {
        'categories#list': 'home',
        'items#search#filters': '[category-name]/[subcategory-id]/search/[filter_name_value]',
        'items#search': '[category-name]/[subcategory-id]/search',
        'items#search#nfFilters': '[category-name]/[subcategory-id]/search/[filter_name_value]',
        'items#search#nf': '[category-name]/[subcategory-id]/search',
        'users#register': 'register',
        'users#login': 'login',
        'locations#list': 'select_location',
        'post#location': 'post_location/[rendering]',
        'post#success': '[category-name]/[subcategory-id]/post_success/[rendering]',
        'post#form': '[category-name]/[subcategory-id]/post_form/[rendering]',
        'post#subcategories': 'post_subcategorylist/[rendering]',
        'post#categories': 'post_categorylist/[rendering]',
        'post#edit': 'edititem',
        'post#flow': 'not_set/post_form/[rendering]',
        'pages#terms': 'terms',
        'pages#help': 'help',
        'pages#interstitial': 'interstitial',
        'items#success': '[category-name]/[subcategory-id]/reply/[item_attributes]',
        'items#reply': '[category-name]/[subcategory-id]/contact_form/[item_attributes]',
        'items#map': 'item/locate_in_map/[item_attributes]',
        'items#show': '[category-name]/[subcategory-id]/item/[item_attributes]',
        'items#gallery': '[category-name]/[subcategory-id]/item/[item_attributes]/gallery',
        'categories#show#listing': '[category-name]/[subcategory-id]/listing/[filter_name_value]',
        'categories#show': '[category-name]/subcategory_list',
        'pages#error': 'error'
    }
};
