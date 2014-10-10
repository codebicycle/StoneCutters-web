'use strict';

var Base = require('../../../../../common/app/bases/view').requireView('header/index');
var utils = require('../../../../../../../shared/utils');
var config = require('../../../../../../../shared/config');
var helpers = require('../../../../../../helpers');
var _ = require('underscore');

module.exports = Base.extend({
    getTemplateData: function() {
        var data = Base.prototype.getTemplateData.call(this);
        var currentRoute = this.app.session.get('currentRoute');
        var postingFlowEnabled = this.app.session.get('platform') === 'html5' && config.get(['posting', 'flow', 'enabled', this.app.session.get('siteLocation')], true);
        return _.extend({}, data, {
            postingFlowEnabled: postingFlowEnabled,
            postingFlow: postingFlowEnabled && currentRoute.controller === 'post' && currentRoute.action === 'categoriesOrFlow',
            headerTitle: (currentRoute == 'filter')?data.dictionary["mobilepromo.Filters"]:data.dictionary["unavailableitemrelateditems.SortBy"]
        });
    },    
    postRender: function() {
        this.attachTrackMe(this.className, function(category, action) {
            return {
                custom: [category, '-', '-', action].join('::')
            };
        });        
        $('body').on('change:location', this.changeLocation.bind(this));
        $('body').on('update:postingLink', this.updatePostingLink.bind(this));
        this.app.router.appView.on('postingflow:start', this.onPostingFlowStart.bind(this));
        this.app.router.appView.on('postingflow:end', this.onPostingFlowEnd.bind(this));
        this.app.router.appView.on('sort:start', this.onSelectSortStart.bind(this));
        this.app.router.appView.on('sort:end', this.onSelectSortEnd.bind(this));
        this.app.router.on('action:end', this.onActionEnd.bind(this));        
    },
    onActionEnd: function() {
        if (this.isPostButtonEnabled()) {
            this.$('.postBtn').removeClass('disabled');
        }
        else {
            this.$('.postBtn').addClass('disabled');
        }
    },
    events: {
        'click .logIn span': 'onLoginClick',
        'click #myOlx li a': 'onMenuClick',
        'click .topBarFilters .filter-btns':'onCancelFilter'
    },
    onLoginClick: function(event) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();

        this.$('#myOlx').slideToggle();
    },
    onMenuClick: function(event) {
        this.$('#myOlx').slideUp();
    },
    onCancelFilter: function(event) {
        history.back();
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
    },
    onSelectSortStart: function(){
        this.$('.logo, .header-links').hide();
        this.$('.topBarFilters').removeClass('hide');
    },
    onSelectSortEnd: function(){
        this.$('.logo, .header-links').show();
        this.$('.topBarFilters').addClass('hide');
    }
});
