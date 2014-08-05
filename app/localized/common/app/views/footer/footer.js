'use strict';

var Base = require('../../bases/view');
var _ = require('underscore');
var utils = require('../../../../../../shared/utils');

module.exports = Base.extend({
    className: 'footer_footer_view',
    getTemplateData: function() {
        var data = Base.prototype.getTemplateData.call(this);
        
        return _.extend({}, data, {
            user: this.app.session.get('user')
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
                    href = utils.removeParams.call(this, href, 'location', true);
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
