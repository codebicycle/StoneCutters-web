'use strict';

exports.link = function link(href, siteLocation) {
    if (!siteLocation || !siteLocation.indexOf('www.')) {
        return href;
    }
    if (~href.indexOf('?')) {
        if (href.slice(-1) !== '&') {
            href += '&';
        }
    }
    else {
        href += '?';
    }
    if (!(~href.indexOf('location=' + siteLocation))) {
        href += 'location=' + siteLocation;
    }
    return href;
};

exports.logMiddleware = function () {
    var args = arguments;

    return function(req, res, next) {
        console.log.apply(console, args);
        next();
    };
};
