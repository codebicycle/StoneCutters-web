'use strict';

var Base = require('../../bases/view');
var _ = require('underscore');
var breadcrumb = require('../../../../../modules/breadcrumb');
var config = require('../../../../../../shared/config');

module.exports = Base.extend({
    className: 'users_register_view',
    wapAttributes: {
        cellpadding: 0
    },
    getTemplateData: function() {
        var data = Base.prototype.getTemplateData.call(this);
        var params = this.options.params;
        var location = this.app.session.get('location');
        var platform = this.app.session.get('platform');
        var registerWithConfirmation = config.getForMarket(location.url, ['registerWithConfirmation', platform, 'enabled'], false);

        return _.extend({}, data, {
            params: params,
            breadcrumb: breadcrumb.get.call(this, data),
            toPosting: this.options.toPosting,
            registerWithConfirmation: registerWithConfirmation
        });
    }
});

module.exports.id = 'users/register';
