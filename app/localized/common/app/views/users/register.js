'use strict';

var Base = require('../../bases/view');
var _ = require('underscore');
var breadcrumb = require('../../../../../modules/breadcrumb');

module.exports = Base.extend({
    className: 'users_register_view',
    wapAttributes: {
        cellpadding: 0
    },
    getTemplateData: function() {
        var data = Base.prototype.getTemplateData.call(this);
        var params = this.options.params;

        return _.extend({}, data, {
            params: params,
            breadcrumb: breadcrumb.get.call(this, data),
            toPosting: this.options.toPosting
        });
    }
});

module.exports.id = 'users/register';
