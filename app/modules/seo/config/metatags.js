'use strict';

module.exports = {
    locations: {
        list: {}
    },
    categories: {
        // Home
        list: { 
            title: 'Home',
            description: 'This is the home page',
            'google-site-verification': true
        },
        subcategories: {
            title: 'Listing',
            description: 'This is a listing page'
        },

        // On listing size < 5 -> robots = 'noindex, follow'
        items: {}
    },
    items: {
        // On listing size < 5 -> robots = 'noindex, follow'
        search: {},

        // Title: On title + ' - ' + city + ' | OLX' > 70 characters -> is cut
        // description: On title + ' - ' + category + ' ' + city > 130 characters -> is cut
        show: {
            title: 'title',
            description: 'description'
        }
    },
    post: {
        categories: {},
        subcategories: {},
        form: {},
        edit: {},
        success: {}
    },
    users: {
        register: {},
        login: {},
        myolx: {},
        myads: {},
        favorites: {}
    },
    pages: {
        terms: {},
        help: {},
        interstitial: {},
        error: {}
    },
    'default': {
        title: 'OLX',
        description: 'OLX',
        robots: 'index,follow',
        googlebot: 'index,follow',
        canonical: true
    }
};
