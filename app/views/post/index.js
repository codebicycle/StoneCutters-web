'use strict';

var BaseView = require('../base');
var _ = require('underscore');

module.exports = BaseView.extend({
    className: 'post_index_view',
    getTemplateData: function() {
        var data = BaseView.prototype.getTemplateData.call(this);

        return _.extend({}, data, {
            'location': this.app.getSession('location'),
            'categories': this.app.getSession('categories'),
        });
    }
});

module.exports.id = 'post/index';
