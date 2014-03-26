'use strict';

var BaseView = require('../base');
var _ = require('underscore');

module.exports = BaseView.extend({
    className: 'post_form_view',
    getTemplateData: function() {
        var data = BaseView.prototype.getTemplateData.call(this);

        return _.extend({}, data, {});
    }
});

module.exports.id = 'post/form';
