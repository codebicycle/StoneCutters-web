'use strict';

var Base = require('../../bases/view');
var _ = require('underscore');
var helpers = require('../../helpers');

module.exports = Base.extend({
    className: 'footer_downloadapp_view',
    getTemplateData: function() {
        var data = Base.prototype.getTemplateData.call(this);
        var marketing = helpers.marketing.getInfo(this.app, 'footer');

        return _.extend({}, data, {
            marketing: marketing
        });
    }
});

module.exports.id = 'footer/downloadapp';
