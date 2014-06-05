'use strict';

var qs = require('querystring');

module.exports = {
    hosts: {
        ar: 'm.olx.com.ar', 
        br: 'm.olx.com.br',
        de: 'm.olx.de',
        in: 'm.olx.in'
    },
    locations: {
        ar: {
            www: 'www.olx.com.ar',
            capitalfederal: 'capitalfederal.olx.com.ar'
        },
        br: {
            www: 'www.olx.com.br'
        },
        de: {
            www: 'www.olx.de'
        },
        in: {
            www: 'www.olx.in',
            mumbai: 'mumbai.olx.in'
        }
    },
    userAgents: {
        html5: 'UCWEB/8.8 (iPhone; CPU OS_6; en-US)AppleWebKit/534.1 U3/3.0.0 Mobile', 
        html4: 'Mozilla/4.0 (compatible; MSIE 7.0; Windows Phone OS 7.0; Trident/3.1; IEMobile/7.0) Asus;Galaxy6', 
        wap: 'Nokia6100/1.0 (04.01) Profile/MIDP-1.0 Configuration/CLDC-1.0'
    },
    smaugUserAgent: ['Arwen/mocha-test (node.js ', process.version, ')'].join(''),

    noop: function() {},
    getHost: function (platform, country) {
        return [platform, this.hosts[ country ]].join('.');
    },
    logMiddleware: function () {
        var args = arguments;

        return function(req, res, next) {
            console.log.apply(console, args);
            next();
        };
    },
    deparams: function () {
        return qs.parse.apply(qs, arguments);
    }
};