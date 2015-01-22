'use strict';

var _ = require('underscore');
var asynquence = require('asynquence');
var Base = require('../../../../../../common/app/bases/view');
var User = require('../../../../../../../models/user');
var tracking = require('../../../../../../../modules/tracking');
var helpers = require('../../../../../../../helpers');
var statsd = require('../../../../../../../../shared/statsd')();

module.exports = Base.extend({
    className: 'item-contact-form',
    id: 'item-contact-form',
    tagName: 'section',
    postRender: function() {
        this.user = new User(_.extend({
            country: this.app.session.get('location').abbreviation,
            languageId: this.app.session.get('languageId'),
            platform: this.app.session.get('platform')
        }, this.app.session.get('user') || {}), {
            app: this.app
        });
        this.$el.trigger('reset');
    },
    events: {
        'blur input': 'onBlur',
        'blur textarea': 'onBlur',
        'submit': 'onSubmit',
        'reset': 'onReset',
        'click .replySuccess': 'onReplySuccessClick'
    },
    onBlur: function(event) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();

        var field = $(event.target);

        if (this.validate(field)) {
            this.reply[field.attr('name')] = field.val();
        }
    },
    onSubmit: function(event) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();

        var $spinner = this.$('.spinner').removeClass('hide');

        this.$('.submit').addClass('hide');
        asynquence().or(fail.bind(this))
            .then(submit.bind(this))
            .val(success.bind(this));

        function submit(done) {
            this.user.reply(done, this.reply);
        }

        function success(reply) {
            event.target.reset();
            $spinner.addClass('hide');
            this.$('.replySuccess').removeClass('hide');
            this.trackSuccess(reply);
        }

        function fail(err) {
            $spinner.addClass('hide');
            this.$('.submit').removeClass('hide');
        }
    },
    onReset: function(event) {
        this.reply = {
            id: this.$('[name=itemId]').val()
        };
    },
    onReplySuccessClick: function(event) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();

        this.$('.replySuccess').addClass('hide');
        this.$('.submit').removeClass('hide');
    },
    trackSuccess: function(reply) {
        var item = this.parentView.getItem();
        var categories = this.parentView.getCategories();
        var subcategory = categories.search(item.get('category').id);
        var category = categories.search(item.get('category').parentId) || subcategory;
        var url;

        tracking.reset();
        tracking.setPage('items#success');
        tracking.addParam('item', item.toJSON());
        tracking.addParam('category', category.toJSON());
        tracking.addParam('subcategory', subcategory.toJSON());
        $('#partials-tracking-view').trigger('update', tracking.generateURL.call(this));

        this.track({
            category: 'Reply',
            action: 'ReplySuccess',
            custom: ['Reply', this.$('.itemCategory').val(), this.$('.itemSubcategory').val(), 'ReplySuccess', this.reply.id].join('::')
        });
    },
    validate: function(field) {
        var name = field.attr('name');
        var value = field.val();
        var isEmpty = this.isEmpty(name, value);

        if (!isEmpty && name === 'email') {
            return this.isEmail(name, value);
        }
        return !isEmpty;
    },
    isEmpty: function (name, value) {
        if (!value) {
            this.$('span.' + name).text('Por favor complete este campo.').removeClass('hide');
            this.$('fieldset.' + name).addClass('error');
            this.$('fieldset.' + name + ' span.icons').addClass('icon-attention');
            return true;
        }
        this.$('span.' + name).addClass('hide');
        this.$('fieldset.' + name).removeClass('error');
        this.$('fieldset.' + name + ' span.icons').removeClass('icon-attention');
    },
    isEmail: function(name, value) {
        var expression = /^[_a-zA-Z0-9-]+(\.[_a-zA-Z0-9-]+)*@[a-zA-Z0-9-]+(\.[a-zA-Z0-9-]+)*(\.[a-zA-Z]{2,6})$/;

        if (value && expression.test(value)) {
            this.$('span.' + name).addClass('hide');
            this.$('fieldset.' + name).removeClass('error');
            this.$('fieldset.' + name + ' span.icons').removeClass('icon-attention');
            return true;
        }
        this.$('span.' + name).text('La dirección de correo electrónico es inválida.').removeClass('hide');
        this.$('fieldset.' + name).addClass('error');
        this.$('fieldset.' + name + ' span.icons').addClass('icon-attention');
    },
    showSubmit: function(event) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();

        $('.replySuccess').addClass('hide');
        $('#replyForm .submit').removeClass('hide');
    }
});

module.exports.id = 'items/partials/contactform';
