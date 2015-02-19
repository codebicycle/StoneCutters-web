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
            console.log(this.parentView.getProfile());
            this.parentView.getProfile().changePassword(done);
        }

        function success() {
            this.render();
        }

        function fail(errors) {
            _.each(errors, function each(error) {
                this.$('[name=' + error.selector + ']')
                    .after('<small class="error message">' + error.message + '</small>')
                    .parents('fieldset')
                    .addClass('error');
            }, this);
        }
    }
});
