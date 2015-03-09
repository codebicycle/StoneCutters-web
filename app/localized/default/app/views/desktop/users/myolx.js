'use strict';

var _ = require('underscore');
var Base = require('../../../../../common/app/bases/view').requireView('users/myolx');
var Conversation = require('../../../../../../models/conversation');
var User = require('../../../../../../models/user');
var States = require('../../../../../../collections/states');
var Items = require('../../../../../../collections/items');
var helpers = require('../../../../../../helpers');

module.exports = Base.extend({
    getTemplateData: function() {
        var data = Base.prototype.getTemplateData.call(this);
        var isHermesEnabled = helpers.features.isEnabled.call(this, 'hermes');

        return _.extend({}, data, {
            isHermesEnabled: isHermesEnabled
        });
    },
    postRender: function() {
        this.items = this.items || this.options.items && this.options.items.toJSON ? this.options.items : new Items(this.options.items || {}, {
            app: this.app
        });
    },
    getThread: function() {
        this.thread = this.thread || (this.options.thread && this.options.thread.toJSON ? this.options.thread : new Conversation(this.options.thread || {}, {
            app: this.app
        }));
        return this.thread;
    },
    getProfile: function(profile) {
        this.profile = this.profile || (this.options.profile && this.options.profile.toJSON ? this.options.profile : new User(profile || this.options.profile || {}, {
            app: this.app
        }));
        return this.profile;
    },
    getStates: function(states) {
        this.states = this.states || (this.options.states && this.options.states.toJSON ? this.options.states : new States(states || this.options.states || {}, {
            app: this.app
        }));
        return this.states;
    }
});

module.exports.id = 'users/myolx';
