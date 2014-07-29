'use strict';

var Base = require('../../../../../common/app/bases/view').requireView('header/index');
var utils = require('../../../../../../../shared/utils');
var _ = require('underscore');

module.exports = Base.extend({
    getTemplateData: function() {
        var data = Base.prototype.getTemplateData.call(this);
        var currentRoute = this.app.session.get('currentRoute');

        return _.extend({}, data, {
            postingFlow: currentRoute.controller === 'post' && currentRoute.action === 'flow'
        });
    },
    postRender: function() {
        $('#topBar ul li.logIn span').click(function(e){
            $('menu#myOlx').slideToggle();
        });
        $('menu#myOlx ul li a').click(function(e){
            $('menu#myOlx').slideUp();
        });
        this.attachTrackMe(this.className, function(category, action) {
            return {
                custom: [category, '-', '-', action].join('::')
            };
        });
        $(document).on('route', function onRoute() {
            var platform = this.app.session.get('platform');
            var currentRoute = this.app.session.get('currentRoute');
            var button = $('.postBtn', '#topBar');
            var postButton = this.readPostButtonConfig(platform, currentRoute);

            if (postButton) {
                button.removeClass('disabled');
            }
            else {
                button.addClass('disabled');
            }
        }.bind(this));

        $('body').on('change:location', this.changeLocation.bind(this));
        $('body').on('update:postingLink', this.updatePostingLink.bind(this));
        this.app.router.appView.on('postingflow:start', this.onPostingFlowStart.bind(this));
        this.app.router.appView.on('postingflow:end', this.onPostingFlowEnd.bind(this));
    },
    changeLocation: function (e, siteLocation) {
        this.$('.logo, .header-links .header-link, .header-links .posting-link').each(function(i, link) {
            var $link = $(link);
            var href = $link.attr('href');
            var removeLocation = (siteLocation && ~siteLocation.indexOf('www'));
            var currentLocation;

            if ($link.hasClass('posting-link')) {
                if (~href.indexOf('/posting')) {
                    if (removeLocation) {
                        $link.data('tracking', 'Posting-ClickSelectLocation');
                        $link.attr('href', '/location?target=posting');
                    }
                }
                else if (!removeLocation) {
                    $link.removeData('tracking');
                    $link.attr('href', '/posting');
                }
                href = $link.attr('href');
            }
            currentLocation = utils.params(href, 'location');
            if (currentLocation !== siteLocation) {
                if (removeLocation) {
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
    updatePostingLink: function(e) {
        this.$('.posting-link').each(function(i, link) {
            var $link = $(link);
            var href = $link.attr('href');

            if (~href.indexOf('/posting')) {
                $link.attr('href', href.replace(/\/posting(\/\d*)?(\/\d*)?/, ['/posting', this.getPostLink()].join('')));
            }
        }.bind(this));
    },
    onPostingFlowStart: function() {
        this.$('#topBar, #myOlx').addClass('disabled');
    },
    onPostingFlowEnd: function() {
        this.app.router.once('action:end', this.onPostingFlowAfter.bind(this));
    },
    onPostingFlowAfter: function() {
        this.$('#topBar, #myOlx').removeClass('disabled');
    }
});
