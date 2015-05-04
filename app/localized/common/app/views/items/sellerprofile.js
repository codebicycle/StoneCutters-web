'use strict';

var _ = require('underscore');
var Base = require('../../bases/view');
var helpers = require('../../../../../../app/helpers');

module.exports = Base.extend({
    className: 'seller-profile-view',
    id: 'seller-profile-view',
    getTemplateData: function() {
        var data = Base.prototype.getTemplateData.call(this);
        var sellerProfileEnabled =  helpers.features.isEnabled.call(this, 'sellerProfile');

        return _.extend({}, data, {
            sellerProfileEnabled: sellerProfileEnabled
        });
    }
});

module.exports.id = 'items/sellerprofile';