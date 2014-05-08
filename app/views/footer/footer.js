'use strict';

var BaseView = require('../base');
var _ = require('underscore');
var helpers = require('../../helpers');

module.exports = BaseView.extend({
    className: 'footer_footer_view',
    getTemplateData: function() {
        var data = BaseView.prototype.getTemplateData.call(this);
        var marketing = helpers.marketing.getInfo(this.app.getSession('marketing'), 'footer', this.app.getSession('platform'));
        var user = this.app.getSession('user');
        var location = this.app.getSession('location');

        return _.extend({}, data, {
            marketing: marketing,
            user: user,
            location: location
        });
    }
});

module.exports.id = 'footer/footer';