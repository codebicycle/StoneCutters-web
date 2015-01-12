'use strict';

var Base = require('../../../../../common/app/bases/view').requireView('marketing/post_banner');
var _ = require('underscore');
var config = require('../../../../../../../shared/config');

module.exports = Base.extend({
    getTemplateData: function() {
        var data = Base.prototype.getTemplateData.call(this);
        var location = this.app.session.get('location').url;
        var selectedLanguage = this.app.session.get('selectedLanguage').split('-')[0];
        var image = config.getForMarket(location, ['post_banner', 'image'], 'post-latam');

        return _.extend({}, data, {
            selectedLanguage: selectedLanguage,
            image: image
        });
    },
});

module.exports.id = 'marketing/post_banner';




