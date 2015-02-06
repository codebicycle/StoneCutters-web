'use strict';

var Base = require('../bases/model');

module.exports = Base.extend({
    url: '/conversations/:threadId/messages'
});

module.exports.id = 'Thread';
