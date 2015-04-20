'use strict';

var _ = require('underscore');
var Base = require('../../bases/view');
var breadcrumb = require('../../../../../modules/breadcrumb');
var User = require('../../../../../models/user');

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
    },
    getProfile: function(profile) {
        this.profile = this.profile || (this.options.profile && this.options.profile.toJSON ? this.options.profile : new User(profile || this.options.profile || {}, {
            app: this.app
        }));
        return this.profile;
    }
});

module.exports.id = 'users/createpassword';