'use strict';

module.exports = {
    'locations#list': {
        url: 'location'
    },
    'post#success': {
        url: 'posting/success/:itemId'
    },
    'post#flowMarketing': {
        url :'posting/landing_mo'
    },
    'post#form': {
        url: 'posting/:categoryId/:subcategoryId'
    },
    'post#subcategories': {
        url: 'posting/:categoryId'
    },
    'post#flow': {
        url :'posting'
    },
    'post#flow#edit': {
        url: 'myolx/edititem/:itemId'
    },
    'post#renew': {
        url: 'myolx/renewitem/:itemId'
    },
    'post#rebump': {
        url: 'myolx/rebump/:itemId'
    },
    'post#editsuccess': {
        url: 'edititem/success/:itemId'
    },
};
