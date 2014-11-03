'use strict';

var Base = require('../bases/collection');
var Message = require('../models/message');

module.exports = Base.extend({
    model: Message,
    url: '/users/:userId/messages',
    parse: function(response) {
        if (response) {
            this.metadata = response.metadata;
            return response.data;
        }
        console.log('[OLX_DEBUG] Empty messages response');
        this.metadata = {};
        return [];
    }
});

module.exports.id = 'Messages';
