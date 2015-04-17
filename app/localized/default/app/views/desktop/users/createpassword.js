'use strict';

var _ = require('underscore');
var asynquence = require('asynquence');
var Base = require('../../../../../common/app/bases/view').requireView('users/createpassword');
var helpers = require('../../../../../../helpers');
var User = require('../../../../../../models/user');

module.exports = Base.extend({
    className: 'users_createpassword_view short-page',
    events: {
        'click .passwordToggle': 'onPasswordToggle',
        'change': 'onChange',
        'submit': 'onSubmit'
    },
    onPasswordToggle: function (event) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();

        var field = this.$('.password-field');
        var link = $(event.target);

        if (field.attr('type') === 'password') {
            field.attr('type', 'text');
            link.html('hide');
        }
        else {
            field.attr('type', 'password');
            link.html('show');
        }        
    },
    onChange: function(event) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();

        var $field = $(event.target);

        this.getProfile().set($field.attr('name'), $field.val());
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
            .then(submit.bind(this))
            .val(success.bind(this));

        function submit(done) {
            this.getProfile().changePassword(done);
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
                var $field = this.$('[name=' + error.selector + ']');

                $field.siblings('small').remove();
                $field.after('<small class="error message">' + error.message + '</small>')
                    .parents('fieldset')
                    .addClass('error');
            }, this);
        }
    }
});
