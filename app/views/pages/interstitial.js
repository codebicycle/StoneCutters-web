'use strict';

var BaseView = require('../base');
var _ = require('underscore');
var helpers = require('../../helpers');

module.exports = BaseView.extend({
    className: 'pages_terms_view',
    getTemplateData: function() {
        var data = BaseView.prototype.getTemplateData.call(this);
        var app = helpers.environment.init(this.app);
        var marketing = helpers.marketing.getInfo(app.getSession('marketing'), 'interstitial', app.getSession('platform'));

        return _.extend({}, data, {
            marketing: marketing
        });
    }
});

module.exports.id = 'pages/interstitial';
