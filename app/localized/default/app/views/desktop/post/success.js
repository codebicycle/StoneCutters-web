'use strict';

var _ = require('underscore');
var Base = require('../../../../../common/app/bases/view').requireView('post/success');
var Notifications = require('../../../../../../modules/notifications');
var config = require('../../../../../../../shared/config');
var Metric = require('../../../../../../modules/metric');

module.exports = Base.extend({
    className: 'posting-success-view',
    id: 'posting-success-view',
    tagName: 'main',
    events: {
        'click [data-increment-metric]': Metric.incrementEventHandler,
        'click [data-action=showKeep]': 'showKeep'
    },
    getTemplateData: function() {
        var data = Base.prototype.getTemplateData.call(this);
        var platform = this.app.session.get('platform');
        var location = this.app.session.get('location');
        var accepExchange = config.getForMarket(location.url, ['accepExchange', platform]);

        if(accepExchange.enabled && !_.contains(accepExchange.categories, data.item.category.id)) {
            accepExchange.enabled = false;
        }

        data.item.location.stateName = data.item.location.children[0].name;
        data.item.location.cityName = data.item.location.children[0].children[0].name;
        if (data.item.location.children[0].children[0].children[0]) {
            data.item.location.neighborhoodName = data.item.location.children[0].children[0].children[0].name;
        }
        return _.extend({}, data, {
            accepExchange: accepExchange
        });
    },
    postRender: function () {
        if (!this.notifications) {
            this.notifications = new Notifications({}, this);
        }
        if (this.notifications.isEnabled() && this.notifications.checkNotifications()) {
            this.notifications.checkPermission(function callback(status) {
                if (status === 'default') {
                    this.notifications.requestPermission();
                }
            }.bind(this));
        }

        if(this.$('#accep-exchange').length) {
            var category = this.$('#accep-exchange').data('id');

            if (!this.metric) {
                this.metric = new Metric({}, this);
            }
            this.metric.increment(['conversations', 'exchange', [category, 'show']]);
        }
    },
    showKeep: function (event) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();

        this.$('#accep-exchange').addClass('hide');
        this.$('#notification-keep-posting').removeClass('hide');
    }
});
