'use strict';

var BaseView = require('../base');
var _ = require('underscore');
var helpers = require('../../helpers');

module.exports = BaseView.extend({
    className: 'pages_terms_view',
    wapAttributes: {
        cellpadding: 0
    },
    getTemplateData: function() {
        var data = BaseView.prototype.getTemplateData.call(this);

        return _.extend({}, data, {
            breadcrumb: helpers.breadcrumb.get.call(this, data)
        });
    }
});

module.exports.id = 'pages/terms';
