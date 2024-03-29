'use strict';

var _ = require('underscore');
var Base = require('../../../../../common/app/bases/view').requireView('partials/tracking');
var helpers = require('../../../../../../helpers');
var Tracking = require('../../../../../../modules/tracking');

module.exports = Base.extend({
    id: 'partials-tracking-view',
    className: 'partials-tracking-view',
    events: {
        'update': 'onUpdate',
        'updateHtml': 'onUpdateHtml',
        'track': 'onTrack',
        'trackAnalytics': 'onTrackAnalytics',
        'trackEvent': 'onTrackEvent',
        'fireTrackEvent': 'onFireTrackEvent'
    },
    getTemplateData: function() {
        var data = Base.prototype.getTemplateData.call(this);

        return _.extend({}, data);
    },
    postRender: function() {
        var params = $('#tracking-data').html();

        if (params && _.isString(params)) {
            params = JSON.parse(params);
        }
        this.$el.trigger('track', {
            params: params
        });
    },
    onUpdate: function(event, tracking) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();

        this.tracking = tracking;
        this.render();
    },
    onUpdateHtml: function(event, html) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();

        this.$el.html(html);
        this.postRender();
    },
    onTrack: function(event, tracking) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();

        if (tracking && tracking.params) {
            if (Tracking.analytics.isClientEnabled.call(this)) {
                this.$el.trigger('trackAnalytics', tracking);
            }
        }
    },
    onTrackAnalytics: function(event, tracking) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();

        if (!tracking.params.analytics) {
            return;
        }

        this._checkAnalyticsLib();

        window._gaq.push(function track() {
            var tracker = this._getAnalyticsTracker('UA-5247560-17', tracking.params.analytics);
            var osName = tracking.params.analytics.osName;
            var osVersion = tracking.params.analytics.osVersion;
            var location = tracking.params.analytics.location;

            osName = (osName !== 'Others' ? osName.toLowerCase() : 'unknown');
            tracker._setCustomVar(1, 'olx_visitor_country', ['html5_', osName, '_', osVersion, '_', location].join(''), 1);
            tracker._trackPageview(tracking.params.analytics.page);
        }.bind(this));
    },
    onTrackEvent: function(event, element, handler) {
        var $element = $(element);
        var data = $element.data('tracking');
        var category;
        var action;

        if (!data || $element.hasClass('disabled') || $element.hasClass('opaque')) {
            return;
        }
        data = data.split('-');
        if (data.length) {
            handler = handler || $.noop;
            category = data[0];
            action = data[1];
            data = handler.apply($element, data) || {};
            this._fireTrack(_.defaults(data, {
                category: category,
                action: action
            }));
        }
    },
    onFireTrackEvent: function(event, data, options) {
        this._fireTrack(data, options);
    },
    _fireTrack: function(data, callback, options) {
        var location = this.app.session.get('location');

        if (callback && !_.isFunction(callback)) {
            options = callback;
            callback = $.noop;
        }
        options = _.defaults((options || {}), {
            url: '/tracking/event.gif',
            type: 'GET',
            global: false,
            cache: false,
            data: _.defaults(data, {
                locUrl: location.url,
                locIso: location.abbreviation,
                url: helpers.common.static.call(this, '/images/common/gif1x1.gif')
            }),
            always: (callback || $.noop)
        });
        $.ajax(options);
    },
    _checkAnalyticsLib: function() {
        var id = 'ga-lib';
        var $ga;

        window._gaq = window._gaq || [];
/*        if (!$('#' + id).length) {
            $ga = $('<script></script>');
            $ga.attr({
                type: 'text/javascript', 
                src: ('https:' == document.location.protocol ? 'https://ssl' : 'http://www') + '.google-analytics.com/ga.js',
                id: id,
                async: true
            });
            $('head').append($ga);
        }
*/
    },
    _getAnalyticsTracker: function(id, options) {
        if (!window.analyticsTracker) {
            window.analyticsTracker = window._gat._getTracker(id);
            window.analyticsTracker._setDomainName(options.domain);
            window.analyticsTracker._setCookiePath('/');
        }
        return window.analyticsTracker;
    }
});
