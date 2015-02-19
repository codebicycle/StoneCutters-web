'use strict';

var _ = require('underscore');
var asynquence = require('asynquence');
var Base = require('../../../../../../common/app/bases/view');
var User = require('../../../../../../../models/user');
var tracking = require('../../../../../../../modules/tracking');
var helpers = require('../../../../../../../helpers');
var translations = require('../../../../../../../../shared/translations');
var statsd = require('../../../../../../../../shared/statsd')();
var rEmail = /^[_a-zA-Z0-9-]+(\.[_a-zA-Z0-9-]+)*@[a-zA-Z0-9-]+(\.[a-zA-Z0-9-]+)*(\.[a-zA-Z]{2,6})$/;

module.exports = Base.extend({
    className: 'item-contact-form',
    id: 'item-contact-form',
    tagName: 'section',
    postRender: function() {
        this.dictionary = translations.get(this.app.session.get('selectedLanguage'));
        this.user = new User(_.extend({
            country: this.app.session.get('location').abbreviation,
            languageId: this.app.session.get('languageId'),
            platform: this.app.session.get('platform')
        }, this.app.session.get('user') || {}), {
            app: this.app
        });

        this.$el.trigger('reset');
        this.$spinner = this.$('.spinner');
        this.$submit = this.$('.submit');
        this.$success = this.$('.replySuccess');
        this.$fields = this.$('textarea, input:not([type=submit], [type=hidden])');
    },
    events: {
        'blur textarea, input:not([type=submit], [type=hidden])': 'onBlur',
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

        this.$spinner.removeClass('hide');
        this.$submit.addClass('hide');
        this.$success.addClass('hide');

        asynquence().or(fail.bind(this))
            .then(validate.bind(this))
            .then(submit.bind(this))
            .val(success.bind(this));

        function validate(done) {
            var hasErrors = false;

            _.each(this.$fields, function each(field) {
                var isValid = this.validate($(field));

                hasErrors = hasErrors || !isValid;
            }, this);
            if (hasErrors) {
                return done.fail();
            }
            done();
        }

        function submit(done) {
            this.user.reply(done, this.reply);
        }

        function success(reply) {
            event.target.reset();
            this.$spinner.addClass('hide');
            this.$success.removeClass('hide');
            this.trackSuccess(reply);
        }

        function fail(err) {
            this.$spinner.addClass('hide');
            this.$submit.removeClass('hide');
        }
    },
    onReset: function(event) {
        this.reply = {
            id: this.$('[name=itemId]').val(),
            userId: this.user.get('userId'),
            email: this.user.get('email')
        };
    },
    onReplySuccessClick: function(event) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();

        this.$success.addClass('hide');
        this.$submit.removeClass('hide');
    },
    trackSuccess: function(reply) {
        var item = this.parentView.getItem();
        var categories = this.parentView.getCategories();
        var subcategory = categories.search(item.get('category').id);
        var category = categories.search(item.get('category').parentId) || subcategory;

        tracking.reset();
        tracking.setPage('items#success');
        tracking.addParam('item', item.toJSON());
        tracking.addParam('category', category.toJSON());
        tracking.addParam('subcategory', subcategory.toJSON());
        $('#partials-tracking-view').trigger('update', tracking.generateURL.call(this));

        this.track({
            category: 'Reply',
            action: 'ReplySuccess',
            custom: ['Reply', item.get('category').parentId, item.get('category').id, 'ReplySuccess', this.reply.id].join('::')
        });
    },
    validate: function(field) {
        var name = field.attr('name');
        var value = field.val();
        var isEmpty;

        if (name === 'phone') {
            return true;
        }
        isEmpty = this.isEmpty(name, value);
        if (!isEmpty && name === 'email') {
            return this.isEmail(name, value);
        }
        return !isEmpty;
    },
    isEmpty: function (name, value) {
        return !this.setError(!!value, name, this.dictionary['postingerror.PleaseCompleteThisField']);
    },
    isEmail: function(name, value) {
        return this.setError(rEmail.test(value), name, this.dictionary['postingerror.InvalidEmailAddress']);
    },
    setError: function (isValid, name, text) {
        this.$('span.' + name).text(isValid ? '' : text).toggleClass('hide', isValid);
        this.$('fieldset.' + name).toggleClass('error', !isValid);
        this.$('fieldset.' + name + ' span.icons').toggleClass('icon-attention', !isValid);
        return isValid;
    }
});

module.exports.id = 'items/partials/reply';
