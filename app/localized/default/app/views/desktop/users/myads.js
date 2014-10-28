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
    },
    events: {
        'click .btndelete': 'onDeleteClick',
    },
    onDeleteClick: function(event) {
        var data = Base.prototype.getTemplateData.call(this);
        var key = data.dictionary['myolx.AreYouSureYouWantToCloseSelectedListings'];
        if(!confirm(key)){
            event.preventDefault();
            event.stopPropagation();
            event.stopImmediatePropagation();
        }
    }
});

module.exports.id = 'users/myads';