'use strict';

var Base = require('../../../../../common/app/bases/view').requireView('partials/tracking');
var _ = require('underscore');
var helpers = require('../../../../../../helpers');

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
        var params = $('#tracking-data').data('params');

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
            this.$el.trigger('trackAnalytics', tracking);
        }
    },
    onTrackAnalytics: function(event, tracking) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();

        if (!tracking.params.analytics) {
            return;
        }

        var host = this.app.session.get('shortHost').split('.');
        var hasM = !!~host.indexOf('m');
        var slice = 1;
        var domain;

        if (hasM) {
            slice++;
        }
        domain = host.slice(slice).join('.');

        this._checkAnalyticsLib();

        window._gaq = window._gaq || [];
        window._gaq.push(function track() {
            var tracker = window._gat._getTracker('UA-5247560-17');
            var osName = tracking.params.analytics.osName;
            var osVersion = tracking.params.analytics.osVersion;
            var location = tracking.params.analytics.location;

            tracker._setDomainName(domain);
            tracker._setCookiePath('/');
            osName = (osName !== 'Others' ? osName.toLowerCase() : 'unknown');
            tracker._setCustomVar(1, 'olx_visitor_country', ['html5_', osName, '_', osVersion, '_', location].join(''), 1);
            tracker._trackPageview(tracking.params.analytics.page);
        });
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
        if (data.length === 2) {
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
                locUrl: this.app.session.get('location').url,
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
        if (!$('#' + id).length) {
            $ga = $('<script></script>');
            $ga.attr({
                type: 'text/javascript', 
                src: ('https:' == document.location.protocol ? 'https://ssl' : 'http://www') + '.google-analytics.com/ga.js',
                id: id,
                async: true
            });
            $('head').append($ga);
        }
    }
});
