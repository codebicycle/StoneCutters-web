'use strict';

var Base = require('../../bases/view');
var _ = require('underscore');
var breadcrumb = require('../../../../../modules/breadcrumb');
var config = require('../../../../../../shared/config');

module.exports = Base.extend({
    className: 'post_form_view',
    wapAttributes: {
        cellpadding: 0
    },
    getTemplateData: function() {
        var data = Base.prototype.getTemplateData.call(this);
        var locationUrl = this.app.session.get('location').url;
        var isEmailReadOnly = config.getForMarket(locationUrl, ['posting', 'loginRequired'],false);

        return _.extend({}, data, {
            breadcrumb: breadcrumb.get.call(this, data),
            isEmailReadOnly: isEmailReadOnly.toString()
        });
    }
});

module.exports.id = 'post/form';
