'use strict';

var Base = require('../../../../../common/app/bases/view').requireView('footer/languages');
var utils = require('../../../../../../../shared/utils');
var config = require('../../../../../../../shared/config');
var helpers = require('../../../../../../helpers');
var _ = require('underscore');

module.exports = Base.extend({
    getTemplateData: function() {
        var data = Base.prototype.getTemplateData.call(this);
        var currentRoute = this.app.session.get('currentRoute');
        var languages = this.app.session.get('languages').models;
        var selected = this.app.session.get('selectedLanguage');

        var selectedLanguage = _.find(languages, function(language){
            return language.locale === selected;
        });

        var languagesList = _.filter(languages, function(language){
            return language.locale !== selected;
        });

        var languages = this.app.session.get('languages').models;
        var selected = this.app.session.get('selectedLanguage');

        var selectedLanguage = _.find(languages, function(language){
            return language.locale === selected;
        });

        var languagesList = _.filter(languages, function(language){
            return language.locale !== selected;
        });

        return _.extend({}, data, {
            languages: {
                selected: selectedLanguage,
                list: languagesList
            },
            postingFlow: currentRoute.controller === 'post' && currentRoute.action === 'flow' && this.app.session.get('platform') === 'html5' && config.get(['posting', 'flow', 'enabled', this.app.session.get('siteLocation')], true),
            selectedLanguage: this.app.session.get('selectedLanguage')
        });
    },
    events: {
        'click strong.drop': 'languageToggle'
    },
    postRender: function() {
        $('body').on('change:location', this.changeLocation.bind(this));
    },
    languageToggle: function(event) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();
        var btn = $(event.target);
        if (btn.hasClass('open')) {
            btn.removeClass('open').addClass('close');
        } else if (btn.hasClass('close')) {
            btn.removeClass('close').addClass('open');
        }
        $('.footer-links').slideToggle();
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
