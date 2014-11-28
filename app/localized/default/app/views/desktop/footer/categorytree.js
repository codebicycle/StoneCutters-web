'use strict';

var Base = require('../../../../../common/app/bases/view');
var _ = require('underscore');
var helpers = require('../../../../../../helpers');

module.exports = Base.extend({
    className: 'footer-categorytree-view',
    getTemplateData: function() {
        var data = Base.prototype.getTemplateData.call(this);
        var categories = data.categories;

        categories = helpers.common.categoryOrder(categories, this.app.session.get('siteLocation'));

        return _.extend({}, data, {
            categories: categories
        });
    }
});

module.exports.id = 'footer/categorytree';
