'use strict';

var Base = require('../../bases/view');
var _ = require('underscore');
var querystring = require('querystring');
var asynquence = require('asynquence');
var helpers = require('../../../../../helpers');
var tracking = require('../../../../../modules/tracking');
var Seo = require('../../../../../modules/seo');

module.exports = Base.extend({
    className: 'items_staticsearch_view',
    wapAttributes: {
        cellpadding: 0
    },
    getTemplateData: function() {
        var data = Base.prototype.getTemplateData.call(this);

        _.each(data.items, this.processItem);
        return _.extend({}, data, {
            breadcrumb: helpers.breadcrumb.get.call(this, data)
        });
    },
    processItem: function(item) {
        item.date.since = helpers.timeAgo(item.date);
    }
});

module.exports.id = 'items/staticsearch';
