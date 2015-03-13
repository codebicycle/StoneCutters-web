'use strict';

var Base = require('../../bases/view');
var _ = require('underscore');
var breadcrumb = require('../../../../../modules/breadcrumb');
var helpers = require('../../../../../helpers');

module.exports = Base.extend({
    className: 'users_myolx_view',
    getTemplateData: function() {
        var data = Base.prototype.getTemplateData.call(this);
        var isHermesEnabled = helpers.features.isEnabled.call(this, 'hermes');

        return _.extend({}, data, {
            breadcrumb: breadcrumb.get.call(this, data),
            isHermesEnabled: isHermesEnabled
        });
    }
});

module.exports.id = 'users/myolx';
