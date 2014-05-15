'use strict';

var BaseView = require('../base');
var _ = require('underscore');
var helpers = require('../../helpers');

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
    }
});

module.exports.id = 'footer/footer';