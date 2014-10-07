'use strict';

var Base = require('../../../../../common/app/bases/view');
var config = require('../../../../../../../shared/config');
var helpers = require('../../../../../../helpers');
var _ = require('underscore');

module.exports = Base.extend({
    id: 'categories-show-view',
    className: 'categories-show-view',
    tagName: 'main',
    getTemplateData: function() {
        var data = Base.prototype.getTemplateData.call(this);
        _.each(data.items, this.processItem);

        return _.extend({}, data, {
            items: data.items
        });
    },
    postRender: function() {

    },
    processItem: function(item) {
        item.date.since = helpers.timeAgo(item.date);
    }
});

module.exports.id = 'categories/show';
