'use strict';

module.exports = {
    environment: {
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
    keywords: {
        events: {
            search: 'Search',
            postStarted: 'Post Started',
            postSubmitted: 'Post Submitted',
            postComplete: 'Post Complete',
            replyIntention: 'Reply intention',
            chooseCategory: 'Choose a Category'
        },
        properties: {
            keyword: 'Keyword',
            loggedIn: 'Logged in',
            from: 'From',
            type: 'Type',
            itemId: 'Item id',
            categoryId: 'Category Id',
            categoryName: 'Category Name',
            price: 'Price',
            neighborhood: 'Neighborhood',
            numberOfPhotos: 'Number of Photos',
            tipo: 'Tipo',
            location: 'Location',
            defaultCity: '$city'
        }
    },
    routes: {
        categories: {
            list: {
                pagename: 'Home'
            },
            show: {
                pagename: 'Listing Category'
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
            },
            login: {
                pagename: 'Login'
            },
            register: {
                pagename: 'Register'
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
