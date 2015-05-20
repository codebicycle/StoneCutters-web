'use strict';

var Base = require('../../bases/view');
var _ = require('underscore');
var breadcrumb = require('../../../../../modules/breadcrumb');

module.exports = Base.extend({
    className: 'home focus_on_browse',
    wapAttributes: {
        cellpadding: 0
    }
});

module.exports.id = 'home/focus_on_browse';
