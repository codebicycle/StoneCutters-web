'use strict';

var BaseView = require('../base');
var _ = require('underscore');
var utils = require('../../../shared/utils');

module.exports = BaseView.extend({
    className: 'location_index_view',
    wapAttributes: {
        cellpadding: 0
    },
    getTemplateData: function() {
        var data = BaseView.prototype.getTemplateData.call(this);

        return _.extend({}, data, {
            location: this.app.getSession('location')
        });
    },
    postRender: function() {
        this.attachTrackMe(this.className, function(category, action) {
            return {
                custom: [category, '-', '-', action].join('::')
            };
        });

        this.$('.cities-links .city-link').on('click', function(e) {
            var href = $(e.currentTarget).attr('href');
            var siteLocation = utils.params(href, 'location');

            $('.logo').trigger('change:location', siteLocation);
            $('.header-links .header-link').trigger('change:location', siteLocation);
            $('.footer-links .footer-link').trigger('change:location', siteLocation);
        }.bind(this));
    }
});

module.exports.id = 'location/index';
