'use strict';

var Base = require('../../../../../common/app/bases/view').requireView('marketing/post_banner');
var _ = require('underscore');

module.exports = Base.extend({
    getTemplateData: function() {
        var data = Base.prototype.getTemplateData.call(this);
        var location = this.app.session.get('location').url;
        var selectedLanguage = this.app.session.get('selectedLanguage').split('-')[0];
        var image = 'post-latam';
        var africa = ['www.olx.sn', 'www.olx.cm', 'www.olx.co.tz'];

        if (_.contains(africa, location)) {
            image = 'post-africa';
        }

        return _.extend({}, data, {
            selectedLanguage: selectedLanguage,
            image: image
        });
    },
});

module.exports.id = 'marketing/post_banner';




