'use strict';

var BaseView = require('../base');
var _ = require('underscore');

module.exports = BaseView.extend({
    className: 'pages_help_view',
    getTemplateData: function() {
        var data = BaseView.prototype.getTemplateData.call(this);

        return _.extend({}, data, {});
    }
});

module.exports.id = 'pages/help';