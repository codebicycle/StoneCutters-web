'use strict';
var Base = require('../../../../../common/app/bases/view');
var _ = require('underscore');
var asynquence = require('asynquence');
var helpers = require('../../../../../../helpers');
var statsd = require('../../../../../../../shared/statsd')();

module.exports = Base.extend({
    className: 'items_reply_view',
    messages: {},
    getTemplateData: function() {
        var data = Base.prototype.getTemplateData.call(this);

        return _.extend({}, data, {});
    },
    postRender: function() {
        this.app.router.once('action:end', this.onStart);
        this.app.router.once('action:start', this.onEnd);
        this.attachTrackMe();

        var that = this;
        var data = Base.prototype.getTemplateData.call(this);
        that.messages = {
            'errMsgMail': data.dictionary['postingerror.InvalidEmail'],
            'errMsgMandatory': data.dictionary['postingerror.PleaseCompleteThisField'],
            'addedFav': data.dictionary['itemheader.AddedFavorites'],
            'removedFav': data.dictionary['itemheader.RemovedFavorites'],
            'addFav': data.dictionary['itemgeneraldetails.addFavorites'],
            'removeFav': data.dictionary['item.RemoveFromFavorites']
        };
    },
    events: {
        'click #replyForm .submit': 'sendReply'
    },
    sendReply: function(event) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();

        var message = $('.message').val();
        var email = $('.email').val();
        var name = $('.name').val();
        var phone = $('.phone').val();
        var itemId = $('.itemId').val();
        var itemSlug = $('.itemSlug').val();
        var url = [];

        url.push('/items/');
        url.push(itemId);
        url.push('/reply');
        url = helpers.common.fullizeUrl(url.join(''), this.app);

        var validate = function(done) {
            if (this.validForm(message, email)) {
                done();
            }
            else {
                done.abort();
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
                    name: name,
                    phone: phone
                }
            })
            .done(done)
            .fail(done.fail);
        }.bind(this);

        var success = function(done, data) {
            var params;
            var newUrl;

            params = {
                sent: true
            };
            newUrl = {
                slug: itemSlug
            };
            newUrl = helpers.common.slugToUrl(newUrl);

            $('.message').val('');
            $('.name').val('');
            $('.email').val('');
            $('.phone').val('');

            helpers.common.redirect.call(this.app.router, newUrl , params, {
                status: 200
            });
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

        asynquence().or(fail)
        .then(validate)
        .then(post)
        .gate(success, trackEvent, trackTracking, trackGraphite);
    },
    onStart: function(event) {
        this.appView.trigger('reply:start');
    },
    onEnd: function(event) {
        this.appView.trigger('reply:end');
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

module.exports.id = 'items/reply';