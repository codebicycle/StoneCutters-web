'use strict';

var _ = require('underscore');
var asynquence = require('asynquence');
var Base = require('../../../../../common/app/bases/view').requireView('users/createpassword');
var helpers = require('../../../../../../helpers');
var User = require('../../../../../../models/user');
var translations = require('../../../../../../../shared/translations');

module.exports = Base.extend({
    className: 'users_createpassword_view short-page',
    events: {
        'change': 'onChange',
        'click .password-toggle': 'onPasswordToggle',
        'submit': 'onSubmit'
    },
    postRender: function () {
        this.dictionary = translations.get(this.app.session.get('selectedLanguage'));
    },
    onChange: function(event) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();

        var $field = $(event.target);

        this.getProfile().set($field.attr('name'), $field.val());
        this.getProfile().set('platform', this.app.session.get('platform'));
    },
    onPasswordToggle: function (event) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();

        var field = this.$('.password-field');
        var link = $(event.target);
        var msgShow = this.dictionary['misc.Show'];
        var msgHide = this.dictionary['misc.Hide'];

        if (field.attr('type') === 'password') {
            field.attr('type', 'text');
            link.html(msgHide);
        }
        else {
            field.attr('type', 'password');
            link.html(msgShow);
        }        
    },
    getProfile: function(profile) {
        this.profile = this.profile || (this.options.profile && this.options.profile.toJSON ? this.options.profile : new User(profile || this.options.profile || {}, {
            app: this.app
        }));
        return this.profile;
    },
    onSubmit: function(event) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();

        asynquence().or(fail.bind(this))
            .then(prepare.bind(this))
            .then(submit.bind(this))
            .val(success.bind(this));
        
        function prepare (done) {
            this.getProfile().set({
                email: this.app.session.get('user').email,
                location: this.app.session.get('location').url,
                newPassword: this.$('.password-field').val()
            });

            done();
        }

        function submit(done) {
            this.getProfile().updatePassword(done);
        }

        function success() {
            helpers.common.redirect.call(this.app.router, '/myolx/myadslisting', {
                createPassword: true
            }, {
                status: 200
            });
        }

        function fail(errors) {
            _.each(errors, function each(error) {
                var selector = error.selector === 'newPassword' ? '.fake-input' : '[name=' + error.selector + ']';
                var $field = this.$(selector);

                $field.siblings('small').remove();
                $field.after('<small class="error message">' + error.message + '</small>')
                    .parents('fieldset')
                    .addClass('error');
            }, this);
        }
    }
});