'use strict';

var _ = require('underscore');
var Base = require('../../bases/view');
var breadcrumb = require('../../../../../modules/breadcrumb');

module.exports = Base.extend({
    className: 'categories_showig_view',
    getTemplateData: function() {
        var data = Base.prototype.getTemplateData.call(this);

        return _.extend({}, data, {
            breadcrumb: breadcrumb.get.call(this, data)
        });
    }
});

module.exports.id = 'categories/showig';
