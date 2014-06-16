'use strict';

var BaseView = require('../base');
var _ = require('underscore');

module.exports = BaseView.extend({
    className: 'footer_footer_view',
    getTemplateData: function() {
        var data = BaseView.prototype.getTemplateData.call(this);
        var user = this.app.getSession('user');
        var location = this.app.getSession('location');

        return _.extend({}, data, {
            user: user,
            location: location
        });
    },
    postRender: function() {
        this.$('.footer-links .footer-link').on('change:location', this.changeLocation);
    }
});

module.exports.id = 'footer/footer';