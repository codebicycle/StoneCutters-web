'use strict';

var Base = require('../../../../../common/app/bases/view');
var _ = require('underscore');

module.exports = Base.extend({
    className: 'item-listing items_items_view',
    tagName: 'ul',
    wapAttributes: {
        cellpadding: 0
    },
    getProperty: function(options, name) {
        return options.context[name] || options.context.ctx[name];
    },
    initialize: function(options) {
        if (options.context) {
            this.items = this.getProperty(options, 'items');
        }
    },
    getTemplateData: function() {
        var data = Base.prototype.getTemplateData.call(this);

        return _.extend({}, data, {
            items: this.items
        });
    }
});

module.exports.id = 'items/items';
