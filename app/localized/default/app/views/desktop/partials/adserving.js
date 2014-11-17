'use strict';

var Base = require('../../../../../common/app/bases/view').requireView('partials/adserving');
var _ = require('underscore');
var AdServing = require('../../../../../../modules/adserving');

module.exports = Base.extend({
    className: 'adsense-listing',

    getTemplateData: function () {
        var data = Base.prototype.getTemplateData.call(this);
        var slotname = this.options.subId;

        return _.extend({}, data, {
            adserving: {
                enabled : true,
                slotname: slotname
            }
        });
    },
    postRender: function () {
        console.log(AdServing.getSettings);
    },
});

module.exports.id = 'partials/adserving';
