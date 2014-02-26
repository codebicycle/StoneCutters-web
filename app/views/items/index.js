'use strict';

var BaseView = require('../base');
var _ = require('underscore');
var timeAgo = require('../../helpers/time_ago_helper');

module.exports = BaseView.extend({
    className: 'items_index_view',
    processItem: function(item) {
        var dateAg = timeAgo.timeAgo(new Date(item.date.year, item.date.month - 1, item.date.day, item.date.hour, item.date.minute, item.date.second));
        item.date.since = dateAg;
    },
    getTemplateData: function() {
        var data = BaseView.prototype.getTemplateData.call(this);
        _.each(data.items, this.processItem);
        return _.extend({}, data, {
            count: this.app.get('session').count
        });
    }
});

module.exports.id = 'items/index';
