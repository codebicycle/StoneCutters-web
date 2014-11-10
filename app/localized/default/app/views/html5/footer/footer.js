'use strict';

var Base = require('../../../../../common/app/bases/view').requireView('footer/footer');
var utils = require('../../../../../../../shared/utils');
var config = require('../../../../../../../shared/config');
var _ = require('underscore');
var helpers = require('../../../../../../helpers');
var asynquence = require('asynquence');

module.exports = Base.extend({
    tagName: 'footer',
    className: function() {
        if (this.isFilter()) {
            return 'footer_footer_view disabled';
        }
        return 'footer_footer_view';
    },
    getTemplateData: function() {
        var data = Base.prototype.getTemplateData.call(this);
        var currentRoute = this.app.session.get('currentRoute');

        return _.extend({}, data, {
            postingFlow: currentRoute.controller === 'post' && currentRoute.action === 'flow' && this.app.session.get('platform') === 'html5' && config.get(['posting', 'flow', 'enabled', this.app.session.get('siteLocation')], true)
        });
    },
    postRender: function() {
        $('body').on('change:location', this.changeLocation.bind(this));
        this.app.router.appView.on('postingflow:start', this.onPostingFlowStart.bind(this));
        this.app.router.appView.on('postingflow:end', this.onPostingFlowEnd.bind(this));
        this.app.router.appView.on('filter:start', this.hide.bind(this));
        this.app.router.appView.on('filter:end', this.show.bind(this));
        this.app.router.appView.on('sort:start', this.hide.bind(this));
        this.app.router.appView.on('sort:end', this.show.bind(this));
        this.app.router.appView.on('location:start', this.hide.bind(this));
        this.app.router.appView.on('location:end', this.show.bind(this));
        this.attachTrackMe(this.className, function(category, action) {
            return {
                custom: [category, '-', '-', action].join('::')
            };
        });
    },
    isFilter: function() {
        var currentRoute = this.app.session.get('currentRoute');
        
        return (currentRoute.action === 'filter' || currentRoute.action === 'sort' || currentRoute.action === 'location');
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
        this.$el.addClass('disabled');
    },
    onPostingFlowEnd: function() {
        this.app.router.once('action:end', this.onPostingFlowAfter.bind(this));
    },
    onPostingFlowAfter: function() {
        this.$el.removeClass('disabled');
    },
    hide: function() {
        this.$el.addClass('disabled');
    },
    show: function() {
        var $footer = this.$el;

        this.app.router.once('action:end', function afterEnd() {
            $footer.removeClass('disabled');
        });
    }
});
