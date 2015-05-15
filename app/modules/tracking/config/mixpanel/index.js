'use strict';

module.exports = {
    enviroment: {        
        development: {
            token: '559e3633de8bb99c26a5a7dd10a9797e'
        },
        testing: {
            token: '559e3633de8bb99c26a5a7dd10a9797e'
        },
        staging: {
            token: 'de524b4f1ff25309a6a0f6d3456cfc6f'
        },
        production: {
            token: 'de524b4f1ff25309a6a0f6d3456cfc6f'
        }
    },
    routes: {
        categories: {
            list: {
                pagename: 'Home'
            }
        },
        searches: {
            allresults: {
                pagename: 'Listing'
            },
            allresultsig: {
                pagename: 'Listing gallery'
            },
            statics: {
                pagename: 'Listing /q'
            }
        },
        items: {
            show: {
                pagename: 'Item'
            }
        },
        pages: {
            'default': {
                pagename: 'Statics'
            },
            help: {
                pagename: 'Help'
            },
            terms: {
                pagename: 'Terms'
            }
        },
        users: {
            'default': {
                pagename: 'MyOLX'
            }
        },
        landings: {
            'default': {
                pagename: 'Landing'
            }
        },
        post: {
            'default': {
                pagename: 'Post'
            }
        }
    }
};
