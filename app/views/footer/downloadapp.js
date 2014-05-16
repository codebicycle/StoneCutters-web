'use strict';

var BaseView = require('../base');
var _ = require('underscore');
var helpers = require('../../helpers');
var translations = require('../../translations');

module.exports = BaseView.extend({
    className: 'footer_downloadapp_view',
    getTemplateData: function() {
        var data = BaseView.prototype.getTemplateData.call(this);
        var marketing = helpers.marketing.getInfo(this.app, 'footer');

        return _.extend({}, data, {
            marketing: marketing
        });
    }
});

module.exports.id = 'footer/downloadapp';