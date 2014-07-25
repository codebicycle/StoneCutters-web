'use strict';

module.exports = {
    metatags: require('./metatags'),
    redirect: {
        onDesktop: {
            postingSuccess: {
                regexp: /^\/posting\/success\/.*?/,
                path: '/posting_success.php'
            },
            posting: {
                regexp: /^\/posting(\/\d+)?(\/\d+)?/,
                path: '/posting.php'
            },
            location: {
                regexp: /^\/location/,
                path: '/'
            },
            login: {
                regexp: /^\/login/,
                path: '/login.php'
            },
            logout: {
                regexp: /^\/logout/,
                path: '/logout.php'
            },
            register: {
                regexp: /^\/register/,
                path: '/register.php'
            },
            terms: {
                regexp: /^\/terms/,
                path: '/terms.php'
            },
            help: {
                regexp: /^\/help/,
                path: '/help.php'
            },
            myolxFavorites: {
                regexp: /^\/myolx\/favoritelisting/,
                path: '/myolx/favoritelisting.php'
            },
            myolx: {
                regexp: /^\/myolx(\/myadslisting)?/,
                path: '/myolx/myolx.php'
            },
            itemGallery: {
                regexp: /^(.+)\/gallery/,
                path: 'replace',
                replace: '$1'
            },
            itemMap: {
                regexp: /^(.+)\/map/,
                path: 'replace',
                replace: '$1'
            },
            itemReply: {
                regexp: /^(.+)\/reply(\/success)?/,
                path: 'replace',
                replace: '$1'
            }
        }
    }
};