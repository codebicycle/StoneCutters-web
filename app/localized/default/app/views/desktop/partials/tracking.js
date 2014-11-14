'use strict';

var Base = require('../../../../../common/app/bases/view').requireView('partials/tracking');
var _ = require('underscore');

module.exports = Base.extend({
    tagName: 'section',
    id: 'partials-tracking-view',
    className: 'partials-tracking-view',
    events: {
        'update': 'onUpdate',
        'updateHtml': 'onUpdateHtml',
        'track': 'onTrack',
        'trackAti': 'onTrackAti',
        'trackAnalytics': 'onTrackAnalytics',
        'trackHydra': 'onTrackHydra'
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
            this.$el.trigger('trackAti', tracking);
            this.$el.trigger('trackAnalytics', tracking);
            this.$el.trigger('trackHydra', tracking);
        }
    },
    onTrackAti: function(event, tracking) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();

        if (!tracking.params.ati) {
            return;
        }

        window.atiapi = window.atiapi || [];
        window.atiapi.push({
            xtdmc: tracking.params.ati.host,
            xtnv: document,
            xtsd: [tracking.params.ati.protocol, '://', tracking.params.ati.logServer].join(''),
            xtsite: tracking.params.ati.siteId,
            xtcustom: JSON.parse(tracking.params.ati.custom),
            xtergo: '1'
        });
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

        window._gaq.push(function track() {
            var host = tracking.params.analytics.host;
            var tracker = window._gat._getTracker(tracking.params.analytics.id);
            var referrerDomain = 'emptyReferrer';
            var doStore = true;

            tracker._setDomainName(domain);
            tracker._setCookiePath('/');
            if (typeof document.referrer !== 'undefined' && document.referrer !== '') {
                referrerDomain = document.referrer.match(/:\/\/(.[^/]+)/)[1];

                if (referrerDomain.indexOf(host) !== -1) {
                    doStore = false;
                }
            }
            if (doStore) {
                tracker._setCustomVar(2, 'keep_referral', referrerDomain, 2);
            }
            tracker._set('title', tracking.params.analytics.keyword);
            tracker._trackPageview(tracking.params.analytics.page);
        });
    },
    onTrackHydra: function(event, tracking) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();

        if (!tracking.params.hydra) {
            return;
        }

        window.asyncApi = window.asyncApi || [];
        window.asyncApi.push({
            wait: function() {
                return typeof window.hydra !== 'undefined';
            },
            callback: function() {
                var params = JSON.parse(tracking.params.hydra.params);

                window.hydra.referer = tracking.params.hydra.referer || undefined;
                window.hydra.set('pageName', tracking.params.hydra.page);
                window.hydra.trackPageView(params);
            }
        });
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
