'use strict';

var Base = require('../../../../../common/app/bases/view').requireView('partials/tracking');
var _ = require('underscore');

module.exports = Base.extend({
    id: 'partials-tracking-view',
    className: 'partials-tracking-view',
    events: {
        'update': 'onUpdate',
        'track': 'onTrack',
        'trackAnalytics': 'onTrackAnalytics'
    },

    getTemplateData: function() {
        var data = Base.prototype.getTemplateData.call(this);

        return _.extend({}, data);
    },
    postRender: function() {
        var params = this.$('#tracking-data').data('params');

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
    onTrack: function(event, tracking) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();

        if (tracking) {
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

        var _gaq = window._gaq || [];
        
        _gaq.push(function track() {
            var tracker = window._gat._getTracker('UA-5247560-17');
            var osName = tracking.params.analytics.osName;
            var osVersion = tracking.params.analytics.osVersion;
            var location = tracking.params.analytics.location;

            osName = (osName !== 'Others' ? osName.toLowerCase() : 'unknown');
            tracker._setCustomVar(1, 'olx_visitor_country', ['html5_', osName, '_', osVersion, '_', location].join(''), 1);
            tracker._trackPageview(tracking.params.analytics.page);
        });
    }
});

module.exports.id = 'partials/tracking';