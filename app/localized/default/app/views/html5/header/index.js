'use strict';

var Base = require('../../../../../common/app/bases/view').requireView('header/index');
var utils = require('../../../../../../../shared/utils');
var config = require('../../../../../../../shared/config');
var helpers = require('../../../../../../helpers');
var _ = require('underscore');

module.exports = Base.extend({
    urlreferer: '',
    getTemplateData: function() {
        var data = Base.prototype.getTemplateData.call(this);
        var currentRoute = this.app.session.get('currentRoute');
        var postingFlowEnabled = this.app.session.get('platform') === 'html5' && config.get(['posting', 'flow', 'enabled', this.app.session.get('siteLocation')], true);

        return _.extend({}, data, {
            postingFlowEnabled: postingFlowEnabled,
            postingFlow: postingFlowEnabled && currentRoute.controller === 'post' && currentRoute.action === 'flow'
        });
    },
    postRender: function() {
        this.attachTrackMe();
        $('body').on('change:location', this.changeLocation.bind(this));
        $('body').on('update:postingLink', this.updatePostingLink.bind(this));
        this.app.router.appView.on('postingflow:start', this.onPostingFlowStart.bind(this));
        this.app.router.appView.on('postingflow:end', this.onPostingFlowEnd.bind(this));
        this.app.router.appView.on('sort:start', this.onSelectSortStart.bind(this));
        this.app.router.appView.on('sort:end', this.restore.bind(this));
        this.app.router.appView.on('filter:start', this.onSelectFilterStart.bind(this));
        this.app.router.appView.on('filter:end', this.restore.bind(this));
        this.app.router.appView.on('location:start', this.onSelectLocation.bind(this));
        this.app.router.appView.on('location:end', this.restore.bind(this));
        if(helpers.features.isEnabled.call(this, 'newItemPage')) {
            this.app.router.appView.on('reply:start', this.onReplyForm.bind(this));
            this.app.router.appView.on('reply:end', this.restore.bind(this));
        }
        /*this.app.router.appView.on('login:start', this.onLoginStart.bind(this));
        this.app.router.appView.on('login:end', this.restore.bind(this));
        this.app.router.appView.on('register:start', this.onLoginStart.bind(this));
        this.app.router.appView.on('register:end', this.restore.bind(this));
        this.app.router.appView.on('lostpassword:start', this.onLoginStart.bind(this));
        this.app.router.appView.on('lostpassword:end', this.restore.bind(this));*/
        this.app.router.on('action:end', this.onActionEnd.bind(this));
        if (helpers.features.isEnabled.call(this, 'smartBanner')) {
            if ( !(/(iPad|iPhone|iPod).*OS [6-7].*AppleWebKit.*Mobile.*Safari/.test(navigator.userAgent)) && !this.app.session.get('interstitial') ) {
                $.smartbanner({
                    title: 'OLX Free Classifieds',
                    author: 'OLX Inc.',
                    daysHidden: 0,
                    daysReminder: 0,
                    icon: 'images/html5/app_logo.jpeg',
                    layer: true
                });
            }
        }
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
        'click .topBarFilters .filter-btns': 'onCancelFilter'
    },
    onLoginClick: function(event) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();

        var $current = $(event.currentTarget);

        $current.toggleClass('active');
        this.$('#myOlx').slideToggle();
    },
    onMenuClick: function(event) {
        this.$('.logIn .btns.blue.active').toggleClass('active');
        this.$('#myOlx').slideUp();
    },
    onCancelFilter: function(event) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();

        helpers.common.redirect.call(this.app.router, this.urlreferer, null, {
            status: 200
        });

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
        this.$('#myOlx').css('display', 'none');
    },
    onPostingFlowEnd: function() {
        this.app.router.once('action:end', this.onPostingFlowAfter.bind(this));
    },
    onPostingFlowAfter: function() {
        this.$('#topBar, #myOlx').removeClass('disabled');
    },
    onSelectSortStart: function(){
        this.customize("unavailableitemrelateditems.SortBy");
    },
    onSelectFilterStart: function(){
        this.customize("mobilepromo.Filters");
    },
    onSelectLocation: function(){
        this.customize("itemslisting.NavigatorByLocation");
    },
    onLoginStart: function(){
        this.customize("defaulthtmlhead.My Listings");
    },
    onReplyForm: function() {
        this.customize('itemslisting.ContactSeller');
    },
    customize: function(key) {
        var data = Base.prototype.getTemplateData.call(this);
        var route = this.app.session.get('currentRoute').action;

        this.urlreferer = data.referer || '/';

        if (route === 'register' || route === 'lostpassword') {
            this.urlreferer = '/login';
        } else if (route === 'login') {
            this.urlreferer = '/';
        }

        this.$('.logo, .header-links').hide();
        this.$('.topBarFilters').removeClass('hide');
        this.$('.topBarFilters .title').text(data.dictionary[key]);

        this.$('.topBarFilters a').attr('data-tracking', route+'-cancel');
    },
    restore: function() {
        var $links = this.$('.logo, .header-links');
        var $text = this.$('.topBarFilters');

        this.app.router.once('action:end', function afterEnd() {
            $links.show();
            $text.addClass('hide').find('.title').text('');
        });
    }
});
