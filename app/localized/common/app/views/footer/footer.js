'use strict';

var Base = require('../../bases/view');
var _ = require('underscore');
var utils = require('../../../../../../shared/utils');

module.exports = Base.extend({
    className: 'footer_footer_view',
    getTemplateData: function() {
        var data = Base.prototype.getTemplateData.call(this);
        var user = this.app.session.get('user');
        var location = this.app.session.get('location');

        return _.extend({}, data, {
            user: user,
            location: location
        });
    },
    postRender: function() {
        $('body').on('change:location', this.changeLocation.bind(this));
    },
    changeLocation: function (e, siteLocation) {
        this.$('.footer-links .footer-link').each(function(i, link) {
            var $link = $(link);
            var href = $link.attr('href');
            var currentLocation = utils.params(href, 'location');

            if (currentLocation !== siteLocation) {
                if (siteLocation && ~siteLocation.indexOf('www')) {
                    href = utils.removeParams(href, 'location');
                }
                else {
                    href = utils.link(href, this.app, {
                        location: siteLocation
                    });
                }
                $link.attr({
                    href: href
                });
            }
        }.bind(this));
    }
});

module.exports.id = 'footer/footer';
