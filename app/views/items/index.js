'use strict';

var BaseView = require('../base');
var _ = require('underscore');
var helpers = require('../../helpers');

module.exports = BaseView.extend({
    className: 'items_index_view',
    processItem: function(item) {
        var year = item.date.year;
        var month = item.date.month - 1;
        var day = item.date.day;
        var hour = item.date.hour;
        var minute = item.date.minute;
        var second = item.date.second;
        var date = new Date(year, month, day, hour, minute, second);

        item.date.since = helpers.timeAgo(date);
    },
    getTemplateData: function() {
        var data = BaseView.prototype.getTemplateData.call(this);

        _.each(data.items, this.processItem);
        return _.extend({}, data);
    }
});

module.exports.id = 'items/index';
