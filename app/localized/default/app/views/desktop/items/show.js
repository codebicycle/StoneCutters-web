'use strict';

var Base = require('../../../../../common/app/bases/view').requireView('items/show');
var _ = require('underscore');
var helpers = require('../../../../../../helpers');

module.exports = Base.extend({
    tagName: 'main',
    id: 'items-show-view',
    className: 'items-show-view',
    getTemplateData: function() {
        var data = Base.prototype.getTemplateData.call(this);
        var platform = this.app.session.get('platform');
        var location = this.app.session.get('location');
        var showAdSenseItemBottom = helpers.features.isEnabled.call(this, 'adSenseItemBottom', platform, location.url);
        console.log(data.item);
        console.log(data.item.purged);
        return _.extend({}, data, {
            showAdSenseItemBottom: showAdSenseItemBottom
        });
    }
});
