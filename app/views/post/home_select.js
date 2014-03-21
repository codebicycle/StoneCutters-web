'use strict';

var BaseView = require('../base');
var _ = require('underscore');

module.exports = BaseView.extend({
    className: 'post_home_select_view',
    getTemplateData: function() {
        var data = BaseView.prototype.getTemplateData.call(this);

        return _.extend({}, data, {
            location: this.app.getSession('location')
        });
    }
});

module.exports.id = 'post/home_select';
