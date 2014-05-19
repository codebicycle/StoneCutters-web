'use strict';

var BaseView = require('../base');
var _ = require('underscore');

module.exports = BaseView.extend({
    className: 'items_show_view',
    wapAttributes: {
        cellpadding: 0
    },
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

        $('.fav').click(function(e) {
            if ($(this).attr('href') == '#') {
                e.preventDefault();
                var element = $(this);
                var itemId = element.attr('data-itemId');
                var url = (element.hasClass('add')) ? '/items/'+itemId+'/favorite' : '/items/'+itemId+'/favorite/delete';
                $.ajax({
                    type: "GET",
                    url: url,
                    cache: false,
                    success: function(data) {
                        element.toggleClass('add remove');
                    },
                    error: function() {
                        console.log('Error');
                    }
                });
            }
        });
        $('.share').click(function(e) {
            e.preventDefault();
            $('body').addClass('noscroll');
            $('#share').addClass('visible');
        });
        $('.popup-close').click(function(e) {
            e.preventDefault();
            $('body').removeClass('noscroll');
            $(this).parents('.popup').removeClass('visible');
        });
        var self = this;
        $('#replyForm .submit').click(function() {
            var message = $('.message').val();
            var email = $('.email').val();
            var name = $('.name').val();
            var phone = $('.phone').val();
            var itemId = $('.itemId').val();
            var data = {message: message,email: email, name:name,phone:phone};
            if(self.validForm(message, name, email)){
                $('.loading').show();
                $('body').addClass('noscroll');
                var url = '/items/'+itemId+'/reply';
                $.ajax({
                    type: "POST",
                    url: url,
                    cache: false,
                    data: data,
                    success: function(data) {
                        $('.loading').hide();
                        $('body').removeClass('noscroll');
                        $('.message').val('');
                        $('.name').val('');
                        $('.email').val('');
                        $('.phone').val('');
                        $('.msgCont .msgCont-wrapper .msgCont-container').text('Se envio');
                        $('.msgCont').addClass('visible');
                        setTimeout(function(){
                            $('.msgCont').removeClass('visible');
                       }, 3000);
                    },
                    error: function() {
                        $('small.email').text('error mail smaug').removeClass('hide');
                    }
                });
            }

        });
        $('form#replyForm').on('change', 'input.name , input.email , textarea.message', function (e) {
            var value = $(this).val();
            var field = $(this).attr('class');

            if(self.isEmpty(value,field) && field == 'email'){
                self.isEmail(value,field);
            }
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
    },
    validForm: function (message, name, email) {
        var valMail = true;
        var valName = true;
        var valMsg = true;

        valMail = this.isEmpty(email,'email');
        if(valMail){
            valMail = this.isEmail(email,'email');
        }

        valName = this.isEmpty(name,'name');
        valMsg = this.isEmpty(message,'message');

        return (valMail && valName && valMsg);
    },
    isEmail: function (value,field) {
            var expression = /^[_a-zA-Z0-9-]+(\.[_a-zA-Z0-9-]+)*@[a-zA-Z0-9-]+(\.[a-zA-Z0-9-]+)*(\.[a-zA-Z]{2,6})$/;
            if(!expression.test(value)){
                $('small.'+field).text('no mail').removeClass('hide');
                return false;
            }else{
                $('small.'+field).removeClass('hide').empty();
                return true;
            }

        },

    isEmpty: function (value,field) {

            if(value === ''){
                $('small.'+field).text('mandatory').removeClass('hide');
                return false;
            }else{
                $('small.'+field).addClass('hide').empty();
                return true;
            }
    }

});

module.exports.id = 'items/show';
