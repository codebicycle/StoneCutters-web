'use strict';

var _ = require('underscore');
var asynquence = require('asynquence');
var Base = require('../../../../../../common/app/bases/view').requireView('users/partials/itemsconversation');
var helpers = require('../../../../../../../helpers');

module.exports = Base.extend({
    getTemplateData: function() {
        var data = Base.prototype.getTemplateData.call(this);
        data.thread = this.parentView.getThread().toJSON();
        return data;
    },
    postRender: function() {
        this.parentView.checkPosition();

        if (!this.rendered) {
            this.parentView.getThread().on('change', this.onReset.bind(this), this);
        }

        this.rendered = true;
    },
    onReset: function() {
        this.render();
    }
});

module.exports.id = 'users/partials/itemsconversation';