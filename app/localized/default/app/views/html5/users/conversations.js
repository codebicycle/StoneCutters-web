'use strict';

var Base = require('../../../../../common/app/bases/view').requireView('users/conversations');
var _ = require('underscore');
var asynquence = require('asynquence');
var helpers = require('../../../../../../helpers');

module.exports = Base.extend({
    className: 'users_conversations_view',
});
