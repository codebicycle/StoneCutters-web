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
            languages: this.app.session.get('languages'),
            selectedLanguage: this.app.session.get('selectedLanguage')
        });
    },
    postRender: function() {
        this.$('.footer-links .footer-link').on('change:location', this.changeLocation);
    }
});

module.exports.id = 'footer/languages';
