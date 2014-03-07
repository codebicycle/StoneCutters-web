'use strict';

var BaseView = require('../base');
var _ = require('underscore');

module.exports = BaseView.extend({
    className: 'left-panel_index_view',
    getTemplateData: function() {
        var data = BaseView.prototype.getTemplateData.call(this);

        return _.extend({}, data, {
            categories: this.app.getSession('categories'),
            siteLocation: this.app.getSession('siteLocation'),
            user: this.app.getSession('user')
        });
    }
});

module.exports.id = 'left-panel/index';
