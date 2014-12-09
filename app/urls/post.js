'use strict';

module.exports = {
    'locations#list': {
        url: 'location'
    },
    'post#success': {
        url: 'posting/success/:itemId'
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
    }
};
