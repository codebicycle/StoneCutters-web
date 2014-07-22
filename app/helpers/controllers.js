'use strict';

var asynquence = require('asynquence');
var _ = require('underscore');
var URLParser = require('url');
var seo = require('../seo');
var common = require('./common');
var marketing = require('./marketing');
var config = require('../config');
var utils = require('../../shared/utils');
var intertitial = config.get(['interstitial', 'enabled'], false);
var isServer = typeof window === 'undefined';

function setUrlVars(done) {
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
    done();
}

function redirect(done) {
    var path = this.app.session.get('path');

    if (path.length <= 1 || path.slice(-1) !== '/') {
        if (intertitial && setInterstitial.call(this)) {
            done.abort();
            return;
        }
        return done();
    }
    this.redirectTo(common.link(path.slice(0, -1), this.app), {
        status: 301
    });
    done.abort();
    return;
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
    paths = _.filter(paths, function filterInterstitial(ignorePath) {
        if (_.isString(ignorePath)) {
            return path === ignorePath;
        }
        return ignorePath.test(path);
    });
    if (paths.length) {
        return false;
    }

    if (utils.params(this.app.session.get('url') || '', 'target') === 'posting') {
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
                common.redirect.call(this, [url, '?ref=', protocol, '://', host, this.app.session.get('url')].join(''), null, {
                    status: 302
                });
                return true;
            }
        }
    }
    return false;
}

function clearSession(done) {
    this.app.session.clear('page');
    this.app.session.clear('postingLink');
    done();
}

function setCurrentRoute(done) {
    this.app.session.update({
        currentRoute: this.currentRoute
    });
    done();
}

function setReferer(done) {
    if (!isServer) {
        this.app.session.update({
            referer: this.app.session.get('referer')
        });
    }
    done();
}

function setLanguage(params, done) {
    if (isServer) {
        return done();
    }
    var selectedLanguage = this.app.session.get('selectedLanguage');
    var languages = this.app.session.get('languages');
    var language = (params ? params.language : undefined);
    var redirect;
    var url;

    if (selectedLanguage === languages.models[0].locale && language) {
        redirect = true;
    }
    else if (selectedLanguage !== languages.models[0].locale && !language) {
        redirect = true;
    }
    else if (language && language !== selectedLanguage) {
        redirect = true;
    }
    if (redirect) {
        done.abort();
        url = URLParser.parse(this.app.session.get('url'));
        url = [url.pathname, (url.search || '')].join('');
        return common.redirect.call(this.app.router || this, url, null, {
            status: 200
        });
    }
    if (!params || !language || selectedLanguage === language || !languages._byId[language]) {
        return done();
    }
    this.app.session.persist({
        selectedLanguage: language
    });
    done();
}

function setLocation(params, done) {
    if (isServer) {
        return done();
    }
    var app = this.app;
    var location = this.app.session.get('location');
    var previousLocation;
    var redirect;
    var url;

    if (!params || !params.location) {
        return done();
    }
    previousLocation = this.app.session.get('siteLocation');
    if (previousLocation === params.location) {
        return done();
    }
    if (!params.location && (previousLocation && previousLocation.split('.').shift() !== 'www')) {
        url = URLParser.parse(this.app.session.get('url'));
        url = [url.pathname, (url.search || '')].join('');
        common.redirect.call(this.app.router || this, url, {
            location: previousLocation
        }, {
            status: 200
        });
        done.abort();
        return;
    } 
    else if (params.location && params.location.split('.').shift() === 'www') {
        redirect = true;
    }
    this.app.fetch({
        location: {
            model: 'City',
            params: {
                location: params.location
            }
        }
    }, {
        readFromCache: false
    }, function afterFetch(err, result) {
        if (err) {
            return done.fail(err);
        }
        url = result.location.get('url');
        if (location.url.split('.').pop() !== url.split('.').pop()) {
            common.redirect.call(this.app.router || this, '/', null, {
                status: 200
            });
            done.abort();
            return;
        }
        location.current = result.location.toJSON();
        app.session.persist({
            siteLocation: url
        });
        app.session.update({
            location: location
        });
        if (redirect) {
            url = URLParser.parse(this.app.session.get('url'));
            url = [url.pathname, (url.search || '')].join('');
            common.redirect.call(this.app.router || this, common.removeParams(url, 'location'), null, {
                status: 200
            });
            done.abort();
            return;
        }
        done();
    }.bind(this));
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
        asynquence().or(fail.bind(this))
            .then(setUrlVars.bind(this))
            .then(redirect.bind(this))
            .then(clearSession.bind(this))
            .then(setCurrentRoute.bind(this))
            .then(setReferer.bind(this))
            .then(setLanguage.bind(this, params))
            .then(setLocation.bind(this, params))
            .val(success.bind(this));

        function success() {
            if (options.seo) {
                seo.resetHead.call(this);
            }
            if (options.cache) {
                changeHeaders.call(this);
            }
            callback.call(this, processForm.call(this, params, options.isForm));
        }

        function fail(err) {
            this.app.session.persist({
                error: err
            });
            return common.redirect.call(this, '/500');
        }
    },
    changeHeaders: changeHeaders
};
