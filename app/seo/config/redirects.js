'use strict';

module.exports = {
    onDesktop: [
        {
            regexp: /^\/category\/(\d+)\/.+?/,
            path: 'replace',
            replace: '/des-cat-$1'
        },
        {
            regexp: /^\/item\/(gallery|list_comments|reply|show)\/(\d+)(\/.+)?/,
            path: 'replace',
            replace: '/des-iid-$2'
        },
        {
            regexp: /^\/item\/post\/.+/,
            path: '/posting.php'
        },
        {
            regexp: /^\/item\/(\d+)\/.+?/,
            path: 'replace',
            replace: '/des-cat-$1'
        },
        {
            regexp: /^\/auth\/login/,
            path: '/login.php'
        },
        {
            regexp: /^\/registration\/index/,
            path: '/register.php'
        },
        {
            regexp: /^\/user\/(\d+)\/(index|active_ads)/,
            path: '/myolx/myolx.php'
        },
        {
            regexp: /^\/user\/(\d+)\/favorites/,
            path: '/myolx/favoritelisting.php'
        },
        {
            regexp: /^\/user\/edit_item\/(\d+)\/(\d+)/,
            path: 'replace',
            replace: '/myolx/edititem.php?editid=$2'
        },
        {
            regexp: /^\/location\/page\/.+/,
            path: '/'
        },
        {
            regexp: /^\/search\/page\/.+/,
            path: 'replace',
            replace: '/nf/search/$search',
            params: true
        },
        {
            regexp: /^\/posting\/success\/.*?/,
            path: '/posting_success.php'
        },
        {
            regexp: /^\/posting(\/\d+)?(\/\d+)?/,
            path: '/posting.php'
        },
        {
            regexp: /^\/location/,
            path: '/'
        },
        {
            regexp: /^\/login/,
            path: '/login.php'
        },
        {
            regexp: /^\/logout/,
            path: '/logout.php'
        },
        {
            regexp: /^\/register/,
            path: '/register.php'
        },
        {
            regexp: /^\/terms/,
            path: '/terms.php'
        },
        {
            regexp: /^\/help/,
            path: '/help.php'
        },
        {
            regexp: /^\/myolx\/edititem\/(\d+)/,
            path: 'replace',
            replace: '/myolx/edititem.php?editid=$1'
        },
        {
            regexp: /^\/myolx\/favoritelisting/,
            path: '/myolx/favoritelisting.php'
        },
        {
            regexp: /^\/myolx(\/myadslisting)?/,
            path: '/myolx/myolx.php'
        },
        {
            regexp: /^(.+)\/gallery/,
            path: 'replace',
            replace: '$1'
        },
        {
            regexp: /^(.+)\/map/,
            path: 'replace',
            replace: '$1'
        },
        {
            regexp: /^(.+)\/reply(\/success)?/,
            path: 'replace',
            replace: '$1'
        }
    ]
};