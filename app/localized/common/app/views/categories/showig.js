'use strict';

var Base = require('../../bases/view');
var _ = require('underscore');
var querystring = require('querystring');
var asynquence = require('asynquence');
var helpers = require('../../../../../helpers');
var tracking = require('../../../../../modules/tracking');

module.exports = Base.extend({
    className: 'categories_showig_view',
    getTemplateData: function() {
        var data = Base.prototype.getTemplateData.call(this);

        _.each(data.items, this.processItem);
        return _.extend({}, data, {
            breadcrumb: helpers.breadcrumb.get.call(this, data),
            items: data.items
        });
    }
});

module.exports.id = 'categories/showig';
