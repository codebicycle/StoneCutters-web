'use strict';

var Base = require('../../../../../common/app/bases/view').requireView('users/createpassword');
var helpers = require('../../../../../../helpers');
var _ = require('underscore');

module.exports = Base.extend({
    className: 'users_createpassword_view short-page',
    events: {
        'click .passwordToggle': 'onPasswordToggle'
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
    }
});
