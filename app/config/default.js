module.exports = {
    smaug: {
        wap: {
            maxPageSize: 25
        },
        html4: {
            maxPageSize: 25
        },
        html5: {
            maxPageSize: 25
        }
    },
    staticAccept: ['css', 'js'],
    imageAccept: ['jpg', 'jpeg', 'png', 'gif', 'ico'],
    icons: {
        wap: ['www.olx.com.ar', 'www.olx.com.bd', 'www.olx.com.br', 'www.olx.cm', 'www.olx.com.co', 'www.olx.com.ec', 'www.olx.com.sv', 'www.olx.com.gt', 'www.olx.in', 'www.olx.co.ke', 'www.olx.com.ng', 'www.olx.com.pe', 'www.olx.sn', 'www.olx.co.za', 'www.olx.com.ve'],
        html4: ['www.olx.com.ar', 'www.olx.com.bd', 'www.olx.com.br', 'www.olx.cm', 'www.olx.com.co', 'www.olx.com.ec', 'www.olx.com.sv', 'www.olx.com.gt', 'www.olx.in', 'www.olx.co.ke', 'www.olx.com.ng', 'www.olx.com.pe', 'www.olx.sn', 'www.olx.co.za', 'www.olx.com.ve'],
        html5: ['www.olx.com.ar', 'www.olx.com.bd', 'www.olx.com.br', 'www.olx.cm', 'www.olx.com.co', 'www.olx.com.ec', 'www.olx.com.sv', 'www.olx.com.gt', 'www.olx.in', 'www.olx.co.ke', 'www.olx.com.ng', 'www.olx.com.pe', 'www.olx.sn', 'www.olx.co.za', 'www.olx.com.ve']

    },
    sixpack: {
        enabled: false,
        url: 'http://localhost:5000',
        'post-button': {
            enabled: false
        }
    },
    disablePostingButton: {
        wap: ['home', 'post', 'location'],
        html4: ['post', 'location'],
        html5: ['post', 'location']
    },
    interstitial: {
        enabled: true,
        clicks: 1,
        time: 600000,
        ignorePath: ['/health', '/stats', '/stats/memory', '/stats/threads', '/check', '/login', '/interstitial', '/404', '/500', '/pageview.gif', '/pageevent.gif'],
        ignorePlatform: ['wap']
    }
};
