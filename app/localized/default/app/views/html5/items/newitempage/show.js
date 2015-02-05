'use strict';

var _ = require('underscore');
var asynquence = require('asynquence');
var Base = require('../../../../../../common/app/bases/view').requireView('items/show');
var Categories = require('../../../../../../../collections/categories');
var Item = require('../../../../../../../models/item');
var helpers = require('../../../../../../../helpers');
var statsd = require('../../../../../../../../shared/statsd')();
var translations = require('../../../../../../../../shared/translations');
var User = require('../../../../../../../models/user');

module.exports = Base.extend({
    className: 'items_show_view',
    wapAttributes: {
        cellpadding: 0
    },
    messages: {},
    initialize: function() {
        this.dictionary = translations.get(this.app.session.get('selectedLanguage'));
        this.messages = {};
    },
    getTemplateData: function() {
        var data = Base.prototype.getTemplateData.call(this);
        var isNotOwner = false;

        if (data.item.user !== null && this.app.session.get('user') && this.app.session.get('user').userId !== data.item.user.id) {
            isNotOwner = true;
        }
        return _.extend({}, data, {
            newItemPage: helpers.features.isEnabled.call(this, 'newItemPage'),
            isNotOwner:  isNotOwner
        });
    },
    postRender: function() {
        var marginActions = $('section.actions').height() + $('section.actions > span').height() + 20;

        this.galery = '';
        this.mySwiperGal = '';
        this.dictionary = translations.get(this.app.session.get('selectedLanguage'));
        this.messages = {
            'msgSend': this.dictionary['comments.YourMessageHasBeenSent'].replace(/<br \/>/g,''),
            'addedFav': this.dictionary['itemheader.AddedFavorites'],
            'removedFav': this.dictionary['itemheader.RemovedFavorites'],
            'addFav': this.dictionary['itemgeneraldetails.addFavorites'],
            'removeFav': this.dictionary['item.RemoveFromFavorites']
        };
        this.showMessage();
        this.galleries();
        $('.footer_footer_view').css('margin-bottom', marginActions + 'px');
        this.$(window).on('resize', this.resize).trigger('resize');
        this.paginationSize();
    },
    events: {
        'click section#itemPage section.onePicture .slide div' : 'showOnePicture',
        'click .galActions .close':'closeGallery',
        'click .zd-gallery': 'showGallery',
        'click .galActions .next': 'nextImage',
        'click .galActions .prev': 'previouImage',
        'click .galActions .pause': 'pause',
        'click #galCont .swiper-wrapper , #galContOne': 'hideTitleActions',
        'click .fav': 'favorites',
        'click .share': 'share',
        'click .popup-close': 'popupClose',
        'onpopstate window': 'onPopState'
    },
    showMessage: function() {
        var $msg = this.$('.msg-resulted');

        if (this.options.sent && this.options.sent === 'true') {
            $msg.find('span').text(this.messages.msgSend);
            $msg.addClass('visible');
            setTimeout(function(){
                $msg.removeClass('visible');
            }, 3000);
        }
    },
    galleries: function() {
        this.galery = $('.zd-gallery').swiper({
            onSlideChangeStart: function(){
                updateNavPosition();
            }
        });
        var that = this.galery;

        var galeryNavigator = $('.swiper-nav').swiper({
            visibilityFullFit: true,
            slidesPerView:'auto',
            onSlideClick: function(){
                that.swipeTo( galeryNavigator.clickedSlideIndex );
            }
        });

        var updateNavPosition = function(){
            $('.swiper-nav .active-nav').removeClass('active-nav');
            var activeNav = $('.swiper-nav .swiper-slide').eq(that.activeIndex).addClass('active-nav');
            if (!activeNav.hasClass('swiper-slide-visible')) {
                if (activeNav.index()>galeryNavigator.activeIndex) {
                    var thumbsPerNav = Math.floor(galeryNavigator.width/activeNav.width())-1;
                    galeryNavigator.swipeTo(activeNav.index()-thumbsPerNav);
                }
                else {
                    galeryNavigator.swipeTo(activeNav.index());
                }
            }
        };

        var relatedAds = this.$('.swiper-related').swiper({
            visibilityFullFit: true,
            slidesPerView: 'auto',
            preventLinks:false,
            mode:'horizontal'
        });
    },
    showOnePicture: function(e) {
        e.preventDefault();
        $('body').addClass('noscroll');
        history.pushState(null, "", window.location.pathname);
        $('#galContOne').addClass('visible');
    },
    closeGallery: function(e) {
        e.preventDefault();
        $('.galCont').removeClass('visible');
        $('body').removeClass('noscroll');
    },
    showGallery: function(e) {
        e.preventDefault();

        var galery = this.galery;

        $('body').addClass('noscroll');
        history.pushState(null, "", window.location.pathname);
        $('#galCont').addClass('visible');
        if (this.mySwiperGal === '') {
            this.mySwiperGal = $('.swiper-container-gal').swiper({
                mode:'horizontal',
                loop: true,
                initialSlide: galery.activeLoopIndex,
                autoplay: 2000
            });
        }
        else {
            this.mySwiperGal.swipeTo(galery.activeLoopIndex,750);
        }
    },
    nextImage: function(e) {
        e.preventDefault();
        this.mySwiperGal.swipeNext();
    },
    previouImage: function(e) {
        e.preventDefault();
        this.mySwiperGal.swipePrev();
    },
    pause: function(e) {
        e.preventDefault();
        var that = $(e.currentTarget);
        var msg = this.mySwiperGal;

        if ($(that).hasClass('play')) {
            msg.startAutoplay();
        }
        else {
            msg.stopAutoplay();
        }
        $('.pause').toggleClass('play');
    },
    hideTitleActions: function(e) {
        e.preventDefault();
        $('.galCont .galActions , .galCont .title').fadeToggle(500);
    },
    favorites: function(e) {
        var $that = $(e.currentTarget);

        if ($that.attr('href') == '#') {
            e.preventDefault();

            var user = this.app.session.get('user');
            var itemId = $that.data('itemid');
            var url = [];
            var $msg = $('.msg-resulted');

            $msg.find('span').text($that.hasClass('add') ? this.messages.addedFav : this.messages.removedFav);

            url.push('/users/');
            url.push(user.userId);
            url.push('/favorites/');
            url.push(itemId);
            url.push(($that.hasClass('add') ? '' : '/delete'));
            url.push('?token=');
            url.push(user.token);

            $('.loading').show();
            helpers.dataAdapter.post(this.app.req, url.join(''), {
                query: {
                    platform: this.app.session.get('platform')
                },
                cache: false,
                json: true,
                done: function() {
                    $that.toggleClass('add remove');
                    $that.text($that.hasClass('add') ? this.messages.addFav : this.messages.removeFav);
                    $that.attr('data-qa', $that.attr('data-qa') == 'add-favorite' ? 'remove-favorite' : 'add-favorite');

                    $msg.addClass('visible');
                    setTimeout(function(){
                        $msg.removeClass('visible');
                        $msg.find('span').text('');
                    }, 3000);
                }.bind(this),
                fail: function() {
                    console.log('Error');
                }
            }, function always() {
                $('.loading').hide();
            });
        }
    },
    share: function(e) {
        e.preventDefault();
        $('body').addClass('noscroll');
        history.pushState(null, "", window.location.pathname);
        $('#share').addClass('visible');
    },
    popupClose: function(e) {
        e.preventDefault();
        $('body').removeClass('noscroll');
        $(this).parents('.popup').removeClass('visible');
    },
    onPopState: function(e) {
        var $galCont = $('#galCont');
        var $galContOne = $('#galContOne');
        var $share = $('#share');

        if($galCont.is('.visible')) {
            $galCont.removeClass('visible');
            $('body').removeClass('noscroll');
        }
        else if($galContOne.is('.visible')) {
            $galContOne.removeClass('visible');
            $('body').removeClass('noscroll');
        }
        else if($share.is('.visible')) {
            $share.removeClass('visible');
            $('body').removeClass('noscroll');
        }
    },
    remove: function() {
        $(window).off('resize', this.resize);
        Base.prototype.remove.apply(this, arguments);
    },
    resize: function() {
        $('section#itemPage').css('margin-bottom' , ($('.actions').height()+20)+'px');
        var paginationCount = $('.slidePagination span').length + 2;
        var windowSize = $(window).width();
        var paginationWidth = windowSize / paginationCount;
        var paginationMargin = paginationWidth / paginationCount;

        paginationWidth = paginationWidth - paginationMargin;
        $('.slidePagination span').css('width' , paginationWidth+'px');
        $('.slidePagination span').css('margin' , '0 '+paginationMargin+'px');
    },
    paginationSize: function () {
        var paginationCount = $('.slidePagination span').length + 1;
        var windowSize = $(window).width();
        var paginationWidth = windowSize / paginationCount;
        var paginationMargin = paginationWidth / paginationCount;

        paginationWidth = paginationWidth - paginationMargin;
        $('.slidePagination span').css('width' , paginationWidth+'px');
        $('.slidePagination span').css('margin' , '0 '+paginationMargin+'px');
    },
    getItem: function() {
        this.item = this.item || (this.options.item && this.options.item.toJSON ? this.options.item : new Item(this.options.item || {}, {
            app: this.app
        }));
        return this.item;
    },
    getCategories: function() {
        this.categories = this.categories || (this.options.categories && this.options.categories.toJSON ? this.options.categories : new Categories(this.options.categories || {}, {
            app: this.app
        }));
        return this.categories;
    }
});

module.exports.id = 'items/newitempage/show';