'use strict';
var Base = require('../../../../../common/app/bases/view').requireView('items/reply');
var _ = require('underscore');
var asynquence = require('asynquence');
var helpers = require('../../../../../../helpers');
var statsd = require('../../../../../../../shared/statsd')();

module.exports = Base.extend({
    className: 'items_reply_view',
    getTemplateData: function() {
        var data = Base.prototype.getTemplateData.call(this);
        return _.extend({}, data, {});
    },
    postRender: function() {
        var that = this;
        that.messages = {
            'errMsgMail': this.$('.errMsgMail').val(),
            'errMsgMandatory': this.$('.errMsgMandatory').val(),
            'msgSend': this.$('.msgSend').val().replace(/<br \/>/g,''),
            'addedFav': this.$('.addedFav').val(),
            'removedFav': this.$('.removedFav').val(),
            'addFav': this.$('.addFav').val(),
            'removeFav': this.$('.removeFav').val()
        };
        this.$('#replyForm .submit').click(function onSubmit(e) {
            e.preventDefault();
            var message = $('.message').val();
            var email = $('input.email').val();
            var name = $('input.name').val();
            var phone = $('input.phone').val();
            var itemId = $('input.itemId').val();
            var errMsgMail = $('.errMsgMail').val();
            var errMsgMandatory = $('.errMsgMandatory').val();
            var msgSend = $('.msgSend').val();
            var url = [];
            console.log('message:', message);
            console.log('email:', email);
            console.log('name:', name);
            console.log('phone:', phone);
            console.log('itemId:', itemId);
            console.log('errMsgMail:', errMsgMail);
            console.log('errMsgMandatory:', errMsgMandatory);
            console.log('msgSend', msgSend);
            url.push('/items/');
            url.push(itemId);
            url.push('/reply');
            url = helpers.common.fullizeUrl(url.join(''), this.app);
            $('.loading').show();
            var validate = function(done) {
                if (this.validForm(message, email)) {
                    console.log('si');
                    done();
                }
                else {
                    console.log('no');
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
                    helpers.common.redirect.call(this.App.router, 'iid-' + itemId , null, {
                        status: 200
                    });
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
}
});
