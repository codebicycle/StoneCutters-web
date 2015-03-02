'use strict';

var Base = require('../../../../../common/app/bases/view').requireView('marketing/post_banner');
var _ = require('underscore');
var config = require('../../../../../../../shared/config');

module.exports = Base.extend({
    getTemplateData: function() {
        var data = Base.prototype.getTemplateData.call(this);
        var location = this.app.session.get('location').url;
        var selectedLanguage = this.app.session.get('selectedLanguage').split('-')[0];
        var marketing = config.getForMarket(location, ['marketing'], '');

        return _.extend({}, data, {
            selectedLanguage: selectedLanguage,
            marketing: marketing
        });
    },
});

module.exports.id = 'marketing/post_banner';




