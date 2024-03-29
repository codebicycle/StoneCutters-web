'use strict';

var Base = require('../../bases/view');
var _ = require('underscore');
var breadcrumb = require('../../../../../modules/breadcrumb');

module.exports = Base.extend({
    className: 'post_subcategories_view',
    wapAttributes: {
        cellpadding: 0,
        bgcolor: '#DDDDDD'
    },
    getTemplateData: function() {
        var data = Base.prototype.getTemplateData.call(this);

        return _.extend({}, data, {
            breadcrumb: breadcrumb.get.call(this, data)
        });
    },
    postRender: function() {
        this.attachTrackMe(function(category, action) {
            return {
                custom: [category, this.data('parentId'), this.data('id'), action].join('::')
            };
        });
    }
});

module.exports.id = 'post/subcategories';
