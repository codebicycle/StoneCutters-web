'use strict';

var BaseView = require('../base');
var _ = require('underscore');

module.exports = BaseView.extend({
    className: 'pages_error_view',
    wapAttributes: {
        cellpadding: 0
    }
});

module.exports.id = 'pages/error';
