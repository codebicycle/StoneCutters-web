'use strict';

module.exports = {
    onDesktop: [
        {
            regexp: /^\/category\/(\d+)\/.+?/,
            url: '/des-cat-$1',
            replace: true
        },
        {
            regexp: /^\/item\/(gallery|list_comments|reply|show)\/(\d+)(\/.+)?/,
            url: '/des-iid-$2',
            replace: true
        },
        {
            regexp: /^\/item\/post\/.+/,
            url: '/posting.php'
        },
        {
            regexp: /^\/item\/(\d+)\/.+?/,
            url: '/des-cat-$1',
            replace: true
        },
        {
            regexp: /^\/auth\/login/,
            url: '/login.php'
        },
        {
            regexp: /^\/registration\/index/,
            url: '/register.php'
        },
        {
            regexp: /^\/user\/(\d+)\/(index|active_ads)/,
            url: '/myolx/myolx.php'
        },
        {
            regexp: /^\/user\/(\d+)\/favorites/,
            url: '/myolx/favoritelisting.php'
        },
        {
            regexp: /^\/user\/edit_item\/(\d+)\/(\d+)/,
            url: '/myolx/edititem.php?editid=$2',
            replace: true
        },
        {
            regexp: /^\/location\/page\/.+/,
            url: '/'
        },
        {
            regexp: /^\/search\/page\/.+/,
            url: '/nf/search/$search',
            replace: true,
            params: true
        },
        {
            regexp: /^\/posting\/success\/.*?/,
            url: '/posting_success.php'
        },
        {
            regexp: /^\/posting(\/\d+)?(\/\d+)?/,
            url: '/posting.php'
        },
        {
            regexp: /^\/location/,
            url: '/'
        },
        {
            regexp: /^\/login/,
            url: '/login.php'
        },
        {
            regexp: /^\/logout/,
            url: '/logout.php'
        },
        {
            regexp: /^\/register/,
            url: '/register.php'
        },
        {
            regexp: /^\/terms/,
            url: '/terms.php'
        },
        {
            regexp: /^\/help/,
            url: '/help.php'
        },
        {
            regexp: /^\/myolx\/edititem\/(\d+)/,
            url: '/myolx/edititem.php?editid=$1',
            replace: true
        },
        {
            regexp: /^\/myolx\/favoritelisting/,
            url: '/myolx/favoritelisting.php'
        },
        {
            regexp: /^\/myolx(\/myadslisting)?/,
            url: '/myolx/myolx.php'
        },
        {
            regexp: /^(.+)\/gallery/,
            url: '$1',
            replace: true
        },
        {
            regexp: /^(.+)\/map/,
            url: '$1',
            replace: true
        },
        {
            regexp: /^(.+)\/reply(\/success)?/,
            url: '$1',
            replace: true
        }
    ]
};