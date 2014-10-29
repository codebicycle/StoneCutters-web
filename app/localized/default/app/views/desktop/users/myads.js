'use strict';

var Base = require('../../../../../common/app/bases/view').requireView('users/myads');
var _ = require('underscore');

module.exports = Base.extend({
    className: 'users_myads_view',
    getTemplateData: function() {
        var data = Base.prototype.getTemplateData.call(this);

        return _.extend({}, data, {
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
