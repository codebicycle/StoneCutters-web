'use strict';

var BaseView = require('../base');
var _ = require('underscore');

module.exports = BaseView.extend({
    className: 'left-panel_index_view',
    getTemplateData: function() {
        var data = BaseView.prototype.getTemplateData.call(this);
        return _.extend({}, data, {
            categories: this.app.get('baseData').categories,
            siteLocation: this.app.get('baseData').siteLocation,
            user: this.app.get('session').user
        });
    }
});

module.exports.id = 'left-panel/index';
