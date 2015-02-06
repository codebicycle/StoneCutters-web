'use strict';

var _ = require('underscore');
var Base = require('../../../../../common/app/bases/view').requireView('users/myolx');
var Thread = require('../../../../../../models/conversation');
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
        this.thread = this.thread || (this.options.thread && this.options.thread.toJSON ? this.options.thread : new Thread(this.options.thread || {}, {
            app: this.app
        }));
        return this.thread;
    }
});

module.exports.id = 'users/myolx';
