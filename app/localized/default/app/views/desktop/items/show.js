'use strict';

var Base = require('../../../../../common/app/bases/view').requireView('items/show');
var _ = require('underscore');
var helpers = require('../../../../../../helpers');
var asynquence = require('asynquence');

module.exports = Base.extend({
    tagName: 'main',
    id: 'items-show-view',
    className: 'items-show-view',
    events: {
        'blur input': 'validateField',
        'blur textarea': 'validateField',
        'submit': 'submitForm',
        'click .replySuccess span': 'showSubmit',
        'click [data-fav]': 'addToFavorites'
    },
    getTemplateData: function() {
        var data = Base.prototype.getTemplateData.call(this);
        var platform = this.app.session.get('platform');
        var location = this.app.session.get('location');
        var showAdSenseItemBottom = helpers.features.isEnabled.call(this, 'adSenseItemBottom', platform, location.url);

        return _.extend({}, data, {
            showAdSenseItemBottom: showAdSenseItemBottom
        });
    },
    showSubmit: function(event) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();

        $('.replySuccess').addClass('hide');
        $('#replyForm .submit').removeClass('hide');
    },
    submitForm: function(event) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();

        var email = $('#email').val();
        var name = $('#name').val();
        var comment = $('#comment').val();
        var phone = $('#phone').val();
        var itemId = $('.itemId').val();
        var url = [];

        url.push('/items/');
        url.push(itemId);
        url.push('/reply');
        url = helpers.common.fullizeUrl(url.join(''), this.app);

        var validate = function(done) {
            if (this.validateForm(email, name, comment)) {
                $('.spinner').removeClass('hide');
                $('#replyForm .submit').addClass('hide');
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
                    message: comment,
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
            var $replySuccess = $('.replySuccess');
            var category = $('.itemCategory').val();
            var subcategory = $('.itemSubcategory').val();

            $('.comment').val('');
            $('.name').val('');
            $('.email').val('');
            $('.phone').val('');
            $replySuccess.removeClass('hide');
            this.track({
                category: 'Reply',
                action: 'ReplySuccess',
                custom: ['Reply', category, subcategory, 'ReplySuccess', itemId].join('::')
            });
            done(data);
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

        var always = function() {
            $('.spinner').addClass('hide');
        }.bind(this);

        var fail = function(data) {
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

        asynquence().or(fail)
                .then(validate)
                .then(post)
                .then(success)
                .then(trackTracking)
                .then(trackGraphite);

    },
    validateForm: function(email, name, comment) {
        if((this.isEmpty(email, 'email') || this.isEmpty(name, 'name') || this.isEmpty(comment, 'comment')) && this.isEmail(email, 'email')) {
            return true;
        }else{
            return false;
        }

    },
    validateField: function(event) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();

        var field = $(event.currentTarget).attr('name');
        var value = $(event.currentTarget).val();
        var result = this.isEmpty(value, field);

        if(field === 'email' && result) {
            this.isEmail(value, field);
        }

    },
    isEmpty: function (value,field) {
        if(value === ''){
            $('span.' + field).text('Por favor complete este campo.').removeClass('hide');
            $('fieldset.' + field).addClass('error');
            $('fieldset.' + field + ' span.icons').addClass('icon-attention');
            return false;
        }else{
            $('span.' + field).addClass('hide');
            $('fieldset.' + field).removeClass('error');
            $('fieldset.' + field + ' span.icons').removeClass('icon-attention');
            return true;
        }
    },
    isEmail: function (value,field) {
        var expression = /^[_a-zA-Z0-9-]+(\.[_a-zA-Z0-9-]+)*@[a-zA-Z0-9-]+(\.[a-zA-Z0-9-]+)*(\.[a-zA-Z]{2,6})$/;
        if(!expression.test(value)){
            $('span.' + field).text('La dirección de correo electrónico es inválida.').removeClass('hide');
            $('fieldset.' + field).addClass('error');
            $('fieldset.' + field + ' span.icons').addClass('icon-attention');
            return false;
        }else{
            $('span.' + field).addClass('hide');
            $('fieldset.' + field).removeClass('error');
            $('fieldset.' + field + ' span.icons').removeClass('icon-attention');
            return true;
        }

    },
    addToFavorites: function (e) {
        var $this = $(e.currentTarget);

        if ($this.attr('href') == '#') {
            e.preventDefault();
            var session = this.app.get('session');
            var user = session.user;
            var itemId = $this.data('itemid');
            var url = [];
            var removeTxt = $this.attr('data-remove');
            var addTxt = $this.attr('data-add');

            $this.attr('href', 'adding');

            url.push('/users/');
            url.push(user.userId);
            url.push('/favorites/');
            url.push(itemId);
            url.push(($this.attr('data-current') == 'add' ? '' : '/delete'));
            url.push('?token=');
            url.push(user.token);

            helpers.dataAdapter.post(this.app.req, url.join(''), {
                query: {
                    platform: this.app.session.get('platform')
                },
                cache: false,
                json: true,
                done: function() {
                    $this.attr('data-qa', $this.attr('data-qa') == 'add-favorite' ? 'remove-favorite' : 'add-favorite');
                    if ($this.attr('data-current') == 'add') {
                        $this.attr('data-current', 'remove');
                        $this.text(removeTxt);
                    } else {
                        $this.attr('data-current', 'add');
                        $this.text(addTxt);
                    }
                },
                fail: function() {
                    console.log('[OLX_DEBUG] Fail add to favorites :: ERROR');
                }
            }, function always() {
                $this.attr('href', '#');
            });
        }
    }

});
