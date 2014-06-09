'use strict';

var _ = require('underscore');
var common = require('./common');

function setUrlVars() {
    var href;
    if (typeof window === 'undefined') {
        href = this.app.getSession('siteLocation') + this.app.getSession('path');

        this.app.updateSession({
            href: href
        });
    }
    else {
        var location = window.location;
        href = this.app.getSession('siteLocation') + location.pathname;

        this.app.updateSession({
            path: location.pathname,
            url: location.href,
            href: href
        });
    }
}

function redirect() {
    if (typeof window === 'undefined') {
        return false;
    }
    var path = this.app.getSession('path');

    if (path.length <= 1 || path.slice(-1) !== '/') {
        return false;
    }
    this.redirectTo(common.link(path.slice(0, -1), this.app.getSession('siteLocation')), {
        status: 301
    });
    return true;
}

function cleanSession() {
    this.app.deleteSession('page');
}

function setCurrentRoute() {
    this.app.updateSession({
        currentRoute: this.currentRoute
    });
}

function setReferer() {
    if (typeof window === 'undefined') {
        return;
    }
    this.app.updateSession({
        referer: this.app.getSession('referer')
    });
}

function setLanguage(params) {
    if (typeof window === 'undefined') {
        return;
    }
    var languages = this.app.getSession('languages');
    var selectedLanguage = this.app.getSession('selectedLanguage');

    if (!params || !params.language || selectedLanguage === params.language || !languages._byId[params.language]) {
        return;
    }
    this.app.persistSession({
        selectedLanguage: params.language
    });
}

function setLocation(params, callback) {
    if (typeof window === 'undefined') {
        return callback();
    }
    var app = this.app;
    var location = this.app.getSession('location');
    var previousLocation;
    var spec;
    var url;

    if (!params || !params.location) {
        return callback();
    }
    previousLocation = this.app.getSession('siteLocation');
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
    this.app.fetch(spec, function afterFetch(err, result) {
        if (err) {
            return callback();
        }
        url = result.location.get('url');
        if (location.url.split('.').pop() !== url.split('.').pop()) {
            window.location = '/';
            return;
        }
        location.current = result.location.toJSON();
        app.persistSession({
            siteLocation: url
        });
        app.updateSession({
            location: location
        });
        callback();
    });
}

function processForm(params) {
    var form;
    var errors;

    if (this.app.getSession('platform') === 'wap' && params && params.errors) {
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
        form = _.clone(this.app.getSession('form'));
        this.app.deleteSession('form');
    }
    return form;
}

module.exports = {
    control: function(params, callback) {
        setUrlVars.call(this);
        if (!redirect.call(this)) {
            cleanSession.call(this);
            setCurrentRoute.call(this);
            setReferer.call(this);
            setLanguage.call(this);
            setLocation.call(this, params, function next() {
                callback.call(this, processForm.call(this, params));
            }.bind(this));
        }
    }
};
