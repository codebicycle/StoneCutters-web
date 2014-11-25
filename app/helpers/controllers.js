'use strict';

var _ = require('underscore');
var asynquence = require('asynquence');
var common = require('./common');
var esi = require('../modules/esi');
var tracking = require('../modules/tracking');
var config = require('../../shared/config');
var utils = require('../../shared/utils');
var isServer = typeof window === 'undefined';
var cacheDefault = config.get(['cache', 'headers', 'default']);

function prepare(params, done) {
    if (!isServer) {
        this.app.session.update({
            referer: this.app.session.get('referer')
        });
    }
    this.app.session.clear('page');
    this.app.session.clear('postingLink');
    this.app.session.update({
        currentRoute: this.currentRoute,
        params: params
    });
    if (params && params.filters && !utils.startsWith(params.filters, '-')) {
        params.filters = '-' + params.filters;
    }
    done();
}

function processTracking(done) {
    tracking.reset();
    done();
}

function processSeo(done) {
    this.app.seo.reset(this.app);
    done();
}

function changeHeaders(headers, currentRoute) {
    var header;

    if (!isServer) {
        return;
    }
    headers = headers || {};
    setCache.call(this, headers, currentRoute);
    setEsi.call(this, headers);
    for (header in headers) {
        this.app.req.res.setHeader(header, headers[header]);
    }
}

function setCache(headers, currentRoute) {
    if (!config.get(['cache', 'enabled'], false) || !esi.isEnabled.call(this)) {
        return;
    }
    currentRoute = currentRoute || this.app.session.get('currentRoute');
    headers = _.extend(headers, config.get(['cache', 'headers', currentRoute.controller, currentRoute.action], cacheDefault || {}));
}

function setEsi(headers) {
    if (!config.get(['cache', 'enabled'], false) || !esi.isEnabled.call(this)) {
        return;
    }
    if (headers['Edge-Control']) {
        headers['Edge-Control'] += ',dca=esi';
    }
    else {
        headers['Edge-Control'] = 'dca=esi';
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
    this.form = form;
    done();
}

module.exports = {
    control: function(params, options, controller) {
        var promise;

        if (_.isFunction(options)) {
            controller = options;
            options = {};
        }
        _.defaults(options, {
            seo: true,
            cache: true,
            isForm: false
        });

        promise = asynquence().or(fail.bind(this))
            .then(prepare.bind(this, params))
            .then(processTracking.bind(this));
        if (options.seo) {
            promise.then(processSeo.bind(this));
        }
        if (options.cache) {
            promise.val(changeHeaders.bind(this));
        }
        if (options.isForm) {
            promise.then(processForm.bind(this, params));
        }
        promise.val(controller.bind(this));

        function fail(err) {
            this.app.session.persist({
                error: err
            });
            return common.redirect.call(this, '/500');
        }
    },
    changeHeaders: changeHeaders
};
