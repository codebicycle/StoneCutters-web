'use strict';

var _ = require('underscore');
var asynquence = require('asynquence');
var common = require('./common');
var seo = require('../modules/seo');
var analytics = require('../modules/analytics');
var config = require('../../shared/config');
var isServer = typeof window === 'undefined';

function prepare(done) {
    if (!isServer) {
        this.app.session.update({
            referer: this.app.session.get('referer')
        });
    }
    this.app.session.clear('page');
    this.app.session.clear('postingLink');
    this.app.session.update({
        currentRoute: this.currentRoute
    });
    done();
}

function processAnalytics(done) {
    analytics.reset();
    done();
}

function processSeo(done) {
    seo.resetHead.call(this);
    done();
}

function processHeaders(done) {
    changeHeaders.call(this);
    done();
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

function processForm(params, done) {
    var form;
    var errors;

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
    done(form);
}

module.exports = {
    control: function(params, options, callback) {
        var promise;

        if (options instanceof Function) {
            callback = options;
            options = {};
        }
        _.defaults(options, {
            analytics: true,
            seo: true,
            cache: true,
            isForm: false
        });

        promise = asynquence().or(fail.bind(this))
            .then(prepare.bind(this));
        if (options.analytics) {
            promise.then(processAnalytics.bind(this));
        }
        if (options.seo) {
            promise.then(processSeo.bind(this));
        }
        if (options.cache) {
            promise.then(processHeaders.bind(this));
        }
        if (options.isForm) {
            promise.then(processForm.bind(this, params));
        }
        promise.val(callback.bind(this));

        function fail(err) {
            this.app.session.persist({
                error: err
            });
            return common.redirect.call(this, '/500');
        }
    },
    changeHeaders: changeHeaders
};
