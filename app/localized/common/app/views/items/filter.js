'use strict';

var Base = require('../../bases/view');
var _ = require('underscore');
var querystring = require('querystring');
var asynquence = require('asynquence');
var helpers = require('../../../../../helpers');
var analytics = require('../../../../../modules/analytics');

module.exports = Base.extend({
    className: 'items_filter_view',
    wapAttributes: {
        cellpadding: 0
    },
    getTemplateData: function() {
        var data = Base.prototype.getTemplateData.call(this);

        return _.extend({}, data, {
            breadcrumb: helpers.breadcrumb.get.call(this, data)
        });
    },
});

module.exports.id = 'items/filter';
