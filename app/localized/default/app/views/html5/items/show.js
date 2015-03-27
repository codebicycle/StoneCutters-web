'use strict';

var _ = require('underscore');
var asynquence = require('asynquence');
var Base = require('../../../../../common/app/bases/view').requireView('items/show');
var Categories = require('../../../../../../collections/categories');
var Item = require('../../../../../../models/item');
var helpers = require('../../../../../../helpers');

module.exports = Base.extend({
    className: 'items_show_view_default',
    postRender: function() {
        var that = this;

        var marginActions = $('section.actions').height() + $('section.actions > span').height() + 15;
        $('.footer_footer_view').css('margin-bottom', marginActions + 'px');

        that.messages = {
            'addFav': this.$('.addFav').val(),
            'removeFav': this.$('.removeFav').val()
        };

        var galery = this.$('.swiper-container').swiper({
            mode:'horizontal',
            loop: true,
            pagination: '.slidePagination',
            paginationClickable: true,
            initialSlide: 0
        });
        this.$(window).on('resize', this.resize).trigger('resize');
        this.$( '.actions .email' ).click(function onClick() {
            $('html, body').animate({
                scrollTop: this.$('.reply').offset().top
            }, 400);
        }.bind(this));
        this.$('section#itemPage section#onePicture .slide div').click(function(e) {
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
        var mySwiperGal = '';
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
                mySwiperGal.swipeTo(galery.activeLoopIndex,500);
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
                var $msg = $('.msgCont .msgCont-wrapper .msgCont-container');
                $msg.text($this.hasClass('add') ? that.messages.addFav : that.messages.removeFav);

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
                        $this.attr('data-qa', $this.attr('data-qa') == 'add-favorite' ? 'remove-favorite' : 'add-favorite');

                        $('.msgCont').addClass('visible');
                        setTimeout(function(){
                            $('.msgCont').removeClass('visible');
                            $msg.text('');
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

        this.attachTrackMe(function(category, action) {
            var itemId = $('.itemId').val();
            var itemCategory = $('.itemCategory').val();
            var itemSubcategory = $('.itemSubcategory').val();

            return {
                action: action,
                custom: [category, itemCategory, itemSubcategory, action, itemId].join('::')
            };
        }.bind(this));
    },
    remove: function() {
        $(window).off('resize', this.resize);
        Base.prototype.remove.apply(this, arguments);
    },
    resize: function() {
        $('section#itemPage').css('margin-bottom' , ($('#actions').height()+20)+'px');
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
