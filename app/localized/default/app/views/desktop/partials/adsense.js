'use strict';

var Base = require('../../../../../common/app/bases/view');
var _ = require('underscore');
var helpers = require('../../../../../../helpers');

module.exports = Base.extend({
    className: 'adsense-listing',

    getTemplateData: function() {
        var data = Base.prototype.getTemplateData.call(this);
        var platform = this.app.session.get('platform');
        var location = this.app.session.get('location');
        var showAdSense = helpers.features.isEnabled.call(this, 'adSense', platform, location.url);

        return _.extend({}, data, {
            adsense: {
                enabled : showAdSense,
                slotname: data.subId || 'slot_empty'
            }
        });
    }
});

module.exports.id = 'partials/adsense';
