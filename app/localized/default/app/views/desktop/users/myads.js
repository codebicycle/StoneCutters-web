'use strict';

var Base = require('../../../../../common/app/bases/view');
var _ = require('underscore');
var helpers = require('../../../../../../helpers');

module.exports = Base.extend({
    className: 'users_myads_view',
    getTemplateData: function() {
        var data = Base.prototype.getTemplateData.call(this);
        return _.extend({}, data, {
            breadcrumb: helpers.breadcrumb.get.call(this, data),
            myAds: data.context.ctx.myAds
        });
    }
});

module.exports.id = 'users/myads';