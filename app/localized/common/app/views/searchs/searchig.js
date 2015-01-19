'use strict';

var _ = require('underscore');
var Base = require('../../bases/view');
var helpers = require('../../../../../helpers');

module.exports = Base.extend({
    className: 'searchs_searchig_view',
    wapAttributes: {
        cellpadding: 0
    },
    getTemplateData: function() {
        var data = Base.prototype.getTemplateData.call(this);
    }

});

module.exports.id = 'searchs/searchig';
