'use strict';

var BaseView = require('../base');
var _ = require('underscore');
var helpers = require('../../helpers');

module.exports = BaseView.extend({
    className: 'footer_index_view',
    getTemplateData: function() {
        var data = BaseView.prototype.getTemplateData.call(this);
        var app = helpers.environment.init(this.app);

        return _.extend({}, data, {
            languages: app.getSession('languages'),
            selectedLanguage: app.getSession('selectedLanguage')
        });
    }
});

module.exports.id = 'footer/languages';