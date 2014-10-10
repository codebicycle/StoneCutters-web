'use strict';

var Base = require('rendr/shared/base/view');
var _ = require('underscore');
var async = require('async');
var localization = require('../../../../../shared/config').get('localization', {});
var helpers = require('../../../../helpers');
var translations = require('../../../../../shared/translations');

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
    getTemplate: function() {
        var template = this.app.session.get('template');

        return this.app.templateAdapter.getTemplate(template + '/' + this.name);
    },
    getTemplateData: function() {
        var data = Base.prototype.getTemplateData.call(this);
        var template = this.app.session.get('template');

        return _.extend({}, data, {
            device: this.app.session.get('device'),
            platform: this.app.session.get('platform'),
            template: template,
            siteLocation: this.app.session.get('siteLocation'),
            location: this.app.session.get('location'),
            dictionary: translations[this.app.session.get('selectedLanguage') || 'en-US'] || translations['es-ES'],
            referer: this.app.session.get('referer'),
            url: this.app.session.get('url'),
            href: this.app.session.get('href'),
            macros: template + '/partials/macros.html',
            currentRoute: this.app.session.get('currentRoute'),
            interstitial: this.app.session.get('interstitial'),
            os: {
                name: this.app.session.get('osName').replace(/\s*/g, ''),
                version: this.app.session.get('osVersion')
            }
        });
    },
    track: function(data, callback, options) {
        var obj = {
            url: helpers.common.static('/images/common/gif1x1.gif')
        };
        var tracking = {};
        var $img = $('img.analytics');

        if (callback && !_.isFunction(callback)) {
            options = callback;
            callback = $.noop;
        }
        if ($img.length) {
            tracking = $img.last().attr('src');
            tracking = $.deparam(tracking.replace(/\/analytics\/(pageview|graphite)\.gif\?/, ''));
        }
        obj = _.defaults(obj, data, tracking);
        options = _.defaults((options || {}), {
            url: '/analytics/pageevent.gif',
            type: 'GET',
            global: false,
            cache: false,
            data: obj,
            always: (callback || $.noop)
        });
        $.ajax(options);
    },
    attachTrackMe: function(context, handler) {
        this.$('.trackMe').on('click', function(e) {
            var $this = $(e.currentTarget);
            var data = $this.data('tracking');
            var obj;
            var category;
            var action;

            if (data && !$this.hasClass('disabled') && !$this.hasClass('opaque')) {
                data = data.split('-');

                if (data.length === 2) {
                    category = data[0];
                    action = data[1];
                    obj = _.defaults((handler || $.noop).apply($this, data) || {}, {
                        category: category,
                        action: action
                    });
                    this.track(obj);
                }
            }
        }.bind(this));
    }
});

module.exports.attach = Base.attach = function(app, parentView, callback) {
    var scope = parentView ? parentView.$el : null;
    var list = $('[data-view]', scope).toArray();

    async.map(list, function each(el, cb) {
        var $el;
        var options;
        var viewName;
        var fetchSummary;

        $el = $(el);
        if (!$el.data('view-attached')) {
            options = Base.getViewOptions($el);
            options.app = app;
            viewName = options.view;
            fetchSummary = options.fetch_summary || {};
            app.fetcher.hydrate(fetchSummary, {
                app: app
            }, function done(err, results) {
                options = _.extend(options, results);
                Base.getView(app, viewName, app.options.entryPath, function after(ViewClass) {
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
    var View;

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
