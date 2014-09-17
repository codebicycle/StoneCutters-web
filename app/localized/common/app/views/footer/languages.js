'use strict';

var Base = require('../../bases/view');
var _ = require('underscore');

module.exports = Base.extend({
    className: 'footer_languages_view',
    wapAttributes: {
        bgcolor: '#DDDDDD'
    },
    getTemplateData: function() {
        var data = Base.prototype.getTemplateData.call(this);

        return _.extend({}, data, {
            languages: this.app.session.get('languages'),
            selectedLanguage: this.app.session.get('selectedLanguage')
        });
    }
});

module.exports.id = 'footer/languages';
