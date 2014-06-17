'use strict';

var BaseView = require('../base');
var _ = require('underscore');
var utils = require('../../../shared/utils');

module.exports = BaseView.extend({
    className: 'footer_languages_view',
    wapAttributes: {
        bgcolor: '#DDDDDD'
    },
    getTemplateData: function() {
        var data = BaseView.prototype.getTemplateData.call(this);

        return _.extend({}, data, {
            languages: this.app.getSession('languages'),
            selectedLanguage: this.app.getSession('selectedLanguage')
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
                $link.attr({
                    href: utils.link(href, siteLocation)
                });
            }
        });
    }
});

module.exports.id = 'footer/languages';
