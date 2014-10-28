'use strict';

var Base = require('../../bases/view');
var _ = require('underscore');
var helpers = require('../../../../../helpers');

module.exports = Base.extend({
    className: 'categories_list_view',
    wapAttributes: {
        cellpadding: 0
    },
    getTemplateData: function() {
        var data = Base.prototype.getTemplateData.call(this);

        return _.extend({}, data, {
            location: this.app.session.get('location'),
            breadcrumb: helpers.breadcrumb.get.call(this, data)
        });
    }
});

module.exports.id = 'categories/list';
