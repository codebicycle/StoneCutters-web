'use strict';

var Base = require('../../bases/view');
var helpers = require('../../../../../helpers');
var _ = require('underscore');

module.exports = Base.extend({
    className: 'partials_filterorder_view',
    id: 'filterorder',
    getTemplateData: function() {
        var data = Base.prototype.getTemplateData.call(this);
        return _.extend({}, data, {});
    },
    postRender: function() {
    }
});

module.exports.id = 'partials/filterorder';