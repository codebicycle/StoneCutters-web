'use strict';

var URLParser = require('url');
var path = require('path');
var asynquence = require('asynquence');
var helpers = require('../helpers');

module.exports = function(params, next) {
    if (this.app.session.get('isServer')) {
        return next();
    }

    var location = this.app.session.get('location');
    var redirect = false;
    var previousLocation;
    var url;

    if (!params || !params.location) {
        return next();
    }

    previousLocation = this.app.session.get('siteLocation');
    if (previousLocation === params.location) {
        return next();
    }

    if (!params.location && (previousLocation && previousLocation.split('.').shift() !== 'www')) {
        url = URLParser.parse(this.app.session.get('url'));
        url = [url.pathname, (url.search || '')].join('');
        helpers.common.redirect.call(this.app.router || this, url, {
            location: previousLocation
        }, {
            status: 200
        });
        return next.abort();
    }
    else if (params.location && params.location.split('.').shift() === 'www') {
        redirect = true;
    }
    findCity.call(this, params, redirect, next);
};

function findCity(params, _redirect, next) {
    var siteLocation = this.app.session.get('siteLocation');

    function fetch(done) {
        this.app.fetch({
            location: {
                model: 'Location',
                params: {
                    location: params.location
                }
            }
        }, {
            store: true
        }, done.errfcb);
    }

    function check(done, res) {
        if (!res || !res.location) {
            return done.fail(new Error('Invalid location'));
        }
        if (siteLocation.split('.').pop() !== res.location.get('url').split('.').pop()) {
            helpers.common.redirect.call(this.app.router || this, '/', null, {
                status: 200
            });
            done.abort();
            return next.abort();
        }
        done(res.location);
    }

    function store(done, location) {
        var current = location.get('current');

        this.app.session.persist({
            siteLocation: current ? current.url : location.get('url')
        });
        this.app.session.update({
            location: location.toJSON()
        });
        done();
    }

    function redirect(done) {
        var url;

        if (_redirect) {
            url = URLParser.parse(this.app.session.get('url'));
            url = [url.pathname, (url.search || '')].join('');

            helpers.common.redirect.call(this.app.router || this, helpers.common.removeParams(url, 'location'), null, {
                status: 200
            });
            done.abort();
            return next.abort();
        }
        done();
    }

    function fail(err) {
        this.app.session.persist({
            error: err
        });
        next.abort();
        return helpers.common.redirect.call(this, '/500');
    }

    asynquence().or(fail.bind(this))
        .then(fetch.bind(this))
        .then(check.bind(this))
        .then(store.bind(this))
        .then(redirect.bind(this))
        .val(next);
}
