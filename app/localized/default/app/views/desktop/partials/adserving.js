'use strict';

var Base = require('../../../../../common/app/bases/view');
var _ = require('underscore');
var helpers = require('../../../../../../helpers');

module.exports = Base.extend({
    className: 'adsense-listing',

    getTemplateData: function() {
        var data = Base.prototype.getTemplateData.call(this);
        var slotname = this.options.subId;

        return _.extend({}, data, {
            adserving2: {
                enabled : true,
                slotname: slotname
            }
        });
    }
});

module.exports.id = 'partials/adserving';
