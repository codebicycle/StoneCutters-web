'use strict';

var Base = require('../../bases/view');
var _ = require('underscore');
var helpers = require('../../helpers');

module.exports = Base.extend({
    className: 'post_index_view',
    wapAttributes: {
        cellpadding: 0,
        bgcolor: '#DDDDDD'
    },
    getTemplateData: function() {
        var data = Base.prototype.getTemplateData.call(this);

        return _.extend({}, data, {
            breadcrumb: helpers.breadcrumb.get.call(this, data)
        });
    },
    postRender: function() {
        this.attachTrackMe(this.className, function(category, action) {
            return {
                custom: [category, this.data('id'), '-', action].join('::')
            };
        });
    }
});

module.exports.id = 'post/index';
