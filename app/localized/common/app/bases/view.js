'use strict';

var Base = require('rendr/shared/base/view');
var _ = require('underscore');
var localization = require('../../../../config').get('localization', {});
var helpers = require('../../../../helpers');
var translations = require('../../../../translations');
var requireAMD = require;

var View = module.exports = Base.extend({
    /*constructor: function(options) {
        var found = false;
        var prefix;
        var platform;
        var location;
        var Localized;
        var obj;

        this.options = _.extend(this.options || {}, options || {});
        this.parseOptions(options);
        this.name = this.name || this.app.modelUtils.underscorize(this.constructor.id || this.constructor.name);
        prefix = this.app.session.get('isServer') ? '../../../' : 'app/localized/';
        platform = this.app.session.get('platform');
        location = this.app.session.get('location').url;
        if (localization[platform] && _.contains(localization[platform], location)) {
            try {
                Localized = require(prefix + location + '/app/views/' + platform + '/' + this.name);
                found = true;
                console.log(prefix + location + '/app/views/' + platform + '/' + this.name);
            }
            catch (error) {}
        }
        if (!found) {
            try {
                Localized = require(prefix + 'default/app/views/' + platform + '/' + this.name);
                found = true;
                console.log(prefix + 'default/app/views/' + platform + '/' + this.name);
            }
            catch (error) {}
        }
        if (!found) {
            Localized = require(prefix + 'common/app/bases/' + platform + '/view');
            console.log(prefix + 'common/app/bases/' + platform + '/view');
        }
        Localized.apply(this, arguments);
        Backbone.View.apply(this, arguments);
        if (this.postInitialize) {
          logger.log('`postInitialize` is deprecated, please use `initialize`');
          this.postInitialize();
        }
        if ((obj = this.options.model || this.options.collection) && this.renderOnRefresh) {
          obj.on('refresh', this.render, this);
        }
        this.render = this.render.bind(this);
        console.log(this.className);
    },*/
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
            sixpack: this.app.session.get('sixpack'),
            macros: template + '/partials/macros.html',
            currentRoute: this.app.session.get('currentRoute'),
            interstitial: this.app.session.get('interstitial')
        });
    },
    track: function(data, callback) {
        var that = this;
        var obj = {
            url: helpers.common.static('/images/common/gif1x1.gif')
        };
        var analytics = {};
        var $img = $('img.analytics');

        if ($img.length) {
            analytics = $img.last().attr('src');
            analytics = $.deparam(analytics.replace('/analytics/pageview.gif?', ''));
        }
        obj = _.defaults(obj, data, analytics);

        $.ajax({
            url: '/analytics/pageevent.gif',
            type: 'GET',
            global: false,
            cache: false,
            data: obj,
            always: (callback || $.noop)
        });
    },
    attachTrackMe: function(context, handler) {
        var that = this;

        $('.' + context + ' .trackMe').on('click', function(e) {
            var $this = $(this);
            var data = $this.data('tracking');
            var obj;
            var category;
            var action;

            if (data && !$this.hasClass('disabled')) {
                data = data.split('-');

                if (data.length === 2) {
                    category = data[0];
                    action = data[1];
                    obj = _.defaults((handler || $.noop).apply($this, data) || {}, {
                        category: category,
                        action: action
                    });
                    that.track(obj);
                }
            }
        });
    }
});

module.exports.getView = Base.getView = function(app, viewName, entryPath, callback) {
    var viewPath;

    if (!entryPath) {
        entryPath = '';
    }
    if (app) {
        var platform = app.session.get('platform');
        var location = app.session.get('location').url;
        console.log(entryPath + 'app/localized/' + location + '/app/views/' + platform + '/' + viewName);
    }
    viewPath = entryPath + 'app/localized/common/app/views/' + viewName;
    if (typeof callback === 'function') {
        if (typeof define !== 'undefined') {
            requireAMD([viewPath], callback);
        }
        else {
            callback(require(viewPath));
        }
    }
    else {
        return require(viewPath);
    }
};
