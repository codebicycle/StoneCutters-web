'use strict';

module.exports = {
    environments: ['development', 'testing', 'staging', 'production'],
    platforms: ['html4', 'html5', 'desktop'],
    stylus: {
        testing: {
            urls: {
                static: 'http://static-testing.olx-st.com/mobile-webapp',
                image: 'http://static-testing.olx-st.com/mobile-webapp'
            },
            'www.olx.ir': {
                urls: {
                    static: 'http://static01.olx-st.ir/mobile-webapp',
                    image: 'http://static01.olx-st.ir/mobile-webapp'
                }
            }
        },
        staging: {
            urls: {
                static: 'http://static-staging.olx-st.com/mobile-webapp',
                image: 'http://static-staging.olx-st.com/mobile-webapp'
            }
        },
        production: {
            urls: {
                static: 'http://static01.olx-st.com/mobile-webapp',
                image: 'http://static01.olx-st.com/mobile-webapp'
            }
        }
    }
};
