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
        'click [data-footer-slidedown]': 'slideDownContent',
        'click [data-footer-tab]': 'slideFooter',
        'click [data-footer-content] ul li': 'cleanClases',
        'click [data-modal-shadow], [data-modal-close]': 'onCloseModal',
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
                var $slide = this.$('[data-footer-content]');

                if (!$slide.hasClass('open')) {
                    return;
                }
                else if (!$(event.target).closest($slide).length) {
                    this.slideDownContent(event);
                }
            }.bind(this));
            this.firstRender = false;
        }
        this.app.router.appView.on('footer:hide', this.onFooterHide.bind(this));
        this.app.router.appView.on('footer:show', this.onFooterShow.bind(this));
    },
    cleanClases: function() {
        this.$('[data-footer-tab]').removeClass('active');
        this.$('[data-footer-content].open').removeClass('open').hide();
    },
    slideDownContent: function(event) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();

        var $slideOpen = this.$('[data-footer-content].open');
        var $tabs = this.$('[data-footer-tab]');

        $tabs.removeClass('active');
        $slideOpen.removeClass('open');
        $slideOpen.slideUp('slow');
    },
    slideFooter: function(event) {
        var $currentTab = $(event.currentTarget);
        var $currentSlide = $currentTab.siblings('[data-footer-content]');
        var $tabs = this.$('[data-footer-tab]');
        var $slides = this.$('[data-footer-content]');
        var isActive = $currentSlide.hasClass('open');

        $slides.stop(true, true);

        if ($slides.hasClass('open') && !$currentSlide.hasClass('open')) {
            $slides.filter('.open').slideToggle('slow', function() {
                $slides.find('.open').toggleClass('open');
                $tabs.find('.active').removeClass('active');
                $currentTab.addClass('active');
                $currentSlide.slideToggle('slow', function() {
                    $currentSlide.toggleClass('open');
                });
            });
        }
        else {
            $currentSlide.slideToggle('slow', function() {
                if (isActive) {
                    $currentTab.removeClass('active');
                    $currentSlide.removeClass('open');
                }
                else {
                    $currentTab.addClass('active');
                    $currentSlide.addClass('open');
                }
            });
        }
    },
    onCloseModal: function(event) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();
        $('#migrations-modal').trigger('hide');
    },
    onFooterHide: function() {
        this.$el.hide();
    },
    onFooterShow: function() {
        this.$el.show();
    }
});
