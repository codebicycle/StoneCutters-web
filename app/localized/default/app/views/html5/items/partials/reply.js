'use strict';

var _ = require('underscore');
var asynquence = require('asynquence');
var Base = require('../../../../../../common/app/bases/view');
var User = require('../../../../../../../models/user');
var Tracking = require('../../../../../../../modules/tracking');
var helpers = require('../../../../../../../helpers');
var translations = require('../../../../../../../../shared/translations');
var rEmail = /^[_a-zA-Z0-9-]+(\.[_a-zA-Z0-9-]+)*@[a-zA-Z0-9-]+(\.[a-zA-Z0-9-]+)*(\.[a-zA-Z]{2,6})$/;

module.exports = Base.extend({
    className: 'reply',
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
        this.$spinner = $('.loading');
        this.$success = this.parentView.$('.msgCont');
        this.$fields = this.$('textarea, input:not([type=submit], [type=hidden])');
    },
    events: {
        'blur textarea, input:not([type=submit], [type=hidden])': 'onBlur',
        'submit': 'onSubmit',
        'reset': 'onReset'
    },
    onBlur: function(event) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();

        var field = $(event.target);

        this.validate(field);
    },
    onSubmit: function(event) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();

        this.$spinner.show();
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
            this.$spinner.hide();
            this.$success.addClass('visible').find('.msgCont-container').text(this.dictionary['comments.YourMessageHasBeenSent'].replace(/<br \/>/g,''));
            setTimeout(function onTimeout() {
                this.$success.removeClass('visible');
            }.bind(this), 3000);
            this.trackSuccess(reply);
        }

        function fail(err) {
            this.$spinner.hide();
        }
    },
    onReset: function(event) {
        this.reply = {
            id: this.$('[name=itemId]').val()
        };
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

        this.addData(field);
        if (name === 'phone') {
            return true;
        }
        isEmpty = this.isEmpty(name, value);
        if (!isEmpty && name === 'email') {
            return this.isEmail(name, value);
        }
        return !isEmpty;
    },
    addData: function (field){
        this.reply[field.attr('name')] = field.val();
    },
    isEmpty: function (name, value) {
        return !this.setError(!!value, name, this.dictionary['postingerror.PleaseCompleteThisField']);
    },
    isEmail: function(name, value) {
        return this.setError(rEmail.test(value), name, this.dictionary['postingerror.InvalidEmailAddress']);
    },
    setError: function (isValid, name, text) {
        this.$('small.' + name).text(isValid ? '' : text).toggleClass('hide', isValid);
        return isValid;
    }
});

module.exports.id = 'items/partials/reply';
