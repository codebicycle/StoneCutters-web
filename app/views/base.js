'use strict';

var RendrView = require('rendr/shared/base/view');
var _ = require('underscore');
var helpers = require('../helpers');
var translations = require('../translations');
var utils = require('../../shared/utils');

module.exports = RendrView.extend({
    initialize: function() {
        if (this.tagName === 'div' && this.app.session.get('platform') === 'wap') {
            this.tagName = 'table';
            this.attributes = this.getWapAttributes();
        }
    },
    getTemplate: function() {
        var template = this.app.session.get('template');

        return this.app.templateAdapter.getTemplate(template + '/' + this.name);
    },
    getTemplateData: function() {
        var data = RendrView.prototype.getTemplateData.call(this);
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
    getWapAttributes: function() {
        return _.extend(this.attributes || {}, {
            width: '100%',
            cellspacing: 0,
            cellpadding: 4,
            border: 0
        }, this.wapAttributes || {});
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
