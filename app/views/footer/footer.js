'use strict';

var BaseView = require('../base');
var _ = require('underscore');
var helpers = require('../../helpers');

module.exports = BaseView.extend({
    className: 'footer_footer_view',
    getTemplateData: function() {
        var data = BaseView.prototype.getTemplateData.call(this);
        var app = helpers.environment.init(this.app);
        var marketing = helpers.marketing.getInfo(app.getSession('marketing'),'footer',app.getSession('platform'));
        var user = app.getSession('user');
        var location = app.getSession('location');

        return _.extend({}, data, {
            marketing: marketing,
            user: user,
            location: location
        });
    }
});

module.exports.id = 'footer/footer';