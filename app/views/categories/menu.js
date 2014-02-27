'use strict';

var BaseView = require('../base');
var _ = require('underscore');

module.exports = BaseView.extend({
    className: 'categories_menu_view',
    getTemplateData: function() {
        var data = BaseView.prototype.getTemplateData.call(this);
        return _.extend({}, data, {
            categories: this.app.get('baseData').categories,
            siteLocation: this.app.get('baseData').siteLocation
        });
    },
});

module.exports.id = 'categories/menu';
