'use strict';

var Base = require('../../bases/view');
var _ = require('underscore');
var helpers = require('../../../../../helpers');

module.exports = Base.extend({
    tagName: "section",
    className: 'pages-sitemap-view',
    id: "category-tree",
    getTemplateData: function() {
        var data = Base.prototype.getTemplateData.call(this);
        var categories = data.categories;

        categories = helpers.common.categoryOrder(categories, this.app.session.get('siteLocation'));

        return _.extend({}, data, {
            location: this.app.session.get('location'),
            categories: categories
        });
    }
});

module.exports.id = 'pages/sitemap';
