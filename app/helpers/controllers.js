'use strict';

var _ = require('underscore');
var seo = require('../seo');
var common = require('./common');
var marketing = require('./marketing');
var config = require('../config');
var intertitial = config.get(['interstitial', 'enabled'], false);
var isServer = typeof window === 'undefined';

function setUrlVars() {
    var href;
    if (isServer) {
        href = this.app.session.get('protocol') + '://' + this.app.session.get('siteLocation') + this.app.session.get('path');

        this.app.session.update({
            href: href
        });
    }
    else {
        var location = window.location;
        href = this.app.session.get('protocol') + '://' + this.app.session.get('siteLocation') + location.pathname;

        this.app.session.update({
            path: location.pathname,
            url: location.href,
            href: href
        });
    }
}

function redirect() {
    var path = this.app.session.get('path');

    if (path.length <= 1 || path.slice(-1) !== '/') {
        if (intertitial && setInterstitial.call(this)) {
            return true;
        }
        return false;
    }
    this.redirectTo(common.link(path.slice(0, -1), this.app), {
        status: 301
    });
    return true;
}

function cleanSession() {
    this.app.session.clear('page');
}

function setCurrentRoute() {
    this.app.session.update({
        currentRoute: this.currentRoute
    });
}

function setReferer() {
    if (isServer) {
        return;
    }
    this.app.session.update({
        referer: this.app.session.get('referer')
    });
}

function setInterstitial() {
    var url = '/interstitial';
    var platform;
    var platforms;
    var path;
    var paths;
    var info;
    var downloadApp;
    var clicks;
    var currentClicks;

    platform = this.app.session.get('platform');
    platforms = config.get(['interstitial', 'ignorePlatform'], []);
    if (_.contains(platforms, platform)) {
        return false;
    }

    path = this.app.session.get('path');
    paths = config.get(['interstitial', 'ignorePath'], []);
    if (_.contains(paths, path)) {
        return false;
    }

    info = marketing.getInfo(this.app, 'interstitial');
    if (!info || _.isEmpty(info)) {
        return false;
    }

    downloadApp = this.app.session.get('downloadApp');
    if (_.isUndefined(downloadApp) || downloadApp !== '1') {
        clicks = config.get(['interstitial', 'clicks'], 1);
        currentClicks = this.app.session.get('clicks') || 0;

        if (currentClicks < clicks) {
            currentClicks++;
            this.app.session.persist({
                clicks: currentClicks
            });
        }
        else {
            var protocol = this.app.session.get('protocol');
            var host = this.app.session.get('host');
            var time = config.get(['interstitial', 'time'], 60000);

            this.app.session.clear('clicks');
            this.app.session.persist({
                downloadApp: time
            });
            if (!isServer || platform === 'html5') {
                this.app.session.update({
                    interstitial: true
                });
            }
            else {
                common.redirect.call(this, [url, '?ref=', protocol, '://', host, this.app.session.get('url')].join(''), {
                    status: 302
                });
                return true;
            }
        }
    }
    return false;
}

function setLanguage(params) {
    if (isServer) {
        return;
    }
    var languages = this.app.session.get('languages');
    var selectedLanguage = this.app.session.get('selectedLanguage');

    if (!params || !params.language || selectedLanguage === params.language || !languages._byId[params.language]) {
        return;
    }
    this.app.session.persist({
        selectedLanguage: params.language
    });
}

function setLocation(params, callback) {
    if (isServer) {
        return callback();
    }
    var app = this.app;
    var location = this.app.session.get('location');
    var previousLocation;
    var spec;
    var url;

    if (!params || !params.location) {
        return callback();
    }
    previousLocation = this.app.session.get('siteLocation');
    if (previousLocation === params.location) {
        return callback();
    }
    spec = {
        location: {
            model: 'City',
            params: {
                location: params.location
            }
        }
    };
    this.app.fetch(spec, {
        readFromCache: false
    }, function afterFetch(err, result) {
        if (err) {
            return callback();
        }
        url = result.location.get('url');
        if (location.url.split('.').pop() !== url.split('.').pop()) {
            window.location = '/';
            return;
        }
        location.current = result.location.toJSON();
        app.session.persist({
            siteLocation: url
        });
        app.session.update({
            location: location
        });
        callback();
    });
}

function processForm(params, isForm) {
    var form;
    var errors;

    if (!isForm) {
        return;
    }
    if (this.app.session.get('platform') === 'wap' && params && params.errors) {
        if (typeof params.errors === 'string') {
            params.errors = [params.errors];
        }
        else {
            params.errors.length = Object.keys(params.errors).length;
            params.errors = Array.prototype.slice.call(params.errors);
        }
        form = {
            values: {},
            errors: {}
        };
        params.errors.forEach(function each(error) {
            var err = error.split(' | ');
            var field;
            var message;

            if (err.length > 1) {
                field = err.shift();
                message = err.pop();
            }
            else {
                field = 'main';
                message = err.shift();
            }
            if (!form.errors[field]) {
                form.errors[field] = [];
            }
            form.errors[field].push(message);
        });
    }
    else {
        form = _.clone(this.app.session.get('form'));
        this.app.session.clear('form');
    }
    return form;
}

function changeHeaders(headers, page) {
    if (!isServer || !config.get(['cache', 'enabled'], false) || (headers && _.isEmpty(headers))) {
        return;
    }
    if (!headers) {
        if (!page) {
            var currentRoute = this.app.session.get('currentRoute');
            page = [currentRoute.controller, currentRoute.action];
        }
        headers = config.get(['cache', 'headers'].concat(page), config.get(['cache', 'headers', 'default'], {}));
    }
    if (_.isEmpty(headers)) {
        return;
    }
    for (var header in headers) {
        this.app.req.res.setHeader(header, headers[header]);
    }
}

module.exports = {
    control: function(params, options, callback) {
        if (options instanceof Function) {
            callback = options;
            options = {};
        }
        _.defaults(options, {
            isForm: false,
            seo: true,
            cache: true
        });
        setUrlVars.call(this);
        if (!redirect.call(this)) {
            cleanSession.call(this);
            setCurrentRoute.call(this);
            setReferer.call(this);
            setLanguage.call(this, params);
            setLocation.call(this, params, function next() {
                if (options.seo) {
                    seo.resetHead.call(this);
                }
                if (options.cache) {
                    changeHeaders.call(this);
                }
                callback.call(this, processForm.call(this, params, options.isForm));
            }.bind(this));
        }
    },
    changeHeaders: changeHeaders
};
