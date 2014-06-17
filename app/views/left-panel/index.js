'use strict';

var BaseView = require('../base');
var _ = require('underscore');

module.exports = BaseView.extend({
    className: 'left-panel_index_view',
    getTemplateData: function() {
        var data = BaseView.prototype.getTemplateData.call(this);

        return _.extend({}, data, {
            categories: this.app.session.get('categories'),
            siteLocation: this.app.session.get('siteLocation'),
            user: this.app.session.get('user')
        });
    }
});

module.exports.id = 'left-panel/index';
