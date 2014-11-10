'use strict';

var Base = require('../../../../../common/app/bases/view');
var _ = require('underscore');

module.exports = Base.extend({
    className: 'items_items_view',
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
        //console.log(data);
        console.log(data.parentView);
        return _.extend({}, data, {
            items: this.items
        });
    }
});

module.exports.id = 'items/items';
