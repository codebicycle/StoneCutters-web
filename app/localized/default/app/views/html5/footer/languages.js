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

        return _.extend({}, data, {
            languages: {
                selected: selectedLanguage,
                list: languagesList
            },
            postingFlow: currentRoute.controller === 'post' && currentRoute.action === 'flow' && this.app.session.get('platform') === 'html5' && config.get(['posting', 'flow', 'enabled', this.app.session.get('siteLocation')], true),
            selectedLanguage: this.app.session.get('selectedLanguage')
        });
    },
    postRender: function() {
        $('body').on('change:location', this.changeLocation.bind(this));
        this.app.router.appView.on('postingflow:start', this.onPostingFlowStart.bind(this));
        this.app.router.appView.on('postingflow:end', this.onPostingFlowEnd.bind(this));
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
    onPostingFlowStart: function() {
        this.$('#languages').addClass('disabled');
    },
    onPostingFlowEnd: function() {
        this.app.router.once('action:end', this.onPostingFlowAfter.bind(this));
    },
    onPostingFlowAfter: function() {
        this.$('#languages').removeClass('disabled');
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
