'use strict';

var Base = require('../../../../../common/app/bases/view').requireView('pages/about');
var _ = require('underscore');

module.exports = Base.extend({
    tagName: 'main',
    id: 'pages-about-view',
    className: 'pages-about-view',
    getTemplateData: function() {
        var data = Base.prototype.getTemplateData.call(this);
        var selectedLanguage = this.app.session.get('selectedLanguage').split('-')[0];

        return _.extend({}, data, {
            selectedLanguage: selectedLanguage
        });
    }
});
