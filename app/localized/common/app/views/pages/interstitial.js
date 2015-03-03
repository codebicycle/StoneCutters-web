'use strict';

var _ = require('underscore');
var Base = require('../../bases/view');
var helpers = require('../../../../../helpers');
var tracking = require('../../../../../modules/tracking');
var config = require('../../../../../../shared/config');
var maxAge = config.get(['interstitial', 'time'], 60000);

module.exports = Base.extend({
    className: 'pages_intertitial_view hide',
    getTemplateData: function() {
        var data = Base.prototype.getTemplateData.call(this);
        var marketing = helpers.marketing.getInfo(this.app, 'interstitial');

        return _.extend({}, data, {
            marketing: marketing
        });
    }
});

module.exports.id = 'pages/interstitial';
