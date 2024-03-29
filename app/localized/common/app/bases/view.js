'use strict';

var _ = require('underscore');
var async = require('async');
var Base = require('rendr/shared/base/view');
var config = require('../../../../../shared/config');
var localization = config.get('localization', {});
var translations = require('../../../../../shared/translations');
var utils = require('../../../../../shared/utils');
var helpers = require('../../../../helpers');

module.exports = Base.extend({
    initialize: function() {
        if (this.app.session.get('platform') === 'wap') {
            if (this.tagName === 'div') {
                this.tagName = 'table';
            }
            if (this.tagName === 'table') {
                this.attributes = this.getWapAttributes();
            }
        }
    },
    getWapAttributes: function() {
        return _.extend(this.attributes || {}, {
            width: '100%',
            cellspacing: 0,
            cellpadding: 4,
            border: 0
        }, this.wapAttributes || {});
    },
    getAttributes: function() {
        var attributes = Base.prototype.getAttributes.call(this, arguments);
        var data;

        if (this.options && this.options.include) {
            data = _.pick.apply(_, [this.options || {}].concat(this.options.include));
            _.each(data, function eachDataController(value, key) {
                attributes['data-' + key] = JSON.stringify(value);
            });
        }
        return attributes;
    },
    getTemplate: function() {
        var template = this.app.session.get('template');

        return this.app.templateAdapter.getTemplate(template + '/' + this.name);
    },
    getTemplateData: function() {
        var data = Base.prototype.getTemplateData.call(this) || {};
        var template = this.app.session.get('template');
        var user = this.app.session.get('user');
        var context = data.context ? data.context.ctx || {} : {};
        var location = this.app.session.get('location');

        return _.extend(context, data, {
            user: user,
            device: this.app.session.get('device'),
            platform: this.app.session.get('platform'),
            template: template,
            siteLocation: this.app.session.get('siteLocation'),
            location: location,
            dictionary: translations.get(this.app.session.get('selectedLanguage')),
            referer: this.app.session.get('referer'),
            url: this.app.session.get('url'),
            path: this.app.session.get('path'),
            href: this.app.session.get('href'),
            macros: template + '/partials/macros.html',
            currentRoute: this.app.session.get('currentRoute'),
            interstitial: this.app.session.get('interstitial'),
            os: {
                name: this.app.session.get('osName').replace(/\s*/g, ''),
                version: this.app.session.get('osVersion')
            },
            host: this.app.session.get('host'),
            shortHost: this.app.session.get('shortHost'),
            domain: this.app.session.get('domain'),
            fullDomain: this.app.session.get('fullDomain'),
            layoutOptions: config.getForMarket(location.url, ['layoutOptions'], {})
        });
    },
    track: function(data, callback, options) {
        $('#partials-tracking-view').trigger('fireTrackEvent', [data, options]);
    },
    attachTrackMe: function(handler, ctx) {
        (ctx ? $('.trackMe', ctx) : this.$('.trackMe')).on('click', function(e) {
            $('#partials-tracking-view').trigger('trackEvent', [e.currentTarget, handler || function(category, action) {
                return {
                   custom: [category, '-', '-', action].join('::')
                };
            }.bind(this)]);
        }.bind(this));
    },
    onActionStart: utils.noop,
    onActionEnd: utils.noop
});

module.exports.attach = Base.attach = function(app, parentView, callback) {
    var scope = parentView ? parentView.$el : null;
    var list = $('[data-view]', scope).toArray();

    async.map(list, function each(el, cb) {
        var $el = $(el);

        if (!$el.data('view-attached')) {
            app.fetchDependencies(['categories', 'topCities', 'states', 'countries'], function done(err, dependencies) {
                var options = _.extend(Base.getViewOptions($el), dependencies.toJSON(), {
                    app: app
                });

                Base.getView(app, options.view, app.options.entryPath, function after(ViewClass) {
                    var view = new ViewClass(options);

                    view.attach($el, parentView);
                    cb(null, view);
                });
            });
        }
        else {
            cb(null, null);
        }
    }, function done(err, views) {
        callback(_.compact(views));
    });
};

module.exports.getView = Base.getView = function(app, viewName, entryPath, callback) {
    var platform = app.session.get('platform');
    var location = app.session.get('location').url;
    var View = Base.requireView(viewName, location, platform, entryPath);

    if (typeof callback !== 'function') {
        return View;
    }
    callback(View);
};

module.exports.requireView = Base.requireView = function(viewName, location, platform, entryPath) {
    if (!entryPath) {
        entryPath = process.cwd();
        if (entryPath.length === 1) {
            entryPath = '';
        }
        else {
            entryPath += '/';
        }
    }
    entryPath += 'app/localized/';
    if (localization[platform] && _.contains(localization[platform], location)) {
        try {
            return require(entryPath + location + '/app/views/' + platform + '/' + viewName);
        }
        catch (error) {
            location = 'default';
        }
    }
    else {
        location = 'default';
    }
    if (location === 'default') {
        try {
            return require(entryPath + 'default/app/views/' + platform + '/' + viewName);
        }
        catch (error) {}
    }
    return require(entryPath + 'common/app/views/' + viewName);
};
