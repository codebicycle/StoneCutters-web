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
    'post#categoriesOrFlow': {
        url :'posting'
    },
    'post#edit': {
        url: 'myolx/edititem/:itemId'
    }
};
