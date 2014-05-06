'use strict';

var BaseView = require('../base');
var _ = require('underscore');

module.exports = BaseView.extend({
    className: 'items_show_view',
    getTemplateData: function() {
        var data = BaseView.prototype.getTemplateData.call(this);
        data.category_name = this.options.category_name;
        data.item.location.stateName = data.item.location.children[0].name;
        data.item.location.cityName = data.item.location.children[0].children[0].name;
        data.item.description = data.item.description.replace(/(<([^>]+)>)/ig,'');
        
        return data;
    },
    postRender: function() {
        var galery = $('.swiper-container').swiper({
            mode:'horizontal',
            loop: true,
            pagination: '.slidePagination',
            paginationClickable: true,
            initialSlide: 0
        });
        var relatedAds = $('.swiper-containerRA').swiper({
            mode:'horizontal',
            slidesPerView: 3,
            preventLinks:false
        });
        $(window).on('resize', this.resize).trigger('resize');
        $( '.actions .email' ).click(function() {
            $('html, body').animate({scrollTop: $('.reply').offset().top}, 400);
        });
        $('section#itemPage section#onePicture .slide div').click(function(e) {
            e.preventDefault();
            $('body').addClass('noscroll');
            $('#galContOne').addClass('visible');
        });
        $('.galActions .close').click(function(e) {
            e.preventDefault();
            $('.galCont').removeClass('visible');
            $('body').removeClass('noscroll');
        });
        var mySwiperGal = '';
        $('section.swiper-container').click(function(e) {
            e.preventDefault();
            $('body').addClass('noscroll');
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
        $('.galActions .next').click(function(e) {
            e.preventDefault();
            mySwiperGal.swipeNext();
        });
        $('.galActions .prev').click(function(e) {
            e.preventDefault();
            mySwiperGal.swipePrev();
        });

        $('.galActions .pause').click(function(e) {
            e.preventDefault();
            if($(this).hasClass('play')){
                mySwiperGal.startAutoplay();
            }else{
                mySwiperGal.stopAutoplay();
            }
            $('.pause').toggleClass('play');
            
        });
        $('#galCont .swiper-wrapper , #galContOne').click(function(e) {
            e.preventDefault();
            $('.galCont .galActions , .galCont .title').fadeToggle(500);

        });
    },
    remove: function() {
        $(window).off('resize', this.resize);
        BaseView.prototype.remove.apply(this, arguments);
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
    }
});

module.exports.id = 'items/show';
