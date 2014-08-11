var Base = require('../../../../../common/app/bases/view').requireView('items/show');
var _ = require('underscore');
var helpers = require('../../../../../../helpers');
var asynquence = require('asynquence');

module.exports = Base.extend({
    className: 'items_show_view',

    postRender: function() {
		var that = this;

        this.$('span.addPhoto').click(function(e) {
            e.preventDefault();
            $('.message').val('Tenho interesse e gostaria de ver fotos. Você pode, por favor, adicionar fotos no seu anúncio?');
        });

        this.$('#photos ul li').hover(function(e) {
            e.preventDefault();
            if(!$(this).hasClass('active')) {
                var image = $(this).attr('data-image');
                var currentImage = $(this).css('background-image');
                $('#photos ul li').removeClass('active');
                $(this).addClass('active');
                $('#photos .bigPhoto').css('background-image', currentImage);
                var newImg = new Image();
                newImg.src = image;
                newImg.onload = function() {
                    $('#photos .bigPhoto').css('background-image', 'url(' + image + ')');
                };
                
            }
        });
        

		that.messages = {'errMsgMail': this.$('.errMsgMail').val(), 'errMsgMandatory': this.$('.errMsgMandatory').val(), 'msgSend': this.$('.msgSend').val().replace(/<br \/>/g,''), 'addFav': this.$('.addFav').val(), 'removeFav': this.$('.removeFav').val()};

		this.$('p.replySuccses span').click(function(e) {
            e.preventDefault();
            $('.replySuccses').addClass('hide');
            $('#replyForm .submit').removeClass('hide');
			$('#replyForm p').removeClass('hide');
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

            var validate = function(done) {
                if (this.validForm(message, email)) {
					$('.loading').removeClass('hide');
					$('#replyForm .submit').addClass('hide');
					$('#replyForm p').addClass('hide');
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
                var category = $('.itemCategory').val();
                var subcategory = $('.itemSubcategory').val();

                $('.message').val('');
                $('.name').val('');
                $('.email').val('');
                $('.phone').val('');
                
                $('.replySuccses').removeClass('hide');
                this.track({
                    category: 'Reply',
                    action: 'ReplySuccess',
                    custom: ['Reply', category, subcategory, 'ReplySuccess', itemId].join('::')
                });
                
                
            }.bind(this);

            var track = function(done) {
                var url = helpers.common.fullizeUrl('/analytics/graphite.gif', this.app);

                $.ajax({
                    url: helpers.common.link(url, this.app, {
                        metric: 'reply,success',
                        location: this.app.session.get('location').name,
                        platform: this.app.session.get('platform')
                    }),
                    cache: false
                })
                .done(done)
                .fail(done.fail);
            }.bind(this);

            var fail = function(data) {
                var messages = JSON.parse(data.responseText);

                $('small.email').text(messages[0].message).removeClass('hide');
                trackFail();
            }.bind(this);

            var trackFail = function() {
                var url = helpers.common.fullizeUrl('/analytics/graphite.gif', this.app);

                $.ajax({
                    url: helpers.common.link(url, this.app, {
                        metric: 'reply,error',
                        location: this.app.session.get('location').name,
                        platform: this.app.session.get('platform')
                    }),
                    cache: false
                });
            }.bind(this);

            var always = function() {
                $('.loading').addClass('hide');
            }.bind(this);


            asynquence().or(fail)
                .then(validate)
                .then(post)
                .gate(success, track);
        }.bind(this));
		
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

            if (action === 'ClickReply') {
                var message = $('.message').val();
                var email = $('.email').val();
                var name = $('.name').val();

                if (!that.validForm(message, email)) {
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
            $('small.'+field).addClass('hide').empty();
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

});