'use strict';

var Base = require('../../bases/view');
var _ = require('underscore');
var helpers = require('../../../../../helpers');

module.exports = Base.extend({
    className: 'users_register_view',
    wapAttributes: {
        cellpadding: 0
    },
    getTemplateData: function() {
        var data = Base.prototype.getTemplateData.call(this);
        var params = this.options.params;

        /*if (params.err && typeof params.err === 'string') {
            params.err = params.err.split(',');
        }
        if (params.errFields && typeof params.errFields === 'string') {
            params.errFields = params.errFields.split(',');
        }*/

        return _.extend({}, data, {
            location: this.app.session.get('siteLocation'),
            user: this.app.session.get('user'),
            params: params,
            breadcrumb: helpers.breadcrumb.get.call(this, data)
        });
    }
});

module.exports.id = 'users/register';
