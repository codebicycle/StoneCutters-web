'use strict';

var BaseView = require('../base');
var _ = require('underscore');
var helpers = require('../../helpers');
var utils = require('../../../shared/utils');

module.exports = BaseView.extend({
    className: 'location_index_view',
    wapAttributes: {
        cellpadding: 0
    },
    getTemplateData: function() {
        var data = BaseView.prototype.getTemplateData.call(this);

        return _.extend({}, data, {
            location: this.app.session.get('location'),
            breadcrumb: helpers.breadcrumb.get.call(this, data)
        });
    },
    postRender: function() {
        this.attachTrackMe(this.className, function(category, action) {
            return {
                custom: [category, '-', '-', action].join('::')
            };
        });

        this.$('#location .country-link, .cities-links .city-link').on('click', function(e) {
            var href = $(e.currentTarget).attr('href');
            var siteLocation = utils.params(href, 'location');

            $('body').trigger('change:location', siteLocation);
        }.bind(this));
    }
});

module.exports.id = 'location/index';
