'use strict';

var Base = require('../../../../../common/app/bases/view').requireView('users/edituserprofile');
var helpers = require('../../../../../../helpers');
var _ = require('underscore');

module.exports = Base.extend({
    tagName: 'main',
    className: 'users-edituserprofile-view'
});
