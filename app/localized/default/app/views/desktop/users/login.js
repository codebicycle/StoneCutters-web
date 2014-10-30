'use strict';

var Base = require('../../../../../common/app/bases/view');
var helpers = require('../../../../../../helpers');
var _ = require('underscore');

module.exports = Base.extend({
    className: 'users_login_view',
    getTemplateData: function() {
        var data = Base.prototype.getTemplateData.call(this);
        var params = this.options.params || {};
        console.log(data.form);
        return _.extend({}, data, {
            params: params
        });
    },
    events: {
        'focus .text-field': 'clearInput'
    },
    clearInput: function (event) {
        event.preventDefault();
        $('.wrapper.error').removeClass('error');
    }

});

module.exports.id = 'users/login';
