'use strict';

var Base = require('../../bases/view');
var _ = require('underscore');
var helpers = require('../../../../../helpers');

module.exports = Base.extend({
    className: 'pages-allstates-view',
    getTemplateData: function() {
        var data = Base.prototype.getTemplateData.call(this);

        return _.extend({}, data, {
            breadcrumb: helpers.breadcrumb.get.call(this, data)
        });
    }
});

module.exports.id = 'pages/allstates';