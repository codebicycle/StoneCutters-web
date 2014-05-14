'use strict';

var BaseView = require('../base');
var _ = require('underscore');

module.exports = BaseView.extend({
    className: 'post_subcat_view',
    wapAttributes: {
        cellpadding: 0,
        bgcolor: '#DDDDDD'
    }
});

module.exports.id = 'post/subcat';
