'use strict';

var BaseView = require('../base');
var _ = require('underscore');

module.exports = BaseView.extend({
    className: 'categories_menu_view',
    getTemplateData: function() {
        var data = BaseView.prototype.getTemplateData.call(this);

        return _.extend({}, data, {
            categories: this.app.getSession('categories'),
            siteLocation: this.app.getSession('siteLocation')
        });
    },
});

module.exports.id = 'categories/menu';
