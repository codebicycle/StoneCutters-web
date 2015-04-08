'use strict';

var _ = require('underscore');
var asynquence = require('asynquence');
var Base = require('../../../../../../common/app/bases/view');
var Sixpack = require('../../../../../../../../shared/sixpack');
var User = require('../../../../../../../models/user');
var Tracking = require('../../../../../../../modules/tracking');
var helpers = require('../../../../../../../helpers');
var translations = require('../../../../../../../../shared/translations');
var rEmail = /^[_a-zA-Z0-9-]+(\.[_a-zA-Z0-9-]+)*@[a-zA-Z0-9-]+(\.[a-zA-Z0-9-]+)*(\.[a-zA-Z]{2,6})$/;

module.exports = Base.extend({
    id: 'item-contact-form',
    tagName: 'section',
    className: function() {
        var sixpack = new Sixpack({
            clientId: this.app.session.get('clientId'),
            ip: this.app.session.get('ip'),
            userAgent: this.app.session.get('userAgent'),
            platform: this.app.session.get('platform'),
            market: this.app.session.get('location').abbreviation,
            experiments: this.app.session.get('experiments')
        });
        var sixpackClass = sixpack.className(sixpack.experiments.desktopDGD23ShowSimplifiedReplyForm);

        return 'item-contact-form' + (sixpackClass ? (' ' + sixpackClass) : '');
    },
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
        'focus textarea': 'onFocus',
        'blur textarea, input:not([type=submit], [type=hidden])': 'onBlur',
        'submit': 'onSubmit',
        'reset': 'onReset',
        'click .replySuccess': 'onReplySuccessClick'
    },
    onFocus: function(event) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();

        this.$('fieldset.name, fieldset.email., fieldset.phone').addClass('visible');
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
        var sixpack = new Sixpack({
            clientId: this.app.session.get('clientId'),
            ip: this.app.session.get('ip'),
            userAgent: this.app.session.get('userAgent'),
            platform: this.app.session.get('platform'),
            market: this.app.session.get('location').abbreviation,
            experiments: this.app.session.get('experiments')
        });
        
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

            if (reply.phone) {
                sixpack.convert(sixpack.experiments.desktopDGD23ShowSimplifiedReplyForm, 'phone-filled');
            }
            this.$spinner.addClass('hide');
            this.$success.removeClass('hide');
            this.trackSuccess(reply);
            sixpack.convert(sixpack.experiments.desktopDGD23ShowSimplifiedReplyForm);
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
        var tracking = new Tracking({}, {
            app: this.app
        });

        tracking.setPage('items#success');
        tracking.set('item', item.toJSON());
        tracking.set('category', category.toJSON());
        tracking.set('subcategory', subcategory.toJSON());
        tracking.generate(onTrackData.bind(this));

        this.track({
            category: 'Reply',
            action: 'ReplySuccess',
            custom: ['Reply', item.get('category').parentId, item.get('category').id, 'ReplySuccess', this.reply.id].join('::')
        });

        function onTrackData(trackingData) {
            $('#partials-tracking-view').trigger('update', trackingData);
        }
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
