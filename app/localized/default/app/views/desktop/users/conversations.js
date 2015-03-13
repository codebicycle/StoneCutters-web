'use strict';

var Base = require('../../../../../common/app/bases/view').requireView('users/conversations');
var asynquence = require('asynquence');
var _ = require('underscore');
var helpers = require('../../../../../../helpers');
var async = require('async');

module.exports = Base.extend({
    className: 'users_conversations_view',
    events: {
        'click [data-delete-message]': 'deleteMessage',
        'click [data-select-all]': 'selectAll'
    },
    getTemplateData: function() {
        var data = Base.prototype.getTemplateData.call(this);

        this.messages = this.messages || data.context.ctx.messages;
        return _.extend({}, data, {
            messages: this.messages
        });
    }
});

module.exports.id = 'users/conversations';
