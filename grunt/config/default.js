'use strict';

module.exports = {
    environments: ['development', 'testing', 'staging', 'production'],
    stylus: {
        testing: {
            urls: {
                static: 'http://static-testing.olx-st.com/mobile-webapp',
                image: 'http://images-testing.olx-st.com/mobile-webapp'
            }
        },
        staging: {
            urls: {
                static: 'http://static-staging.olx-st.com/mobile-webapp',
                image: 'http://images-staging.olx-st.com/mobile-webapp'
            }
        },
        production: {
            urls: {
                static: 'http://static01.olx-st.com/mobile-webapp',
                image: 'http://images01.olx-st.com/mobile-webapp'
            }
        }
    }
};
