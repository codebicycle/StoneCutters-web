'use strict';

var _ = require('underscore');
var asynquence = require('asynquence');
var Base = require('../../../../../common/app/bases/view').requireView('header/index');
var helpers = require('../../../../../../helpers');
var breadcrumb = require('../../../../../../modules/breadcrumb');
var Sixpack = require('../../../../../../../shared/sixpack');
var utils = require('../../../../../../../shared/utils');
var config = require('../../../../../../../shared/config');

module.exports = Base.extend({
    urlreferer: '',
    className: function() {
        var className = _.result(Base.prototype, 'className') || '';
        var sixpack = new Sixpack({
            platform: this.app.session.get('platform'),
            market: this.app.session.get('location').abbreviation,
            experiments: this.app.session.get('experiments')
        });
        var sixpackClass = sixpack.className(sixpack.experiments.html5HeaderPostButton);

        return className + (sixpackClass ? ' ' : '') + sixpackClass;
    },
    getTemplateData: function() {
        var data = Base.prototype.getTemplateData.call(this);
        var currentRoute = this.app.session.get('currentRoute');
        var postingFlowEnabled = this.app.session.get('platform') === 'html5' && config.get(['posting', 'flow', 'enabled', this.app.session.get('siteLocation')], true);
        var isHermesEnabled = helpers.features.isEnabled.call(this, 'hermes');

        return _.extend({}, data, {
            postingFlowEnabled: postingFlowEnabled,
            postingFlow: postingFlowEnabled && currentRoute.controller === 'post' && currentRoute.action === 'flow',
            isHermesEnabled: isHermesEnabled
        });
    },
    postRender: function() {
        this.attachTrackMe();
        $('body').on('change:location', this.changeLocation.bind(this));
        $('body').on('update:notifications', this.showNotification.bind(this));
        $('body').on('update:postingLink', this.updatePostingLink.bind(this));
        this.app.router.appView.on('postingflow:start', this.onPostingFlowStart.bind(this));
        this.app.router.appView.on('postingflow:end', this.onPostingFlowEnd.bind(this));
        this.app.router.appView.on('sort:start', this.onSelectSortStart.bind(this));
        this.app.router.appView.on('sort:end', this.restore.bind(this));
        this.app.router.appView.on('filter:start', this.onSelectFilterStart.bind(this));
        this.app.router.appView.on('filter:end', this.restore.bind(this));
        this.app.router.appView.on('location:start', this.onSelectLocation.bind(this));
        this.app.router.appView.on('location:end', this.restore.bind(this));
        if (helpers.features.isEnabled.call(this, 'newItemPage')) {
            this.app.router.appView.on('reply:start', this.onReplyForm.bind(this));
            this.app.router.appView.on('reply:end', this.restore.bind(this));
        }
        this.app.router.appView.on('login:start', this.onLoginStart.bind(this));
        this.app.router.appView.on('login:end', this.restore.bind(this));
        this.app.router.appView.on('register:start', this.onLoginStart.bind(this));
        this.app.router.appView.on('register:end', this.restore.bind(this));
        this.app.router.appView.on('lostpassword:start', this.onLoginStart.bind(this));
        this.app.router.appView.on('lostpassword:end', this.restore.bind(this));
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
    showNotification: function() {
        var user = this.app.session.get('user');
        var isHermesEnabled = helpers.features.isEnabled.call(this, 'hermes');

        if (user && isHermesEnabled) {
            this.unreadConversations();
        }

        this.$('.logIn .btns.blue.active').toggleClass('active');
        if (this.notifications) {
            this.$('.notification').css('display', 'block');
            $('.message-notification').css('display', 'none');
        }
        this.isMenuOpen = false;
        this.$('#myOlx').hide();
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
        'click .topBarFilters .filter-btns': 'onCancelFilter',
        'click .postBtn': 'onPostClick'
    },
    onPostClick: function() {
        var sixpack = new Sixpack({
            platform: this.app.session.get('platform'),
            market: this.app.session.get('location').abbreviation,
            experiments: this.app.session.get('experiments')
        });

        sixpack.convert(sixpack.experiments.html5HeaderPostButton);
    },
    isMenuOpen: false,
    onLoginClick: function(event) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();

        var $current = $(event.currentTarget);

        $current.toggleClass('active');
        if (!this.isMenuOpen) {
            this.isMenuOpen = true;
            if (this.notifications) {
                this.$('.notification').css('display', 'none');
                $('.message-notification').css('display', 'inline-block');
            }
            this.$('#myOlx').slideDown();
        }
        else {
            this.isMenuOpen = false;
            if (this.notifications) {
                this.$('.notification').css('display', 'block');
                $('.message-notification').css('display', 'none');
            }
            this.$('#myOlx').slideUp();
        }
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
        this.$('.migration-banner-bd').addClass('disabled');
    },
    onPostingFlowEnd: function() {
        this.app.router.once('action:end', this.onPostingFlowAfter.bind(this));
    },
    onPostingFlowAfter: function() {
        this.$('#topBar, #myOlx, .migration-banner-bd').removeClass('disabled');
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

        this.urlreferer = data.referer || breadcrumb.getCancel.call(this, data) || '/';

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
    },
    unreadConversations: function() {
        var user = this.app.session.get('user');

        if (user.unreadConversationsCount) {
            this.notifications = true;
            return this.$('.notification').css('display', 'block');
        }
        else {
            this.notifications = false;
            return this.$('.notification').css('display', 'none');
        }

    }
});
