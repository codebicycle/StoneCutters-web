'use strict';

var _ = require('underscore');
var asynquence = require('asynquence');
var Base = require('../../../../../common/app/bases/view');
var User = require('../../../../../../models/user');
var Tracking = require('../../../../../../modules/tracking');
var helpers = require('../../../../../../helpers');
var translations = require('../../../../../../../shared/translations');
var statsd = require('../../../../../../../shared/statsd')();
var rEmail = /^[_a-zA-Z0-9-]+(\.[_a-zA-Z0-9-]+)*@[a-zA-Z0-9-]+(\.[a-zA-Z0-9-]+)*(\.[a-zA-Z]{2,6})$/;

module.exports = Base.extend({
    id: 'item-contact-form',
    tagName: 'section',
    className: 'items_reply_view',
    getTemplateData: function() {
        var data = Base.prototype.getTemplateData.call(this);
        data.fields = [{ name: 'message', label: 'replymessage.Message', mandatory: 'true'},{name: 'name', label: 'replymessage.Name', mandatory: 'true'}, {name: 'email', label: 'replymessage.Email', mandatory: 'true'}, {name: 'phone', label: 'itemgeneraldetails.Phone'}];

        return _.extend({}, data, {});
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
        this.$spinner = $('.loading');
        this.$fields = this.$('textarea, input:not([type=submit], [type=hidden])');
        this.app.router.once('action:end', this.onStart);
        this.app.router.once('action:start', this.onEnd);
        this.attachTrackMe();
        this.$itemSlug = this.$('.itemSlug').val();
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
            .then(prepare.bind(this))
            .then(submit.bind(this))
            .val(success.bind(this));

        function prepare(done) {
            if(this.user){
                this.reply.name = this.$('input.name').val();
                this.reply.email = this.$('input.email').val();
                this.reply.userId = this.user.get('userId');
            }

            done();
        }

        function validate(done) {
            var hasErrors = false;
            var isValid;

            _.each(this.$fields, function each(field) {
                isValid = this.validate($(field));
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

            var params = {
                sent: true
            };
            var newUrl = {
                slug: this.$itemSlug
            };
            newUrl = helpers.common.slugToUrl(newUrl);
            this.trackSuccess(reply);
            this.$spinner.hide();
            helpers.common.redirect.call(this.app.router, newUrl , params, {
                status: 200
            });
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
        var categories = this.$('.itemCategory').val();
        var subcategory = this.$('.itemSubcategory').val();
        var category = categories || subcategory;
        var tracking = new Tracking({}, {
            app: this.app
        });

        tracking.setPage('items#success');
        tracking.set('item', this.reply.itemId);
        tracking.set('category', category);
        tracking.set('subcategory', subcategory);
        tracking.generate(onTrackData.bind(this));

        this.track({
            category: 'Reply',
            action: 'ReplySuccess',
            custom: ['Reply', categories, subcategory, 'ReplySuccess', this.reply.id].join('::')
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
        var tip = this.$('input[name="'+name+'"], textarea[name="'+name+'"]').parents('.field').find('.placeholder');
        if (isValid) {
            tip.show();
        }
        else {
            tip.hide();
        }
        this.$('small.' + name).text(isValid ? '' : text).toggleClass('hide', isValid);
        this.$('small.' + name).parents('.field').toggleClass('haserror', !isValid);
        return isValid;
    },
    onStart: function(event) {
        this.appView.trigger('reply:start');
    },
    onEnd: function(event) {
        this.appView.trigger('reply:end');
    }
});

module.exports.id = 'items/reply';