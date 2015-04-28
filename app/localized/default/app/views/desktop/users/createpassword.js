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
        'click .password-toggle': 'onPasswordToggle',
        'change': 'onChange',
        'submit': 'onSubmit'
    },
    postRender: function () {
        this.dictionary = translations.get(this.app.session.get('selectedLanguage'));
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
    onChange: function(event) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();

        var $field = $(event.target);

        this.getProfile().set($field.attr('name'), $field.val());
        this.getProfile().set('platform', this.app.session.get('platform'));
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
