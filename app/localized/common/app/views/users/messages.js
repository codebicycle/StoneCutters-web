'use strict';

var Base = require('../../bases/view');
var _ = require('underscore');

module.exports = Base.extend({
    className: 'users_messages_view',
    wapAttributes: {
        cellpadding: 0
    }
});

module.exports.id = 'users/messages';