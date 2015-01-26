'use strict';

var Base = require('../../../bases/view');
var _ = require('underscore');
var helpers = require('../../../../../../helpers');
var utils = require('../../../../../../../shared/utils');
var breadcrumb = require('../../../../../../modules/breadcrumb');

module.exports = Base.extend({
    className: 'items_reply_view',
    wapAttributes: {
        cellpadding: 0
    },
    getTemplateData: function() {
        var data = Base.prototype.getTemplateData.call(this);

        return _.extend({}, data, {});
    }
});

module.exports.id = 'items/partials/reply';
