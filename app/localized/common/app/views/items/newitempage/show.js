'use strict';

var Base = require('../../../bases/view');
var _ = require('underscore');
var helpers = require('../../../../../../helpers');
var utils = require('../../../../../../../shared/utils');
var breadcrumb = require('../../../../../../modules/breadcrumb');

module.exports = Base.extend({
    className: 'items_show_view_default',
    wapAttributes: {
        cellpadding: 0
    }
});

module.exports.id = 'items/newitempage/show';
