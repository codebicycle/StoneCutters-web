'use strict';

var BaseView = require('../base');
var _ = require('underscore');
var helpers = require('../../helpers');

module.exports = BaseView.extend({
    className: 'post_subcat_view',
    wapAttributes: {
        cellpadding: 0,
        bgcolor: '#DDDDDD'
    },
    getTemplateData: function() {
        var data = BaseView.prototype.getTemplateData.call(this);

        return _.extend({}, data, {
            breadcrumb: helpers.breadcrumb.get.call(this, data)
        });
    },
    postRender: function() {
        this.attachTrackMe(this.className, function(category, action) {
            return {
                custom: [category, this.data('parentId'), this.data('id'), action].join('::')
            };
        });
    }
});

module.exports.id = 'post/subcat';
