'use strict';

var Base = require('../../../../../common/app/bases/view').requireView('pages/thanks');
var config = require('../../../../../../../shared/config');
var _ = require('underscore');

module.exports = Base.extend({
    getTemplateData: function() {
        var data = Base.prototype.getTemplateData.call(this);
        var location = this.app.session.get('location');
        var thanksPage = config.getForMarket(location.url, ['marketing','thanksPage'], '');
        var selectedLanguage = this.app.session.get('selectedLanguage').split('-')[0];

        return _.extend({}, data, {
            location: location,
            thanksPage: thanksPage,
            selectedLanguage: selectedLanguage
        });
    }
});