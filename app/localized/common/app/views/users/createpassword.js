'use strict';

var _ = require('underscore');
var Base = require('../../bases/view');
var breadcrumb = require('../../../../../modules/breadcrumb');

module.exports = Base.extend({
    className: 'users_createpassword_view',
    wapAttributes: {
        cellpadding: 0
    },
    getTemplateData: function() {
        var data = Base.prototype.getTemplateData.call(this);
        var params = this.options.params;

        return _.extend({}, data, {
            params: params,
            breadcrumb: breadcrumb.get.call(this, data)
        });
    }
});

module.exports.id = 'users/createpassword';