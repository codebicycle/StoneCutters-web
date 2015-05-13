'use strict';

var _ = require('underscore');
var Base = require('../../../../../common/app/bases/view').requireView('footer/footer');
var utils = require('../../../../../../../shared/utils');
var config = require('../../../../../../../shared/config');
var FeatureAd = require('../../../../../../models/feature_ad');
var Metric = require('../../../../../../modules/metric');

module.exports = Base.extend({
    tagName: 'footer',
    id: 'footer-view',
    className: 'footer-view wrapper',
    firstRender: true,
    events: {
        'click [data-modal-shadow], [data-modal-close]': 'onCloseModal',
        'click .modal-link': 'onModalLinkClick',
        'click .modal-close': 'onModalCloseClick',
        'click [data-increment-metric]': Metric.incrementEventHandler
    },
    getTemplateData: function() {
        var data = Base.prototype.getTemplateData.call(this);
        var location = this.app.session.get('location');
        var socials = config.getForMarket(location.url, ['socials'], '');
        var marketing = config.getForMarket(location.url, ['marketing'], '');
        var states = data.states;
        var currentState = {};
        var selectedLanguage = this.app.session.get('selectedLanguage').split('-')[0];
        var isFeaturedCountry = FeatureAd.isEnabled(this.app, 'footer#footer');

        if(location.children.length) {
            _.each(states, function each(state, i){
                if(location.children[0].id == state.id) {
                    currentState = state;
                }
            });
        }

        return _.extend({}, data, {
            selectedLanguage: selectedLanguage,
            socials: socials,
            isFeaturedCountry: isFeaturedCountry,
            migrationModal: marketing.migrationModal,
            currentState: {
                hostname: currentState.hostname,
                name: currentState.name
            }
        });
    },
    postRender: function() {
        if (utils.getUrlParam('from') === 'schibsted') {
            $('#migrations-modal').trigger('show');
            window.setTimeout(function onTimeout(){
                $('#migrations-modal').trigger('hide');
            }, 10000);
        }
        if (this.firstRender) {
            $('body').on('click', function(event){
                var $openedLink = this.$('.modal-link.active');
                var $openedModal = $openedLink.next('.modal-container.active');

                if ($openedLink.length && !$(event.target).closest($openedLink.next('.modal-container.active')).length) {
                    $openedLink.click();
                }
            }.bind(this));
            this.firstRender = false;
        }
        this.app.router.appView.on('footer:hide', this.onFooterHide.bind(this));
        this.app.router.appView.on('footer:show', this.onFooterShow.bind(this));
    },
    onCloseModal: function(event) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();
        $('#migrations-modal').trigger('hide');
    },
    onModalLinkClick: function(event) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();

        var $currentSource = this.$('.modal-link.active');
        var $currentTarget = this.$('.modal-container.active');
        var $source = this.$(event.target);
        var $target = $source.next('.modal-container');

        if (!$source.hasClass('active')) {
            $currentSource.removeClass('active');
            $currentTarget.removeClass('active').hide();
        }

        $source.toggleClass('active');
        $target.toggleClass('active').toggle();
    },
    onModalCloseClick: function(event) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();

        $('#migrations-modal').trigger('hide');
    }    }
});
