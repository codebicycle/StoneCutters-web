'use strict';

var Base = require('../../bases/view');
var _ = require('underscore');
var breadcrumb = require('../../../../../modules/breadcrumb');

module.exports = Base.extend({
    className: 'pages_error_view',
    wapAttributes: {
        cellpadding: 0
    },
    getTemplateData: function() {
        var data = Base.prototype.getTemplateData.call(this);

        this.app.session.clear('errorDirection');
        return _.extend({}, data, {
            breadcrumb: breadcrumb.get.call(this, data)
        });
    }
});

module.exports.id = 'pages/error';
