'use strict';

var BaseView = require('../base');
var _ = require('underscore');

module.exports = BaseView.extend({
    className: 'user_registration_view',
    getTemplateData: function() {
        var data = BaseView.prototype.getTemplateData.call(this);
        var params = this.options.params;

        if (params.err && typeof params.err === 'string') {
            params.err = params.err.split(',');
        }
        if (params.errFields && typeof params.errFields === 'string') {
            params.errFields = params.errFields.split(',');
        }

        return _.extend({}, data, {
            location: this.app.getSession('siteLocation'),
            user: this.app.getSession('user'),
            params: params.err
        });
    }
});

module.exports.id = 'user/registration';
