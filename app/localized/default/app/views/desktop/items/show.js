'use strict';

var Base = require('../../../../../common/app/bases/view');
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
        'click .replySuccses span': 'showSubmit',
        'mouseover .image-navigator figure': 'updateGalery',
        'click .image-navigator [class*="arrow-"]': 'navigator'
    },
    getTemplateData: function() {
        var data = Base.prototype.getTemplateData.call(this);
        var platform = this.app.session.get('platform');
        var location = this.app.session.get('location');
        var showAdSenseItemBottom = helpers.features.isEnabled.call(this, 'adSenseItemBottom', platform, location.url);
        
        data.category_name = this.options.category_name;
        if (!data.item.purged) {
            data.item.location.stateName = data.item.location.children[0].name;
            data.item.location.cityName = data.item.location.children[0].children[0].name;
            if(data.item.location.children[0].children[0].children[0]){
                data.item.location.neighborhoodName = data.item.location.children[0].children[0].children[0].name;
            }
            data.item.descriptionReplace = data.item.description.replace(/(<([^>]+)>)/ig,'');
            data.item.date.since = helpers.timeAgo(data.item.date);
        }

        return _.extend({}, data, {
            breadcrumb: helpers.breadcrumb.get.call(this, data),
            showAdSenseItemBottom: showAdSenseItemBottom
        });
    },
    updateGalery: function(event) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();
        if(!$(event.currentTarget).hasClass('active')) {
            var $image = $(event.currentTarget).find('img');
            var image = $image.data('image');
            var currentImage = $image.attr('src');

            $('.image-navigator figure').removeClass('active');
            $(event.currentTarget).addClass('active');
            $('.image-viewer img').attr('src', currentImage);
            var newImg = new Image();

            newImg.src = image;
            newImg.onload = function() {
                $('.image-viewer img').attr('src', image);
            };
        }
    },
    navigator: function(event) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();

        var active = $('.image-navigator .active');
        var previous = ($(event.currentTarget).hasClass('arrow-prev')) ? true : false;

        if (previous) {
            if (active.prev('figure').length > 0) {
                active.prev().mouseover();
            } else {
                $('.image-navigator figure').last().mouseover();
            }
        } else {
            if (active.next('figure').length > 0) {
                active.next().mouseover();
            } else {
                $('.image-navigator figure').first().mouseover();
            }
        }
    },
    showSubmit: function(event) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();

        $('.replySuccses').addClass('hide');
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
            var $replySuccess = $('.replySuccses');
            var category = $('.itemCategory').val();
            var subcategory = $('.itemSubcategory').val();
            var tracking;

            $('.comment').val('');
            $('.name').val('');
            $('.email').val('');
            $('.phone').val('');
            tracking = $('<div></div>').append(data);
            tracking = $('#replySuccess', tracking);
            $replySuccess.append(tracking.length ? tracking : '');
            this.track({
                category: 'Reply',
                action: 'ReplySuccess',
                custom: ['Reply', category, subcategory, 'ReplySuccess', itemId].join('::')
            });
            $replySuccess.removeClass('hide');
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
                .gate(success, track);

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

    }
});

module.exports.id = 'items/show';
