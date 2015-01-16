'use strict';

var Base = require('../../../../../common/app/bases/view').requireView('items/show');
var _ = require('underscore');
var asynquence = require('asynquence');
var helpers = require('../../../../../../helpers');
var statsd = require('../../../../../../../shared/statsd')();
var translations = require('../../../../../../../shared/translations');

module.exports = Base.extend({
    className: 'items_show_view',
    wapAttributes: {
        cellpadding: 0
    },
    initialize: function() {
        this.dictionary = translations.get(this.app.session.get('selectedLanguage'));
    },
    postRender: function() {
        var that = this;
        var marginActions = $('section.actions').height() + $('section.actions > span').height() + 20;
        var url = this.app.session.get('url');
        var msgSent = helpers.common.getUrlParameters('sent', url, true);
        var $msg = this.$('.msg-resulted');
        var galery;
        var relatedAds;
        var mySwiperGal = '';
        var messages;
        var updateNavPosition;
        var galeryNavigator;

        this.dictionary = translations.get(this.app.session.get('selectedLanguage'));
        that.messages = {
            'msgSend': this.dictionary['comments.YourMessageHasBeenSent'].replace(/<br \/>/g,''),
            'addedFav': this.dictionary['itemheader.AddedFavorites'],
            'removedFav': this.dictionary['itemheader.RemovedFavorites'],
            'addFav': this.dictionary['itemgeneraldetails.addFavorites'],
            'removeFav': this.dictionary['item.RemoveFromFavorites']
        };

        $('.footer_footer_view').css('margin-bottom', marginActions + 'px');

        if (msgSent && msgSent == 'true') {
            $msg.find('span').text(that.messages.msgSend);
            $msg.addClass('visible');
            setTimeout(function(){
                $msg.removeClass('visible');
            }, 3000);
        }

        galery = this.$('.swiper-container').swiper({
            onSlideChangeStart: function(){
                updateNavPosition();
            }
        });
        galeryNavigator = $('.swiper-nav').swiper({
            visibilityFullFit: true,
            slidesPerView:'auto',
            onSlideClick: function(){
                galery.swipeTo( galeryNavigator.clickedSlideIndex );
            }
        });
        updateNavPosition = function(){
            $('.swiper-nav .active-nav').removeClass('active-nav');
            var activeNav = $('.swiper-nav .swiper-slide').eq(galery.activeIndex).addClass('active-nav');
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

        relatedAds = this.$('.swiper-containerRA').swiper({
            mode:'horizontal',
            slidesPerView: 3,
            preventLinks:false
        });
        this.$(window).on('resize', this.resize).trigger('resize');
        this.$('section#itemPage section.onePicture .slide div').click(function(e) {
            e.preventDefault();
            $('body').addClass('noscroll');
            history.pushState(null, "", window.location.pathname);
            $('#galContOne').addClass('visible');
        });
        this.$('.galActions .close').click(function(e) {
            e.preventDefault();
            $('.galCont').removeClass('visible');
            $('body').removeClass('noscroll');
        });

        this.$('section.swiper-container').click(function(e) {
            e.preventDefault();
            $('body').addClass('noscroll');
            history.pushState(null, "", window.location.pathname);
            $('#galCont').addClass('visible');

            if(mySwiperGal === ''){
                mySwiperGal = $('.swiper-container-gal').swiper({
                    mode:'horizontal',
                    loop: true,
                    initialSlide: galery.activeLoopIndex,
                    autoplay: 2000,

                });
            }else{
                mySwiperGal.swipeTo(galery.activeLoopIndex,750);
            }
        });
        this.$('.galActions .next').click(function(e) {
            e.preventDefault();
            mySwiperGal.swipeNext();
        });
        this.$('.galActions .prev').click(function(e) {
            e.preventDefault();
            mySwiperGal.swipePrev();
        });

        this.$('.galActions .pause').click(function(e) {
            e.preventDefault();
            if($(this).hasClass('play')){
                mySwiperGal.startAutoplay();
            }else{
                mySwiperGal.stopAutoplay();
            }
            $('.pause').toggleClass('play');

        });
        this.$('#galCont .swiper-wrapper , #galContOne').click(function(e) {
            e.preventDefault();
            $('.galCont .galActions , .galCont .title').fadeToggle(500);
        });

        this.paginationSize();

        this.$('.fav').click(function(e) {
            var $this = $(e.currentTarget);

            if ($this.attr('href') == '#') {
                e.preventDefault();
                var user = that.app.session.get('user');
                var itemId = $this.data('itemid');
                var url = [];
                var $msg = $('.msg-resulted');


                $msg.find('span').text($this.hasClass('add') ? that.messages.addedFav : that.messages.removedFav);

                url.push('/users/');
                url.push(user.userId);
                url.push('/favorites/');
                url.push(itemId);
                url.push(($this.hasClass('add') ? '' : '/delete'));
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
                        $this.toggleClass('add remove');
                        $this.text($this.hasClass('add') ? that.messages.addFav : that.messages.removeFav);
                        $this.attr('data-qa', $this.attr('data-qa') == 'add-favorite' ? 'remove-favorite' : 'add-favorite');

                        $msg.addClass('visible');
                        setTimeout(function(){
                            $msg.removeClass('visible');
                            $msg.find('span').text('');
                        }, 3000);
                    },
                    fail: function() {
                        console.log('Error');
                    }
                }, function always() {
                    $('.loading').hide();
                });
            }
        }.bind(this));
        this.$('.share').click(function(e) {
            e.preventDefault();
            $('body').addClass('noscroll');
            history.pushState(null, "", window.location.pathname);
            $('#share').addClass('visible');
        });
        this.$('.popup-close').click(function(e) {
            e.preventDefault();
            $('body').removeClass('noscroll');
            $(this).parents('.popup').removeClass('visible');
        });

        //window History
        window.onpopstate = function(e) {
            var $galCont = $('#galCont');
            var $galContOne = $('#galContOne');
            var $share = $('#share');

            if($galCont.is('.visible')){
                $galCont.removeClass('visible');
                $('body').removeClass('noscroll');
            }else if($galContOne.is('.visible')){
                $galContOne.removeClass('visible');
                $('body').removeClass('noscroll');
            }else if($share.is('.visible')){
                $share.removeClass('visible');
                $('body').removeClass('noscroll');
            }
        };
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
    }
});
