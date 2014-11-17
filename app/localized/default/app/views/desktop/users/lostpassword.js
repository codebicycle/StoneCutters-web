'use strict';

var Base = require('../../../../../common/app/bases/view').requireView('users/lostpassword');
var helpers = require('../../../../../../helpers');
var _ = require('underscore');

module.exports = Base.extend({
	className: 'users_lostpassword_view short-page',
    events: {
        'focus .text-field': 'clearInputs'
    },
    clearInputs: function(event) {
        event.preventDefault();
        $('.wrapper.error').removeClass('error');
    }
});
