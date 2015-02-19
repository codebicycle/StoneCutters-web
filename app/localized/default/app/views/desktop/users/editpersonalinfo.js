'use strict';

var _ = require('underscore');
var asynquence = require('asynquence');
var Base = require('../../../../../common/app/bases/view').requireView('users/editpersonalinfo');
var helpers = require('../../../../../../helpers');

module.exports = Base.extend({
    tagName: 'form',
    className: 'users-editpersonalinfo-view',
    events: {
        'change': 'onChange',
        'submit': 'onSubmit'
    },
    onChange: function(event) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();

        var $field = $(event.target);

        this.parentView.getProfile().set($field.attr('name'), $field.val());
    },
    onSubmit: function(event) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();

        asynquence().or(fail.bind(this))
            .then(submit.bind(this))
            .val(success.bind(this));

        function submit(done) {
            this.parentView.getProfile().changePassword(done);
        }

        function success() {
            helpers.common.redirect.call(this.app.router, '/myolx/myadslisting', null, {
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
