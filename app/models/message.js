'use strict';

var Base = require('../bases/model');

module.exports = Base.extend({
    url: '/users/:userId/messages/:messageId'
});

module.exports.id = 'Message';
