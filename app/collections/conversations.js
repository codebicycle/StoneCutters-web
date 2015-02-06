'use strict';

var _ = require('underscore');
var Base = require('../bases/collection');
var Conversation = require('../models/conversation');
var Items = require('./items');

module.exports = Base.extend({
    model: Conversation,
    url: '/conversations',
    parse: function(response) {
        this.meta = _.omit(response, 'conversations', 'items');
        this.items = new Items(response.items, {
            app: this.app
        });
        return response.conversations;
    }
});

module.exports.id = 'Conversations';
