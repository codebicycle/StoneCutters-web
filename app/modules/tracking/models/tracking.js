'use strict';

var _ = require('underscore');
var asynquence = require('asynquence');
var Backbone = require('backbone');
var config = require('../../../../shared/config');
var utils = require('../../../../shared/utils');
var trackers = require('../trackers');
var Base;
var Tracking;

Backbone.noConflict();
Base = Backbone.Model;

function defaults() {
    return {
        page: '',
        data: {},
        length: 0
    };
}

function initialize(attrs, options) {
    var user = options.app.session.get('user');

    this.app = options.app;
    this.set('rendering', this.app.session.get('platform'));
    if (user) {
        this.set('user', user);
    }
}

function getPageName(page) {
    if (~page.indexOf('#')) {
        return page;
    }
    var name = [];
    var currentRoute = this.app.session.get('currentRoute');

    name.push(currentRoute.controller);
    name.push('#');
    name.push(currentRoute.action);
    if (page) {
        name.push('#');
        name.push(page);
    }
    return name.join('');
}

function generate(done) {
    var tracking = {
        urls: [],
        params: {}
    };
    var promise;
    var data;
    var page;

    if (!this.isEnabled()) {
        return always();
    }
    data = this.get('data') || {};
    page = getPageName.call(this, this.get('page') || '');
    promise = asynquence().or(fail.bind(this));

    onGenerateStart.call(this);
    _.each(trackers, function eachTrackers(tracker, name) {
        promise.then(function track(next) {
            tracker.call(this, next, tracking, {
                page: page,
                query: data
            });
        }.bind(this));
    }, this);
    promise.val(always);

    function fail(e) {
        console.log('[OLX_DEBUG]', 'Module tracking not found', e instanceof Error ? JSON.stringify(e.stack) : e);
        always();
    }

    function always() {
        done(tracking);
    }
}

function setPage(page) {
    Base.prototype.set.call(this, {
        page: page
    }, {
        unset: false
    });
}

function set(key, value, options) {
    if (_.isObject(key)) {
        return Base.prototype.set.apply(this, arguments);
    }
    var data = this.get('data') || {};

    data[key] = value;
    Base.prototype.set.call(this, {
        data: data,
        length: _.size(data)
    }, {
        unset: false
    });
}

function isEnabled() {
    return config.getForMarket(this.app.session.get('location').url, ['tracking', 'enabled'], true);
}

function onGenerateStart() {
    this.app.session.persist({
        hitCount: Number(this.app.session.get('hitCount') || 0) + 1
    }, {
        maxAge: 30 * utils.MINUTE
    });
}

Tracking = Base.extend({
    defaults: defaults,
    initialize: initialize,
    generate: generate,
    setPage: setPage,
    set: set,
    isEnabled: isEnabled
});

module.exports = Tracking;
