'use strict';

var Base = require('../../bases/view');
var _ = require('underscore');

module.exports = Base.extend({
    className: 'items_delete_view',
    wapAttributes: {
        cellpadding: 0
    },
    getTemplateData: function() {
        var data = Base.prototype.getTemplateData.call(this);

        return data;
    },
});

module.exports.id = 'items/delete';
