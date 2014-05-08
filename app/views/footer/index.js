'use strict';

var BaseView = require('../base');
var _ = require('underscore');
var helpers = require('../../helpers');

module.exports = BaseView.extend({
    className: 'footer_index_view',
    getTemplateData: function() {
        var data = BaseView.prototype.getTemplateData.call(this);
        var marketing = helpers.marketing.getInfo(this.app.getSession('marketing'), 'footer', this.app.getSession('platform'));

        return _.extend({}, data, {
            marketing: marketing
        });
    }
});

module.exports.id = 'footer/index';