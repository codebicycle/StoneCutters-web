'use strict';

var _ = require('underscore');
var asynquence = require('asynquence');
var Base = require('../../../../../../common/app/bases/view');
var helpers = require('../../../../../../../helpers');
var User = require('../../../../../../../models/user');
var Tracking = require('../../../../../../../modules/tracking');
var Notifications = require('../../../../../../../modules/notifications');
var translations = require('../../../../../../../../shared/translations');
var rEmail = /^[_a-zA-Z0-9-]+(\.[_a-zA-Z0-9-]+)*@[a-zA-Z0-9-]+(\.[a-zA-Z0-9-]+)*(\.[a-zA-Z]{2,6})$/;
var Mixpanel = require('../../../../../../../modules/tracking/trackers/mixpanel');

module.exports = Base.extend({
    id: 'item-contact-form',
    tagName: 'section',
    className: function() {
        var sixpackClass = this.app.sixpack.className(this.app.sixpack.experiments.desktopDGD23ShowSimplifiedReplyForm);

        return 'item-contact-form' + (sixpackClass ? (' ' + sixpackClass) : '');
    },
    getTemplateData: function() {
        var data = Base.prototype.getTemplateData.call(this);
        var phone = data.item.phone;
        var dgdHidePhoneNumber = this.app.sixpack.experiments.dgdHidePhoneNumber;
        var hiddenPhone;

        if (phone && dgdHidePhoneNumber && dgdHidePhoneNumber.alternative === 'hide-phone-number') {
            hiddenPhone = this.transformPhone(phone, 4, '*');
        }

        return _.extend({}, data, {
            hiddenPhone: hiddenPhone
        });
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
        'click .replySuccess': 'onReplySuccessClick',
        'click .dgd-hide-phone-number .action-button': 'onShowPhoneNumberClick'
    },
    onFocus: function(event) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();

        this.$('fieldset.name, fieldset.email, fieldset.phone').slideDown();
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

        Mixpanel.track.call(this, 'Reply intention', {
            'Type': 'Message',
            'Item id': this.parentView.getItem().get('id') || 0,
            'Category Id': this.parentView.getItem().get('category').id || 0,
            'Category Name': this.parentView.getItem().get('category').originalName || ''
        });

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
            var item = this.parentView.getItem();

            event.target.reset();

            if (reply.phone) {
                this.app.sixpack.convert(this.app.sixpack.experiments.desktopDGD23ShowSimplifiedReplyForm, 'phone-filled');
            }
            this.$spinner.addClass('hide');
            this.$success.removeClass('hide');
            this.trackSuccess(reply);
            this.app.sixpack.convert(this.app.sixpack.experiments.desktopDGD23ShowSimplifiedReplyForm);
            this.app.sixpack.convert(this.app.sixpack.experiments.dgdOpenItemInNewTab);

            if (_.contains([378], item.get('category').id)) {
                this.app.sixpack.convert(this.app.sixpack.experiments.dgdCategoryCars);
            }
            
            this.app.sixpack.convert(this.app.sixpack.experiments.dgdHidePhoneNumber, 'reply-by-mail');
            this.app.sixpack.convert(this.app.sixpack.experiments.dgdMarkVisitedItems, 'item-reply');

            if (!this.notifications) {
                this.notifications = new Notifications({}, this);
            }
            if (this.notifications.isEnabled() && this.notifications.checkNotifications()) {
                this.notifications.checkPermission(function callback(status) {
                    if (status === 'default') {
                        this.notifications.requestPermission();
                    }
                }.bind(this));
            }
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
    },
    onShowPhoneNumberClick: function(event) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();

        this.$('.user-phone').text(this.parentView.getItem().get('phone'));
        this.app.sixpack.convert(this.app.sixpack.experiments.dgdHidePhoneNumber);
    },
    transformPhone: function(phone, digits, symbol) {
        var count = 0;
        var position = 0;

        phone = phone.split('').reverse();
        while (count < digits) {
            if (~parseInt(phone[position])) {
                phone[position] = symbol;
                count++;
            }
            position++;
        }
        return phone.reverse().join('');
    }
});

module.exports.id = 'items/partials/reply';
