'use strict';

var Base = require('../../../../../common/app/bases/view').requireView('footer/languages');
var utils = require('../../../../../../../shared/utils');
var config = require('../../../../../../../shared/config');
var helpers = require('../../../../../../helpers');
var _ = require('underscore');

module.exports = Base.extend({
    getTemplateData: function() {
        var data = Base.prototype.getTemplateData.call(this);

        return _.extend({}, data, {
            languages: this.app.session.get('languages'),
            selectedLanguage: this.app.session.get('selectedLanguage')
        });
    },
    postRender: function() {
        $('body').on('change:location', this.changeLocation.bind(this));
        this.app.router.on('action:end', this.onActionEnd.bind(this));
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


    },
    onActionEnd: function(e, loading) {
        this.$('#languages .footer-links a').each(function(i, link) {
            var $link = $(link);
            var href = this.app.session.get('url');
            var language = $link.attr('data-language');

            $link.attr({
                href: utils.link(href, this.app, {
                    language: language
                })
            });
        }.bind(this));
    }
});
