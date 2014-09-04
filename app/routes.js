'use strict';

var _ = require('underscore');
var urls = require('./urls');

module.exports = function(match) {
    Object.keys(urls).forEach(function each(view) {
        var route = urls[view];
        var url;

        if (!route.urls) {
            url = route.url;
        }
        else if (typeof window === 'undefined') {
            url = route.urls.server;
        }
        else {
            url = route.urls.client.url;
        }
        if (typeof url === 'undefined') {
            return;
        }
        if (typeof window !== 'undefined') {
            if (url instanceof RegExp) {
                url = new RegExp(url.toString().slice(1, -1) + '\\/?');
            }
            else {
                url += '(/)';
            }
        }
        match(url, view.split('#').slice(0, 2).join('#'));
    });
};
