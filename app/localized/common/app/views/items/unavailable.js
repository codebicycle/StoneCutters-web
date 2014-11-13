'use strict';

var Base = require('../../bases/view');
var _ = require('underscore');
var breadcrumb = require('../../../../../modules/breadcrumb');

module.exports = Base.extend({
    className: 'items_unavailable_view',
    wapAttributes: {
        cellpadding: 0
    },
    getTemplateData: function() {
        var data = Base.prototype.getTemplateData.call(this);
        data.category_name = this.options.category_name;

        return _.extend({}, data, {
            breadcrumb: breadcrumb.get.call(this, data)
        });
    },
    postRender: function() {
        
    }

});

module.exports.id = 'items/unavailable';
