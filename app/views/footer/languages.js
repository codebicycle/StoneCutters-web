'use strict';

var BaseView = require('../base');
var _ = require('underscore');

module.exports = BaseView.extend({
    className: 'footer_languages_view',
    wapAttributes: {
        bgcolor: '#DDDDDD'
    },
    getTemplateData: function() {
        var data = BaseView.prototype.getTemplateData.call(this);

        return _.extend({}, data, {
            languages: this.app.getSession('languages'),
            selectedLanguage: this.app.getSession('selectedLanguage')
        });
    },
    postRender: function() {
        this.$('.footer-links .footer-link').on('change:location', this.changeLocation);
    }
});

module.exports.id = 'footer/languages';
