'use strict';

var Base = require('../../../../../common/app/bases/view');
var helpers = require('../../../../../../helpers');
var _ = require('underscore');
var asynquence = require('asynquence');

module.exports = Base.extend({
    className: 'users_register_view',
    events: {
        'focus .text-field': 'clearInputs'
    },
    getTemplateData: function() {
        var data = Base.prototype.getTemplateData.call(this);
        var params = this.options.params || {};

        return _.extend({}, data, {
            params: params
        });
    },
    clearInputs: function(event) {
        event.preventDefault();
        $('.wrapper.error').removeClass('error');
    }

});

module.exports.id = 'users/register';
