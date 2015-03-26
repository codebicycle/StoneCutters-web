'use strict';

var _ = require('underscore');
var Base = require('../../bases/view');
var breadcrumb = require('../../../../../modules/breadcrumb');
var helpers = require('../../../../../../app/helpers');

module.exports = Base.extend({
    className: 'page-safetytips-view',
    id: 'page-safetytips',
    getTemplateData: function() {
        var data = Base.prototype.getTemplateData.call(this);
        var isSafetyTipsEnabled =  helpers.features.isEnabled.call(this, 'safetyTips');

        return _.extend({}, data, {
            breadcrumb: breadcrumb.get.call(this, data),
            isSafetyTipsEnabled: isSafetyTipsEnabled
        });
    }
});

module.exports.id = 'items/safetytips';
