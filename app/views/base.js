'use strict';

var RendrView = require('rendr/shared/base/view');
var _ = require('underscore');
var helpers = require('../helpers');
var translations = require('../translations');

module.exports = RendrView.extend({
    initialize: function() {
        if (this.tagName === 'div' && this.app.get('session').platform === 'wap') {
            this.tagName = 'table';
            this.attributes = this.getWapAttributes();
        }
    },
    getTemplate: function() {
        var template = this.app.getSession('template');

        return this.app.templateAdapter.getTemplate(template + '/' + this.name);
    },
    getTemplateData: function() {
        var data = RendrView.prototype.getTemplateData.call(this);
        var template = this.app.getSession('template');

        return _.extend({}, data, {
            device: this.app.getSession('device'),
            platform: this.app.getSession('platform'),
            template: template,
            siteLocation: this.app.getSession('siteLocation'),
            location: this.app.getSession('location'),
            dictionary: translations[this.app.getSession('selectedLanguage') || 'en-US'] || translations['es-ES'],
            referer: this.app.getSession('referer'),
            breadcrumb: helpers.breadcrumb.get.call(this, data),
            url: this.app.getSession('url'),
            sixpack: this.app.getSession('sixpack'),
            macros: 'compiled/' + template + '/partials/macros.html',
            currentRoute: this.app.getSession('currentRoute')
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
            analytics = $.deparam(analytics.replace('/pageview.gif?', ''));
        }
        obj = _.defaults(obj, data, analytics);

        $.ajax({
            url: '/pageevent.gif',
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
