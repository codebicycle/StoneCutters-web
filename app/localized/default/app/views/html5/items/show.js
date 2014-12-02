'use strict';

var Base = require('../../../../../common/app/bases/view').requireView('items/show');
var _ = require('underscore');
var asynquence = require('asynquence');
var helpers = require('../../../../../../helpers');
var statsd = require('../../../../../../../shared/statsd')();

module.exports = Base.extend({
    className: 'items_show_view',
    wapAttributes: {
        cellpadding: 0
    },
    postRender: function() {
        var that = this;

        var marginActions = $('section.actions').height() + $('section.actions > span').height() + 15;
        $('.footer_footer_view').css('margin-bottom', marginActions + 'px');

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

        this.$('#replyForm .submit').click(function onSubmit(e) {
            e.preventDefault();
            var message = $('.message').val();
            var email = $('.email').val();
            var name = $('.name').val();
            var phone = $('.phone').val();
            var itemId = $('.itemId').val();
            var errMsgMail = $('.errMsgMail').val();
            var errMsgMandatory = $('.errMsgMandatory').val();
            var msgSend = $('.msgSend').val();
            var url = [];

            url.push('/items/');
            url.push(itemId);
            url.push('/reply');
            url = helpers.common.fullizeUrl(url.join(''), this.app);
            $('.loading').show();

            var validate = function(done) {
                if (this.validForm(message, email)) {
                    done();
                }
                else {
                    done.abort();
                    always();
                    trackFail();
                }
            }.bind(this);

            var post = function(done) {
                $.ajax({
                    type: 'POST',
                    url: helpers.common.link(url, this.app),
                    cache: false,
                    data: {
                        message: message,
                        email: email,
                        name:name,
                        phone:phone
                    }
                })
                .done(done)
                .fail(done.fail)
                .always(always);
            }.bind(this);

            var success = function(done, data) {
                var $msg = $('.msgCont .msgCont-wrapper .msgCont-container');

                $('.loading').hide();
                $('body').removeClass('noscroll');
                $('.message').val('');
                $('.name').val('');
                $('.email').val('');
                $('.phone').val('');
                $msg.text(this.messages.msgSend);
                $('.msgCont').addClass('visible');
                setTimeout(function(){
                    $('.msgCont').removeClass('visible');
                }, 3000);
                done(data);
            }.bind(this);

            var trackEvent = function(done, data) {
                var category = $('.itemCategory').val();
                var subcategory = $('.itemSubcategory').val();

                this.track({
                    category: 'Reply',
                    action: 'ReplySuccess',
                    custom: ['Reply', category, subcategory, 'ReplySuccess', itemId].join('::')
                });
                done();
            }.bind(this);

            var trackTracking = function(done, data) {
                var $view = $('#partials-tracking-view');
                var tracking;

                tracking = $('<div></div>').append(data);
                tracking = $('#partials-tracking-view', tracking);
                if (tracking.length) {
                    $view.trigger('updateHtml', tracking.html());
                }
                done();
            }.bind(this);

            var trackGraphite = function(done) {
                var location = this.app.session.get('location');
                var platform = this.app.session.get('platform');

                statsd.increment([location.name, 'reply', 'success', platform]);
                done();
            }.bind(this);

            var fail = function(data) {
                var messages = JSON.parse(data.responseText);

                $('small.email').text(messages[0].message).removeClass('hide');
                trackFail();
            }.bind(this);

            var trackFail = function() {
                var location = this.app.session.get('location');
                var platform = this.app.session.get('platform');

                statsd.increment([location.name, 'reply', 'error', platform]);
            }.bind(this);

            var always = function() {
                $('.loading').hide();
            }.bind(this);

            asynquence().or(fail)
                .then(validate)
                .then(post)
                .gate(success, trackEvent, trackTracking, trackGraphite);
        }.bind(this));

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

        this.$('form#replyForm').on('change', 'input.name , input.email , textarea.message', function (e) {
            var value = $(this).val();
            var field = $(this).attr('class');

            if(that.isEmpty(value,field) && field == 'email'){
                that.isEmail(value,field);
            }
        });
        this.attachTrackMe(function(category, action) {
            var itemId = $('.itemId').val();
            var itemCategory = $('.itemCategory').val();
            var itemSubcategory = $('.itemSubcategory').val();
            if (action === 'ClickReply') {
                var message = $('.message').val();
                var email = $('.email').val();
                var name = $('.name').val();

                if (!that.validForm(message, email)) {
                    action += '_Error';
                    if (!that.isEmpty(email, 'email')){
                        action += 'EmailEmpty';
                        statsd.increment([this.app.session.get('location').name, this.app.session.get('platform'), 'reply', 'error', 'EmailEmpty']);
                    }
                    else if (!that.isEmail(email, 'email')) {
                        action += 'EmailWrong';
                        statsd.increment([this.app.session.get('location').name, this.app.session.get('platform'), 'reply', 'error', 'EmailWrong']);
                    }
                    if (!that.isEmpty(message, 'message')) {
                        action += 'MessageEmpty';
                        statsd.increment([this.app.session.get('location').name, this.app.session.get('platform'), 'reply', 'error', 'MessageEmpty']);
                    }
                    if (!that.isEmpty(name, 'name')) {
                        action += 'NameEmpty';
                    }
                }
            }
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
    validForm: function (message, email) {
        var valMail = true;
        var valMsg = true;

        valMail = this.isEmpty(email,'email');
        if(valMail){
            valMail = this.isEmail(email,'email');
        }

        valMsg = this.isEmpty(message,'message');

        return (valMail && valMsg);
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

module.exports.id = 'items/show';