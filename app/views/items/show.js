'use strict';

var BaseView = require('../base');
var _ = require('underscore');
var helpers = require('../../helpers');

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
        data.item.date.since = helpers.timeAgo(data.item.date);

        return data;
    },
    postRender: function() {
        var that = this;

        $('html, body').scrollTop(0);

        var marginActions = $('section.actions').height() + $('section.actions > span').height() + 15;
        this.$('.footer_footer_view').css('margin-bottom', marginActions + 'px');

        that.messages = {'errMsgMail': this.$('.errMsgMail').val(), 'errMsgMandatory': this.$('.errMsgMandatory').val(), 'msgSend': this.$('.msgSend').val().replace(/<br \/>/g,''), 'addFav': this.$('.addFav').val(), 'removeFav': this.$('.removeFav').val()};

        var galery = this.$('.swiper-container').swiper({
            mode:'horizontal',
            loop: true,
            pagination: '.slidePagination',
            paginationClickable: true,
            initialSlide: 0
        });
        var relatedAds = this.$('.swiper-containerRA').swiper({
            mode:'horizontal',
            slidesPerView: 3,
            preventLinks:false
        });
        this.$(window).on('resize', this.resize).trigger('resize');
        this.$( '.actions .email' ).click(function() {
            $('html, body').animate({scrollTop: $('.reply').offset().top}, 400);
        });
        this.$('section#itemPage section#onePicture .slide div').click(function(e) {
            e.preventDefault();
            $('body').addClass('noscroll');
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

        this.$('.fav').click(function(e) {
            var $this = $(this);

            if ($this.attr('href') == '#') {
                e.preventDefault();
                var session = that.app.get('session');
                var user = session.user;
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
                helpers.dataAdapter.request('post', url.join(''), {
                    cache: false,
                    json: true,
                    done: function() {
                        $this.toggleClass('add remove');
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
        });
        this.$('.share').click(function(e) {
            e.preventDefault();
            $('body').addClass('noscroll');
            $('#share').addClass('visible');
        });
        this.$('.popup-close').click(function(e) {
            e.preventDefault();
            $('body').removeClass('noscroll');
            $(this).parents('.popup').removeClass('visible');
        });

        this.$('#replyForm .submit').click(function() {
            var $this = $(this);

            var message = $('.message').val();
            var email = $('.email').val();
            var name = $('.name').val();
            var phone = $('.phone').val();

            var errMsgMail = $('.errMsgMail').val();
            var errMsgMandatory = $('.errMsgMandatory').val();
            var msgSend = $('.msgSend').val();

            var api = that.app.get('apiPath');
            var session = that.app.get('session');
            var itemId = $('.itemId').val();
            var url = [];

            url.push(api);
            url.push('/items/');
            url.push(itemId);
            url.push('/messages');

            if (that.validForm(message, name, email)) {
                $('.loading').show();
                $.ajax({
                    type: 'POST',
                    url: url.join(''),
                    cache: false,
                    data: {
                        message: message,
                        email: email,
                        name:name,
                        phone:phone
                    }
                })
                .done(function (data) {
                    var analytics;
                    var $msg = $('.msgCont .msgCont-wrapper .msgCont-container');
                    var category = $('.itemCategory').val();
                    var subcategory = $('.itemSubcategory').val();

                    $('.loading').hide();
                    $('body').removeClass('noscroll');
                    $('.message').val('');
                    $('.name').val('');
                    $('.email').val('');
                    $('.phone').val('');
                    $msg.text(that.messages.msgSend);

                    analytics = $('<div></div>').append(data);
                    analytics = $('#replySuccess', analytics);
                    $msg.append(analytics.length ? analytics : '');
                    that.track({
                        category: 'Reply',
                        action: 'ReplySuccess',
                        custom: ['Reply', category, subcategory, 'ReplySuccess', itemId].join('::')
                    });

                    $('.msgCont').addClass('visible');
                    setTimeout(function(){
                        $('.msgCont').removeClass('visible');
                    }, 3000);
                })
                .fail(function (data) {
                    var messages = JSON.parse(data.responseText);
                    $('small.email').text(messages[0].message).removeClass('hide');
                })
                .always(function () {
                    $('.loading').hide();
                });
            }

        });

        this.$('form#replyForm').on('change', 'input.name , input.email , textarea.message', function (e) {
            var value = $(this).val();
            var field = $(this).attr('class');

            if(that.isEmpty(value,field) && field == 'email'){
                that.isEmail(value,field);
            }
        });
        this.attachTrackMe(this.className, function(category, action) {
            var itemId = $('.itemId').val();
            var itemCategory = $('.itemCategory').val();
            var itemSubcategory = $('.itemSubcategory').val();

            if (action === 'clickReply') {
                var message = $('.message').val();
                var email = $('.email').val();
                var name = $('.name').val();

                if (!that.validForm(message, name, email)) {
                    action += '_Error';

                    if (!that.isEmpty(email, 'email')){
                        action += 'EmailEmpty';
                    }
                    else if (!that.isEmail(email, 'email')) {
                        action += 'EmailWrong';
                    }
                    action += (that.isEmpty(message, 'message') ? '' : 'MessageEmpty');
                    action += (that.isEmpty(name, 'name') ? '' : 'NameEmpty');
                }
            }
            return {
                action: action,
                custom: [category, itemCategory, itemSubcategory, action, itemId].join('::')
            };
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
            $('small.'+field).text(this.messages.errMsgMail).removeClass('hide');
            return false;
        }else{
            $('small.'+field).removeClass('hide').empty();
            return true;
        }

    },
    isEmpty: function (value,field) {
        if(value === ''){
            $('small.'+field).text(this.messages.errMsgMandatory).removeClass('hide');
            return false;
        }else{
            $('small.'+field).addClass('hide').empty();
            return true;
        }
    }

});

module.exports.id = 'items/show';
