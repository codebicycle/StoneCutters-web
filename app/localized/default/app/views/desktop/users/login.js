'use strict';

var Base = require('../../../../../common/app/bases/view').requireView('users/login');
var helpers = require('../../../../../../helpers');
var _ = require('underscore');
var config = require('../../../../../../../shared/config');

module.exports = Base.extend({
    className: 'users_login_view short-page',
    getTemplateData: function() {
        var data = Base.prototype.getTemplateData.call(this);
        var location = this.app.session.get('location');
        var params = this.options.params || {};
        var facebooklogin = config.getForMarket(location.url, ['socials', 'facebookLogin'], '');

        return _.extend({}, data, {
            params: params,
            requireTracking: true,
            facebookLogin: facebooklogin
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
